import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not, IsNull, EntityManager, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { subDays } from 'date-fns';

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

// DTO imports
import {
	WorkerLocationDto,
	MapEventDto,
	MapDataResponseDto,
	MapMarkerType,
	LocationDto,
	TaskDto,
	ScheduleDto,
	JobStatusDto,
	BreakDataDto,
	MapConfigDto,
	ActivityDto,
} from './dto/map-data.dto';

// Enum imports
import { TaskStatus, TaskPriority, JobStatus } from '../lib/enums/task.enums';

@Injectable()
export class MapDataService {
	constructor(
		private readonly configService: ConfigService,
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
		private readonly entityManager: EntityManager,
	) {}

	/**
	 * Get real map data from database
	 */
	async getRealMapData(orgId: string, branchId: string, userId: string): Promise<MapDataResponseDto> {
		console.log(`Fetching real map data for org ${orgId}, branch ${branchId}, user ${userId}`);

		try {
			// 1. Fetch workers data
			const workers = await this.getWorkerLocations(orgId, branchId);

			// 2. Fetch events data
			const events = await this.getMapEvents(orgId, branchId);

			// 3. Get map configuration
			const mapConfig = this.getMapConfig();

			return {
				workers,
				events,
				mapConfig,
			};
		} catch (error) {
			console.error('Error fetching real map data:', error);
			throw error;
		}
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
		const workerPromises = users.map(async (user) => {
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

				// If no tracking data available, leave position blank
				let position: [number, number] | null = null;
				let address = 'Unknown location';

				if (latestTracking) {
					position = [latestTracking.latitude, latestTracking.longitude];
					address = latestTracking.address || 'Unknown location';
				} else {
					// No tracking data, leave position null
					
					// Try to get org/branch name for the address at least
					if (user.branch) {
						address = `${user.branch.name || 'Branch'} location`;
					} else if (user.organisation) {
						address = `${user.organisation.name || 'Organization'} location`;
					}
				}

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
					position: position || undefined,
					markerType,
					status: statusText,
					image: user.photoURL || '/placeholder.svg?height=100&width=100',
					location: {
						address,
						imageUrl: latestTracking ? 'https://images.pexels.com/photos/2464890/pexels-photo-2464890.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' : undefined,
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
		});

		// Wait for all worker data to be processed
		const results = await Promise.all(workerPromises);

		// Filter out any null results from failed worker data processing
		return results.filter(worker => worker !== null) as WorkerLocationDto[];
	}

	// New helper method to get comprehensive worker activity data
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
						isDeleted: false
					}
				});
			} catch (error) {
				console.warn(`Claims repository access error: ${error.message}. Setting claims count to 0.`);
				// Continue with claimsCount = 0
			}

			// Count journals
			const journalsCount = await this.journalRepository.count({
				where: {
					owner: { uid: userId },
					createdAt: Between(startDate, endDate)
				}
			});

			// Count leads
			const leadsCount = await this.leadRepository.count({
				where: {
					owner: { uid: userId },
					createdAt: Between(startDate, endDate)
				}
			});

			// Count check-ins
			const checkInsCount = await this.checkInRepository.count({
				where: {
					owner: { uid: userId },
					checkInTime: Between(startDate, endDate)
				}
			});

			// Count tasks (both created and assigned)
			const createdTasksCount = await this.taskRepository.count({
				where: {
					creator: { uid: userId },
					updatedAt: Between(startDate, endDate)
				}
			});

			// Count assigned tasks (more complex due to JSON array storage)
			const allTasks = await this.taskRepository.find({
				where: {
					updatedAt: Between(startDate, endDate)
				}
			});

			// Filter tasks where user is in assignees
			const assignedTasksCount = allTasks.filter(task => {
				if (task.assignees && Array.isArray(task.assignees)) {
					return task.assignees.some(assignee => assignee.uid === userId);
				}
				return false;
			}).length;

			// Get quotations count if that repository exists
			let quotationsCount = 0;
			try {
				const quotationsRepository = this.entityManager.getRepository('quotations');
				quotationsCount = await quotationsRepository.count({
					where: {
						ownerUid: userId,
						createdAt: Between(startDate, endDate)
					}
				});
			} catch (error) {
				console.warn(`Quotations repository not available: ${error.message}`);
			}

			// Total unique tasks (avoiding double-counting)
			const tasksCount = Math.max(createdTasksCount, assignedTasksCount);

			return {
				claims: claimsCount,
				journals: journalsCount,
				leads: leadsCount,
				checkIns: checkInsCount,
				tasks: tasksCount,
				quotations: quotationsCount || 0
			};
		} catch (error) {
			console.error(`Error fetching activity stats for user ${userId}:`, error);
			return {
				claims: 0,
				journals: 0,
				leads: 0,
				checkIns: 0,
				tasks: 0,
				quotations: 0
			};
		}
	}

	// Helper method to get map events from real data
	private async getMapEvents(orgId: string, branchId: string): Promise<MapEventDto[]> {
		const events: MapEventDto[] = [];

		// Define date ranges - focus more on today's data
		const now = new Date();
		const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
		const startOfYesterday = new Date(startOfToday);
		startOfYesterday.setDate(startOfYesterday.getDate() - 1);
		const startOfPeriod = new Date(startOfToday);
		startOfPeriod.setDate(startOfPeriod.getDate() - 7); // Look back 7 days for better activity coverage

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

			// Get all users' IDs for easy querying
			const userIds = users.map(user => user.uid);
			
			// Create a map of user IDs to names for easy lookups
			const userNameMap = new Map<number, string>();
			for (const user of users) {
				userNameMap.set(user.uid, `${user.name || ''} ${user.surname || ''}`.trim());
			}

			// 1. TRACKING DATA - Get latest tracking data for all users
			const trackings = await this.trackingRepository.find({
				where: {
					owner: { uid: In(userIds) },
					createdAt: Between(startOfToday, now),
				},
				relations: ['owner'],
				order: {
					createdAt: 'DESC',
				},
			});
			
			// Process tracking data for location events
			for (const tracking of trackings) {
				if (!tracking.owner) continue;
				
				const userName = userNameMap.get(tracking.owner.uid) || 'Unknown user';
				const address = tracking.address || 'Unknown location';
				
				events.push({
					id: `tracking-${tracking.owner.uid}-${tracking.uid}`,
					user: userName,
					type: MapMarkerType.CHECK_IN,
					time: this.formatEventTime(tracking.createdAt),
					location: address,
					title: `Tracked at ${address}`,
				});
			}

			// 2. TASKS - Get all tasks created or updated today
			const tasks = await this.taskRepository.find({
				where: [
					{
						assignees: Not(IsNull()),
						createdAt: Between(startOfToday, now),
					},
					{
						assignees: Not(IsNull()),
						updatedAt: Between(startOfToday, now),
					},
					{
						assignees: Not(IsNull()),
						completionDate: Between(startOfToday, now),
					},
					{
						assignees: Not(IsNull()),
						status: TaskStatus.IN_PROGRESS,
					}
				],
				relations: ['creator', 'clients'],
				order: {
					updatedAt: 'DESC',
				},
			});
			
			// Process tasks events
			for (const task of tasks) {
				if (!task.assignees || task.assignees.length === 0) continue;
				
				const userId = task.assignees[0]?.uid;
				const userName = userNameMap.get(userId) || 'Unknown user';
				
				// Find client for this task
				let clientName = 'No client';
				if (task.clients && Array.isArray(task.clients) && task.clients.length > 0) {
					try {
						const clientUid = task.clients[0].uid;
						const client = await this.clientRepository.findOne({
							where: { uid: clientUid },
						});
						if (client) {
							clientName = client.name;
						}
					} catch (error) {
						console.error(`Error fetching client for task ${task.uid}:`, error);
					}
				}
				
				// Generate task event
				let eventTitle = '';
				let eventType = MapMarkerType.TASK;
				
				if (task.completionDate && task.completionDate >= startOfToday) {
					// Task was completed today
					eventTitle = `Completed task: ${task.title}`;
					eventType = MapMarkerType.JOB_COMPLETE;
				} else if (task.createdAt >= startOfToday) {
					// Task was created today
					eventTitle = `New task created: ${task.title}`;
				} else if (task.status === TaskStatus.IN_PROGRESS) {
					// Task is in progress
					eventTitle = `Working on: ${task.title} (Progress: ${task.progress || 0}%)`;
				} else {
					// Task was updated today
					eventTitle = `Updated task: ${task.title} (Status: ${task.status})`;
				}
				
				events.push({
					id: `task-${task.uid}`,
					user: userName,
					type: eventType,
					time: this.formatEventTime(task.updatedAt || task.createdAt),
					location: clientName,
					title: eventTitle,
				});
			}

			// 3. CHECK-INS - Get all check-ins from today
			const checkIns = await this.checkInRepository.find({
				where: {
					owner: { uid: In(userIds) },
					checkInTime: Between(startOfToday, now),
				},
				relations: ['owner', 'client'],
				order: {
					checkInTime: 'DESC',
				},
			});

			for (const checkIn of checkIns) {
				if (!checkIn.owner) continue;

				const userName = userNameMap.get(checkIn.owner.uid) || 'Unknown user';
				const locationText = checkIn.client 
					? `${checkIn.client.name}${checkIn.checkInLocation ? ` (${checkIn.checkInLocation})` : ''}` 
					: checkIn.checkInLocation || 'Unknown location';

				// Add check-in event
				events.push({
					id: `checkin-${checkIn.uid}`,
					user: userName,
					type: MapMarkerType.CHECK_IN,
					time: this.formatEventTime(new Date(checkIn.checkInTime)),
					location: locationText,
					title: checkIn.client 
						? `Visit to ${checkIn.client.name}${(checkIn as any).purpose ? ` - ${(checkIn as any).purpose}` : ''}` 
						: 'Client check-in',
				});

				// Add check-out event if available
				if (checkIn.checkOutTime) {
					const durationMinutes = Math.round((new Date(checkIn.checkOutTime).getTime() - new Date(checkIn.checkInTime).getTime()) / (1000 * 60));
					const hours = Math.floor(durationMinutes / 60);
					const minutes = durationMinutes % 60;
					const durationText = hours > 0 
						? `${hours}h ${minutes}m` 
						: `${minutes}m`;

					events.push({
						id: `checkout-${checkIn.uid}`,
						user: userName,
						type: MapMarkerType.CHECK_OUT,
						time: this.formatEventTime(new Date(checkIn.checkOutTime)),
						location: checkIn.checkOutLocation || locationText,
						title: checkIn.client 
							? `Completed visit to ${checkIn.client.name} (Duration: ${durationText})` 
							: `Client check-out (Duration: ${durationText})`,
					});
				}
			}

			// 4. LEADS - Get all leads created or updated today
			const leads = await this.leadRepository.find({
				where: [
					{
						owner: { uid: In(userIds) },
						createdAt: Between(startOfToday, now),
					},
					{
						owner: { uid: In(userIds) },
						updatedAt: Between(startOfToday, now),
					}
				],
				relations: ['owner', 'client'],
				order: {
					updatedAt: 'DESC',
				},
			});
			
			// Process leads events
			for (const lead of leads) {
				if (!lead.owner) continue;
				
				const userName = userNameMap.get(lead.owner.uid) || 'Unknown user';
				let locationText = 'Unknown location';
				
				if (lead.client) {
					locationText = lead.client.name;
				} else if (lead.name) {
					locationText = lead.name;
				}
				
				// Determine if lead was created or updated today
				let eventTitle = '';
				if (lead.createdAt >= startOfToday) {
					eventTitle = `New lead created: ${lead.name || 'Untitled'}`;
				} else {
					eventTitle = `Updated lead: ${lead.name || 'Untitled'} (Status: ${lead.status})`;
				}
				
				events.push({
					id: `lead-${lead.uid}`,
					user: userName,
					type: MapMarkerType.LEAD,
					time: this.formatEventTime(lead.updatedAt || lead.createdAt),
					location: locationText,
					title: eventTitle,
				});
			}

			// 5. JOURNALS - Get all journals created today
			const journals = await this.journalRepository.find({
				where: {
					owner: { uid: In(userIds) },
					createdAt: Between(startOfToday, now),
				},
				relations: ['owner'],
				order: {
					createdAt: 'DESC',
				},
			});
			
			// Process journal events
			for (const journal of journals) {
				if (!journal.owner) continue;
				
				const userName = userNameMap.get(journal.owner.uid) || 'Unknown user';
				
				events.push({
					id: `journal-${journal.uid}`,
					user: userName,
					type: MapMarkerType.JOURNAL,
					time: this.formatEventTime(journal.createdAt),
					location: 'Office',
					title: `Journal entry: ${journal.comments?.substring(0, 30) + '...' || 'No content'}`,
				});
			}

			// 6. CLAIMS - Get all claims created today using entity manager
			try {
				// Use the proper entity name 'claim' (singular) instead of 'claims'
				const claimsRepository = this.entityManager.getRepository('claim');
				const claims = await claimsRepository.find({
					where: {
						owner: { uid: In(userIds) },
						createdAt: Between(startOfToday, now),
						isDeleted: false
					},
					relations: ['owner'],
					order: {
						createdAt: 'DESC',
					},
				});
				
				// Process claims events
				for (const claim of claims) {
					if (!claim.owner) continue;
					
					const userName = userNameMap.get(claim.owner.uid) || 'Unknown user';
					
					events.push({
						id: `claim-${claim.uid}`,
						user: userName,
						type: MapMarkerType.TASK,  // Using task marker type since there's no specific claim type
						time: this.formatEventTime(claim.createdAt),
						location: 'Office', // Using default location since location field may not exist
						title: `New claim: ${claim.comments?.substring(0, 30) || `Amount: ${claim.amount}`}`,
					});
				}
			} catch (error) {
				console.warn(`Error fetching claims data: ${error.message}. Skipping claims in events.`);
				// Continue execution without claims data
			}

			// 7. ATTENDANCE - Get attendance records for today
			const attendances = await this.attendanceRepository.find({
				where: {
					owner: { uid: In(userIds) },
					checkIn: Between(startOfToday, now),
				},
				relations: ['owner'],
				order: {
					checkIn: 'DESC',
				},
			});

			for (const attendance of attendances) {
				if (!attendance.owner) continue;

				const userName = userNameMap.get(attendance.owner.uid) || 'Unknown user';

				// Add shift start
				events.push({
					id: `shift-start-${attendance.uid}`,
					user: userName,
					type: MapMarkerType.SHIFT_START,
					time: this.formatEventTime(attendance.checkIn),
					location: attendance.checkInNotes || 'Office',
					title: `Started shift${attendance.status ? ` (${attendance.status})` : ''}`,
				});

				// Add shift end if available
				if (attendance.checkOut) {
					const durationMinutes = Math.round((attendance.checkOut.getTime() - attendance.checkIn.getTime()) / (1000 * 60));
					const hours = Math.floor(durationMinutes / 60);
					const minutes = durationMinutes % 60;
					const durationText = hours > 0 
						? `${hours}h ${minutes}m` 
						: `${minutes}m`;
						
					events.push({
						id: `shift-end-${attendance.uid}`,
						user: userName,
						type: MapMarkerType.SHIFT_END,
						time: this.formatEventTime(attendance.checkOut),
						location: attendance.checkOutNotes || 'Office',
						title: `Ended shift${durationText ? ` (Duration: ${durationText})` : ''}`,
					});
				}

				// Add break events if available
				if (attendance.breakStartTime) {
					events.push({
						id: `break-start-${attendance.uid}`,
						user: userName,
						type: MapMarkerType.BREAK_START,
						time: this.formatEventTime(attendance.breakStartTime),
						location: attendance.breakNotes || 'Office',
						title: `Started break`,
					});
					
					if (attendance.breakEndTime) {
						const breakDurationMinutes = Math.round((attendance.breakEndTime.getTime() - attendance.breakStartTime.getTime()) / (1000 * 60));
						
						events.push({
							id: `break-end-${attendance.uid}`,
							user: userName,
							type: MapMarkerType.BREAK_END,
							time: this.formatEventTime(attendance.breakEndTime),
							location: attendance.breakNotes || 'Office',
							title: `Ended break (Duration: ${breakDurationMinutes}m)`,
						});
					}
				}
			}

			// Sort events by time, most recent first
			events.sort((a, b) => {
				const timeA = this.parseEventTime(a.time);
				const timeB = this.parseEventTime(b.time);
				return timeB.getTime() - timeA.getTime();
			});

			return events;
		} catch (error) {
			console.error('Error fetching events data:', error);
			return []; // Return empty array on error
		}
	}

	// Utility method to get map configuration
	private getMapConfig(): MapConfigDto {
		const defaultLat = this.configService.get<number>('MAP_DEFAULT_LAT', -26.2041);
		const defaultLng = this.configService.get<number>('MAP_DEFAULT_LNG', 28.0473);
		
		// Ensure we have numbers, not strings
		return {
			defaultCenter: {
				lat: typeof defaultLat === 'string' ? parseFloat(defaultLat) : defaultLat,
				lng: typeof defaultLng === 'string' ? parseFloat(defaultLng) : defaultLng,
			},
			orgRegions: this.configService.get<any[]>('MAP_ORG_REGIONS', [
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
			]).map(region => ({
				...region,
				center: {
					lat: typeof region.center.lat === 'string' ? parseFloat(region.center.lat) : region.center.lat,
					lng: typeof region.center.lng === 'string' ? parseFloat(region.center.lng) : region.center.lng
				}
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

	// Helper method to get location image URL
	private getLocationImageUrl(address: string, markerType: MapMarkerType, position?: [number, number]): string {
		// For now, use a placeholder image for all locations
		return 'https://images.pexels.com/photos/2464890/pexels-photo-2464890.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';

		// In the future, this could integrate with Google Places API or similar to get actual location images
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
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);

		if (date >= today) {
			return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
		} else if (date >= yesterday) {
			return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
		} else {
			return (
				date.toLocaleDateString('en-US', {
					month: 'short',
					day: 'numeric',
				}) +
				', ' +
				date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
			);
		}
	}

	// Helper method to parse event time string back to Date
	private parseEventTime(timeString: string): Date {
		const now = new Date();

		if (timeString.startsWith('Today')) {
			const timePart = timeString.split(', ')[1];
			const [timePortion, ampm] = timePart.split(' ');
			const [hours, minutes] = timePortion.split(':');
			const isPM = ampm === 'PM';

			const date = new Date();
			date.setHours(
				isPM && parseInt(hours) !== 12
					? parseInt(hours) + 12
					: !isPM && parseInt(hours) === 12
					? 0
					: parseInt(hours),
				parseInt(minutes),
				0,
				0,
			);
			return date;
		} else if (timeString.startsWith('Yesterday')) {
			const timePart = timeString.split(', ')[1];
			const [timePortion, ampm] = timePart.split(' ');
			const [hours, minutes] = timePortion.split(':');
			const isPM = ampm === 'PM';

			const date = new Date();
			date.setDate(date.getDate() - 1);
			date.setHours(
				isPM && parseInt(hours) !== 12
					? parseInt(hours) + 12
					: !isPM && parseInt(hours) === 12
					? 0
					: parseInt(hours),
				parseInt(minutes),
				0,
				0,
			);
			return date;
		} else {
			// For other dates, try to parse it
			try {
				return new Date(timeString);
			} catch (e) {
				return now; // Fallback to current time if parsing fails
			}
		}
	}

	// Utility method to format currency values
	private formatCurrency(value: number): string {
		return new Intl.NumberFormat('en-ZA', {
			style: 'currency',
			currency: 'ZAR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(value);
	}
}
