export const XP_VALUES = {
    // Daily Actions
    DAILY_LOGIN: 50,
    COMPLETE_PROFILE: 100,

    // Task Related
    CREATE_TASK: 10,
    COMPLETE_TASK: 25,
    COMPLETE_TASK_EARLY: 40,
    CREATE_SUBTASK: 5,

    // Sales Related
    CREATE_LEAD: 15,
    CONVERT_LEAD: 50,
    COMPLETE_SALE: 100,

    // Collaboration
    CREATE_JOURNAL: 20,
    COMMENT_ON_TASK: 5,
    HELP_COLLEAGUE: 30,

    // Achievements
    FIRST_SALE: 200,
    TASK_STREAK_7_DAYS: 300,
    PERFECT_ATTENDANCE_MONTH: 500
};

export const LEVELS = {
    1: { min: 0, max: 1000 },
    2: { min: 1001, max: 2500 },
    3: { min: 2501, max: 5000 },
    4: { min: 5001, max: 10000 },
    5: { min: 10001, max: 20000 },
    6: { min: 20001, max: Infinity }
};

export const RANKS = {
    BRONZE: { levels: [1, 5] },
    SILVER: { levels: [6, 15] },
    GOLD: { levels: [16, 25] },
    PLATINUM: { levels: [26, 35] },
    DIAMOND: { levels: [36, 50] },
    LEGENDARY: { levels: [51, Infinity] }
}; 