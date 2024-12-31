export const XP_VALUES = {
    // Daily Actions
    DAILY_LOGIN: 25,
    COMPLETE_PROFILE: 50,

    // Task Related
    CREATE_TASK: 5,
    COMPLETE_TASK: 15,
    COMPLETE_TASK_EARLY: 20,
    CREATE_SUBTASK: 2,

    // Sales Related
    CREATE_LEAD: 10,
    CONVERT_LEAD: 30,
    COMPLETE_SALE: 50,

    // Collaboration
    CREATE_JOURNAL: 10,
    COMMENT_ON_TASK: 2,
    HELP_COLLEAGUE: 15,

    // Achievements
    FIRST_SALE: 100,
    TASK_STREAK_7_DAYS: 150,
    PERFECT_ATTENDANCE_MONTH: 200,

    // check-in/out attendance
    CHECK_OUT: 5,
    CHECK_IN: 5,

    // check-in/out client
    CHECK_OUT_CLIENT: 8,
    CHECK_IN_CLIENT: 8,

    // claims
    CLAIM: 10,

    // journal
    JOURNAL: 8,

    // leads
    LEAD: 10,

    // notifications
    NOTIFICATION: 2,

    // tasks
    TASK: 8
};

export const XP_VALUES_TYPES = {
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

export const LEVELS = {
    1: { min: 0, max: 500 },
    2: { min: 501, max: 1500 },
    3: { min: 1501, max: 3000 },
    4: { min: 3001, max: 5000 },
    5: { min: 5001, max: 7500 },
    6: { min: 7501, max: 10000 },
    7: { min: 10001, max: 15000 },
    8: { min: 15001, max: Infinity }
};

export const RANKS = {
    BRONZE: { levels: [1, 2] },
    SILVER: { levels: [3, 4] },
    GOLD: { levels: [5, 6] },
    PLATINUM: { levels: [7, 8] },
    DIAMOND: { levels: [8, Infinity] }
}; 