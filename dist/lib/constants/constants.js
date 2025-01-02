"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RANKS = exports.LEVELS = exports.XP_VALUES_TYPES = exports.XP_VALUES = void 0;
exports.XP_VALUES = {
    DAILY_LOGIN: 25,
    COMPLETE_PROFILE: 50,
    CREATE_TASK: 5,
    COMPLETE_TASK: 15,
    COMPLETE_TASK_EARLY: 20,
    CREATE_SUBTASK: 2,
    CREATE_LEAD: 10,
    CONVERT_LEAD: 30,
    COMPLETE_SALE: 50,
    CREATE_JOURNAL: 10,
    COMMENT_ON_TASK: 2,
    HELP_COLLEAGUE: 15,
    FIRST_SALE: 100,
    TASK_STREAK_7_DAYS: 150,
    PERFECT_ATTENDANCE_MONTH: 200,
    CHECK_OUT: 5,
    CHECK_IN: 5,
    CHECK_OUT_CLIENT: 8,
    CHECK_IN_CLIENT: 8,
    CLAIM: 10,
    JOURNAL: 8,
    LEAD: 10,
    NOTIFICATION: 2,
    TASK: 8
};
exports.XP_VALUES_TYPES = {
    LOGIN: 'login',
    TASK: 'task',
    SUBTASK: 'subtask',
    LEAD: 'lead',
    SALE: 'sale',
    COLLABORATION: 'collaboration',
    ATTENDANCE: 'attendance',
    CHECK_IN_CLIENT: 'check-in-client',
    CHECK_OUT_CLIENT: 'check-out-client',
    CLAIM: 'claim',
    JOURNAL: 'journal',
    NOTIFICATION: 'notification'
};
exports.LEVELS = {
    1: { min: 0, max: 500 },
    2: { min: 501, max: 1500 },
    3: { min: 1501, max: 3000 },
    4: { min: 3001, max: 5000 },
    5: { min: 5001, max: 7500 },
    6: { min: 7501, max: 10000 },
    7: { min: 10001, max: 15000 },
    8: { min: 15001, max: Infinity }
};
exports.RANKS = {
    BRONZE: { levels: [1, 2] },
    SILVER: { levels: [3, 4] },
    GOLD: { levels: [5, 6] },
    PLATINUM: { levels: [7, 8] },
    DIAMOND: { levels: [8, Infinity] }
};
//# sourceMappingURL=constants.js.map