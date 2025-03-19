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

		// Mock locations across the world for better coverage
		const locations = [
			// Africa
			{ name: 'Sandton City Mall', address: 'Nelson Mandela Square, Sandton, Johannesburg, South Africa', position: [-26.1052, 28.0560] },
			{ name: 'Cairo Mall', address: 'El-Nasr Road, Cairo, Egypt', position: [30.0444, 31.2357] },
			{ name: 'Kigali Convention Centre', address: 'KG 2 Roundabout, Kigali, Rwanda', position: [-1.9441, 30.0619] },
			{ name: 'Victoria Falls Hotel', address: 'Victoria Falls, Zimbabwe', position: [-17.9315, 25.8307] },
			{ name: 'Two Oceans Aquarium', address: 'V&A Waterfront, Cape Town, South Africa', position: [-33.9032, 18.4195] },
			
			// Europe
			{ name: 'Eiffel Tower', address: 'Champ de Mars, Paris, France', position: [48.8584, 2.2945] },
			{ name: 'Colosseum', address: 'Piazza del Colosseo, Rome, Italy', position: [41.8902, 12.4922] },
			{ name: 'Sagrada Familia', address: 'Carrer de Mallorca, Barcelona, Spain', position: [41.4036, 2.1744] },
			{ name: 'Harrods', address: 'Brompton Road, London, UK', position: [51.4994, -0.1631] },
			{ name: 'Brandenburg Gate', address: 'Pariser Platz, Berlin, Germany', position: [52.5163, 13.3777] },
			
			// Asia
			{ name: 'Tokyo Skytree', address: 'Sumida City, Tokyo, Japan', position: [35.7101, 139.8107] },
			{ name: 'Marina Bay Sands', address: 'Bayfront Avenue, Singapore', position: [1.2834, 103.8607] },
			{ name: 'Burj Khalifa', address: 'Sheikh Mohammed bin Rashid Boulevard, Dubai, UAE', position: [25.1972, 55.2744] },
			{ name: 'Taj Mahal', address: 'Dharmapuri, Agra, India', position: [27.1751, 78.0421] },
			{ name: 'Great Wall of China', address: 'Huairou District, Beijing, China', position: [40.4319, 116.5704] },
			
			// North America
			{ name: 'Empire State Building', address: '350 Fifth Avenue, New York, USA', position: [40.7484, -73.9857] },
			{ name: 'Golden Gate Bridge', address: 'Golden Gate Bridge, San Francisco, USA', position: [37.8199, -122.4783] },
			{ name: 'CN Tower', address: 'Front Street West, Toronto, Canada', position: [43.6426, -79.3871] },
			{ name: 'Cancun Hotel Zone', address: 'Kukulkan Boulevard, Cancun, Mexico', position: [21.1289, -86.7486] },
			{ name: 'Disney World', address: 'Walt Disney World Resort, Orlando, USA', position: [28.3772, -81.5707] },
			
			// South America
			{ name: 'Christ the Redeemer', address: 'Corcovado Mountain, Rio de Janeiro, Brazil', position: [-22.9519, -43.2106] },
			{ name: 'Machu Picchu', address: 'Machu Picchu, Peru', position: [-13.1631, -72.5450] },
			{ name: 'Casa Rosada', address: 'Plaza de Mayo, Buenos Aires, Argentina', position: [-34.6083, -58.3712] },
			{ name: 'Cartagena Old Town', address: 'Cartagena, Colombia', position: [10.4236, -75.5503] },
			{ name: 'Plaza de Armas', address: 'Santiago, Chile', position: [-33.4378, -70.6504] },
			
			// Oceania
			{ name: 'Sydney Opera House', address: 'Bennelong Point, Sydney, Australia', position: [-33.8568, 151.2153] },
			{ name: 'Sky Tower', address: 'Victoria Street West, Auckland, New Zealand', position: [-36.8485, 174.7633] },
			{ name: 'Fiji Marriott Resort', address: 'Momi Bay, Fiji', position: [-17.9068, 177.2065] },
			{ name: 'Port Vila Market', address: 'Port Vila, Vanuatu', position: [-17.7405, 168.3123] },
			{ name: 'Royal Palace', address: "Nuku'alofa, Tonga", position: [-21.1343, -175.1962] },
		];

		// Mock worker names - expanded with international names
		const workerNames = [
			// African names
			'Thabo Mbeki', 'Nomsa Dlamini', 'Ahmed Hassan', 'Fatima Nkosi', 'Kofi Mensah',
			// European names
			'Sophie Müller', 'Pierre Dubois', 'Elena Rossi', 'James Wilson', 'Ana García',
			// Asian names
			'Wei Zhang', 'Hiroshi Tanaka', 'Priya Sharma', 'Min-Jun Kim', 'Fatima Al-Fasi',
			// North American names
			'Michael Johnson', 'Maria Rodriguez', 'Robert Smith', 'Emily Wilson', 'Juan Hernandez',
			// South American names
			'Carlos Oliveira', 'Isabella Fernandez', 'Mateo Santos', 'Gabriela Perez', 'Luis Martinez',
			// Oceania names
			'Jackson Cooper', 'Olivia Williams', 'Tane Hohepa', 'Aroha Bennett', 'Noah Patel'
		];

		// Task titles - expanded with more international variety
		const taskTitles = [
			// Infrastructure
			'HVAC system maintenance', 'Electrical wiring repair', 'Plumbing inspection', 'Security system installation',
			'Emergency generator testing', 'Elevator maintenance', 'Roofing repair', 'Solar panel inspection', 
			'Water filtration maintenance', 'Concrete repair', 'Fiber optic cable installation',
			// Facilities
			'Office renovation', 'Retail fixture installation', 'Hotel room refurbishment', 'Exhibition setup',
			'Restaurant kitchen inspection', 'Stadium seating repair', 'Airport terminal maintenance',
			// Technology
			'Network infrastructure audit', 'IoT sensor deployment', 'CCTV camera installation', 'Digital signage setup',
			'Payment terminal maintenance', 'Datacenter cooling inspection', 'Smart building system integration',
			// Specialized
			'Historical site preservation', 'Museum display installation', 'UNESCO site assessment',
			'Resort beach facilities setup', 'Winter equipment maintenance'
		];

		// Status options - expanded with more variety
		const statusOptions = [
			'Working on site', 'En route to next job', 'On break', 'Writing report', 'Client meeting',
			'Equipment setup', 'Troubleshooting', 'Final inspection', 'Material delivery', 'Team briefing',
			'Consulting with expert', 'Awaiting permits', 'Safety briefing', 'Training local staff', 'Quality control'
		];

		// Generate 50 mock workers for worldwide coverage
		const mockWorkers: WorkerLocationDto[] = [];
		
		for (let i = 0; i < 50; i++) {
			const locationIndex = i % locations.length;
			const location = locations[locationIndex];
			const workerIndex = i % workerNames.length;
			const workerName = workerNames[workerIndex];
			
			// Add slight position variance to prevent markers from overlapping
			const positionVariance = 0.005; // About 500m
			const position: [number, number] = [
				location.position[0] + (Math.random() * positionVariance * 2 - positionVariance),
				location.position[1] + (Math.random() * positionVariance * 2 - positionVariance)
			];
			
			// Determine marker type based on index
			let markerType: MapMarkerType;
			if (i % 5 === 0) markerType = MapMarkerType.CHECK_IN;
			else if (i % 5 === 1) markerType = MapMarkerType.TASK;
			else if (i % 5 === 2) markerType = MapMarkerType.JOURNAL;
			else if (i % 5 === 3) markerType = MapMarkerType.LEAD;
			else markerType = MapMarkerType.BREAK_START;
			
			// Generate completion percentage between 10-95%
			const completionPercentage = Math.floor(Math.random() * 85) + 10;
			
			// Generate start and end times - use different time zones to simulate global operations
			// Adjust hours based on rough time zone offset to simulate different times around the world
			const timeZoneOffset = Math.floor(location.position[1] / 15); // Rough time zone calculation
			let startHour = (7 + Math.floor(Math.random() * 4) + timeZoneOffset) % 24; // Between 7-10 AM local time
			let endHour = (startHour + 2 + Math.floor(Math.random() * 4)) % 24; // 2-5 hours later
			
			const startAmPm = startHour >= 12 ? 'PM' : 'AM';
			const endAmPm = endHour >= 12 ? 'PM' : 'AM';
			
			// Convert to 12-hour format
			startHour = startHour > 12 ? startHour - 12 : startHour === 0 ? 12 : startHour;
			endHour = endHour > 12 ? endHour - 12 : endHour === 0 ? 12 : endHour;
			
			const startTime = `${startHour < 10 ? '0' : ''}${startHour}:${Math.random() > 0.5 ? '00' : '30'} ${startAmPm}`;
			const endTime = `${endHour < 10 ? '0' : ''}${endHour}:${Math.random() > 0.5 ? '00' : '30'} ${endAmPm}`;
			
			// Create worker object
			const worker: WorkerLocationDto = {
				id: `worker-${i + 1}`,
				name: workerName,
				status: statusOptions[i % statusOptions.length],
				position,
				markerType,
				image: '/placeholder.svg?height=100&width=100',
				canAddTask: i % 3 === 0, // Every 3rd worker can add tasks
				task: {
					id: `J22${(i + 1).toString().padStart(3, '0')}`,
					title: taskTitles[i % taskTitles.length],
					client: location.name,
				},
				location: {
					address: location.address,
					imageUrl: getLocationImageUrl(location.address, markerType, position),
				},
				schedule: {
					current: `${startTime} - ${endTime}`,
					next: i % 3 === 0 ? 'Tomorrow 09:00 AM' : `${(endHour + 1) % 12 || 12}:00 ${endAmPm} - ${(endHour + 3) % 12 || 12}:00 ${endAmPm}`,
				},
				jobStatus: {
					startTime,
					endTime,
					duration: `${2 + Math.floor(Math.random() * 4)}h ${Math.floor(Math.random() * 60)}m`,
					status: i % 8 === 0 ? 'Completed' : i % 4 === 0 ? 'Traveling' : 'In Progress',
					completionPercentage,
				},
				// Add activity stats for some workers
				activity: i % 3 === 0 ? {
					claims: Math.floor(Math.random() * 5),
					journals: Math.floor(Math.random() * 8),
					leads: Math.floor(Math.random() * 3),
					checkIns: Math.floor(Math.random() * 10),
					tasks: Math.floor(Math.random() * 6)
				} : undefined,
				// Add break data for workers on break
				breakData: markerType === MapMarkerType.BREAK_START ? {
					startTime: `${startHour}:${Math.random() > 0.5 ? '00' : '30'} ${startAmPm}`,
					endTime: `${startHour}:${Math.random() > 0.5 ? '30' : '00'} ${startAmPm}`,
					duration: '30m',
					location: 'Nearby cafe',
					remainingTime: `${Math.floor(Math.random() * 30)}m`,
				} : undefined
			};
			
			mockWorkers.push(worker);
		}

		// Generate 50 mock events for worldwide coverage
		const mockEvents: MapEventDto[] = [];
		
		// Event types to cycle through
		const eventTypes = [
			MapMarkerType.CHECK_IN,
			MapMarkerType.CHECK_OUT,
			MapMarkerType.TASK,
			MapMarkerType.JOURNAL,
			MapMarkerType.LEAD,
			MapMarkerType.SHIFT_START,
			MapMarkerType.SHIFT_END,
			MapMarkerType.BREAK_START,
			MapMarkerType.BREAK_END,
			MapMarkerType.JOB_START,
			MapMarkerType.JOB_COMPLETE
		];
		
		for (let i = 0; i < 50; i++) {
			const locationIndex = i % locations.length;
			const location = locations[locationIndex];
			const workerIndex = i % workerNames.length;
			const workerName = workerNames[workerIndex];
			const eventType = eventTypes[i % eventTypes.length];
			
			// Determine time base (today, yesterday, or earlier)
			let timeBase = 'Today';
			if (i % 4 === 1) timeBase = 'Yesterday';
			if (i % 4 === 2) timeBase = 'Feb 15';
			if (i % 4 === 3) timeBase = 'Mar 2';
			
			// Generate random time - adjust for rough time zones
			const timeZoneOffset = Math.floor(location.position[1] / 15); // Rough time zone calculation
			let hour = (7 + Math.floor(Math.random() * 10) + timeZoneOffset) % 24; // Between 7 AM and 5 PM local time
			const minute = Math.floor(Math.random() * 60);
			const ampm = hour >= 12 ? 'PM' : 'AM';
			
			// Convert to 12-hour format
			hour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
			
			const timeStr = `${timeBase}, ${hour < 10 ? '0' : ''}${hour}:${minute < 10 ? '0' : ''}${minute} ${ampm}`;
			
			// Generate event title based on type
			let title = '';
			
			switch(eventType) {
				case MapMarkerType.CHECK_IN:
					title = `Visit to ${location.name}`;
					break;
				case MapMarkerType.CHECK_OUT:
					title = `Completed visit to ${location.name}`;
					break;
				case MapMarkerType.TASK:
					title = `Working on: ${taskTitles[i % taskTitles.length]}`;
					break;
				case MapMarkerType.JOURNAL:
					title = `Documentation: ${taskTitles[i % taskTitles.length]} progress`;
					break;
				case MapMarkerType.LEAD:
					title = `New lead: ${location.name} opportunity`;
					break;
				case MapMarkerType.SHIFT_START:
					title = 'Started shift';
					break;
				case MapMarkerType.SHIFT_END:
					title = 'Ended shift';
					break;
				case MapMarkerType.BREAK_START:
					title = 'Started break';
					break;
				case MapMarkerType.BREAK_END:
					title = 'Ended break';
					break;
				case MapMarkerType.JOB_START:
					title = `Started: ${taskTitles[i % taskTitles.length]}`;
					break;
				case MapMarkerType.JOB_COMPLETE:
					title = `Completed: ${taskTitles[i % taskTitles.length]}`;
					break;
				default:
					title = 'Activity logged';
			}
			
			// Create event object
			const event: MapEventDto = {
				id: `event-${i + 1}`,
				type: eventType,
				title,
				time: timeStr,
				location: location.address,
				user: workerName
			};
			
			mockEvents.push(event);
		}

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
