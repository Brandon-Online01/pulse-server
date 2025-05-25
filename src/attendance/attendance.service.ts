import { Injectable, NotFoundException, Logger, BadRequestException, Inject } from '@nestjs/common';
import { IsNull, MoreThanOrEqual, Not, Repository, LessThanOrEqual, Between, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Attendance } from './entities/attendance.entity';
import { AttendanceStatus } from '../lib/enums/attendance.enums';
import { CreateCheckInDto } from './dto/create-attendance-check-in.dto';
import { CreateCheckOutDto } from './dto/create-attendance-check-out.dto';
import { CreateBreakDto } from './dto/create-attendance-break.dto';
import { OrganizationReportQueryDto } from './dto/organization-report-query.dto';
import { isToday } from 'date-fns';
import { differenceInMinutes, differenceInMilliseconds, startOfMonth, endOfMonth, startOfDay, endOfDay, differenceInDays, format, parseISO } from 'date-fns';
import { UserService } from '../user/user.service';
import { RewardsService } from '../rewards/rewards.service';
import { XP_VALUES_TYPES } from '../lib/constants/constants';
import { XP_VALUES } from '../lib/constants/constants';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BreakDetail } from './interfaces/break-detail.interface';
import { AccessLevel } from '../lib/enums/user.enums';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AttendanceService {
	private readonly logger = new Logger(AttendanceService.name);

	constructor(
		@InjectRepository(Attendance)
		private attendanceRepository: Repository<Attendance>,
		@InjectRepository(User)
		private userRepository: Repository<User>,
		private userService: UserService,
		private rewardsService: RewardsService,
		private readonly eventEmitter: EventEmitter2,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	// ======================================================
	// ATTENDANCE METRICS FUNCTIONALITY
	// ======================================================

	public async checkIn(checkInDto: CreateCheckInDto): Promise<{ message: string }> {
		try {
			const checkIn = await this.attendanceRepository.save(checkInDto);

			if (!checkIn) {
				throw new NotFoundException(process.env.CREATE_ERROR_MESSAGE);
			}

			const response = {
				message: process.env.SUCCESS_MESSAGE,
			};

			await this.rewardsService.awardXP({
				owner: checkInDto.owner.uid,
				amount: XP_VALUES.CHECK_IN,
				action: XP_VALUES_TYPES.ATTENDANCE,
				source: {
					id: checkInDto.owner.uid.toString(),
					type: XP_VALUES_TYPES.ATTENDANCE,
					details: 'Check-in reward',
				},
			});

			return response;
		} catch (error) {
			const response = {
				message: error?.message,
			};

			return response;
		}
	}

	public async checkOut(checkOutDto: CreateCheckOutDto): Promise<{ message: string; duration?: string }> {
		try {
			const activeShift = await this.attendanceRepository.findOne({
				where: {
					status: AttendanceStatus.PRESENT,
					owner: checkOutDto?.owner,
					checkIn: Not(IsNull()),
					checkOut: IsNull(),
				},
				order: {
					checkIn: 'DESC',
				},
			});

			if (activeShift) {
				const checkOutTime = new Date();
				const checkInTime = new Date(activeShift.checkIn);

				const totalMinutesWorked = differenceInMinutes(checkOutTime, checkInTime);

				// Calculate break time if exists
				const totalBreakMinutes = activeShift.totalBreakTime
					? this.parseBreakTime(activeShift.totalBreakTime)
					: 0;

				// Actual work time = total time - break time
				const actualMinutesWorked = totalMinutesWorked - totalBreakMinutes;

				const hoursWorked = Math.floor(actualMinutesWorked / 60);
				const remainingMinutes = actualMinutesWorked % 60;

				const duration = `${hoursWorked}h ${remainingMinutes}m`;

				const updatedShift = {
					...activeShift,
					...checkOutDto,
					checkOut: checkOutTime,
					duration,
					status: AttendanceStatus.COMPLETED,
				};

				await this.attendanceRepository.save(updatedShift);

				const response = {
					message: process.env.SUCCESS_MESSAGE,
					duration,
				};

				await this.rewardsService.awardXP({
					owner: checkOutDto.owner.uid,
					amount: XP_VALUES.CHECK_OUT,
					action: XP_VALUES_TYPES.ATTENDANCE,
					source: {
						id: checkOutDto.owner.uid.toString(),
						type: XP_VALUES_TYPES.ATTENDANCE,
						details: 'Check-out reward',
					},
				});

				// Emit the daily-report event with the user ID
				this.eventEmitter.emit('daily-report', {
					userId: checkOutDto?.owner?.uid,
				});

				this.eventEmitter.emit('user.target.update.required', { userId: checkOutDto?.owner?.uid });
				this.eventEmitter.emit('user.metrics.update.required', checkOutDto?.owner?.uid);

				return response;
			}
		} catch (error) {
			const response = {
				message: error?.message,
				duration: null,
			};

			return response;
		}
	}

	public async allCheckIns(): Promise<{ message: string; checkIns: Attendance[] }> {
		try {
			const checkIns = await this.attendanceRepository.find({
				relations: ['owner', 'owner.branch', 'owner.organisation', 'owner.userProfile', 'verifiedBy', 'organisation', 'branch'],
			});

			if (!checkIns) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			const response = {
				message: process.env.SUCCESS_MESSAGE,
				checkIns,
			};

			return response;
		} catch (error) {
			const response = {
				message: `could not get all check ins - ${error.message}`,
				checkIns: null,
			};

			return response;
		}
	}

	public async checkInsByDate(date: string): Promise<{ message: string; checkIns: Attendance[] }> {
		try {
			const checkIns = await this.attendanceRepository.find({
				where: {
					checkIn: MoreThanOrEqual(new Date(date)),
				},
				relations: ['owner', 'owner.branch', 'owner.organisation', 'owner.userProfile', 'verifiedBy', 'organisation', 'branch'],
				order: {
					checkIn: 'DESC',
				},
			});

			if (!checkIns) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			const response = {
				message: process.env.SUCCESS_MESSAGE,
				checkIns,
			};

			return response;
		} catch (error) {
			const response = {
				message: `could not get check ins by date - ${error.message}`,
				checkIns: null,
			};

			return response;
		}
	}

	public async checkInsByStatus(ref: number): Promise<{
		message: string;
		startTime: string;
		endTime: string;
		nextAction: string;
		isLatestCheckIn: boolean;
		checkedIn: boolean;
		user: any;
		attendance: Attendance;
	}> {
		try {
			const [checkIn] = await this.attendanceRepository.find({
				where: {
					owner: {
						uid: ref,
					},
				},
				relations: ['owner', 'owner.branch', 'owner.organisation', 'owner.userProfile', 'verifiedBy', 'organisation', 'branch'],
				order: {
					checkIn: 'DESC',
				},
			});

			if (!checkIn) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			const isLatestCheckIn = isToday(new Date(checkIn?.checkIn));

			const {
				status,
				checkOut,
				createdAt,
				updatedAt,
				verifiedAt,
				checkIn: CheckInTime,
				owner,
				...restOfCheckIn
			} = checkIn;

			const nextAction = status === AttendanceStatus.PRESENT ? 'End Shift' : 'Start Shift';
			const checkedIn = status === AttendanceStatus.PRESENT ? true : false;

			const response = {
				message: process.env.SUCCESS_MESSAGE,
				startTime: `${CheckInTime}`,
				endTime: `${checkOut}`,
				createdAt: `${createdAt}`,
				updatedAt: `${updatedAt}`,
				verifiedAt: `${verifiedAt}`,
				nextAction,
				isLatestCheckIn,
				checkedIn,
				user: owner,
				attendance: checkIn,
				...restOfCheckIn,
			};

			return response;
		} catch (error) {
			const response = {
				message: `could not get check in - ${error?.message}`,
				startTime: null,
				endTime: null,
				nextAction: null,
				isLatestCheckIn: false,
				checkedIn: false,
				user: null,
				attendance: null,
			};

			return response;
		}
	}

	// ======================================================
	// ATTENDANCE REPORTS
	// ======================================================

	public async checkInsByUser(ref: number): Promise<{ message: string; checkIns: Attendance[]; user: any }> {
		try {
			const checkIns = await this.attendanceRepository.find({
				where: { owner: { uid: ref } },
				relations: ['owner', 'owner.branch', 'owner.organisation', 'owner.userProfile', 'verifiedBy', 'organisation', 'branch'],
				order: {
					checkIn: 'DESC',
				},
			});

			if (!checkIns || checkIns.length === 0) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			// Get user info from the first attendance record
			const userInfo = checkIns[0]?.owner || null;

			const response = {
				message: process.env.SUCCESS_MESSAGE,
				checkIns,
				user: userInfo,
			};

			return response;
		} catch (error) {
			const response = {
				message: `could not get check ins by user - ${error?.message}`,
				checkIns: null,
				user: null,
			};

			return response;
		}
	}

	public async checkInsByBranch(ref: string): Promise<{ message: string; checkIns: Attendance[]; branch: any; totalUsers: number }> {
		try {
			const checkIns = await this.attendanceRepository.find({
				where: {
					branch: { ref },
				},
				relations: ['owner', 'owner.branch', 'owner.organisation', 'owner.userProfile', 'verifiedBy', 'organisation', 'branch'],
				order: {
					checkIn: 'DESC',
				},
			});

			if (!checkIns || checkIns.length === 0) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			// Get branch info and count unique users
			const branchInfo = checkIns[0]?.branch || null;
			const uniqueUsers = new Set(checkIns.map(record => record.owner.uid));
			const totalUsers = uniqueUsers.size;

			const response = {
				message: process.env.SUCCESS_MESSAGE,
				checkIns,
				branch: branchInfo,
				totalUsers,
			};

			return response;
		} catch (error) {
			const response = {
				message: `could not get check ins by branch - ${error?.message}`,
				checkIns: null,
				branch: null,
				totalUsers: 0,
			};

			return response;
		}
	}

	public async getAttendancePercentage(): Promise<{ percentage: number; totalHours: number }> {
		try {
			const today = new Date();
			const startOfDay = new Date(today.setHours(0, 0, 0, 0));

			const attendanceRecords = await this.attendanceRepository.find({
				where: {
					checkIn: MoreThanOrEqual(startOfDay),
					status: AttendanceStatus.COMPLETED,
				},
			});

			let totalMinutesWorked = 0;

			// Calculate total minutes worked
			attendanceRecords.forEach((record) => {
				if (record.checkIn && record.checkOut) {
					const minutes = differenceInMinutes(new Date(record.checkOut), new Date(record.checkIn));
					totalMinutesWorked += minutes;
				}
			});

			// Assuming 8-hour workday
			const expectedWorkMinutes = 8 * 60;
			const percentage = Math.min((totalMinutesWorked / expectedWorkMinutes) * 100, 100);
			const totalHours = totalMinutesWorked / 60;

			return {
				percentage: Math.round(percentage),
				totalHours: Math.round(totalHours * 10) / 10, // Round to 1 decimal place
			};
		} catch (error) {
			return {
				percentage: 0,
				totalHours: 0,
			};
		}
	}

	public async getAttendanceForDate(
		date: Date,
	): Promise<{ totalHours: number; activeShifts: Attendance[]; attendanceRecords: Attendance[] }> {
		try {
			const startOfDayDate = new Date(date.setHours(0, 0, 0, 0));
			const endOfDayDate = new Date(date.setHours(23, 59, 59, 999));

			// Get completed shifts for the day
			const attendanceRecords = await this.attendanceRepository.find({
				where: {
					checkIn: MoreThanOrEqual(startOfDayDate),
					checkOut: LessThanOrEqual(endOfDayDate),
					status: AttendanceStatus.COMPLETED,
				},
				relations: ['owner', 'owner.branch', 'owner.organisation', 'owner.userProfile', 'verifiedBy', 'organisation', 'branch'],
				order: {
					checkIn: 'ASC',
				},
			});

			let totalMinutesWorked = 0;

			// Calculate minutes from completed shifts
			attendanceRecords?.forEach((record) => {
				if (record.checkIn && record.checkOut) {
					const minutes = differenceInMinutes(new Date(record.checkOut), new Date(record.checkIn));
					totalMinutesWorked += minutes;
				}
			});

			// Get active shifts for today
			const activeShifts = await this.attendanceRepository.find({
				where: {
					status: AttendanceStatus.PRESENT,
					checkIn: MoreThanOrEqual(startOfDayDate),
					checkOut: IsNull(),
				},
				relations: ['owner', 'owner.branch', 'owner.organisation', 'owner.userProfile', 'verifiedBy', 'organisation', 'branch'],
				order: {
					checkIn: 'ASC',
				},
			});

			// Add minutes from active shifts
			const now = new Date();
			activeShifts.forEach((shift) => {
				if (shift?.checkIn) {
					const minutes = differenceInMinutes(now, new Date(shift?.checkIn));
					totalMinutesWorked += minutes;
				}
			});

			const response = {
				totalHours: Math.round((totalMinutesWorked / 60) * 10) / 10, // Round to 1 decimal place
				activeShifts,
				attendanceRecords,
			};

			return response;
		} catch (error) {
			const response = {
				totalHours: 0,
				activeShifts: [],
				attendanceRecords: [],
			};

			return response;
		}
	}

	public async getAttendanceForMonth(ref: string): Promise<{ totalHours: number }> {
		try {
			const user = await this.userService.findOne(Number(ref));
			const userId = user.user.uid;

			// Get completed shifts for the month
			const attendanceRecords = await this.attendanceRepository.find({
				where: {
					owner: { uid: userId },
					checkIn: MoreThanOrEqual(startOfMonth(new Date())),
					checkOut: LessThanOrEqual(endOfMonth(new Date())),
					status: AttendanceStatus.COMPLETED,
				},
			});

			// Calculate hours from completed shifts
			const completedHours = attendanceRecords.reduce((total, record) => {
				if (record?.duration) {
					const [hours, minutes] = record.duration.split(' ');
					const hoursValue = parseFloat(hours.replace('h', ''));
					const minutesValue = parseFloat(minutes.replace('m', '')) / 60;
					return total + hoursValue + minutesValue;
				}
				return total;
			}, 0);

			// Get today's attendance hours
			const todayHours = (await this.getAttendanceForDate(new Date())).totalHours;

			const totalHours = completedHours + todayHours;

			return {
				totalHours: Math.round(totalHours * 10) / 10, // Round to 1 decimal place
			};
		} catch (error) {
			return { totalHours: 0 };
		}
	}

	public async getMonthlyAttendanceStats(): Promise<{
		message: string;
		stats: {
			metrics: {
				totalEmployees: number;
				totalPresent: number;
				attendancePercentage: number;
			};
		};
	}> {
		try {
			const todayPresent = await this.attendanceRepository.count({
				where: {
					status: AttendanceStatus.PRESENT,
				},
			});

			const totalUsers = await this.userService.findAll().then((users) => users?.data?.length);

			const attendancePercentage = totalUsers > 0 ? Math.round((todayPresent / totalUsers) * 100) : 0;

			return {
				message: process.env.SUCCESS_MESSAGE,
				stats: {
					metrics: {
						totalEmployees: totalUsers,
						totalPresent: todayPresent,
						attendancePercentage,
					},
				},
			};
		} catch (error) {
			return {
				message: error?.message,
				stats: null,
			};
		}
	}

	public async getCurrentShiftHours(userId: number): Promise<number> {
		try {
			const activeShift = await this.attendanceRepository.findOne({
				where: {
					status: AttendanceStatus.PRESENT,
					owner: { uid: userId },
					checkIn: Not(IsNull()),
					checkOut: IsNull(),
				},
				order: {
					checkIn: 'DESC',
				},
			});

			if (activeShift) {
				const now = new Date();
				const checkInTime = new Date(activeShift.checkIn);
				const minutesWorked = differenceInMinutes(now, checkInTime);
				return Math.round((minutesWorked / 60) * 10) / 10; // Round to 1 decimal place
			}

			return 0;
		} catch (error) {
			return 0;
		}
	}

	public async manageBreak(breakDto: CreateBreakDto): Promise<{ message: string }> {
		try {
			if (breakDto.isStartingBreak) {
				return this.startBreak(breakDto);
			} else {
				return this.endBreak(breakDto);
			}
		} catch (error) {
			return {
				message: error?.message,
			};
		}
	}

	private async startBreak(breakDto: CreateBreakDto): Promise<{ message: string }> {
		try {
			// Find the active shift
			const activeShift = await this.attendanceRepository.findOne({
				where: {
					status: AttendanceStatus.PRESENT,
					owner: breakDto.owner,
					checkIn: Not(IsNull()),
					checkOut: IsNull(),
				},
				order: {
					checkIn: 'DESC',
				},
			});

			if (!activeShift) {
				throw new NotFoundException('No active shift found to start break');
			}

			// Initialize the breakDetails array if it doesn't exist
			const breakDetails: BreakDetail[] = activeShift.breakDetails || [];

			// Create a new break entry
			const breakStartTime = new Date();
			const newBreakEntry: BreakDetail = {
				startTime: breakStartTime,
				endTime: null,
				duration: null,
				latitude: breakDto.breakLatitude ? String(breakDto.breakLatitude) : null,
				longitude: breakDto.breakLongitude ? String(breakDto.breakLongitude) : null,
				notes: breakDto.breakNotes,
			};

			// Add to break details array
			breakDetails.push(newBreakEntry);

			// Increment break count
			const breakCount = (activeShift.breakCount || 0) + 1;

			// Update shift with break start time and status
			const updatedShift = {
				...activeShift,
				breakStartTime,
				breakLatitude: breakDto.breakLatitude,
				breakLongitude: breakDto.breakLongitude,
				breakCount,
				breakDetails,
				status: AttendanceStatus.ON_BREAK,
			};

			await this.attendanceRepository.save(updatedShift);

			return {
				message: 'Break started successfully',
			};
		} catch (error) {
			return {
				message: error?.message,
			};
		}
	}

	private async endBreak(breakDto: CreateBreakDto): Promise<{ message: string }> {
		try {
			// Find the shift on break
			const shiftOnBreak = await this.attendanceRepository.findOne({
				where: {
					status: AttendanceStatus.ON_BREAK,
					owner: breakDto.owner,
					checkIn: Not(IsNull()),
					checkOut: IsNull(),
					breakStartTime: Not(IsNull()),
				},
				order: {
					checkIn: 'DESC',
				},
			});

			if (!shiftOnBreak) {
				throw new NotFoundException('No shift on break found');
			}

			// Calculate break duration
			const breakEndTime = new Date();
			const breakStartTime = new Date(shiftOnBreak.breakStartTime);

			const breakMinutes = differenceInMinutes(breakEndTime, breakStartTime);
			const breakHours = Math.floor(breakMinutes / 60);
			const remainingBreakMinutes = breakMinutes % 60;

			const currentBreakDuration = `${breakHours}h ${remainingBreakMinutes}m`;

			// Calculate total break time (including previous breaks)
			let totalBreakHours = breakHours;
			let totalBreakMinutes = remainingBreakMinutes;

			if (shiftOnBreak.totalBreakTime) {
				const previousBreakMinutes = this.parseBreakTime(shiftOnBreak.totalBreakTime);
				totalBreakMinutes += previousBreakMinutes % 60;
				totalBreakHours += Math.floor(previousBreakMinutes / 60) + Math.floor(totalBreakMinutes / 60);
				totalBreakMinutes = totalBreakMinutes % 60;
			}

			const totalBreakTime = `${totalBreakHours}h ${totalBreakMinutes}m`;

			// Initialize or get the breakDetails array
			const breakDetails: BreakDetail[] = shiftOnBreak.breakDetails || [];

			// Update the latest break entry if it exists
			if (breakDetails.length > 0) {
				const latestBreak = breakDetails[breakDetails.length - 1];
				latestBreak.endTime = breakEndTime;
				latestBreak.duration = currentBreakDuration;
				latestBreak.notes = breakDto.breakNotes || latestBreak.notes;
			} else {
				// If no breakDetails exist, create a new entry for backward compatibility
				breakDetails.push({
					startTime: breakStartTime,
					endTime: breakEndTime,
					duration: currentBreakDuration,
					latitude: shiftOnBreak.breakLatitude ? String(shiftOnBreak.breakLatitude) : null,
					longitude: shiftOnBreak.breakLongitude ? String(shiftOnBreak.breakLongitude) : null,
					notes: breakDto.breakNotes,
				});
			}

			// Update shift with break end time and status
			const updatedShift = {
				...shiftOnBreak,
				breakEndTime,
				totalBreakTime,
				breakNotes: breakDto.breakNotes,
				breakDetails,
				status: AttendanceStatus.PRESENT,
			};

			await this.attendanceRepository.save(updatedShift);

			return {
				message: 'Break ended successfully',
			};
		} catch (error) {
			return {
				message: error?.message,
			};
		}
	}

	private parseBreakTime(breakTimeString: string): number {
		if (!breakTimeString) return 0;
		
		const parts = breakTimeString.split(':');
		if (parts.length === 3) {
			// Format: HH:MM:SS
			const hours = parseInt(parts[0], 10) || 0;
			const minutes = parseInt(parts[1], 10) || 0;
			const seconds = parseInt(parts[2], 10) || 0;
			return hours * 60 + minutes + Math.round(seconds / 60);
		} else if (parts.length === 2) {
			// Format: MM:SS
			const minutes = parseInt(parts[0], 10) || 0;
			const seconds = parseInt(parts[1], 10) || 0;
			return minutes + Math.round(seconds / 60);
		}
		
		return 0;
	}

	public async getDailyStats(
		userId: number,
		dateStr?: string,
	): Promise<{ message: string; dailyWorkTime: number; dailyBreakTime: number }> {
		try {
			// Set date to today if not provided
			const date = dateStr ? new Date(dateStr) : new Date();
			const startOfDayDate = new Date(date.setHours(0, 0, 0, 0));
			const endOfDayDate = new Date(date.setHours(23, 59, 59, 999));

			// Get completed shifts for the day
			const completedShifts = await this.attendanceRepository.find({
				where: {
					owner: { uid: userId },
					checkIn: MoreThanOrEqual(startOfDayDate),
					checkOut: LessThanOrEqual(endOfDayDate),
					status: AttendanceStatus.COMPLETED,
				},
			});

			// Get active shift (if any)
			const activeShift = await this.attendanceRepository.findOne({
				where: {
					owner: { uid: userId },
					checkIn: MoreThanOrEqual(startOfDayDate),
					checkOut: IsNull(),
				},
			});

			let totalWorkTimeMs = 0;
			let totalBreakTimeMs = 0;

			// Calculate time from completed shifts
			for (const shift of completedShifts) {
				const checkInTime = new Date(shift.checkIn);
				const checkOutTime = new Date(shift.checkOut);

				// Calculate total shift duration in milliseconds
				const shiftDuration = differenceInMilliseconds(checkOutTime, checkInTime);

				// Calculate break time
				let breakMs = 0;

				// Use breakDetails array if available for more accurate break tracking
				if (shift.breakDetails && shift.breakDetails.length > 0) {
					for (const breakEntry of shift.breakDetails) {
						if (breakEntry.startTime && breakEntry.endTime) {
							const breakStart = new Date(breakEntry.startTime);
							const breakEnd = new Date(breakEntry.endTime);
							const breakDuration = differenceInMilliseconds(breakEnd, breakStart);
							breakMs += breakDuration;
						}
					}
				}
				// Fallback to totalBreakTime for backward compatibility
				else if (shift.totalBreakTime) {
					const breakMinutes = this.parseBreakTime(shift.totalBreakTime);
					breakMs = breakMinutes * 60 * 1000;
				}

				totalBreakTimeMs += breakMs;
				totalWorkTimeMs += shiftDuration - breakMs;
			}

			// Add time from active shift
			if (activeShift) {
				const now = new Date();
				const checkInTime = new Date(activeShift.checkIn);
				const currentDuration = differenceInMilliseconds(now, checkInTime);

				// Calculate break time
				let breakMs = 0;

				// If on break, add the current break time
				if (activeShift.status === AttendanceStatus.ON_BREAK && activeShift.breakStartTime) {
					const breakStartTime = new Date(activeShift.breakStartTime);
					const currentBreakDuration = differenceInMilliseconds(now, breakStartTime);

					// Use breakDetails array if available
					if (activeShift.breakDetails && activeShift.breakDetails.length > 0) {
						// Add all completed breaks from breakDetails
						for (const breakEntry of activeShift.breakDetails) {
							if (breakEntry.startTime && breakEntry.endTime) {
								const breakStart = new Date(breakEntry.startTime);
								const breakEnd = new Date(breakEntry.endTime);
								const breakDuration = differenceInMilliseconds(breakEnd, breakStart);
								breakMs += breakDuration;
							}
						}

						// Add current ongoing break (the last one without an end time)
						breakMs += currentBreakDuration;
					}
					// Fallback to totalBreakTime for backward compatibility
					else if (activeShift.totalBreakTime) {
						const breakMinutes = this.parseBreakTime(activeShift.totalBreakTime);
						breakMs = breakMinutes * 60 * 1000 + currentBreakDuration;
					} else {
						breakMs = currentBreakDuration;
					}

					totalBreakTimeMs += breakMs;
					totalWorkTimeMs += currentDuration - breakMs;
				} else {
					// If actively working, add previous breaks

					// Use breakDetails array if available
					if (activeShift.breakDetails && activeShift.breakDetails.length > 0) {
						// Add all completed breaks from breakDetails
						for (const breakEntry of activeShift.breakDetails) {
							if (breakEntry.startTime && breakEntry.endTime) {
								const breakStart = new Date(breakEntry.startTime);
								const breakEnd = new Date(breakEntry.endTime);
								const breakDuration = differenceInMilliseconds(breakEnd, breakStart);
								breakMs += breakDuration;
							}
						}
					}
					// Fallback to totalBreakTime for backward compatibility
					else if (activeShift.totalBreakTime) {
						const breakMinutes = this.parseBreakTime(activeShift.totalBreakTime);
						breakMs = breakMinutes * 60 * 1000;
					}

					totalBreakTimeMs += breakMs;
					totalWorkTimeMs += currentDuration - breakMs;
				}
			}

			return {
				message: process.env.SUCCESS_MESSAGE || 'Success',
				dailyWorkTime: totalWorkTimeMs,
				dailyBreakTime: totalBreakTimeMs,
			};
		} catch (error) {
			return {
				message: error?.message || 'Error retrieving daily stats',
				dailyWorkTime: 0,
				dailyBreakTime: 0,
			};
		}
	}

	// ======================================================
	// ATTENDANCE METRICS ENDPOINTS
	// ======================================================

	/**
	 * Get comprehensive attendance metrics for a specific user
	 * @param userId - User ID to get metrics for
	 * @returns Comprehensive attendance metrics including first/last attendance and time breakdowns
	 */
	public async getUserAttendanceMetrics(userId: number): Promise<{
		message: string;
		metrics: {
			firstAttendance: {
				date: string | null;
				checkInTime: string | null;
				daysAgo: number | null;
			};
			lastAttendance: {
				date: string | null;
				checkInTime: string | null;
				checkOutTime: string | null;
				daysAgo: number | null;
			};
			totalHours: {
				allTime: number;
				thisMonth: number;
				thisWeek: number;
				today: number;
			};
			totalShifts: {
				allTime: number;
				thisMonth: number;
				thisWeek: number;
				today: number;
			};
			averageHoursPerDay: number;
			attendanceStreak: number;
			breakAnalytics: {
				totalBreakTime: {
					allTime: number; // in minutes
					thisMonth: number;
					thisWeek: number;
					today: number;
				};
				averageBreakDuration: number; // in minutes per shift
				breakFrequency: number; // average breaks per shift
				longestBreak: number; // in minutes
				shortestBreak: number; // in minutes
			};
			timingPatterns: {
				averageCheckInTime: string;
				averageCheckOutTime: string;
				punctualityScore: number; // percentage of on-time arrivals
				overtimeFrequency: number; // percentage of shifts with overtime
			};
			productivityInsights: {
				workEfficiencyScore: number; // percentage based on work vs break time
				shiftCompletionRate: number; // percentage of completed shifts
				lateArrivalsCount: number;
				earlyDeparturesCount: number;
			};
		};
	}> {
		try {
			// Validate input
			if (!userId || userId <= 0) {
				throw new BadRequestException('Invalid user ID provided');
			}

			// Check if user exists
			const userExists = await this.userRepository.findOne({
				where: { uid: userId },
			});

			if (!userExists) {
				throw new NotFoundException(`User with ID ${userId} not found`);
			}

			// Get first ever attendance
			const firstAttendance = await this.attendanceRepository.findOne({
				where: { owner: { uid: userId } },
				order: { checkIn: 'ASC' },
			});

			// Get last attendance
			const lastAttendance = await this.attendanceRepository.findOne({
				where: { owner: { uid: userId } },
				order: { checkIn: 'DESC' },
			});

			// Calculate date ranges
			const now = new Date();
			const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			const startOfWeek = new Date(now);
			startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
			startOfWeek.setHours(0, 0, 0, 0);
			const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

			// Get all attendance records for the user
			const allAttendance = await this.attendanceRepository.find({
				where: { owner: { uid: userId } },
				order: { checkIn: 'ASC' },
			});

			// Calculate total hours for different periods
			const todayAttendance = allAttendance.filter(
				(record) => new Date(record.checkIn) >= startOfToday
			);
			const weekAttendance = allAttendance.filter(
				(record) => new Date(record.checkIn) >= startOfWeek
			);
			const monthAttendance = allAttendance.filter(
				(record) => new Date(record.checkIn) >= startOfMonth
			);

			// Helper function to calculate total hours from attendance records
			const calculateTotalHours = (records: Attendance[]): number => {
				return records.reduce((total, record) => {
					if (record.checkIn && record.checkOut) {
						const minutes = differenceInMinutes(new Date(record.checkOut), new Date(record.checkIn));
						// Subtract break time if available
						const breakMinutes = record.totalBreakTime ? this.parseBreakTime(record.totalBreakTime) : 0;
						return total + (minutes - breakMinutes) / 60;
					}
					return total;
				}, 0);
			};

			// Calculate hours for each period
			const totalHoursAllTime = calculateTotalHours(allAttendance);
			const totalHoursThisMonth = calculateTotalHours(monthAttendance);
			const totalHoursThisWeek = calculateTotalHours(weekAttendance);
			const totalHoursToday = calculateTotalHours(todayAttendance);

			// Calculate average hours per day (based on days since first attendance)
			const daysSinceFirst = firstAttendance 
				? Math.max(1, Math.ceil(differenceInMinutes(now, new Date(firstAttendance.checkIn)) / (24 * 60)))
				: 1;
			const averageHoursPerDay = totalHoursAllTime / daysSinceFirst;

			// Calculate attendance streak (consecutive days with attendance)
			let attendanceStreak = 0;
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			
			for (let i = 0; i < 30; i++) { // Check last 30 days
				const checkDate = new Date(today);
				checkDate.setDate(today.getDate() - i);
				const nextDay = new Date(checkDate);
				nextDay.setDate(checkDate.getDate() + 1);
				
				const hasAttendance = allAttendance.some(record => {
					const recordDate = new Date(record.checkIn);
					return recordDate >= checkDate && recordDate < nextDay;
				});
				
				if (hasAttendance) {
					attendanceStreak++;
				} else if (i > 0) { // Don't break on today if no attendance yet
					break;
				}
			}

			// ===== BREAK ANALYTICS =====
			const calculateBreakAnalytics = (records: Attendance[]) => {
				let totalBreakMinutes = 0;
				let totalBreaks = 0;
				let breakDurations: number[] = [];

				records.forEach(record => {
					if (record.totalBreakTime) {
						const breakMinutes = this.parseBreakTime(record.totalBreakTime);
						totalBreakMinutes += breakMinutes;
						breakDurations.push(breakMinutes);
					}
					if (record.breakCount) {
						totalBreaks += record.breakCount;
					}
				});

				return {
					totalBreakMinutes,
					totalBreaks,
					breakDurations,
				};
			};

			const allTimeBreaks = calculateBreakAnalytics(allAttendance);
			const monthBreaks = calculateBreakAnalytics(monthAttendance);
			const weekBreaks = calculateBreakAnalytics(weekAttendance);
			const todayBreaks = calculateBreakAnalytics(todayAttendance);

			const completedShifts = allAttendance.filter(record => record.checkOut);
			const averageBreakDuration = completedShifts.length > 0 
				? allTimeBreaks.totalBreakMinutes / completedShifts.length 
				: 0;
			const breakFrequency = completedShifts.length > 0 
				? allTimeBreaks.totalBreaks / completedShifts.length 
				: 0;
			const longestBreak = allTimeBreaks.breakDurations.length > 0 
				? Math.max(...allTimeBreaks.breakDurations) 
				: 0;
			const shortestBreak = allTimeBreaks.breakDurations.length > 0 
				? Math.min(...allTimeBreaks.breakDurations) 
				: 0;

			// ===== TIMING PATTERNS =====
			const calculateAverageTime = (times: Date[], isCheckOut = false): string => {
				if (times.length === 0) return 'N/A';
				
				const totalMinutes = times.reduce((sum, time) => {
					const hours = time.getHours();
					const minutes = time.getMinutes();
					return sum + (hours * 60) + minutes;
				}, 0);
				
				const avgMinutes = Math.round(totalMinutes / times.length);
				const avgHours = Math.floor(avgMinutes / 60);
				const remainingMinutes = avgMinutes % 60;
				
				return `${avgHours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}`;
			};

			const checkInTimes = allAttendance.map(record => new Date(record.checkIn));
			const checkOutTimes = allAttendance
				.filter(record => record.checkOut)
				.map(record => new Date(record.checkOut!));

			const averageCheckInTime = calculateAverageTime(checkInTimes);
			const averageCheckOutTime = calculateAverageTime(checkOutTimes, true);

			// Punctuality score (assuming 9:00 AM is standard start time)
			const standardStartHour = 9;
			const onTimeArrivals = allAttendance.filter(record => {
				const checkInTime = new Date(record.checkIn);
				return checkInTime.getHours() <= standardStartHour;
			}).length;
			const punctualityScore = allAttendance.length > 0 
				? Math.round((onTimeArrivals / allAttendance.length) * 100) 
				: 0;

			// Overtime frequency (assuming 8-hour standard workday)
			const standardWorkHours = 8;
			const overtimeShifts = completedShifts.filter(record => {
				if (!record.checkOut) return false;
				const workMinutes = differenceInMinutes(new Date(record.checkOut), new Date(record.checkIn));
				const breakMinutes = record.totalBreakTime ? this.parseBreakTime(record.totalBreakTime) : 0;
				const actualWorkHours = (workMinutes - breakMinutes) / 60;
				return actualWorkHours > standardWorkHours;
			}).length;
			const overtimeFrequency = completedShifts.length > 0 
				? Math.round((overtimeShifts / completedShifts.length) * 100) 
				: 0;

			// ===== PRODUCTIVITY INSIGHTS =====
			// Work efficiency score (work time vs total time including breaks)
			const totalWorkMinutes = allAttendance.reduce((total, record) => {
				if (record.checkIn && record.checkOut) {
					return total + differenceInMinutes(new Date(record.checkOut), new Date(record.checkIn));
				}
				return total;
			}, 0);
			const workEfficiencyScore = totalWorkMinutes > 0 
				? Math.round(((totalWorkMinutes - allTimeBreaks.totalBreakMinutes) / totalWorkMinutes) * 100) 
				: 0;

			// Shift completion rate
			const totalShifts = allAttendance.length;
			const shiftCompletionRate = totalShifts > 0 
				? Math.round((completedShifts.length / totalShifts) * 100) 
				: 0;

			// Late arrivals count (after 9:15 AM)
			const lateThresholdHour = 9;
			const lateThresholdMinute = 15;
			const lateArrivalsCount = allAttendance.filter(record => {
				const checkInTime = new Date(record.checkIn);
				const checkInMinutes = checkInTime.getHours() * 60 + checkInTime.getMinutes();
				const lateThreshold = lateThresholdHour * 60 + lateThresholdMinute;
				return checkInMinutes > lateThreshold;
			}).length;

			// Early departures count (before 5:00 PM)
			const earlyDepartureHour = 17; // 5 PM
			const earlyDeparturesCount = completedShifts.filter(record => {
				if (!record.checkOut) return false;
				const checkOutTime = new Date(record.checkOut);
				return checkOutTime.getHours() < earlyDepartureHour;
			}).length;

			// Format response
			const metrics = {
				firstAttendance: {
					date: firstAttendance ? new Date(firstAttendance.checkIn).toISOString().split('T')[0] : null,
					checkInTime: firstAttendance ? new Date(firstAttendance.checkIn).toLocaleTimeString() : null,
					daysAgo: firstAttendance ? Math.floor(differenceInMinutes(now, new Date(firstAttendance.checkIn)) / (24 * 60)) : null,
				},
				lastAttendance: {
					date: lastAttendance ? new Date(lastAttendance.checkIn).toISOString().split('T')[0] : null,
					checkInTime: lastAttendance ? new Date(lastAttendance.checkIn).toLocaleTimeString() : null,
					checkOutTime: lastAttendance?.checkOut ? new Date(lastAttendance.checkOut).toLocaleTimeString() : null,
					daysAgo: lastAttendance ? Math.floor(differenceInMinutes(now, new Date(lastAttendance.checkIn)) / (24 * 60)) : null,
				},
				totalHours: {
					allTime: Math.round(totalHoursAllTime * 10) / 10,
					thisMonth: Math.round(totalHoursThisMonth * 10) / 10,
					thisWeek: Math.round(totalHoursThisWeek * 10) / 10,
					today: Math.round(totalHoursToday * 10) / 10,
				},
				totalShifts: {
					allTime: allAttendance.length,
					thisMonth: monthAttendance.length,
					thisWeek: weekAttendance.length,
					today: todayAttendance.length,
				},
				averageHoursPerDay: Math.round(averageHoursPerDay * 10) / 10,
				attendanceStreak,
				breakAnalytics: {
					totalBreakTime: {
						allTime: allTimeBreaks.totalBreakMinutes,
						thisMonth: monthBreaks.totalBreakMinutes,
						thisWeek: weekBreaks.totalBreakMinutes,
						today: todayBreaks.totalBreakMinutes,
					},
					averageBreakDuration: Math.round(averageBreakDuration),
					breakFrequency: Math.round(breakFrequency * 10) / 10,
					longestBreak,
					shortestBreak,
				},
				timingPatterns: {
					averageCheckInTime,
					averageCheckOutTime,
					punctualityScore,
					overtimeFrequency,
				},
				productivityInsights: {
					workEfficiencyScore,
					shiftCompletionRate,
					lateArrivalsCount,
					earlyDeparturesCount,
				},
			};

			return {
				message: process.env.SUCCESS_MESSAGE || 'Success',
				metrics,
			};
		} catch (error) {
			this.logger.error('Error getting user attendance metrics:', error);
			return {
				message: error?.message || 'Error retrieving attendance metrics',
				metrics: {
					firstAttendance: { date: null, checkInTime: null, daysAgo: null },
					lastAttendance: { date: null, checkInTime: null, checkOutTime: null, daysAgo: null },
					totalHours: { allTime: 0, thisMonth: 0, thisWeek: 0, today: 0 },
					totalShifts: { allTime: 0, thisMonth: 0, thisWeek: 0, today: 0 },
					averageHoursPerDay: 0,
					attendanceStreak: 0,
					breakAnalytics: {
						totalBreakTime: { allTime: 0, thisMonth: 0, thisWeek: 0, today: 0 },
						averageBreakDuration: 0,
						breakFrequency: 0,
						longestBreak: 0,
						shortestBreak: 0,
					},
					timingPatterns: {
						averageCheckInTime: 'N/A',
						averageCheckOutTime: 'N/A',
						punctualityScore: 0,
						overtimeFrequency: 0,
					},
					productivityInsights: {
						workEfficiencyScore: 0,
						shiftCompletionRate: 0,
						lateArrivalsCount: 0,
						earlyDeparturesCount: 0,
					},
				},
			};
		}
	}

	// ======================================================
	// ORGANIZATION ATTENDANCE REPORTING
	// ======================================================

	public async generateOrganizationReport(
		queryDto: OrganizationReportQueryDto,
		orgId?: number,
		branchId?: number,
	): Promise<{
		message: string;
		report: {
			reportPeriod: {
				from: string;
				to: string;
				totalDays: number;
				generatedAt: string;
			};
			userMetrics?: any[];
			organizationMetrics: {
				averageTimes: {
					startTime: string;
					endTime: string;
					shiftDuration: number;
					breakDuration: number;
				};
				totals: {
					totalEmployees: number;
					totalHours: number;
					totalShifts: number;
					overtimeHours: number;
				};
				byBranch: any[];
				byRole: any[];
				insights: {
					attendanceRate: number;
					punctualityRate: number;
					averageHoursPerDay: number;
					peakCheckInTime: string;
					peakCheckOutTime: string;
				};
			};
		};
	}> {
		try {
			// Set default date range (last 30 days if not provided)
			const now = new Date();
			const fromDate = queryDto.dateFrom ? parseISO(queryDto.dateFrom) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
			const toDate = queryDto.dateTo ? parseISO(queryDto.dateTo) : now;
			
			// Validate date range
			if (fromDate > toDate) {
				throw new BadRequestException('Start date cannot be after end date');
			}

			const totalDays = differenceInDays(toDate, fromDate) + 1;

			// Generate cache key
			const cacheKey = this.generateReportCacheKey(queryDto, orgId, branchId, fromDate, toDate);
			
			// Try to get from cache first
			const cachedReport = await this.cacheManager.get(cacheKey);
			if (cachedReport) {
				return cachedReport as any;
			}

			// Build filters for attendance query
			const attendanceFilters: any = {
				checkIn: Between(startOfDay(fromDate), endOfDay(toDate)),
			};

			// Build filters for user query
			const userFilters: any = {};

			// Add organization filter
			if (orgId) {
				userFilters.organisation = { uid: orgId };
			}

			// Add branch filter
			if (branchId || queryDto.branchId) {
				const targetBranchId = branchId || queryDto.branchId;
				userFilters.branch = { uid: targetBranchId };
			}

			// Add role filter
			if (queryDto.role) {
				userFilters.accessLevel = queryDto.role;
			}

			// Get all users matching criteria
			const users = await this.userRepository.find({
				where: userFilters,
				relations: ['branch', 'organisation'],
			});

			if (users.length === 0) {
				throw new NotFoundException('No users found matching the specified criteria');
			}

			const userIds = users.map(user => user.uid);

			// Get all attendance records for users in date range
			const attendanceRecords = await this.attendanceRepository.find({
				where: {
					...attendanceFilters,
					owner: { uid: In(userIds) },
				},
				relations: ['owner', 'owner.branch'],
				order: {
					checkIn: 'ASC',
				},
			});

			// PART 1: Individual User Metrics
			let userMetrics: any[] = [];
			if (queryDto.includeUserDetails !== false) {
				userMetrics = await this.generateAllUsersMetrics(users, attendanceRecords);
			}

			// PART 2: Organization-level metrics
			const organizationMetrics = await this.calculateOrganizationMetrics(attendanceRecords, users);

			const report = {
				reportPeriod: {
					from: format(fromDate, 'yyyy-MM-dd'),
					to: format(toDate, 'yyyy-MM-dd'),
					totalDays,
					generatedAt: now.toISOString(),
				},
				userMetrics,
				organizationMetrics,
			};

			const response = {
				message: process.env.SUCCESS_MESSAGE || 'Success',
				report,
			};

			// Cache the result for 5 minutes
			await this.cacheManager.set(cacheKey, response, 300);

			return response;
		} catch (error) {
			this.logger.error('Error generating organization attendance report:', error);
			throw new BadRequestException(error?.message || 'Error generating organization attendance report');
		}
	}

	private generateReportCacheKey(
		queryDto: OrganizationReportQueryDto,
		orgId?: number,
		branchId?: number,
		fromDate?: Date,
		toDate?: Date,
	): string {
		const keyParts = [
			'org_attendance_report',
			orgId || 'no-org',
			branchId || queryDto.branchId || 'no-branch',
			queryDto.role || 'all-roles',
			queryDto.includeUserDetails !== false ? 'with-users' : 'no-users',
			fromDate ? format(fromDate, 'yyyy-MM-dd') : 'no-from',
			toDate ? format(toDate, 'yyyy-MM-dd') : 'no-to',
		];
		return keyParts.join('_');
	}

	private async generateAllUsersMetrics(users: User[], attendanceRecords: Attendance[]): Promise<any[]> {
		try {
			const userMetrics: any[] = [];

			for (const user of users) {
				// Filter attendance records for this user
				const userAttendance = attendanceRecords.filter(record => record.owner.uid === user.uid);

				if (userAttendance.length === 0) {
					// Include user with zero metrics if they have no attendance
					userMetrics.push({
						userId: user.uid,
						userInfo: {
							name: user.name,
							email: user.email,
							role: user.accessLevel,
							branch: user.branch?.name || 'N/A',
						},
						metrics: this.getZeroMetrics(),
					});
					continue;
				}

				// Get user metrics using existing method
				const userMetricsResult = await this.getUserAttendanceMetrics(user.uid);
				
				userMetrics.push({
					userId: user.uid,
					userInfo: {
						name: user.name,
						email: user.email,
						role: user.accessLevel,
						branch: user.branch?.name || 'N/A',
					},
					metrics: userMetricsResult.metrics,
				});
			}

			return userMetrics;
		} catch (error) {
			this.logger.error('Error generating user metrics:', error);
			return [];
		}
	}

	private async calculateOrganizationMetrics(attendanceRecords: Attendance[], users: User[]): Promise<any> {
		try {
			const completedShifts = attendanceRecords.filter(record => record.checkOut);

			// Calculate average times
			const averageTimes = this.calculateAverageTimes(attendanceRecords);

			// Calculate totals
			const totals = this.calculateTotals(attendanceRecords, users);

			// Group by branch
			const byBranch = this.groupByBranch(attendanceRecords, users);

			// Group by role
			const byRole = this.groupByRole(attendanceRecords, users);

			// Calculate insights
			const insights = this.calculateInsights(attendanceRecords);

			return {
				averageTimes,
				totals,
				byBranch,
				byRole,
				insights,
			};
		} catch (error) {
			this.logger.error('Error calculating organization metrics:', error);
			return this.getZeroOrganizationMetrics();
		}
	}

	private calculateAverageTimes(attendanceRecords: Attendance[]): any {
		try {
			if (attendanceRecords.length === 0) {
				return {
					startTime: 'N/A',
					endTime: 'N/A',
					shiftDuration: 0,
					breakDuration: 0,
				};
			}

			// Calculate average check-in time
			const checkInTimes = attendanceRecords.map(record => {
				const date = new Date(record.checkIn);
				return date.getHours() * 60 + date.getMinutes();
			});

			const avgCheckInMinutes = checkInTimes.reduce((sum, minutes) => sum + minutes, 0) / checkInTimes.length;
			const avgCheckInHours = Math.floor(avgCheckInMinutes / 60);
			const avgCheckInMins = Math.round(avgCheckInMinutes % 60);
			const startTime = `${avgCheckInHours.toString().padStart(2, '0')}:${avgCheckInMins.toString().padStart(2, '0')}:00`;

			// Calculate average check-out time
			const completedShifts = attendanceRecords.filter(record => record.checkOut);
			let endTime = 'N/A';
			
			if (completedShifts.length > 0) {
				const checkOutTimes = completedShifts.map(record => {
					const date = new Date(record.checkOut!);
					return date.getHours() * 60 + date.getMinutes();
				});

				const avgCheckOutMinutes = checkOutTimes.reduce((sum, minutes) => sum + minutes, 0) / checkOutTimes.length;
				const avgCheckOutHours = Math.floor(avgCheckOutMinutes / 60);
				const avgCheckOutMins = Math.round(avgCheckOutMinutes % 60);
				endTime = `${avgCheckOutHours.toString().padStart(2, '0')}:${avgCheckOutMins.toString().padStart(2, '0')}:00`;
			}

			// Calculate average shift duration
			const shiftDurations = completedShifts.map(record => {
				const startTime = new Date(record.checkIn);
				const endTime = new Date(record.checkOut!);
				return differenceInMinutes(endTime, startTime) / 60; // Convert to hours
			});

			const avgShiftDuration = shiftDurations.length > 0 
				? shiftDurations.reduce((sum, duration) => sum + duration, 0) / shiftDurations.length 
				: 0;

			// Calculate average break duration
			const breakDurations = attendanceRecords.map(record => {
				return record.totalBreakTime ? this.parseBreakTime(record.totalBreakTime) / 60 : 0; // Convert to hours
			});

			const avgBreakDuration = breakDurations.length > 0 
				? breakDurations.reduce((sum, duration) => sum + duration, 0) / breakDurations.length 
				: 0;

			return {
				startTime,
				endTime,
				shiftDuration: Math.round(avgShiftDuration * 100) / 100,
				breakDuration: Math.round(avgBreakDuration * 100) / 100,
			};
		} catch (error) {
			this.logger.error('Error calculating average times:', error);
			return {
				startTime: 'N/A',
				endTime: 'N/A',
				shiftDuration: 0,
				breakDuration: 0,
			};
		}
	}

	private calculateTotals(attendanceRecords: Attendance[], users: User[]): any {
		try {
			const completedShifts = attendanceRecords.filter(record => record.checkOut);

			// Calculate total hours
			const totalHours = completedShifts.reduce((sum, record) => {
				const startTime = new Date(record.checkIn);
				const endTime = new Date(record.checkOut!);
				const breakMinutes = record.totalBreakTime ? this.parseBreakTime(record.totalBreakTime) : 0;
				const workMinutes = differenceInMinutes(endTime, startTime) - breakMinutes;
				return sum + (workMinutes / 60); // Convert to hours
			}, 0);

			// Calculate overtime hours (assuming 8-hour standard workday)
			const standardWorkHours = 8;
			const overtimeHours = completedShifts.reduce((sum, record) => {
				const startTime = new Date(record.checkIn);
				const endTime = new Date(record.checkOut!);
				const breakMinutes = record.totalBreakTime ? this.parseBreakTime(record.totalBreakTime) : 0;
				const workHours = (differenceInMinutes(endTime, startTime) - breakMinutes) / 60;
				return sum + Math.max(0, workHours - standardWorkHours);
			}, 0);

			return {
				totalEmployees: users.length,
				totalHours: Math.round(totalHours * 100) / 100,
				totalShifts: attendanceRecords.length,
				overtimeHours: Math.round(overtimeHours * 100) / 100,
			};
		} catch (error) {
			this.logger.error('Error calculating totals:', error);
			return {
				totalEmployees: 0,
				totalHours: 0,
				totalShifts: 0,
				overtimeHours: 0,
			};
		}
	}

	private groupByBranch(attendanceRecords: Attendance[], users: User[]): any[] {
		try {
			const branchMap = new Map();

			// Initialize branches
			users.forEach(user => {
				if (user.branch) {
					const branchId = user.branch.uid.toString();
					if (!branchMap.has(branchId)) {
						branchMap.set(branchId, {
							branchId,
							branchName: user.branch.name || `Branch ${branchId}`,
							employeeCount: 0,
							totalHours: 0,
							totalShifts: 0,
							employees: new Set(),
						});
					}
					branchMap.get(branchId).employees.add(user.uid);
				}
			});

			// Calculate metrics for each branch
			attendanceRecords.forEach(record => {
				const user = users.find(u => u.uid === record.owner.uid);
				if (user && user.branch) {
					const branchId = user.branch.uid.toString();
					const branchData = branchMap.get(branchId);
					
					if (branchData) {
						branchData.totalShifts++;
						
						if (record.checkOut) {
							const startTime = new Date(record.checkIn);
							const endTime = new Date(record.checkOut);
							const breakMinutes = record.totalBreakTime ? this.parseBreakTime(record.totalBreakTime) : 0;
							const workHours = (differenceInMinutes(endTime, startTime) - breakMinutes) / 60;
							branchData.totalHours += workHours;
						}
					}
				}
			});

			// Convert to array and calculate averages
			return Array.from(branchMap.values()).map(branch => ({
				branchId: branch.branchId,
				branchName: branch.branchName,
				employeeCount: branch.employees.size,
				totalHours: Math.round(branch.totalHours * 100) / 100,
				totalShifts: branch.totalShifts,
				averageHoursPerEmployee: branch.employees.size > 0 
					? Math.round((branch.totalHours / branch.employees.size) * 100) / 100 
					: 0,
				averageShiftsPerEmployee: branch.employees.size > 0 
					? Math.round((branch.totalShifts / branch.employees.size) * 100) / 100 
					: 0,
			}));
		} catch (error) {
			this.logger.error('Error grouping by branch:', error);
			return [];
		}
	}

	private groupByRole(attendanceRecords: Attendance[], users: User[]): any[] {
		try {
			const roleMap = new Map();

			// Initialize roles
			users.forEach(user => {
				const role = user.accessLevel;
				if (!roleMap.has(role)) {
					roleMap.set(role, {
						role,
						employeeCount: 0,
						totalHours: 0,
						totalShifts: 0,
						employees: new Set(),
					});
				}
				roleMap.get(role).employees.add(user.uid);
			});

			// Calculate metrics for each role
			attendanceRecords.forEach(record => {
				const user = users.find(u => u.uid === record.owner.uid);
				if (user) {
					const role = user.accessLevel;
					const roleData = roleMap.get(role);
					
					if (roleData) {
						roleData.totalShifts++;
						
						if (record.checkOut) {
							const startTime = new Date(record.checkIn);
							const endTime = new Date(record.checkOut);
							const breakMinutes = record.totalBreakTime ? this.parseBreakTime(record.totalBreakTime) : 0;
							const workHours = (differenceInMinutes(endTime, startTime) - breakMinutes) / 60;
							roleData.totalHours += workHours;
						}
					}
				}
			});

			// Convert to array and calculate averages
			return Array.from(roleMap.values()).map(role => ({
				role: role.role,
				employeeCount: role.employees.size,
				totalHours: Math.round(role.totalHours * 100) / 100,
				totalShifts: role.totalShifts,
				averageHoursPerEmployee: role.employees.size > 0 
					? Math.round((role.totalHours / role.employees.size) * 100) / 100 
					: 0,
				averageShiftsPerEmployee: role.employees.size > 0 
					? Math.round((role.totalShifts / role.employees.size) * 100) / 100 
					: 0,
			}));
		} catch (error) {
			this.logger.error('Error grouping by role:', error);
			return [];
		}
	}

	private calculateInsights(attendanceRecords: Attendance[]): any {
		try {
			if (attendanceRecords.length === 0) {
				return {
					attendanceRate: 0,
					punctualityRate: 0,
					averageHoursPerDay: 0,
					peakCheckInTime: 'N/A',
					peakCheckOutTime: 'N/A',
				};
			}

			// Calculate punctuality rate (on time arrivals before 9:15 AM)
			const standardStartHour = 9;
			const standardStartMinute = 15;
			const onTimeArrivals = attendanceRecords.filter(record => {
				const checkInTime = new Date(record.checkIn);
				const checkInMinutes = checkInTime.getHours() * 60 + checkInTime.getMinutes();
				const standardStartMinutes = standardStartHour * 60 + standardStartMinute;
				return checkInMinutes <= standardStartMinutes;
			}).length;

			const punctualityRate = Math.round((onTimeArrivals / attendanceRecords.length) * 100);

			// Calculate average hours per day
			const completedShifts = attendanceRecords.filter(record => record.checkOut);
			const totalWorkHours = completedShifts.reduce((sum, record) => {
				const startTime = new Date(record.checkIn);
				const endTime = new Date(record.checkOut!);
				const breakMinutes = record.totalBreakTime ? this.parseBreakTime(record.totalBreakTime) : 0;
				const workHours = (differenceInMinutes(endTime, startTime) - breakMinutes) / 60;
				return sum + workHours;
			}, 0);

			const averageHoursPerDay = completedShifts.length > 0 
				? Math.round((totalWorkHours / completedShifts.length) * 100) / 100 
				: 0;

			// Find peak check-in and check-out times
			const peakCheckInTime = this.findPeakTime(attendanceRecords.map(r => new Date(r.checkIn)));
			const peakCheckOutTime = this.findPeakTime(
				completedShifts.map(r => new Date(r.checkOut!))
			);

			// Calculate attendance rate (assuming 100% for users who have any attendance)
			const attendanceRate = 100; // This would need to be calculated against expected attendance

			return {
				attendanceRate,
				punctualityRate,
				averageHoursPerDay,
				peakCheckInTime,
				peakCheckOutTime,
			};
		} catch (error) {
			this.logger.error('Error calculating insights:', error);
			return {
				attendanceRate: 0,
				punctualityRate: 0,
				averageHoursPerDay: 0,
				peakCheckInTime: 'N/A',
				peakCheckOutTime: 'N/A',
			};
		}
	}

	private findPeakTime(times: Date[]): string {
		if (times.length === 0) return 'N/A';

		// Group times by hour
		const hourCounts = new Map<number, number>();
		
		times.forEach(time => {
			const hour = time.getHours();
			hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
		});

		// Find the hour with most occurrences
		let peakHour = 0;
		let maxCount = 0;
		
		hourCounts.forEach((count, hour) => {
			if (count > maxCount) {
				maxCount = count;
				peakHour = hour;
			}
		});

		return `${peakHour.toString().padStart(2, '0')}:00:00`;
	}

	private getZeroMetrics(): any {
		return {
			firstAttendance: { date: null, checkInTime: null, daysAgo: null },
			lastAttendance: { date: null, checkInTime: null, checkOutTime: null, daysAgo: null },
			totalHours: { allTime: 0, thisMonth: 0, thisWeek: 0, today: 0 },
			totalShifts: { allTime: 0, thisMonth: 0, thisWeek: 0, today: 0 },
			averageHoursPerDay: 0,
			attendanceStreak: 0,
		};
	}

	private getZeroOrganizationMetrics(): any {
		return {
			averageTimes: {
				startTime: 'N/A',
				endTime: 'N/A',
				shiftDuration: 0,
				breakDuration: 0,
			},
			totals: {
				totalEmployees: 0,
				totalHours: 0,
				totalShifts: 0,
				overtimeHours: 0,
			},
			byBranch: [],
			byRole: [],
			insights: {
				attendanceRate: 0,
				punctualityRate: 0,
				averageHoursPerDay: 0,
				peakCheckInTime: 'N/A',
				peakCheckOutTime: 'N/A',
			},
		};
	}
}
