import { Injectable, NotFoundException } from '@nestjs/common';
import { IsNull, MoreThanOrEqual, Not, Repository, LessThanOrEqual } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { AttendanceStatus } from '../lib/enums/attendance.enums';
import { CreateCheckInDto } from './dto/create-attendance-check-in.dto';
import { CreateCheckOutDto } from './dto/create-attendance-check-out.dto';
import { CreateBreakDto } from './dto/create-attendance-break.dto';
import { isToday } from 'date-fns';
import { differenceInMinutes, differenceInMilliseconds, startOfMonth, endOfMonth } from 'date-fns';
import { UserService } from '../user/user.service';
import { RewardsService } from '../rewards/rewards.service';
import { XP_VALUES_TYPES } from '../lib/constants/constants';
import { XP_VALUES } from '../lib/constants/constants';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ReportType, ReportFormat, ReportTimeframe } from '../lib/enums/report.enums';
import { BreakDetail } from './interfaces/break-detail.interface';
import { Logger } from '@nestjs/common';

@Injectable()
export class AttendanceService {
	private readonly logger = new Logger(AttendanceService.name);

	constructor(
		@InjectRepository(Attendance)
		private attendanceRepository: Repository<Attendance>,
		private userService: UserService,
		private rewardsService: RewardsService,
		private readonly eventEmitter: EventEmitter2,
	) {}

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
				this.logger.log(`Triggering daily report generation for user ${checkOutDto.owner.uid} after check-out`);
				this.eventEmitter.emit('daily-report', {
					userId: checkOutDto.owner.uid,
				});

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
			const checkIns = await this.attendanceRepository.find();

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

	public async checkInsByStatus(
		ref: number,
	): Promise<{
		message: string;
		startTime: string;
		endTime: string;
		nextAction: string;
		isLatestCheckIn: boolean;
		checkedIn: boolean;
	}> {
		try {
			const [checkIn] = await this.attendanceRepository.find({
				where: {
					owner: {
						uid: ref,
					},
				},
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
			};

			return response;
		}
	}

	public async checkInsByUser(ref: number): Promise<{ message: string; checkIns: Attendance[] }> {
		try {
			const checkIns = await this.attendanceRepository.find({
				where: { owner: { uid: ref } },
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
				message: `could not get check ins by user - ${error?.message}`,
				checkIns: null,
			};

			return response;
		}
	}

	public async checkInsByBranch(ref: string): Promise<{ message: string; checkIns: Attendance[] }> {
		try {
			const checkIns = await this.attendanceRepository.find({
				where: {
					branch: { ref },
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
				message: `could not get check ins by branch - ${error?.message}`,
				checkIns: null,
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

	private parseBreakTime(breakTime: string): number {
		try {
			// Format: "Xh Ym"
			const hours = parseInt(breakTime.split('h')[0].trim()) || 0;
			const minutes = parseInt(breakTime.split('h')[1].split('m')[0].trim()) || 0;
			return hours * 60 + minutes;
		} catch (error) {
			return 0;
		}
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
}
