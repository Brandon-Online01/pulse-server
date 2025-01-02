"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const attendance_entity_1 = require("./entities/attendance.entity");
const attendance_enums_1 = require("../lib/enums/attendance.enums");
const date_fns_1 = require("date-fns");
const date_fns_2 = require("date-fns");
const user_service_1 = require("../user/user.service");
const rewards_service_1 = require("../rewards/rewards.service");
const constants_1 = require("../lib/constants/constants");
const constants_2 = require("../lib/constants/constants");
const event_emitter_1 = require("@nestjs/event-emitter");
let AttendanceService = class AttendanceService {
    constructor(attendanceRepository, userService, rewardsService, eventEmitter) {
        this.attendanceRepository = attendanceRepository;
        this.userService = userService;
        this.rewardsService = rewardsService;
        this.eventEmitter = eventEmitter;
    }
    async checkIn(checkInDto) {
        try {
            const checkIn = await this.attendanceRepository.save(checkInDto);
            if (!checkIn) {
                throw new common_1.NotFoundException(process.env.CREATE_ERROR_MESSAGE);
            }
            const response = {
                message: process.env.SUCCESS_MESSAGE,
            };
            await this.rewardsService.awardXP({
                owner: checkInDto.owner.uid,
                amount: constants_2.XP_VALUES.CHECK_IN,
                action: constants_1.XP_VALUES_TYPES.ATTENDANCE,
                source: {
                    id: checkInDto.owner.uid.toString(),
                    type: constants_1.XP_VALUES_TYPES.ATTENDANCE,
                    details: 'Check-in reward'
                }
            });
            return response;
        }
        catch (error) {
            const response = {
                message: error?.message,
            };
            return response;
        }
    }
    async checkOut(checkOutDto) {
        try {
            const activeShift = await this.attendanceRepository.findOne({
                where: {
                    status: attendance_enums_1.AttendanceStatus.PRESENT,
                    owner: checkOutDto?.owner,
                    checkIn: (0, typeorm_1.Not)((0, typeorm_1.IsNull)()),
                    checkOut: (0, typeorm_1.IsNull)(),
                },
                order: {
                    checkIn: 'DESC'
                }
            });
            if (activeShift) {
                const checkOutTime = new Date();
                const checkInTime = new Date(activeShift.checkIn);
                const minutesWorked = (0, date_fns_2.differenceInMinutes)(checkOutTime, checkInTime);
                const hoursWorked = (0, date_fns_2.differenceInHours)(checkOutTime, checkInTime);
                const remainingMinutes = minutesWorked % 60;
                const duration = `${hoursWorked}h ${remainingMinutes}m`;
                const updatedShift = {
                    ...activeShift,
                    ...checkOutDto,
                    checkOut: checkOutTime,
                    duration,
                    status: attendance_enums_1.AttendanceStatus.COMPLETED
                };
                await this.attendanceRepository.save(updatedShift);
                const response = {
                    message: process.env.SUCCESS_MESSAGE,
                    duration
                };
                await this.rewardsService.awardXP({
                    owner: checkOutDto.owner.uid,
                    amount: constants_2.XP_VALUES.CHECK_OUT,
                    action: constants_1.XP_VALUES_TYPES.ATTENDANCE,
                    source: {
                        id: checkOutDto.owner.uid.toString(),
                        type: constants_1.XP_VALUES_TYPES.ATTENDANCE,
                        details: 'Check-out reward'
                    }
                });
                this.eventEmitter.emit('daily-report', checkOutDto?.owner?.uid?.toString());
                return response;
            }
        }
        catch (error) {
            const response = {
                message: error?.message,
                duration: null
            };
            return response;
        }
    }
    async allCheckIns() {
        try {
            const checkIns = await this.attendanceRepository.find();
            if (!checkIns) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const response = {
                message: process.env.SUCCESS_MESSAGE,
                checkIns
            };
            return response;
        }
        catch (error) {
            const response = {
                message: `could not get all check ins - ${error.message}`,
                checkIns: null
            };
            return response;
        }
    }
    async checkInsByDate(date) {
        try {
            const checkIns = await this.attendanceRepository.find({
                where: {
                    checkIn: (0, typeorm_1.MoreThanOrEqual)(new Date(date))
                }
            });
            if (!checkIns) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const response = {
                message: process.env.SUCCESS_MESSAGE,
                checkIns
            };
            return response;
        }
        catch (error) {
            const response = {
                message: `could not get check ins by date - ${error.message}`,
                checkIns: null
            };
            return response;
        }
    }
    async checkInsByStatus(ref) {
        try {
            const [checkIn] = await this.attendanceRepository.find({
                where: {
                    owner: {
                        uid: ref
                    }
                },
                order: {
                    checkIn: 'DESC'
                }
            });
            if (!checkIn) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const isLatestCheckIn = (0, date_fns_1.isToday)(new Date(checkIn?.checkIn));
            const { status, checkOut, createdAt, updatedAt, verifiedAt, checkIn: CheckInTime, ...restOfCheckIn } = checkIn;
            const nextAction = status === attendance_enums_1.AttendanceStatus.PRESENT ? 'End Shift' : 'Start Shift';
            const checkedIn = status === attendance_enums_1.AttendanceStatus.PRESENT ? true : false;
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
                ...restOfCheckIn
            };
            return response;
        }
        catch (error) {
            const response = {
                message: `could not get check in - ${error?.message}`,
                startTime: null,
                endTime: null,
                nextAction: null,
                isLatestCheckIn: false,
                checkedIn: false
            };
            return response;
        }
    }
    async checkInsByUser(ref) {
        try {
            const checkIns = await this.attendanceRepository.find({
                where: { owner: { uid: ref } }
            });
            if (!checkIns) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const response = {
                message: process.env.SUCCESS_MESSAGE,
                checkIns
            };
            return response;
        }
        catch (error) {
            const response = {
                message: `could not get check ins by user - ${error?.message}`,
                checkIns: null
            };
            return response;
        }
    }
    async checkInsByBranch(ref) {
        try {
            const checkIns = await this.attendanceRepository.find({
                where: {
                    branch: { ref }
                }
            });
            if (!checkIns) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const response = {
                message: process.env.SUCCESS_MESSAGE,
                checkIns
            };
            return response;
        }
        catch (error) {
            const response = {
                message: `could not get check ins by branch - ${error?.message}`,
                checkIns: null
            };
            return response;
        }
    }
    async getAttendancePercentage() {
        try {
            const today = new Date();
            const startOfDay = new Date(today.setHours(0, 0, 0, 0));
            const attendanceRecords = await this.attendanceRepository.find({
                where: {
                    checkIn: (0, typeorm_1.MoreThanOrEqual)(startOfDay),
                    status: attendance_enums_1.AttendanceStatus.COMPLETED
                }
            });
            let totalMinutesWorked = 0;
            attendanceRecords.forEach(record => {
                if (record.checkIn && record.checkOut) {
                    const minutes = (0, date_fns_2.differenceInMinutes)(new Date(record.checkOut), new Date(record.checkIn));
                    totalMinutesWorked += minutes;
                }
            });
            const expectedWorkMinutes = 8 * 60;
            const percentage = Math.min((totalMinutesWorked / expectedWorkMinutes) * 100, 100);
            const totalHours = totalMinutesWorked / 60;
            return {
                percentage: Math.round(percentage),
                totalHours: Math.round(totalHours * 10) / 10
            };
        }
        catch (error) {
            return {
                percentage: 0,
                totalHours: 0
            };
        }
    }
    async getAttendanceForDate(date) {
        try {
            const startOfDayDate = new Date(date.setHours(0, 0, 0, 0));
            const endOfDayDate = new Date(date.setHours(23, 59, 59, 999));
            const attendanceRecords = await this.attendanceRepository.find({
                where: {
                    checkIn: (0, typeorm_1.MoreThanOrEqual)(startOfDayDate),
                    checkOut: (0, typeorm_1.LessThanOrEqual)(endOfDayDate),
                    status: attendance_enums_1.AttendanceStatus.COMPLETED
                }
            });
            let totalMinutesWorked = 0;
            attendanceRecords.forEach(record => {
                if (record.checkIn && record.checkOut) {
                    const minutes = (0, date_fns_2.differenceInMinutes)(new Date(record.checkOut), new Date(record.checkIn));
                    totalMinutesWorked += minutes;
                }
            });
            const activeShifts = await this.attendanceRepository.find({
                where: {
                    status: attendance_enums_1.AttendanceStatus.PRESENT,
                    checkIn: (0, typeorm_1.MoreThanOrEqual)(startOfDayDate),
                    checkOut: (0, typeorm_1.IsNull)(),
                }
            });
            const now = new Date();
            activeShifts.forEach(shift => {
                if (shift.checkIn) {
                    const minutes = (0, date_fns_2.differenceInMinutes)(now, new Date(shift.checkIn));
                    totalMinutesWorked += minutes;
                }
            });
            return {
                totalHours: Math.round((totalMinutesWorked / 60) * 10) / 10
            };
        }
        catch (error) {
            return { totalHours: 0 };
        }
    }
    async getAttendanceForMonth(ref) {
        try {
            const user = await this.userService.findOne(ref);
            const userId = user.user.uid;
            const attendanceRecords = await this.attendanceRepository.find({
                where: {
                    owner: { uid: userId },
                    checkIn: (0, typeorm_1.MoreThanOrEqual)((0, date_fns_2.startOfMonth)(new Date())),
                    checkOut: (0, typeorm_1.LessThanOrEqual)((0, date_fns_2.endOfMonth)(new Date())),
                    status: attendance_enums_1.AttendanceStatus.COMPLETED
                }
            });
            const completedHours = attendanceRecords.reduce((total, record) => {
                if (record?.duration) {
                    const [hours, minutes] = record.duration.split(' ');
                    const hoursValue = parseFloat(hours.replace('h', ''));
                    const minutesValue = parseFloat(minutes.replace('m', '')) / 60;
                    return total + hoursValue + minutesValue;
                }
                return total;
            }, 0);
            const todayHours = (await this.getAttendanceForDate(new Date())).totalHours;
            const totalHours = completedHours + todayHours;
            return {
                totalHours: Math.round(totalHours * 10) / 10
            };
        }
        catch (error) {
            return { totalHours: 0 };
        }
    }
    async getMonthlyAttendanceStats() {
        try {
            const todayPresent = await this.attendanceRepository.count({
                where: {
                    status: attendance_enums_1.AttendanceStatus.PRESENT
                }
            });
            const totalUsers = await this.userService.findAll().then(users => users.users.length);
            const attendancePercentage = totalUsers > 0
                ? Math.round((todayPresent / totalUsers) * 100)
                : 0;
            return {
                message: process.env.SUCCESS_MESSAGE,
                stats: {
                    metrics: {
                        totalEmployees: totalUsers,
                        totalPresent: todayPresent,
                        attendancePercentage
                    }
                }
            };
        }
        catch (error) {
            return {
                message: error?.message,
                stats: null
            };
        }
    }
    async getCurrentShiftHours(userId) {
        try {
            const activeShift = await this.attendanceRepository.findOne({
                where: {
                    status: attendance_enums_1.AttendanceStatus.PRESENT,
                    owner: { uid: userId },
                    checkIn: (0, typeorm_1.Not)((0, typeorm_1.IsNull)()),
                    checkOut: (0, typeorm_1.IsNull)(),
                },
                order: {
                    checkIn: 'DESC'
                }
            });
            if (activeShift) {
                const now = new Date();
                const checkInTime = new Date(activeShift.checkIn);
                const minutesWorked = (0, date_fns_2.differenceInMinutes)(now, checkInTime);
                return Math.round((minutesWorked / 60) * 10) / 10;
            }
            return 0;
        }
        catch (error) {
            return 0;
        }
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(attendance_entity_1.Attendance)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        user_service_1.UserService,
        rewards_service_1.RewardsService,
        event_emitter_1.EventEmitter2])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map