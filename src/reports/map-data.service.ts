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
						imageUrl: latestTracking
							? 'https://images.pexels.com/photos/2464890/pexels-photo-2464890.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
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
		});

		// Wait for all worker data to be processed
		const results = await Promise.all(workerPromises);

		// Filter out any null results from failed worker data processing
		return results.filter((worker) => worker !== null) as WorkerLocationDto[];
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
					const quotationsRepository = this.taskRepository.manager.getRepository('quotations');
					quotationsCount = await quotationsRepository.count({
						where: {
							ownerUid: userId,
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

	// Helper method to get map events from real data
	private async getMapEvents(orgId: string, branchId: string): Promise<MapEventDto[]> {
		console.log("Starting to fetch map events...");
		const events: MapEventDto[] = [];

		// Define date ranges - focus only on today's data
		const now = new Date();
		const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
		const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

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
			for (const user of users) {
				userNameMap.set(user.uid, `${user.name || ''} ${user.surname || ''}`.trim());
			}

			// 1. Process TASKS - only today's tasks
			try {
				const tasks = await this.taskRepository.find({
					where: [
						// Tasks created today
						{
							assignees: Not(IsNull()),
							createdAt: Between(startOfToday, endOfToday),
						},
						// Tasks updated today
						{
							assignees: Not(IsNull()),
							updatedAt: Between(startOfToday, endOfToday),
						},
						// Tasks completed today
						{
							assignees: Not(IsNull()),
							completionDate: Between(startOfToday, endOfToday),
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
					
					// Find client for this task
					let clientName = 'No client';
					if (task.clients && Array.isArray(task.clients) && task.clients.length > 0) {
						try {
							const clientUid = task.clients[0].uid;
							if (clientUid) {
								const client = await this.clientRepository.findOne({
									where: { uid: clientUid },
								});
								if (client) {
									clientName = client.name;
								}
							}
						} catch (error) {
							console.error(`Error fetching client for task ${task.uid}:`, error);
						}
					}
					
					// Create event object
					const eventObj = {
						id: `task-${task.uid}`,
						user: userName,
						type: MapMarkerType.TASK,
						category: MapEventCategory.TASK,
						time: this.formatEventTime(task.updatedAt || task.createdAt),
						timePeriod: 'Today',
						location: clientName,
						title: task.status === TaskStatus.COMPLETED 
							? `Completed task: ${task.title}`
							: `New task created: ${task.title}`,
						context: {
							taskId: task.uid,
							taskStatus: task.status,
							progress: task.progress || 0,
							createdAt: task.createdAt,
							dateKey: this.formatDateShort(task.createdAt)
						}
					};
					
					events.push(eventObj);
				}
				
				// Add summary if needed
				if (tasks.length >= 3) {
					const users = new Set(tasks.map(t => t.assignees[0]?.uid).filter(Boolean));
					events.push({
						id: `task-summary-${this.formatDateShort(now)}`,
						user: 'Multiple Users',
						type: MapMarkerType.TASK,
						category: MapEventCategory.SUMMARY,
						time: this.formatEventTime(now),
						timePeriod: 'Today',
						location: 'Various Locations',
						title: `${tasks.length} tasks created/updated (${users.size} users)`
					});
				}
			} catch (error) {
				console.error('Error processing task data:', error.message);
			}

			// 2. Process LEADS - only today's leads
			try {
				const leads = await this.leadRepository.find({
					where: {
						owner: { uid: In(userIds) },
						createdAt: Between(startOfToday, endOfToday)
					},
					relations: ['owner', 'client'],
					order: { createdAt: 'DESC' }
				});
				
				console.log(`Found ${leads.length} lead records`);
				
				for (const lead of leads) {
					if (!lead.owner) continue;
					
					const userName = userNameMap.get(lead.owner.uid) || 'Unknown user';
					const clientName = lead.client ? lead.client.name : 'No client';
					
					events.push({
						id: `lead-${lead.uid}`,
						user: userName,
						type: MapMarkerType.LEAD,
						category: MapEventCategory.LEAD,
						time: this.formatEventTime(lead.createdAt),
						timePeriod: 'Today',
						location: clientName,
						title: `New lead created: ${(lead as any).title || 'Untitled lead'}`
					});
				}
			} catch (error) {
				console.error('Error processing lead data:', error.message);
			}

			// 3. Process JOURNALS - only today's journals
			try {
				const journals = await this.journalRepository.find({
					where: {
						owner: { uid: In(userIds) },
						createdAt: Between(startOfToday, endOfToday)
					},
					relations: ['owner'],
					order: { createdAt: 'DESC' }
				});
				
				console.log(`Found ${journals.length} journal records`);
				
				for (const journal of journals) {
					if (!journal.owner) continue;
					
					const userName = userNameMap.get(journal.owner.uid) || 'Unknown user';
					
					events.push({
						id: `journal-${journal.uid}`,
						user: userName,
						type: MapMarkerType.JOURNAL,
						category: MapEventCategory.JOURNAL,
						time: this.formatEventTime(journal.createdAt),
						timePeriod: 'Today',
						location: (journal as any).location || 'Unknown location',
						title: `New journal entry: ${(journal as any).title || 'Untitled entry'}`
					});
				}
			} catch (error) {
				console.error('Error processing journal data:', error.message);
			}

			// 4. Process CHECK-INS - only today's check-ins
			try {
				const checkIns = await this.checkInRepository.find({
					where: {
						owner: { uid: In(userIds) },
						checkInTime: Between(startOfToday, endOfToday)
					},
					relations: ['owner'],
					order: { checkInTime: 'DESC' }
				});
				
				console.log(`Found ${checkIns.length} check-in records`);
				
				for (const checkIn of checkIns) {
					if (!checkIn.owner) continue;
					
					const userName = userNameMap.get(checkIn.owner.uid) || 'Unknown user';
					
					try {
						const eventObj = {
							id: `checkin-${checkIn.uid}`,
							user: userName,
							type: MapMarkerType.CHECK_IN,
							category: MapEventCategory.CHECK_IN,
							time: this.formatEventTime(checkIn.checkInTime),
							timePeriod: 'Today',
							location: checkIn.checkInLocation || 'Unknown location',
							title: `Check-in at ${this.formatEventTime(checkIn.checkInTime)}`
						};
						
						events.push(eventObj);
					} catch (error) {
						console.error(`Error processing check-in ${checkIn.uid}:`, error.message);
						continue;
					}
				}
			} catch (error) {
				console.error('Error processing check-in data:', error.message);
			}

			// Sort events by time, most recent first
			events.sort((a, b) => {
				const timeA = this.parseEventTime(a.time);
				const timeB = this.parseEventTime(b.time);
				return timeB.getTime() - timeA.getTime();
			});

			console.log(`Returning ${events.length} map events in total`);
			return events;
		} catch (error) {
			console.error('Error fetching events data:', error);
			return events;
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

	// Helper method to parse event time string back to Date
	private parseEventTime(timeStr: string): Date {
		try {
			const [time, period] = timeStr.split(' ');
			const [hours, minutes] = time.split(':').map(Number);
			const now = new Date();
			const result = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			
			let hour = hours;
			if (period === 'PM' && hours !== 12) {
				hour += 12;
			} else if (period === 'AM' && hours === 12) {
				hour = 0;
			}
			
			result.setHours(hour, minutes);
			return result;
		} catch (error) {
			return new Date();
		}
	}

	// Utility method to format currency values
	private formatCurrency(value: number): string {
		return new Intl.NumberFormat('en-ZA', {
			style: 'currency',
			currency: 'ZAR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(value);
	}
}
