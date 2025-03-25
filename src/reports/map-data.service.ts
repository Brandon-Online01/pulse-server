import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not, IsNull, EntityManager, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';

// Entity imports
import { Tracking } from '../tracking/entities/tracking.entity';
import { User } from '../user/entities/user.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { CheckIn } from '../check-ins/entities/check-in.entity';
import { Task } from '../tasks/entities/task.entity';
import { Journal } from '../journal/entities/journal.entity';
import { Lead } from '../leads/entities/lead.entity';
import { Client } from '../clients/entities/client.entity';
import { Branch } from '../branch/entities/branch.entity';
import { Organisation } from '../organisation/entities/organisation.entity';
import { Competitor } from '../competitors/entities/competitor.entity';
import { Geofence } from '../tracking/entities/geofence.entity';

// Service imports
import { CompetitorsService } from '../competitors/competitors.service';
import { GeofenceType } from '../lib/enums/competitor.enums';

// DTO imports
import {
	WorkerLocationDto,
	MapEventDto,
	MapDataResponseDto,
	MapMarkerType,
	MapEventCategory,
	ScheduleDto,
	JobStatusDto,
	BreakDataDto,
	MapConfigDto,
	ActivityDto,
	CompetitorLocationDto,
	GeofenceDto,
	QuotationLocationDto,
	ClientLocationDto,
} from './dto/map-data.dto';

// Enum imports
import { TaskStatus } from '../lib/enums/task.enums';

@Injectable()
export class MapDataService {
	// Static properties to track quotations repository availability
	private static quotationsRepoChecked = false;
	private static quotationsRepoAvailable = false;

	constructor(
		private readonly configService: ConfigService,
		private readonly competitorsService: CompetitorsService,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(Tracking)
		private readonly trackingRepository: Repository<Tracking>,
		@InjectRepository(Attendance)
		private readonly attendanceRepository: Repository<Attendance>,
		@InjectRepository(CheckIn)
		private readonly checkInRepository: Repository<CheckIn>,
		@InjectRepository(Task)
		private readonly taskRepository: Repository<Task>,
		@InjectRepository(Journal)
		private readonly journalRepository: Repository<Journal>,
		@InjectRepository(Lead)
		private readonly leadRepository: Repository<Lead>,
		@InjectRepository(Client)
		private readonly clientRepository: Repository<Client>,
		@InjectRepository(Branch)
		private readonly branchRepository: Repository<Branch>,
		@InjectRepository(Organisation)
		private readonly organisationRepository: Repository<Organisation>,
		@InjectRepository(Competitor)
		private readonly competitorRepository: Repository<Competitor>,
		@InjectRepository(Geofence)
		private readonly geofenceRepository: Repository<Geofence>,
		private readonly entityManager: EntityManager,
	) {}

	/**
	 * Get real map data from database
	 */
	async getRealMapData(orgId: string, branchId: string, userId: string): Promise<MapDataResponseDto> {
		console.log(`Fetching real map data for org ${orgId}, branch ${branchId}, user ${userId}`);

		try {
			// 1. Fetch workers data - only include workers with valid locations
			const workers = await this.getWorkerLocations(orgId, branchId);

			// 2. Fetch events data with expanded timeframe
			const events = await this.getMapEvents(orgId, branchId);

			// 3. Get map configuration
			const mapConfig = this.getMapConfig();

			// 4. Fetch competitors data
			const competitors = await this.getCompetitorLocations(orgId, branchId);
			
			// 5. Fetch clients data
			const clients = await this.getClientLocations(orgId, branchId);
			
			// 6. Fetch quotations data
			const quotations = await this.getQuotationLocations(orgId, branchId);

			return {
				workers,
				events,
				mapConfig,
				competitors,
				clients,
				quotations,
			};
		} catch (error) {
			console.error('Error fetching map data:', error);
			return {
				workers: [],
				events: [],
				mapConfig: this.getMapConfig(),
				competitors: [],
				clients: [],
				quotations: [],
			};
		}
	}

	/**
	 * Get competitor locations for map display
	 */
	private async getCompetitorLocations(orgId: string, branchId: string): Promise<CompetitorLocationDto[]> {
		try {
			// Get all competitors for the organization/branch
			const orgIdNum = orgId ? parseInt(orgId, 10) : undefined;
			const branchIdNum = branchId ? parseInt(branchId, 10) : undefined;

			// Fetch competitors with full details
			const { data: competitors } = await this.competitorsService.findAll(
				{ isDeleted: false }, 
				1,
				1000, // Get a large number of competitors
				orgIdNum,
				branchIdNum
			);

			// Get existing geofences for organisation
			const geofences = await this.geofenceRepository.find({
				where: {
					organisation: orgIdNum ? { uid: orgIdNum } : undefined,
					isActive: true
				}
			});

			// Map competitors to location DTOs
			return competitors.map(competitor => {
				// Use actual coordinates from competitor record if available
				let position: [number, number] | undefined;
				
				if (competitor.latitude !== null && competitor.longitude !== null) {
					position = [Number(competitor.latitude), Number(competitor.longitude)];
				}
				
				// If no coordinates available, use fallback
				if (!position) {
					position = this.mockPositionFromAddress(competitor.address);
				}

				// Get geofence information
				const geofenceData: GeofenceDto = {
					enabled: competitor.enableGeofence || false,
					type: competitor.geofenceType || GeofenceType.NONE,
					radius: competitor.geofenceRadius || 500
				};

				// Check if there's a corresponding geofence entity already created
				if (competitor.enableGeofence && position) {
					// Look for existing geofence in the database
					const existingGeofence = geofences.find(g => 
						g.name === `Competitor-${competitor.uid}` || 
						(g.latitude === position![0] && g.longitude === position![1])
					);

					if (!existingGeofence) {
						// If enabled but no geofence exists, create one (async, don't await)
						this.createGeofenceForCompetitor(competitor, position, orgIdNum);
					} else {
						// Update geofence data from existing record
						geofenceData.radius = existingGeofence.radius;
					}
				}

				return {
					id: competitor.uid,
					name: competitor.name,
					position,
					markerType: MapMarkerType.COMPETITOR,
					threatLevel: competitor.threatLevel || 0,
					isDirect: competitor.isDirect || false,
					industry: competitor.industry || 'Unknown',
					status: competitor.status,
					website: competitor.website,
					logoUrl: competitor.logoUrl,
					competitorRef: competitor.competitorRef,
					address: competitor.address,
					geofencing: geofenceData
				};
			});
		} catch (error) {
			console.error('Error fetching competitor locations:', error);
			return [];
		}
	}

	/**
	 * Create a geofence entity for a competitor
	 * This is run asynchronously and doesn't block the main data retrieval
	 */
	private async createGeofenceForCompetitor(
		competitor: Competitor, 
		position: [number, number], 
		orgId?: number
	): Promise<void> {
		try {
			// Check if a geofence already exists
			const existingGeofence = await this.geofenceRepository.findOne({
				where: {
					name: `Competitor-${competitor.uid}`,
					organisation: orgId ? { uid: orgId } : undefined
				}
			});

			if (existingGeofence) {
				// Update existing geofence
				existingGeofence.latitude = position[0];
				existingGeofence.longitude = position[1];
				existingGeofence.radius = competitor.geofenceRadius || 500;
				existingGeofence.isActive = competitor.enableGeofence;
				await this.geofenceRepository.save(existingGeofence);
				return;
			}

			// Create new geofence entity
			const geofence = new Geofence();
			geofence.name = `Competitor-${competitor.uid}`;
			geofence.description = `Geofence for competitor: ${competitor.name}`;
			geofence.latitude = position[0];
			geofence.longitude = position[1];
			geofence.radius = competitor.geofenceRadius || 500;
			geofence.isActive = true;

			// Set organisation if available
			if (orgId) {
				const organisation = await this.organisationRepository.findOne({
					where: { uid: orgId }
				});
				if (organisation) {
					geofence.organisation = organisation;
				}
			}

			// Save the new geofence
			await this.geofenceRepository.save(geofence);
			console.log(`Created geofence for competitor ${competitor.name}`);
		} catch (error) {
			console.error(`Failed to create geofence for competitor ${competitor.uid}:`, error);
		}
	}

	/**
	 * Calculate if a position is within a geofence
	 * @param position Position to check [lat, lng]
	 * @param center Center of geofence [lat, lng]
	 * @param radiusMeters Radius of geofence in meters
	 */
	private isPositionInGeofence(
		position: [number, number], 
		center: [number, number], 
		radiusMeters: number
	): boolean {
		// Calculate distance using Haversine formula
		const R = 6371e3; // Earth radius in meters
		const φ1 = this.toRadians(position[0]);
		const φ2 = this.toRadians(center[0]);
		const Δφ = this.toRadians(center[0] - position[0]);
		const Δλ = this.toRadians(center[1] - position[1]);

		const a = 
			Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
			Math.cos(φ1) * Math.cos(φ2) *
			Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
			
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		const distance = R * c;

		return distance <= radiusMeters;
	}

	/**
	 * Convert degrees to radians
	 */
	private toRadians(degrees: number): number {
		return degrees * Math.PI / 180;
	}

	/**
	 * Generate a mock position from address data
	 * In production, you would use a geocoding service
	 */
	private mockPositionFromAddress(address: any): [number, number] | undefined {
		if (!address) return undefined;
		
		// This is a simplified mock - in production use a real geocoding service
		// Generate a position within ~5km of the organization's default location
		const defaultLat = 51.5074; // London latitude
		const defaultLng = -0.1278; // London longitude
		
		// Generate a slight random offset (±0.05 degrees, roughly ±5km)
		const latOffset = (Math.random() - 0.5) * 0.1;
		const lngOffset = (Math.random() - 0.5) * 0.1;
		
		return [defaultLat + latOffset, defaultLng + lngOffset];
	}

	// Helper method to get worker locations from real data
	private async getWorkerLocations(orgId: string, branchId: string): Promise<WorkerLocationDto[]> {
		// Define query conditions
		const queryConditions: any = {};

		if (orgId) {
			queryConditions.organisation = { ref: orgId };
		}

		if (branchId) {
			queryConditions.branch = { uid: Number(branchId) };
		}

		// Get all active users in the organization/branch, not just those with tracking data
		const users = await this.userRepository.find({
			where: {
				...queryConditions,
				status: 'active',
			},
			relations: ['organisation', 'branch'],
		});

		const workerLocations: WorkerLocationDto[] = [];

		// Get the date range for activities
		const now = new Date();
		const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
		const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
		const startOfWeek = new Date(now);
		startOfWeek.setDate(now.getDate() - 7); // Look back 7 days for a more complete picture

		// Process all users in parallel to improve performance
		const workerPromisesResults = await Promise.all(
			users.map(async (user) => {
				try {
					// Get latest tracking data for location
					const latestTracking = await this.trackingRepository.findOne({
						where: {
							owner: { uid: user.uid },
						},
						order: {
							createdAt: 'DESC',
						},
					});

					// Skip users with no tracking data as requested
					if (!latestTracking || !latestTracking.latitude || !latestTracking.longitude) {
						return null;
					}

					// Set position and address from tracking data
					const position: [number, number] = [latestTracking.latitude, latestTracking.longitude];
					const address = latestTracking.address || 'Unknown location';

					// Get current attendance status
					const attendance = await this.attendanceRepository.findOne({
						where: {
							owner: { uid: user.uid },
							checkIn: Between(startOfDay, endOfDay),
						},
						order: {
							checkIn: 'DESC',
						},
					});

					// Determine marker type based on the user's latest activity
					const markerType = await this.determineMarkerType(user.uid);

					// Determine user status text based on their current activity
					const statusText = await this.determineUserStatus(user.uid, attendance);

					// Build worker location object with basic information
					const workerLocation: WorkerLocationDto = {
						id: user.uid.toString(),
						name: `${user.name || ''} ${user.surname || ''}`.trim(),
						position,
						markerType,
						status: statusText,
						image: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || '')}%20${encodeURIComponent(user.surname || '')}&background=random`,
						location: {
							address,
							imageUrl: latestTracking
								? await this.getLocationImageForAddress(address)
								: undefined,
						},
						schedule: await this.getUserSchedule(user.uid),
						jobStatus: await this.getUserJobStatus(user.uid),
					};

					// Add current task information if available
					const currentTask = await this.getCurrentTask(user.uid);
					if (currentTask) {
						// Find client for this task
						let clientName = 'No client';
						if (currentTask.clients && Array.isArray(currentTask.clients) && currentTask.clients.length > 0) {
							try {
								const clientUid = currentTask.clients[0].uid;
								const client = await this.clientRepository.findOne({
									where: { uid: clientUid },
								});
								if (client) {
									clientName = client.name;
								}
							} catch (error) {
								console.error(`Error fetching client for task ${currentTask.uid}:`, error);
							}
						}

						workerLocation.task = {
							id: currentTask.uid.toString(),
							title: currentTask.title,
							client: clientName,
						};
					}

					// Get comprehensive activity stats for this worker (last 7 days)
					const activity = await this.getWorkerActivity(user.uid, startOfWeek, now);
					if (activity) {
						workerLocation.activity = activity;
					}

					// Check if user can add task based on role/permissions
					workerLocation.canAddTask = this.canUserAddTask(user);

					// Add break data if user is on break
					if (attendance?.breakStartTime && !attendance?.breakEndTime) {
						workerLocation.breakData = this.getBreakData(attendance);
					}

					return workerLocation;
				} catch (error) {
					console.error(`Error processing worker location for user ${user.uid}:`, error);
					return null; // Return null for failed worker data
				}
			})
		);

		// Filter out null results (users with no tracking data or errors)
		return workerPromisesResults.filter(worker => worker !== null) as WorkerLocationDto[];
	}

	/**
	 * Get a location image URL for an address - improved to be more specific
	 */
	private async getLocationImageForAddress(address: string): Promise<string> {
		// In a production environment, you would integrate with a service like:
		// - Google Street View API
		// - Mapbox Static Images API
		// - Custom location imagery database
		
		// For now, return a more diverse set of placeholder images based on address hash
		const addressHash = this.simpleHash(address);
		const imageOptions = [
			'https://images.pexels.com/photos/2464890/pexels-photo-2464890.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			'https://images.pexels.com/photos/1563256/pexels-photo-1563256.jpeg?auto=compress&cs=tinysrgb&w=800',
			'https://images.pexels.com/photos/3052361/pexels-photo-3052361.jpeg?auto=compress&cs=tinysrgb&w=800',
			'https://images.pexels.com/photos/1722183/pexels-photo-1722183.jpeg?auto=compress&cs=tinysrgb&w=800',
			'https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg?auto=compress&cs=tinysrgb&w=800'
		];
		
		return imageOptions[addressHash % imageOptions.length];
	}

	/**
	 * Simple string hashing function
	 */
	private simpleHash(str: string): number {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash; // Convert to 32bit integer
		}
		return Math.abs(hash);
	}

	// Helper method to get map events from real data
	private async getMapEvents(orgId: string, branchId: string): Promise<MapEventDto[]> {
		console.log("Starting to fetch map events...");
		const events: MapEventDto[] = [];

		// Define date ranges - fetch events from the last 3 days for more comprehensive data
		const now = new Date();
		const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
		const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
		
		// Include events from the past 3 days to show more activity
		const threeDaysAgo = new Date(startOfToday);
		threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

		// Define query conditions
		const orgCondition = orgId ? { organisation: { ref: orgId } } : {};
		const branchCondition = branchId ? { branch: { uid: Number(branchId) } } : {};

		try {
			// Get all users in the organization/branch
			const users = await this.userRepository.find({
				where: {
					...orgCondition,
					...branchCondition,
					status: 'active',
				},
				relations: ['organisation', 'branch'],
			});

			if (users.length === 0) {
				console.warn("No users found for map events");
				return [];
			}

			console.log(`Found ${users.length} users for map events`);
			
			// Get all users' IDs for easy querying
			const userIds = users.map(user => user.uid);
			
			// Create a map of user IDs to names for easy lookups
			const userNameMap = new Map<number, string>();
			const userImageMap = new Map<number, string>();
			
			for (const user of users) {
				userNameMap.set(user.uid, `${user.name || ''} ${user.surname || ''}`.trim());
				userImageMap.set(user.uid, user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || '')}%20${encodeURIComponent(user.surname || '')}&background=random`);
			}

			// 1. Process TASKS - tasks from the last 3 days
			try {
				const tasks = await this.taskRepository.find({
					where: [
						// Tasks created in the past 3 days
						{
							assignees: Not(IsNull()),
							createdAt: Between(threeDaysAgo, endOfToday),
						},
						// Tasks updated in the past 3 days
						{
							assignees: Not(IsNull()),
							updatedAt: Between(threeDaysAgo, endOfToday),
						},
						// Tasks completed in the past 3 days
						{
							assignees: Not(IsNull()),
							completionDate: Between(threeDaysAgo, endOfToday),
						}
					],
					relations: ['creator'],
					order: {
						updatedAt: 'DESC',
					}
				});
				
				console.log(`Found ${tasks.length} task records`);
				
				// Process tasks events
				for (const task of tasks) {
					if (!task.assignees || task.assignees.length === 0) continue;
					
					const userId = task.assignees[0]?.uid;
					if (!userNameMap.has(userId)) continue;
					
					const userName = userNameMap.get(userId) || 'Unknown user';
					const userImageUrl = userImageMap.get(userId);
					
					// Find client for this task
					let clientName = 'No client';
					let clientAddress = '';
					let clientPosition: [number, number] | undefined;
					
					if (task.clients && Array.isArray(task.clients) && task.clients.length > 0) {
						try {
							const clientUid = task.clients[0].uid;
							if (clientUid) {
								const client = await this.clientRepository.findOne({
									where: { uid: clientUid },
								});
								if (client) {
									clientName = client.name;
									clientAddress = client.address?.street || '';
									if (client.latitude && client.longitude) {
										clientPosition = [Number(client.latitude), Number(client.longitude)];
									}
								}
							}
						} catch (error) {
							console.error(`Error fetching client for task ${task.uid}:`, error);
						}
					}
					
					// Determine the event date for display
					const eventDate = task.updatedAt || task.createdAt;
					let timePeriod = 'Today';
					if (eventDate.getDate() === now.getDate() - 1) {
						timePeriod = 'Yesterday';
					} else if (eventDate < threeDaysAgo) {
						timePeriod = this.formatDateShort(eventDate);
					}
					
					// Create event object with enhanced context
					const eventObj: MapEventDto = {
						id: `task-${task.uid}`,
						user: userName,
						type: MapMarkerType.TASK,
						category: MapEventCategory.TASK,
						time: this.formatEventTime(eventDate),
						timePeriod,
						location: clientName,
						address: clientAddress,
						position: clientPosition, // Include position data if available
						title: task.status === TaskStatus.COMPLETED 
							? `Completed task: ${task.title}`
							: task.status === TaskStatus.IN_PROGRESS
								? `Working on task: ${task.title}`
								: `New task: ${task.title}`,
						context: {
							taskId: task.uid,
							taskStatus: task.status,
							progress: task.progress || 0,
							createdAt: task.createdAt,
							dateKey: this.formatDateShort(task.createdAt),
							deadline: task.deadline || null,
							priority: task.priority || 'normal',
							clientId: task.clients?.[0]?.uid,
						}
					};
					
					// If we have a user image URL, add it to the event object
					if (userImageUrl) {
						(eventObj as any).userImage = userImageUrl;
					}
					
					events.push(eventObj);
				}
				
				// Add summary if needed (for today's tasks only)
				const todaysTasks = tasks.filter(t => 
					new Date(t.createdAt).getDate() === now.getDate() && 
					new Date(t.createdAt).getMonth() === now.getMonth() &&
					new Date(t.createdAt).getFullYear() === now.getFullYear()
				);
				
				if (todaysTasks.length >= 3) {
					const users = new Set(todaysTasks.map(t => t.assignees[0]?.uid).filter(Boolean));
					events.push({
						id: `task-summary-${this.formatDateShort(now)}`,
						user: 'Multiple Users',
						type: MapMarkerType.TASK,
						category: MapEventCategory.SUMMARY,
						time: this.formatEventTime(now),
						timePeriod: 'Today',
						location: 'Various Locations',
						title: `${todaysTasks.length} tasks created/updated today (${users.size} users)`
					});
				}
			} catch (error) {
				console.error('Error processing task data:', error.message);
			}

			// 2. Process LEADS - leads from the last 3 days
			try {
				const leads = await this.leadRepository.find({
					where: {
						owner: { uid: In(userIds) },
						createdAt: Between(threeDaysAgo, endOfToday)
					},
					relations: ['owner', 'client'],
					order: { createdAt: 'DESC' }
				});
				
				console.log(`Found ${leads.length} lead records`);
				
				for (const lead of leads) {
					if (!lead.owner) continue;
					
					const userName = userNameMap.get(lead.owner.uid) || 'Unknown user';
					const userImageUrl = userImageMap.get(lead.owner.uid);
					const clientName = lead.client ? lead.client.name : 'No client';
					
					// Determine client position if available
					let clientPosition: [number, number] | undefined;
					let clientAddress = '';
					
					if (lead.client) {
						if (lead.client.latitude && lead.client.longitude) {
							clientPosition = [Number(lead.client.latitude), Number(lead.client.longitude)];
						}
						clientAddress = lead.client.address?.street || '';
					}
					
					// Determine the event date for display
					const eventDate = lead.createdAt;
					let timePeriod = 'Today';
					if (eventDate.getDate() === now.getDate() - 1) {
						timePeriod = 'Yesterday';
					} else if (eventDate < threeDaysAgo) {
						timePeriod = this.formatDateShort(eventDate);
					}
					
					const leadEvent: MapEventDto = {
						id: `lead-${lead.uid}`,
						user: userName,
						type: MapMarkerType.LEAD,
						category: MapEventCategory.LEAD,
						time: this.formatEventTime(eventDate),
						timePeriod,
						location: clientName,
						address: clientAddress,
						position: clientPosition,
						title: `New lead: ${(lead as any).title || 'Untitled lead'}`,
						context: {
							leadId: lead.uid,
							leadStatus: (lead as any).status || 'new',
							leadValue: (lead as any).estimatedValue || 0,
							clientId: lead.client?.uid,
							dateKey: this.formatDateShort(lead.createdAt)
						}
					};
					
					// If we have a user image URL, add it to the event object
					if (userImageUrl) {
						(leadEvent as any).userImage = userImageUrl;
					}
					
					events.push(leadEvent);
				}
			} catch (error) {
				console.error('Error processing lead data:', error.message);
			}

			// 3. Process JOURNALS - journals from the last 3 days
			try {
				const journals = await this.journalRepository.find({
					where: {
						owner: { uid: In(userIds) },
						createdAt: Between(threeDaysAgo, endOfToday)
					},
					relations: ['owner'],
					order: { createdAt: 'DESC' }
				});
				
				console.log(`Found ${journals.length} journal records`);
				
				for (const journal of journals) {
					if (!journal.owner) continue;
					
					const userName = userNameMap.get(journal.owner.uid) || 'Unknown user';
					const userImageUrl = userImageMap.get(journal.owner.uid);
					
					// Try to extract position from journal if available
					let position: [number, number] | undefined;
					if ((journal as any).latitude && (journal as any).longitude) {
						position = [Number((journal as any).latitude), Number((journal as any).longitude)];
					}
					
					// Determine the event date for display
					const eventDate = journal.createdAt;
					let timePeriod = 'Today';
					if (eventDate.getDate() === now.getDate() - 1) {
						timePeriod = 'Yesterday';
					} else if (eventDate < threeDaysAgo) {
						timePeriod = this.formatDateShort(eventDate);
					}
					
					const journalEvent: MapEventDto = {
						id: `journal-${journal.uid}`,
						user: userName,
						type: MapMarkerType.JOURNAL,
						category: MapEventCategory.JOURNAL,
						time: this.formatEventTime(eventDate),
						timePeriod,
						location: (journal as any).location || 'Unknown location',
						position,
						title: `Journal entry: ${(journal as any).title || 'Untitled entry'}`,
						context: {
							journalId: journal.uid,
							mood: (journal as any).mood,
							dateKey: this.formatDateShort(journal.createdAt)
						}
					};
					
					// If we have a user image URL, add it to the event object
					if (userImageUrl) {
						(journalEvent as any).userImage = userImageUrl;
					}
					
					events.push(journalEvent);
				}
			} catch (error) {
				console.error('Error processing journal data:', error.message);
			}

			// 4. Process CHECK-INS - check-ins from the last 3 days
			try {
				const checkIns = await this.checkInRepository.find({
					where: {
						owner: { uid: In(userIds) },
						checkInTime: Between(threeDaysAgo, endOfToday)
					},
					relations: ['owner', 'client'],
					order: { checkInTime: 'DESC' }
				});
				
				console.log(`Found ${checkIns.length} check-in records`);
				
				for (const checkIn of checkIns) {
					if (!checkIn.owner) continue;
					
					const userName = userNameMap.get(checkIn.owner.uid) || 'Unknown user';
					const userImageUrl = userImageMap.get(checkIn.owner.uid);
					const clientName = checkIn.client ? checkIn.client.name : 'Unknown client';
					
					// Try to extract position data, safely handling potential missing properties
					let position: [number, number] | undefined;
					if ((checkIn as any).latitude !== undefined && (checkIn as any).longitude !== undefined) {
						position = [Number((checkIn as any).latitude), Number((checkIn as any).longitude)];
					}
					
					// Extract client address if available
					let address = checkIn.checkInLocation || 'Unknown location';
					if (checkIn.client && checkIn.client.address) {
						address = checkIn.client.address.street || address;
					}
					
					// Determine the event date for display
					const eventDate = checkIn.checkInTime;
					let timePeriod = 'Today';
					if (eventDate.getDate() === now.getDate() - 1) {
						timePeriod = 'Yesterday';
					} else if (eventDate < threeDaysAgo) {
						timePeriod = this.formatDateShort(eventDate);
					}
					
					try {
						const eventObj: MapEventDto = {
							id: `checkin-${checkIn.uid}`,
							user: userName,
							type: MapMarkerType.CHECK_IN,
							category: MapEventCategory.CHECK_IN,
							time: this.formatEventTime(eventDate),
							timePeriod,
							location: clientName,
							address,
							position,
							title: checkIn.client 
								? `Visited ${clientName}`
								: `Check-in at ${address}`,
							context: {
								checkInId: checkIn.uid,
								clientId: checkIn.client?.uid,
								checkInTime: checkIn.checkInTime,
								checkOutTime: checkIn.checkOutTime,
								notes: (checkIn as any).notes || null,
								dateKey: this.formatDateShort(checkIn.checkInTime)
							}
						};
						
						// If we have a user image URL, add it to the event object
						if (userImageUrl) {
							(eventObj as any).userImage = userImageUrl;
						}
						
						events.push(eventObj);
					} catch (error) {
						console.error(`Error processing check-in ${checkIn.uid}:`, error.message);
						continue;
					}
				}
			} catch (error) {
				console.error('Error processing check-in data:', error.message);
			}

			// 5. Process QUOTATIONS - quotations from the last 3 days
			try {
				if (MapDataService.quotationsRepoAvailable) {
					const quotationsRepository = this.entityManager.getRepository('quotation');
					
					const quotations = await quotationsRepository.find({
						where: {
							createdAt: Between(threeDaysAgo, endOfToday)
						},
						relations: ['placedBy', 'client'],
						order: { createdAt: 'DESC' }
					});
					
					console.log(`Found ${quotations.length} quotation records for events`);
					
					for (const quotation of quotations) {
						if (!quotation.placedBy) continue;
						
						// Check if the placedBy user is in our userIds list
						if (!userNameMap.has(quotation.placedBy.uid)) continue;
						
						const userName = userNameMap.get(quotation.placedBy.uid) || 'Unknown user';
						const userImageUrl = userImageMap.get(quotation.placedBy.uid);
						const clientName = quotation.client ? quotation.client.name : 'No client';
						
						// Try to extract position from client if available
						let position: [number, number] | undefined;
						let clientAddress = '';
						
						if (quotation.client) {
							if (quotation.client.latitude && quotation.client.longitude) {
								position = [Number(quotation.client.latitude), Number(quotation.client.longitude)];
							}
							clientAddress = quotation.client.address?.street || '';
						}
						
						// Determine the event date for display
						const eventDate = quotation.createdAt;
						let timePeriod = 'Today';
						if (eventDate.getDate() === now.getDate() - 1) {
							timePeriod = 'Yesterday';
						} else if (eventDate < threeDaysAgo) {
							timePeriod = this.formatDateShort(eventDate);
						}
						
						try {
							const eventObj: MapEventDto = {
								id: `quotation-${quotation.uid}`,
								user: userName,
								type: MapMarkerType.QUOTATION,
								category: MapEventCategory.QUOTATION,
								time: this.formatEventTime(eventDate),
								timePeriod,
								location: clientName,
								address: clientAddress,
								position,
								title: `Quotation: ${quotation.quotationNumber} (${this.formatCurrency(Number(quotation.totalAmount))})`,
								context: {
									quotationId: quotation.uid,
									quotationNumber: quotation.quotationNumber,
									amount: Number(quotation.totalAmount) || 0,
									status: quotation.status,
									clientId: quotation.client?.uid,
									isConverted: quotation.isConverted || false,
									dateKey: this.formatDateShort(quotation.createdAt)
								}
							};
							
							// If we have a user image URL, add it to the event object
							if (userImageUrl) {
								(eventObj as any).userImage = userImageUrl;
							}
							
							events.push(eventObj);
						} catch (error) {
							console.error(`Error processing quotation event ${quotation.uid}:`, error.message);
							continue;
						}
					}
					
					// Add summary if needed (for today's quotations only)
					const todaysQuotations = quotations.filter(q => 
						new Date(q.createdAt).getDate() === now.getDate() && 
						new Date(q.createdAt).getMonth() === now.getMonth() &&
						new Date(q.createdAt).getFullYear() === now.getFullYear()
					);
					
					if (todaysQuotations.length >= 3) {
						const users = new Set(todaysQuotations.map(q => q.placedBy?.uid).filter(Boolean));
						events.push({
							id: `quotation-summary-${this.formatDateShort(now)}`,
							user: 'Multiple Users',
							type: MapMarkerType.QUOTATION,
							category: MapEventCategory.SUMMARY,
							time: this.formatEventTime(now),
							timePeriod: 'Today',
							location: 'Various Clients',
							title: `${todaysQuotations.length} quotations created today (${users.size} users)`
						});
					}
				}
			} catch (error) {
				console.error('Error processing quotation data:', error.message);
			}

			// Sort events by time, most recent first, with today's events prioritized
			events.sort((a, b) => {
				// First prioritize by time period (Today > Yesterday > Older)
				if (a.timePeriod !== b.timePeriod) {
					if (a.timePeriod === 'Today') return -1;
					if (b.timePeriod === 'Today') return 1;
					if (a.timePeriod === 'Yesterday') return -1;
					if (b.timePeriod === 'Yesterday') return 1;
				}
				
				// Then sort by actual time within each period
				const timeA = this.parseEventTime(a.time, a.timePeriod);
				const timeB = this.parseEventTime(b.time, b.timePeriod);
				return timeB.getTime() - timeA.getTime();
			});

			console.log(`Returning ${events.length} map events in total`);
			return events;
		} catch (error) {
			console.error('Error fetching events data:', error);
			return events;
		}
	}

	/**
	 * Enhanced event time parser that takes time period into account
	 */
	private parseEventTime(timeStr: string, timePeriod?: string): Date {
		try {
			const [time, period] = timeStr.split(' ');
			const [hours, minutes] = time.split(':').map(Number);
			const now = new Date();
			
			// Create date based on time period
			let date = new Date();
			
			if (timePeriod === 'Yesterday') {
				// Set to yesterday
				date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
			} else if (timePeriod && timePeriod !== 'Today') {
				// Parse from date string (format: 'MMM D')
				const [month, day] = timePeriod.split(' ');
				const monthIndex = new Date(`${month} 1, 2000`).getMonth();
				date = new Date(now.getFullYear(), monthIndex, parseInt(day));
			}
			
			// Set time component
			let hour = hours;
			if (period === 'PM' && hours !== 12) {
				hour += 12;
			} else if (period === 'AM' && hours === 12) {
				hour = 0;
			}
			
			date.setHours(hour, minutes, 0, 0);
			return date;
		} catch (error) {
			return new Date();
		}
	}

	// Helper method to get map configuration
	private getMapConfig(): MapConfigDto {
		const defaultLat = this.configService.get<number>('MAP_DEFAULT_LAT', -26.2041);
		const defaultLng = this.configService.get<number>('MAP_DEFAULT_LNG', 28.0473);

		// Ensure we have numbers, not strings
		return {
			defaultCenter: {
				lat: typeof defaultLat === 'string' ? parseFloat(defaultLat) : defaultLat,
				lng: typeof defaultLng === 'string' ? parseFloat(defaultLng) : defaultLng,
			},
			orgRegions: this.configService
				.get<any[]>('MAP_ORG_REGIONS', [
					{
						name: 'Africa Operations',
						center: { lat: -8.7832, lng: 34.5085 },
						zoom: 4,
					},
					{
						name: 'Global Operations',
						center: { lat: 20.5937, lng: 78.9629 },
						zoom: 2,
					},
				])
				.map((region) => ({
					...region,
					center: {
						lat: typeof region.center.lat === 'string' ? parseFloat(region.center.lat) : region.center.lat,
						lng: typeof region.center.lng === 'string' ? parseFloat(region.center.lng) : region.center.lng,
					},
				})),
		};
	}

	// Helper method to determine the marker type for a user
	private async determineMarkerType(userId: number): Promise<MapMarkerType> {
		const now = new Date();
		const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

		try {
			// Check if user is on break
			const onBreak = await this.attendanceRepository.findOne({
				where: {
					owner: { uid: userId },
					breakStartTime: Not(IsNull()),
					breakEndTime: IsNull(),
				},
			});

			if (onBreak) return MapMarkerType.BREAK_START;

			// Check if user has a task in progress
			const taskInProgress = await this.taskRepository.findOne({
				where: {
					status: TaskStatus.IN_PROGRESS,
				},
			});

			// Filter to find if user is in assignees
			if (
				taskInProgress &&
				taskInProgress.assignees &&
				Array.isArray(taskInProgress.assignees) &&
				taskInProgress.assignees.some((assignee) => assignee.uid === userId)
			) {
				return MapMarkerType.TASK;
			}

			// Check if user has checked in today
			const checkedIn = await this.attendanceRepository.findOne({
				where: {
					owner: { uid: userId },
					checkIn: Between(startOfToday, now),
					checkOut: IsNull(),
				},
			});

			if (checkedIn) return MapMarkerType.CHECK_IN;

			// Check if user has a client visit today
			const clientVisit = await this.checkInRepository.findOne({
				where: {
					owner: { uid: userId },
					checkInTime: Between(startOfToday, now),
					checkOutTime: IsNull(),
				},
			});

			if (clientVisit) return MapMarkerType.CHECK_IN;

			// Check if user has journal entries today
			const journal = await this.journalRepository.findOne({
				where: {
					owner: { uid: userId },
					createdAt: Between(startOfToday, now),
				},
			});

			if (journal) return MapMarkerType.JOURNAL;

			// Check if user has created leads today
			const lead = await this.leadRepository.findOne({
				where: {
					owner: { uid: userId },
					createdAt: Between(startOfToday, now),
				},
			});

			if (lead) return MapMarkerType.LEAD;

			// Default marker type if no specific activity is found
			return MapMarkerType.CHECK_IN;
		} catch (error) {
			console.error(`Error determining marker type for user ${userId}:`, error);
			return MapMarkerType.CHECK_IN; // Default fallback
		}
	}

	// Helper method to determine user's current status text
	private async determineUserStatus(userId: number, attendance?: Attendance): Promise<string> {
		try {
			// Check if user is on break
			if (attendance?.breakStartTime && !attendance?.breakEndTime) {
				return 'On break';
			}

			// Check for current tasks
			const currentTask = await this.getCurrentTask(userId);
			if (currentTask) {
				return `Working on ${currentTask.title}`;
			}

			// Check if user is checked in but not checked out
			if (attendance && !attendance.checkOut) {
				return 'On shift';
			}

			// Check for client visits
			const now = new Date();
			const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

			const clientVisit = await this.checkInRepository.findOne({
				where: {
					owner: { uid: userId },
					checkInTime: Between(startOfToday, now),
					checkOutTime: IsNull(),
				},
				relations: ['client'],
			});

			if (clientVisit && clientVisit.client) {
				return `Visiting ${clientVisit.client.name}`;
			}

			// Default status
			return 'Active';
		} catch (error) {
			console.error(`Error determining status for user ${userId}:`, error);
			return 'Active'; // Default fallback
		}
	}

	// Helper method to get user's current task
	private async getCurrentTask(userId: number): Promise<Task | null> {
		try {
			// Get tasks that are in progress
			const tasks = await this.taskRepository.find({
				where: {
					status: TaskStatus.IN_PROGRESS,
					isDeleted: false,
				},
			});

			// Filter tasks where user is in assignees JSON array
			for (const task of tasks) {
				if (task.assignees && Array.isArray(task.assignees)) {
					const isAssigned = task.assignees.some((assignee) => assignee.uid === userId);
					if (isAssigned) {
						return task;
					}
				}
			}

			return null;
		} catch (error) {
			console.error(`Error getting current task for user ${userId}:`, error);
			return null;
		}
	}

	// Helper method to get break data for a user on break
	private getBreakData(attendance: Attendance): BreakDataDto {
		const now = new Date();
		const breakStart = new Date(attendance.breakStartTime);
		const elapsedMinutes = Math.floor((now.getTime() - breakStart.getTime()) / (1000 * 60));

		// Default break duration is 30 minutes unless specified
		const breakDuration = 30;
		const remainingMinutes = Math.max(0, breakDuration - elapsedMinutes);

		return {
			startTime: this.formatTime(breakStart),
			endTime: this.formatTime(new Date(breakStart.getTime() + breakDuration * 60 * 1000)),
			duration: `${breakDuration}m`,
			location: attendance.breakNotes || 'Office',
			remainingTime: `${remainingMinutes}m`,
		};
	}

	// Helper method to get user's schedule
	private async getUserSchedule(userId: number): Promise<ScheduleDto> {
		try {
			const now = new Date();

			// Find tasks assigned to this user
			const tasks = await this.taskRepository.find({
				where: {
					isDeleted: false,
					deadline: Not(IsNull()),
				},
			});

			// Filter tasks where user is in assignees
			const userTasks = tasks.filter((task) => {
				if (task.assignees && Array.isArray(task.assignees)) {
					return task.assignees.some((assignee) => assignee.uid === userId);
				}
				return false;
			});

			// Find current and upcoming tasks
			const currentTasks = userTasks.filter(
				(task) => task.status === TaskStatus.IN_PROGRESS || (task.jobStartTime && !task.jobEndTime),
			);

			const upcomingTasks = userTasks
				.filter((task) => task.status === TaskStatus.PENDING && task.deadline && task.deadline > now)
				.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());

			let current = 'No scheduled tasks';
			let next = 'No upcoming tasks';

			if (currentTasks.length > 0) {
				const task = currentTasks[0];
				if (task.deadline) {
					current = `Until ${this.formatTime(task.deadline)}: ${task.title}`;
				} else {
					current = `Now: ${task.title}`;
				}
			}

			if (upcomingTasks.length > 0) {
				const task = upcomingTasks[0];
				next = `${this.formatTime(task.deadline)}: ${task.title}`;
			}

			return { current, next };
		} catch (error) {
			console.error(`Error getting schedule for user ${userId}:`, error);
			return { current: 'Schedule unavailable', next: 'Schedule unavailable' };
		}
	}

	// Helper method to get user's job status
	private async getUserJobStatus(userId: number): Promise<JobStatusDto> {
		try {
			// Get current task in progress
			const currentTask = await this.getCurrentTask(userId);

			if (!currentTask) {
				// Default job status when not on a task
				return {
					startTime: '--:--',
					endTime: '--:--',
					duration: '0h 0m',
					status: 'Idle',
					completionPercentage: 0,
				};
			}

			const now = new Date();
			const startTime = currentTask.jobStartTime || currentTask.createdAt;
			const durationMinutes = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60));
			const hours = Math.floor(durationMinutes / 60);
			const minutes = durationMinutes % 60;

			let status = 'In Progress';
			if (currentTask.jobStatus) {
				status = currentTask.jobStatus.toString();
			} else if (currentTask.status) {
				status = currentTask.status.toString();
			}

			return {
				startTime: this.formatTime(startTime),
				endTime: currentTask.deadline ? this.formatTime(currentTask.deadline) : '--:--',
				duration: `${hours}h ${minutes}m`,
				status,
				completionPercentage: currentTask.progress || 0,
			};
		} catch (error) {
			console.error(`Error getting job status for user ${userId}:`, error);
			return {
				startTime: '--:--',
				endTime: '--:--',
				duration: '0h 0m',
				status: 'Unknown',
				completionPercentage: 0,
			};
		}
	}

	// Helper method to check if a user can add tasks
	private canUserAddTask(user: User): boolean {
		// This would normally be based on user roles and permissions
		// For simplicity, we'll assume users with certain roles can add tasks
		return true;
	}

	// Helper method to format time in 12-hour format
	private formatTime(date: Date): string {
		return date.toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: true,
		});
	}

	// Helper method to format date in short format
	private formatDateShort(date: Date): string {
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
		});
	}

	// Helper method to format event time
	private formatEventTime(date: Date): string {
		try {
			return date.toLocaleTimeString('en-US', {
				hour: 'numeric',
				minute: '2-digit',
				hour12: true
			});
		} catch (error) {
			return new Date().toLocaleTimeString('en-US', {
				hour: 'numeric',
				minute: '2-digit',
				hour12: true
			});
		}
	}

	// Helper method to get worker activity data
	private async getWorkerActivity(userId: number, startDate: Date, endDate: Date): Promise<ActivityDto> {
		try {
			// Count claims (using entityManager for access to claims repository)
			let claimsCount = 0;
			try {
				// Use the proper entity name 'claim' (singular) instead of 'claims'
				const claimsRepository = this.entityManager.getRepository('claim');
				claimsCount = await claimsRepository.count({
					where: {
						owner: { uid: userId },
						createdAt: Between(startDate, endDate),
						isDeleted: false,
					},
				});
			} catch (error) {
				// Silent fail - use default 0
			}

			// Count journals
			const journalsCount = await this.journalRepository.count({
				where: {
					owner: { uid: userId },
					createdAt: Between(startDate, endDate),
				},
			});

			// Count leads
			const leadsCount = await this.leadRepository.count({
				where: {
					owner: { uid: userId },
					createdAt: Between(startDate, endDate),
				},
			});

			// Count check-ins
			const checkInsCount = await this.checkInRepository.count({
				where: {
					owner: { uid: userId },
					checkInTime: Between(startDate, endDate),
				},
			});

			// Count tasks (both created and assigned)
			const createdTasksCount = await this.taskRepository.count({
				where: {
					creator: { uid: userId },
					updatedAt: Between(startDate, endDate),
				},
			});

			// Count assigned tasks (more complex due to JSON array storage)
			const allTasks = await this.taskRepository.find({
				where: {
					updatedAt: Between(startDate, endDate),
				},
			});

			// Filter tasks where user is in assignees
			const assignedTasksCount = allTasks.filter((task) => {
				if (task.assignees && Array.isArray(task.assignees)) {
					return task.assignees.some((assignee) => assignee.uid === userId);
				}
				return false;
			}).length;

			// Get quotations count if that repository exists
			let quotationsCount = 0;
			// Only try once per server startup to access quotations
			if (!MapDataService.quotationsRepoChecked || MapDataService.quotationsRepoAvailable) {
				try {
					// Use the more reliable approach with getRepository from dataSource
					const quotationsRepository = this.taskRepository.manager.getRepository('quotation');
					quotationsCount = await quotationsRepository.count({
						where: {
							placedBy: { uid: userId },
							createdAt: Between(startDate, endDate),
						},
					});
					MapDataService.quotationsRepoAvailable = true;
				} catch (error) {
					if (!MapDataService.quotationsRepoChecked) {
						console.warn(
							`Quotations repository not available: ${error.message}. This warning will only show once.`,
						);
					}
					MapDataService.quotationsRepoAvailable = false;
				}
				MapDataService.quotationsRepoChecked = true;
			}

			// Total unique tasks (avoiding double-counting)
			const tasksCount = Math.max(createdTasksCount, assignedTasksCount);

			return {
				claims: claimsCount,
				journals: journalsCount,
				leads: leadsCount,
				checkIns: checkInsCount,
				tasks: tasksCount,
				quotations: quotationsCount || 0,
			};
		} catch (error) {
			console.error(`Error fetching activity stats for user ${userId}:`, error);
			return {
				claims: 0,
				journals: 0,
				leads: 0,
				checkIns: 0,
				tasks: 0,
				quotations: 0,
			};
		}
	}

	/**
	 * Get quotation locations for map display
	 */
	private async getQuotationLocations(orgId: string, branchId: string): Promise<QuotationLocationDto[]> {
		try {
			// Check if quotations repository is available
			if (!MapDataService.quotationsRepoChecked) {
				try {
					// Test access to quotations repository
					const quotationsRepository = this.entityManager.getRepository('quotation');
					MapDataService.quotationsRepoAvailable = true;
					console.log('Quotations repository is available');
				} catch (error) {
					console.warn(
						`Quotations repository not available: ${error.message}. Quotations will not be displayed on the map.`,
					);
					MapDataService.quotationsRepoAvailable = false;
				}
				MapDataService.quotationsRepoChecked = true;
			}

			if (!MapDataService.quotationsRepoAvailable) {
				return [];
			}

			// Define query conditions
			const queryConditions: any = {};

			// Add organization and branch filters
			const orgIdNum = orgId ? parseInt(orgId, 10) : undefined;
			const branchIdNum = branchId ? parseInt(branchId, 10) : undefined;

			if (orgIdNum) {
				queryConditions.organisation = { uid: orgIdNum };
			}

			if (branchIdNum) {
				queryConditions.branch = { uid: branchIdNum };
			}

			// Get recent quotations (created in the last 30 days)
			const thirtyDaysAgo = new Date();
			thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
			
			// Use entityManager to access the quotations repository
			const quotationsRepository = this.entityManager.getRepository('quotation');
			
			// Fetch quotations with relations to get client information
			const quotations = await quotationsRepository.find({
				where: {
					...queryConditions,
					createdAt: Between(thirtyDaysAgo, new Date()),
				},
				relations: ['client', 'placedBy', 'branch', 'organisation'],
				order: {
					createdAt: 'DESC',
				},
				take: 50, // Limit to 50 most recent quotations
			});

			console.log(`Found ${quotations.length} quotations for map display`);

			// Transform quotations to location DTOs
			const quotationLocations = quotations.map(quotation => {
				// Extract client position from client if available
				let position: [number, number] | undefined;

				try {
					// Try to get position from client's address
					if (quotation.client && quotation.client.latitude && quotation.client.longitude) {
						position = [Number(quotation.client.latitude), Number(quotation.client.longitude)];
					} else if (quotation.branch && quotation.branch.latitude && quotation.branch.longitude) {
						// Fall back to branch location
						position = [Number(quotation.branch.latitude), Number(quotation.branch.longitude)];
					} else if (quotation.client && quotation.client.address) {
						// Try to generate mock position from address as last resort
						position = this.mockPositionFromAddress(quotation.client.address);
					}

					// Build the quotation location object
					return {
						id: quotation.uid,
						quotationNumber: quotation.quotationNumber,
						clientName: quotation.client ? quotation.client.name : 'Unknown Client',
						position: position,
						totalAmount: Number(quotation.totalAmount) || 0,
						status: quotation.status,
						quotationDate: quotation.quotationDate || quotation.createdAt,
						placedBy: quotation.placedBy ? `${quotation.placedBy.name || ''} ${quotation.placedBy.surname || ''}`.trim() : 'Unknown',
						isConverted: quotation.isConverted || false,
						validUntil: quotation.validUntil,
						markerType: MapMarkerType.QUOTATION,
					};
				} catch (error) {
					console.error(`Error processing quotation ${quotation.uid}:`, error);
					return null;
				}
			})
			.filter(q => q !== null && q.position !== undefined) as QuotationLocationDto[]; // Only include quotations with positions

			return quotationLocations;
		} catch (error) {
			console.error('Error fetching quotation locations:', error);
			return [];
		}
	}

	/**
	 * Get client locations for map display
	 */
	private async getClientLocations(orgId: string, branchId: string): Promise<ClientLocationDto[]> {
		try {
			// Get all clients for the organization/branch
			const orgIdNum = orgId ? parseInt(orgId, 10) : undefined;
			const branchIdNum = branchId ? parseInt(branchId, 10) : undefined;

			const query = this.clientRepository.createQueryBuilder('client')
				.leftJoinAndSelect('client.organisation', 'organisation')
				.leftJoinAndSelect('client.branch', 'branch')
				.where('client.isDeleted = :isDeleted', { isDeleted: false });
			
			if (orgIdNum) {
				query.andWhere('organisation.uid = :orgId', { orgId: orgIdNum });
			}

			if (branchIdNum) {
				query.andWhere('branch.uid = :branchId', { branchId: branchIdNum });
			}

			const clients = await query.getMany();

			// Map clients to location DTOs
			return clients.map(client => {
				// Use actual coordinates from client record if available
				let position: [number, number] | undefined;
				
				if (client.latitude !== null && client.longitude !== null) {
					position = [Number(client.latitude), Number(client.longitude)];
				}
				
				// If no coordinates available, use fallback
				if (!position) {
					position = this.mockPositionFromAddress(client.address);
				}

				return {
					id: client.uid,
					name: client.name,
					position,
					clientRef: `CLIENT-${client.uid}`,
					contactName: client.contactPerson,
					email: client.email,
					phone: client.phone,
					status: client.status,
					website: client.website,
					logoUrl: client.logo,
					address: client.address,
					markerType: MapMarkerType.CLIENT,
				};
			});
		} catch (error) {
			console.error('Error fetching client locations:', error);
			return [];
		}
	}

	/**
	 * Utility method to format currency values
	 */
	private formatCurrency(value: number): string {
		return new Intl.NumberFormat('en-ZA', {
			style: 'currency',
			currency: 'ZAR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(value);
	}
}
