import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not, IsNull, EntityManager } from 'typeorm';
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
} from './dto/map-data.dto';

// Enum imports
import { TaskStatus, TaskPriority, JobStatus } from '../lib/enums/task.enums';
import { AttendanceStatus } from '../lib/enums/attendance.enums';

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

	/**
	 * Get mock data for testing
	 */
	getMockMapData(): MapDataResponseDto {
		const defaultCenter = {
			lat: this.configService.get<number>('MAP_DEFAULT_LAT', -26.2041),
			lng: this.configService.get<number>('MAP_DEFAULT_LNG', 28.0473),
		};

		// Helper function to generate location image URL
		const getLocationImageUrl = (
			address: string,
			markerType: MapMarkerType,
			position?: [number, number],
		): string => {
			// Use the specified Pexels image for all tasks/locations
			return 'https://images.pexels.com/photos/2464890/pexels-photo-2464890.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
		};

		// Generate mock data that matches dashboard expected format
		const mockWorkers: WorkerLocationDto[] = [
			// South Africa (Johannesburg area)
			{
				id: 'worker-1',
				name: 'Thabo Mbeki',
				status: 'Work in progress',
				position: [-26.2041, 28.0473], // Johannesburg CBD
				markerType: MapMarkerType.CHECK_IN,
				image: '/placeholder.svg?height=100&width=100',
				canAddTask: true,
				task: {
					id: 'J22008',
					title: 'Fix broken heating vent',
					client: 'Sandton City Mall',
				},
				location: {
					address: 'Nelson Mandela Square, Sandton, Johannesburg',
					imageUrl: getLocationImageUrl(
						'Nelson Mandela Square, Sandton, Johannesburg',
						MapMarkerType.CHECK_IN,
						[-26.2041, 28.0473],
					),
				},
				schedule: {
					current: '09:30 AM - 12:45 PM',
					next: '02:00 PM - 04:00 PM',
				},
				jobStatus: {
					startTime: '08:15 AM',
					endTime: '12:45 PM',
					duration: '4h 30m',
					status: 'In Progress',
					completionPercentage: 65,
				},
			},
			{
				id: 'worker-4',
				name: 'Nomsa Dlamini',
				status: 'En route to next job',
				position: [-26.2485, 28.13], // Kempton Park
				markerType: MapMarkerType.TASK,
				image: '/placeholder.svg?height=100&width=100',
				task: {
					id: 'J22011',
					title: 'Plumbing inspection',
					client: 'OR Tambo International Airport',
				},
				location: {
					address: 'O.R. Tambo International Airport, Kempton Park',
					imageUrl: getLocationImageUrl(
						'O.R. Tambo International Airport, Kempton Park',
						MapMarkerType.TASK,
						[-26.2485, 28.13],
					),
				},
				schedule: {
					current: '11:00 AM - 02:00 PM',
					next: '03:30 PM - 05:30 PM',
				},
				jobStatus: {
					startTime: '09:00 AM',
					endTime: '02:00 PM',
					duration: '5h 0m',
					status: 'Traveling',
					completionPercentage: 20,
				},
			},
			{
				id: 'worker-14',
				name: 'Nkosinathi Mthembu',
				status: 'Writing report',
				position: [-26.3354, 27.8888], // Soweto
				markerType: MapMarkerType.JOURNAL,
				image: '/placeholder.svg?height=100&width=100',
				task: {
					id: 'J22023',
					title: 'Site assessment',
					client: 'Maponya Mall',
				},
				location: {
					address: 'Chris Hani Road, Soweto, Johannesburg',
					imageUrl: getLocationImageUrl(
						'Chris Hani Road, Soweto, Johannesburg',
						MapMarkerType.JOURNAL,
						[-26.3354, 27.8888],
					),
				},
				schedule: {
					current: '10:00 AM - 02:00 PM',
					next: 'Tomorrow 10:00 AM',
				},
				jobStatus: {
					startTime: '10:00 AM',
					endTime: '02:00 PM',
					duration: '4h 0m',
					status: 'Documentation',
					completionPercentage: 80,
				},
			},
		];

		const mockEvents: MapEventDto[] = [
			// South Africa events
			{
				id: 'event-1',
				type: MapMarkerType.CHECK_IN,
				title: 'Morning check-in',
				time: 'Today, 08:15 AM',
				location: 'Nelson Mandela Square, Sandton, Johannesburg',
				user: 'Thabo Mbeki',
			},
			{
				id: 'event-4',
				type: MapMarkerType.TASK,
				title: 'Plumbing inspection started',
				time: 'Today, 11:15 AM',
				location: 'O.R. Tambo International Airport, Kempton Park',
				user: 'Nomsa Dlamini',
			},
			{
				id: 'event-20',
				type: MapMarkerType.JOURNAL,
				title: 'Site assessment documentation',
				time: 'Today, 01:30 PM',
				location: 'Chris Hani Road, Soweto, Johannesburg',
				user: 'Nkosinathi Mthembu',
			},
		];

		return {
			workers: mockWorkers,
			events: mockEvents,
			mapConfig: {
				defaultCenter,
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
				]),
			},
		};
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

		// Get all active users in the organization/branch
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

		for (const user of users) {
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

				// If no tracking data available, skip this user
				if (!latestTracking) continue;

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
					position: [latestTracking.latitude, latestTracking.longitude],
					markerType,
					status: statusText,
					image: user.photoURL || '/placeholder.svg?height=100&width=100',
					location: {
						address: latestTracking.address || 'Unknown location',
						imageUrl: this.getLocationImageUrl(latestTracking.address || 'Unknown location', markerType, [
							latestTracking.latitude,
							latestTracking.longitude,
						]),
					},
					schedule: await this.getUserSchedule(user.uid),
					jobStatus: await this.getUserJobStatus(user.uid),
				};

				// Add current task information if available
				const currentTask = await this.getCurrentTask(user.uid);
				if (currentTask) {
					// Find client for this task
					let clientName = 'No client';
					if (currentTask.clients && currentTask.clients.length > 0) {
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

				// Get recent activity stats for this worker (last 7 days)
				try {
					// Count claims
					const claimsRepository = this.entityManager.getRepository('claims');
					const claimsCount = await claimsRepository.count({
						where: {
							ownerUid: user.uid,
							createdAt: Between(startOfWeek, now),
							isDeleted: false
						}
					});

					// Count journals
					const journalsCount = await this.journalRepository.count({
						where: {
							owner: { uid: user.uid },
							createdAt: Between(startOfWeek, now)
						}
					});

					// Count leads
					const leadsCount = await this.leadRepository.count({
						where: {
							owner: { uid: user.uid },
							createdAt: Between(startOfWeek, now)
						}
					});

					// Count check-ins
					const checkInsCount = await this.checkInRepository.count({
						where: {
							owner: { uid: user.uid },
							checkInTime: Between(startOfWeek, now)
						}
					});

					// Count completed tasks
					const tasksCount = await this.taskRepository.count({
						where: [
							{
								creator: { uid: user.uid },
								jobEndTime: Between(startOfWeek, now)
							},
							{
								assignees: { uid: user.uid },
								jobEndTime: Between(startOfWeek, now)
							}
						]
					});

					// Add activity counts to worker data
					workerLocation.activity = {
						claims: claimsCount,
						journals: journalsCount,
						leads: leadsCount,
						checkIns: checkInsCount,
						tasks: tasksCount
					};
				} catch (error) {
					console.error(`Error fetching activity stats for user ${user.uid}:`, error);
				}

				// Check if user can add task based on role/permissions
				workerLocation.canAddTask = this.canUserAddTask(user);

				// Add break data if user is on break
				if (attendance?.breakStartTime && !attendance?.breakEndTime) {
					workerLocation.breakData = this.getBreakData(attendance);
				}

				workerLocations.push(workerLocation);
			} catch (error) {
				console.error(`Error processing worker location for user ${user.uid}:`, error);
				// Continue with next user instead of failing the whole process
			}
		}

		return workerLocations;
	}

	// Helper method to get map events from real data
	private async getMapEvents(orgId: string, branchId: string): Promise<MapEventDto[]> {
		const events: MapEventDto[] = [];

		// Define date ranges - today and last 3 days for better map coverage
		const now = new Date();
		const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
		const startOfPeriod = new Date(startOfToday);
		startOfPeriod.setDate(startOfPeriod.getDate() - 3); // Look back 3 days instead of just yesterday

		// Define query conditions
		const orgCondition = orgId ? { organisation: { ref: orgId } } : {};
		const branchCondition = branchId ? { branch: { uid: Number(branchId) } } : {};

		try {
			// 1. Get check-ins
			const checkIns = await this.checkInRepository.find({
				where: {
					...orgCondition,
					...branchCondition,
					checkInTime: Between(startOfPeriod, now),
				},
				relations: ['owner', 'client'],
				order: {
					checkInTime: 'DESC',
				},
			});

			for (const checkIn of checkIns) {
				if (!checkIn.owner) continue;

				// Add check-in event
				events.push({
					id: `checkin-${checkIn.uid}`,
					user: `${checkIn.owner.name || ''} ${checkIn.owner.surname || ''}`.trim(),
					type: MapMarkerType.CHECK_IN,
					time: this.formatEventTime(new Date(checkIn.checkInTime)),
					location: checkIn.checkInLocation || (checkIn.client ? checkIn.client.name : 'Unknown location'),
					title: checkIn.client ? `Visit to ${checkIn.client.name}` : 'Client check-in',
				});

				// Add check-out event if available
				if (checkIn.checkOutTime) {
					events.push({
						id: `checkout-${checkIn.uid}`,
						user: `${checkIn.owner.name || ''} ${checkIn.owner.surname || ''}`.trim(),
						type: MapMarkerType.CHECK_OUT,
						time: this.formatEventTime(new Date(checkIn.checkOutTime)),
						location: checkIn.checkOutLocation || checkIn.checkInLocation || 'Unknown location',
						title: checkIn.client ? `Completed visit to ${checkIn.client.name}` : 'Client check-out',
					});
				}
			}

			// 2. Get attendance records (shifts & breaks) - improved details
			const attendances = await this.attendanceRepository.find({
				where: {
					...orgCondition,
					...branchCondition,
					checkIn: Between(startOfPeriod, now),
				},
				relations: ['owner'],
				order: {
					checkIn: 'DESC',
				},
			});

			for (const attendance of attendances) {
				if (!attendance.owner) continue;

				const userName = `${attendance.owner.name || ''} ${attendance.owner.surname || ''}`.trim();

				// Add shift start
				events.push({
					id: `shift-start-${attendance.uid}`,
					user: userName,
					type: MapMarkerType.SHIFT_START,
					time: this.formatEventTime(attendance.checkIn),
					location: attendance.checkInNotes || 'Office',
					title: 'Started shift',
				});

				// Add shift end if available
				if (attendance.checkOut) {
					events.push({
						id: `shift-end-${attendance.uid}`,
						user: userName,
						type: MapMarkerType.SHIFT_END,
						time: this.formatEventTime(attendance.checkOut),
						location: attendance.checkOutNotes || 'Office',
						title: 'Ended shift',
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
						title: 'Started break',
					});

					if (attendance.breakEndTime) {
						events.push({
							id: `break-end-${attendance.uid}`,
							user: userName,
							type: MapMarkerType.BREAK_END,
							time: this.formatEventTime(attendance.breakEndTime),
							location: attendance.breakNotes || 'Office',
							title: 'Ended break',
						});
					}
				}
			}

			// 3. Get task events with improved detail
			const tasks = await this.taskRepository.find({
				where: [
					{
						...orgCondition,
						...branchCondition,
						jobStartTime: Between(startOfPeriod, now),
					},
					{
						...orgCondition,
						...branchCondition,
						jobEndTime: Between(startOfPeriod, now),
					},
					{
						...orgCondition,
						...branchCondition,
						updatedAt: Between(startOfPeriod, now),
						status: TaskStatus.IN_PROGRESS,
					},
				],
				relations: ['creator', 'assignees', 'clients'],
				order: {
					updatedAt: 'DESC',
				},
			});

			for (const task of tasks) {
				if (!task.creator) continue;

				const userName = `${task.creator.name || ''} ${task.creator.surname || ''}`.trim();
				
				// Safely extract client name
				let clientName = 'Unknown client';
				if (task.clients && Array.isArray(task.clients) && task.clients.length > 0) {
					try {
						const clientId = task.clients[0].uid;
						const client = await this.clientRepository.findOne({
							where: { uid: clientId }
						});
						if (client) {
							clientName = client.name;
						}
					} catch (error) {
						console.error(`Error fetching client for task ${task.uid}:`, error);
					}
				}
				
				// Safely build assignee names list
				let assigneeNames = userName;
				if (task.assignees && Array.isArray(task.assignees) && task.assignees.length > 0) {
					try {
						const assigneeIds = task.assignees.map(a => a.uid);
						const assignees = await this.userRepository.find({
							where: assigneeIds.map(id => ({ uid: id }))
						});
						
						if (assignees && assignees.length > 0) {
							assigneeNames = assignees
								.map(user => `${user.name || ''} ${user.surname || ''}`.trim())
								.join(', ');
						}
					} catch (error) {
						console.error(`Error fetching assignees for task ${task.uid}:`, error);
					}
				}

				// Task started
				if (task.jobStartTime && task.jobStartTime >= startOfPeriod) {
					events.push({
						id: `task-start-${task.uid}`,
						user: assigneeNames,
						type: MapMarkerType.JOB_START,
						time: this.formatEventTime(task.jobStartTime),
						location: clientName,
						title: `Started: ${task.title}`,
					});
				}

				// Task completed
				if (task.jobEndTime && task.jobEndTime >= startOfPeriod) {
					events.push({
						id: `task-end-${task.uid}`,
						user: assigneeNames,
						type: MapMarkerType.JOB_COMPLETE,
						time: this.formatEventTime(task.jobEndTime),
						location: clientName,
						title: `Completed: ${task.title}`,
					});
				}

				// Task updated
				if (
					task.status === TaskStatus.IN_PROGRESS &&
					task.updatedAt >= startOfPeriod &&
					(!task.jobStartTime || task.updatedAt > task.jobStartTime)
				) {
					events.push({
						id: `task-update-${task.uid}-${task.updatedAt.getTime()}`,
						user: assigneeNames,
						type: MapMarkerType.TASK,
						time: this.formatEventTime(task.updatedAt),
						location: clientName,
						title: `Working on: ${task.title} (${task.progress}%)`,
					});
				}
			}

			// 4. Get journal entries with improved detail
			const journals = await this.journalRepository.find({
				where: {
					...orgCondition,
					...branchCondition,
					createdAt: Between(startOfPeriod, now),
				},
				relations: ['owner'],
				order: {
					createdAt: 'DESC',
				},
			});

			for (const journal of journals) {
				if (!journal.owner) continue;

				// Use clientRef instead of client object since it's not in the relations
				const clientName = journal.clientRef || 'Unknown client';
				
				events.push({
					id: `journal-${journal.uid}`,
					user: `${journal.owner.name || ''} ${journal.owner.surname || ''}`.trim(),
					type: MapMarkerType.JOURNAL,
					time: this.formatEventTime(journal.createdAt),
					location: clientName,
					title: journal.comments
						? journal.comments.substring(0, 50) + (journal.comments.length > 50 ? '...' : '')
						: 'Journal entry',
				});
			}

			// 5. Get leads with improved detail
			const leads = await this.leadRepository.find({
				where: {
					...orgCondition,
					...branchCondition,
					createdAt: Between(startOfPeriod, now),
				},
				relations: ['owner'],
				order: {
					createdAt: 'DESC',
				},
			});

			for (const lead of leads) {
				if (!lead.owner) continue;

				events.push({
					id: `lead-${lead.uid}`,
					user: `${lead.owner.name || ''} ${lead.owner.surname || ''}`.trim(),
					type: MapMarkerType.LEAD,
					time: this.formatEventTime(lead.createdAt),
					location: lead.notes || lead.name || 'New lead location',
					title: `New lead: ${lead.name || 'Unnamed'} (${lead.status || 'New'})`,
				});
			}

			// 6. Get claims data
			try {
				// Define a type for the claims data based on expected structure
				interface ClaimData {
					uid: number;
					title: string;
					status: string;
					location: string;
					createdAt: Date;
					owner: User;
				}
				
				// Look up the Claims repository via the entityManager
				const claimsRepository = this.entityManager.getRepository('claims');
				
				// Build the query conditions
				const whereConditions: any = {
					createdAt: Between(startOfPeriod, now),
					isDeleted: false
				};
				
				if (orgId) {
					whereConditions.orgRef = orgId;
				}
				
				if (branchId) {
					whereConditions.branchUid = branchId;
				}
				
				// Fetch claims with their owners
				const claims = await claimsRepository.find({
					where: whereConditions,
					relations: ['owner'],
					order: {
						createdAt: 'DESC'
					}
				});
				
				// Process and add each claim as an event
				for (const claim of claims) {
					if (!claim.owner) continue;
					
					events.push({
						id: `claim-${claim.uid}`,
						user: `${claim.owner.name || ''} ${claim.owner.surname || ''}`.trim(),
						type: MapMarkerType.TASK, // Using task as a similar marker type
						time: this.formatEventTime(claim.createdAt),
						location: claim.location || 'Claim location',
						title: `Claim: ${claim.title || 'Untitled claim'} (${claim.status || 'New'})`,
					});
				}
			} catch (error) {
				console.error('Error fetching claims data:', error);
			}

			// Sort events by time (most recent first)
			return events.sort((a, b) => {
				const dateA = this.parseEventTime(a.time);
				const dateB = this.parseEventTime(b.time);
				return dateB.getTime() - dateA.getTime();
			});
		} catch (error) {
			console.error('Error fetching map events:', error);
			return [];
		}
	}

	// Utility method to get map configuration
	private getMapConfig(): MapConfigDto {
		return {
			defaultCenter: {
				lat: this.configService.get<number>('MAP_DEFAULT_LAT', -26.2041),
				lng: this.configService.get<number>('MAP_DEFAULT_LNG', 28.0473),
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
			]),
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
}
