import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, Not, MoreThanOrEqual, IsNull } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';
import { CheckIn } from '../check-ins/entities/check-in.entity';
import { Journal } from '../journal/entities/journal.entity';
import { Tracking } from '../tracking/entities/tracking.entity';
import { DailyUserActivityReport } from './report.types';
import { TaskStatus, TaskPriority } from '../lib/enums/task.enums';

@Injectable()
export class LiveUserReportService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
        @InjectRepository(CheckIn)
        private readonly checkInRepository: Repository<CheckIn>,
        @InjectRepository(Journal)
        private readonly journalRepository: Repository<Journal>,
        @InjectRepository(Tracking)
        private readonly trackingRepository: Repository<Tracking>
    ) {}

    /**
     * Fetches tasks that are currently in progress for a user
     * @param userId The user ID to fetch tasks for
     * @returns Array of in-progress tasks with their details
     */
    async getCurrentTasksInProgress(userId: number): Promise<Array<{ uid: number; title: string; startedAt: Date; estimatedCompletion?: Date; progress?: number }>> {
        // Fetch tasks that are in progress using TypeORM Repository
        const tasks = await this.taskRepository.find({
            where: {
                status: TaskStatus.IN_PROGRESS,
                isDeleted: false
            }
        });

        // Filter tasks where user is in assignees JSON array
        const filteredTasks = tasks.filter(task => {
            if (task.assignees && Array.isArray(task.assignees)) {
                return task.assignees.some(assignee => assignee.uid === userId);
            }
            return false;
        });

        return filteredTasks.map(task => ({
            uid: task.uid,
            title: task.title,
            startedAt: task.updatedAt, // Using updatedAt as a proxy for when the task was started
            estimatedCompletion: task.deadline,
            progress: task.progress || undefined
        }));
    }

    /**
     * Fetches upcoming tasks for a user, sorted by priority and deadline
     * @param userId The user ID to fetch tasks for
     * @returns Array of upcoming tasks with their details
     */
    async getNextTasks(userId: number): Promise<Array<{ uid: number; title: string; priority: string; deadline?: Date; estimatedDuration?: number }>> {
        const now = new Date();
        
        // Fetch upcoming tasks using TypeORM Repository
        const upcomingTasks = await this.taskRepository.find({
            where: {
                status: Not(TaskStatus.COMPLETED),
                isDeleted: false,
                deadline: MoreThanOrEqual(now)
            }
        });
        
        // Filter tasks where user is in assignees JSON array
        const filteredTasks = upcomingTasks.filter(task => {
            if (task.assignees && Array.isArray(task.assignees)) {
                return task.assignees.some(assignee => assignee.uid === userId);
            }
            return false;
        });
        
        // Sort tasks by priority and deadline
        const sortedTasks = filteredTasks.sort((a, b) => {
            const priorityOrder = {
                [TaskPriority.HIGH]: 1,
                [TaskPriority.MEDIUM]: 2,
                [TaskPriority.LOW]: 3
            };
            
            // First sort by priority
            const priorityDiff = (priorityOrder[a.priority as TaskPriority] || 4) - (priorityOrder[b.priority as TaskPriority] || 4);
            if (priorityDiff !== 0) return priorityDiff;
            
            // Then sort by deadline (null deadlines come last)
            if (!a.deadline && b.deadline) return 1;
            if (a.deadline && !b.deadline) return -1;
            if (a.deadline && b.deadline) {
                return a.deadline.getTime() - b.deadline.getTime();
            }
            
            return 0;
        });
        
        // Take only the first 5 tasks
        const limitedTasks = sortedTasks.slice(0, 5);
        
        return limitedTasks.map(task => {
            return {
                uid: task.uid,
                title: task.title,
                priority: task.priority as string,
                deadline: task.deadline,
                estimatedDuration: (task as any).estimatedDuration as number | undefined
            };
        });
    }

    /**
     * Generates a timeline of tasks for a user
     * @param userId The user ID to generate timeline for
     * @returns Array of tasks with their timeline details
     */
    async getTaskTimeline(userId: number): Promise<Array<{ uid: number; title: string; startDate?: Date; endDate?: Date; status: string }>> {
        const now = new Date();
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);
        
        const thirtyDaysFromNow = new Date(now);
        thirtyDaysFromNow.setDate(now.getDate() + 30);
        
        // Fetch tasks for timeline using TypeORM Repository with Raw query for JSON filtering
        const tasks = await this.taskRepository.find({
            where: [
                {
                    isDeleted: false,
                    createdAt: Between(thirtyDaysAgo, now),
                },
                {
                    isDeleted: false,
                    deadline: Between(now, thirtyDaysFromNow),
                }
            ],
            order: {
                createdAt: 'ASC'
            }
        });
        
        // Filter tasks where user is in assignees JSON array
        const filteredTasks = tasks.filter(task => {
            if (task.assignees && Array.isArray(task.assignees)) {
                return task.assignees.some(assignee => assignee.uid === userId);
            }
            return false;
        });
        
        return filteredTasks.map(task => {
            return {
                uid: task.uid,
                title: task.title,
                startDate: task.updatedAt, // Using updatedAt instead of startedAt
                endDate: task.deadline, // Using deadline as the end date
                status: task.status as string
            };
        });
    }

    /**
     * Fetches overdue tasks for a user, sorted by priority and days overdue
     * @param userId The user ID to fetch overdue tasks for
     * @returns Array of overdue tasks with their details
     */
    async getOverdueTasks(userId: number): Promise<Array<{ uid: number; title: string; deadline: Date; priority: string; daysOverdue: number }>> {
        const now = new Date();
        
        // Fetch overdue tasks using TypeORM Repository
        const overdueTasks = await this.taskRepository.find({
            where: {
                status: Not(TaskStatus.COMPLETED),
                isDeleted: false,
                deadline: LessThan(now)
            },
            order: {
                priority: 'ASC',
                deadline: 'ASC'
            }
        });
        
        // Filter tasks where user is in assignees JSON array
        const filteredTasks = overdueTasks.filter(task => {
            if (task.assignees && Array.isArray(task.assignees)) {
                return task.assignees.some(assignee => assignee.uid === userId);
            }
            return false;
        });
        
        // Sort tasks by priority
        const sortedTasks = filteredTasks.sort((a, b) => {
            const priorityOrder = {
                [TaskPriority.HIGH]: 1,
                [TaskPriority.MEDIUM]: 2,
                [TaskPriority.LOW]: 3
            };
            
            return (priorityOrder[a.priority as TaskPriority] || 4) - (priorityOrder[b.priority as TaskPriority] || 4);
        });
        
        return sortedTasks.map(task => {
            const daysOverdue = Math.floor((now.getTime() - task.deadline.getTime()) / (1000 * 60 * 60 * 24));
            
            return {
                uid: task.uid,
                title: task.title,
                deadline: task.deadline,
                priority: task.priority,
                daysOverdue
            };
        });
    }

    /**
     * Calculates task efficiency metrics for a user
     * @param userId The user ID to calculate efficiency for
     * @returns Task efficiency metrics
     */
    async getTaskEfficiency(userId: number): Promise<{ averageCompletionTime: number; userCompletionTime: number; efficiencyRatio: number; trend: 'improving' | 'declining' | 'stable'; comparisonToTeam: number }> {
        // Get user with organisation using TypeORM Repository
        const user = await this.userRepository.findOne({
            where: { uid: userId },
            relations: ['organisation']
        });
        
        if (!user || !user.organisation) {
            // Default values if user or organization not found
            return {
                averageCompletionTime: 0,
                userCompletionTime: 0,
                efficiencyRatio: 0,
                trend: 'stable',
                comparisonToTeam: 0
            };
        }

        // Get completed tasks for the user in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const now = new Date();
        
        const allTasks = await this.taskRepository.find({
            where: {
                status: TaskStatus.COMPLETED,
                isDeleted: false,
                completionDate: Between(thirtyDaysAgo, now)
            }
        });
        
        // Filter tasks for the current user
        const userCompletedTasks = allTasks.filter(task => {
            if (task.assignees && Array.isArray(task.assignees)) {
                return task.assignees.some(assignee => assignee.uid === userId);
            }
            return false;
        });

        // Calculate user's average completion time (in minutes)
        let userTotalCompletionTime = 0;
        let userTaskCount = 0;
        
        userCompletedTasks.forEach(task => {
            if (task.completionDate && task.createdAt) {
                const completionTimeMinutes = (task.completionDate.getTime() - task.createdAt.getTime()) / (1000 * 60);
                userTotalCompletionTime += completionTimeMinutes;
                userTaskCount++;
            }
        });
        
        const userCompletionTime = userTaskCount > 0 ? Math.round(userTotalCompletionTime / userTaskCount) : 0;

        // Get all users in the same organization
        const orgUsers = await this.userRepository.find({
            where: { organisation: { uid: user.organisation.uid } }
        });

        // Calculate organization's average completion time
        let orgTotalCompletionTime = 0;
        let orgTaskCount = 0;
        
        // For each task, check if it belongs to a user in the organization
        allTasks.forEach(task => {
            if (task.assignees && Array.isArray(task.assignees) && task.completionDate && task.createdAt) {
                const isOrgTask = task.assignees.some(assignee => 
                    orgUsers.some(orgUser => orgUser.uid === assignee.uid)
                );
                
                if (isOrgTask) {
                    const completionTimeMinutes = (task.completionDate.getTime() - task.createdAt.getTime()) / (1000 * 60);
                    orgTotalCompletionTime += completionTimeMinutes;
                    orgTaskCount++;
                }
            }
        });
        
        const averageCompletionTime = orgTaskCount > 0 ? Math.round(orgTotalCompletionTime / orgTaskCount) : 120;
        
        // Calculate efficiency ratio (lower is better)
        const efficiencyRatio = averageCompletionTime > 0 ? userCompletionTime / averageCompletionTime : 1;
        
        // Determine trend based on previous data (this would require historical data in a real implementation)
        const trend = efficiencyRatio < 0.9 ? 'improving' : efficiencyRatio > 1.1 ? 'declining' : 'stable';
        
        // Calculate comparison to team (percentage, 100% means equal to team average)
        const comparisonToTeam = averageCompletionTime > 0 ? Math.round((userCompletionTime / averageCompletionTime) * 100) : 100;
        
        return {
            averageCompletionTime,
            userCompletionTime,
            efficiencyRatio,
            trend,
            comparisonToTeam
        };
    }

    /**
     * Fetches recent activities for a user
     * @param userId The user ID to fetch activities for
     * @returns Array of recent activities with their details
     */
    async getRecentActivities(userId: number): Promise<Array<{ type: string; timestamp: Date; description: string }>> {
        const activities = [];
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Fetch recent task updates
        const recentTasks = await this.taskRepository.find({
            where: {
                updatedAt: Between(twentyFourHoursAgo, now)
            },
            order: {
                updatedAt: 'DESC'
            },
            take: 5,
            relations: ['creator']
        });

        // Filter tasks where user is creator or assignee
        const userTasks = recentTasks.filter(task => {
            const isCreator = task.creator && task.creator.uid === userId;
            const isAssignee = task.assignees && Array.isArray(task.assignees) && 
                task.assignees.some(assignee => assignee.uid === userId);
            
            return isCreator || isAssignee;
        });

        userTasks.forEach(task => {
            activities.push({
                type: 'TASK',
                timestamp: task.updatedAt,
                description: `${task.status === TaskStatus.COMPLETED ? 'Completed' : 'Updated'} task: ${task.title}`
            });
        });

        // Fetch recent check-ins
        const recentCheckIns = await this.checkInRepository.find({
            where: {
                owner: { uid: userId },
                checkInTime: Between(twentyFourHoursAgo, now)
            },
            order: {
                checkInTime: 'DESC'
            },
            take: 5
        });

        recentCheckIns.forEach(checkIn => {
            activities.push({
                type: 'CHECK_IN',
                timestamp: checkIn.checkInTime,
                description: `Checked in at ${checkIn.checkInLocation}`
            });
        });

        // Fetch recent journal entries
        const recentJournals = await this.journalRepository.find({
            where: {
                owner: { uid: userId },
                createdAt: Between(twentyFourHoursAgo, now)
            },
            order: {
                createdAt: 'DESC'
            },
            take: 5
        });

        recentJournals.forEach(journal => {
            activities.push({
                type: 'JOURNAL',
                timestamp: journal.createdAt,
                description: `Added journal entry: ${journal.comments.substring(0, 30)}${journal.comments.length > 30 ? '...' : ''}`
            });
        });

        // Sort by timestamp (newest first) and limit to 10 activities
        return activities
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 10);
    }

    /**
     * Checks if a user is currently online based on recent activity
     * @param userId The user ID to check
     * @returns Boolean indicating if the user is online
     */
    async checkUserOnlineStatus(userId: number): Promise<boolean> {
        const now = new Date();
        const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
        
        // Check for recent task updates
        const recentTasks = await this.taskRepository.find({
            where: {
                updatedAt: Between(fifteenMinutesAgo, now)
            }
        });
        
        // Check if any of the recent tasks have the user as an assignee
        const hasRecentTaskUpdate = recentTasks.some(task => {
            if (task.assignees && Array.isArray(task.assignees)) {
                return task.assignees.some(assignee => assignee.uid === userId);
            }
            return false;
        });
        
        if (hasRecentTaskUpdate) {
            return true;
        }
        
        // Check for recent check-ins
        const recentCheckIn = await this.checkInRepository.findOne({
            where: {
                owner: { uid: userId },
                checkInTime: Between(fifteenMinutesAgo, now)
            }
        });
        
        if (recentCheckIn) {
            return true;
        }
        
        // Check for recent journal entries
        const recentJournal = await this.journalRepository.findOne({
            where: {
                owner: { uid: userId },
                createdAt: Between(fifteenMinutesAgo, now)
            }
        });
        
        if (recentJournal) {
            return true;
        }
        
        return false;
    }

    /**
     * Fetches the current activity of a user
     * @param userId The user ID to fetch activity for
     * @returns String describing the current activity or undefined
     */
    async getCurrentActivity(userId: number): Promise<string | undefined> {
        // In a real implementation, this would determine what the user is currently doing
        // based on their most recent activity
        
        const now = new Date();
        const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
        
        // Check for in-progress tasks
        const inProgressTasks = await this.taskRepository.find({
            where: {
                status: TaskStatus.IN_PROGRESS
            },
            order: {
                updatedAt: 'DESC'
            }
        });
        
        // Find the most recently updated task assigned to the user
        const currentTask = inProgressTasks.find(task => {
            if (task.assignees && Array.isArray(task.assignees)) {
                return task.assignees.some(assignee => assignee.uid === userId);
            }
            return false;
        });
        
        if (currentTask) {
            return `Working on task: ${currentTask.title}`;
        }
        
        // Check for recent check-ins
        const recentCheckIn = await this.checkInRepository.findOne({
            where: {
                owner: { uid: userId },
                checkInTime: Between(thirtyMinutesAgo, now),
                checkOutTime: IsNull()
            },
            order: {
                checkInTime: 'DESC'
            }
        });
        
        if (recentCheckIn) {
            return `At location: ${recentCheckIn.checkInLocation}`;
        }
        
        // If no current activity can be determined
        return undefined;
    }

    /**
     * Fetches the current location of a user
     * @param userId The user ID to fetch location for
     * @returns Location object or undefined
     */
    async getUserLocation(userId: number): Promise<{ latitude: number; longitude: number; address?: string } | undefined> {
        // Get the most recent tracking data for the user
        const latestTracking = await this.trackingRepository.findOne({
            where: {
                owner: { uid: userId }
            },
            order: {
                createdAt: 'DESC'
            }
        });
        
        if (latestTracking) {
            return {
                latitude: latestTracking.latitude,
                longitude: latestTracking.longitude,
                address: latestTracking.address
            };
        }
        
        // If no tracking data, check the most recent check-in
        const latestCheckIn = await this.checkInRepository.findOne({
            where: {
                owner: { uid: userId }
            },
            order: {
                checkInTime: 'DESC'
            }
        });
        
        if (latestCheckIn && latestCheckIn.checkInLocation) {
            return {
                latitude: 0, // Would need to extract from checkInLocation if available
                longitude: 0, // Would need to extract from checkInLocation if available
                address: latestCheckIn.checkInLocation
            };
        }
        
        return undefined;
    }

    /**
     * Generates a summary for the live user report
     * @param user The user object
     * @param dailyReport The daily user activity report
     * @param data Additional data for the summary
     * @returns Summary string
     */
    generateLiveReportSummary(
        user: User, 
        dailyReport: DailyUserActivityReport, 
        data: {
            currentTasksInProgress: Array<{ uid: number; title: string; startedAt: Date; estimatedCompletion?: Date; progress?: number }>;
            nextTasks: Array<{ uid: number; title: string; priority: string; deadline: Date; estimatedDuration?: number }>;
            overdueTasks: Array<{ uid: number; title: string; deadline: Date; priority: string; daysOverdue: number }>;
            taskEfficiency: { averageCompletionTime: number; userCompletionTime: number; efficiencyRatio: number; trend: 'improving' | 'declining' | 'stable'; comparisonToTeam: number };
            isOnline: boolean;
        }
    ): string {
        const { currentTasksInProgress, nextTasks, overdueTasks, taskEfficiency, isOnline } = data;
        const userName = `${user.name} ${user.surname}`;
        
        let summary = `${userName} is currently ${isOnline ? 'online' : 'offline'}. `;
        
        // Add task summary
        summary += `Today: ${dailyReport.tasks.completed} tasks completed, ${dailyReport.tasks.inProgress} in progress, ${dailyReport.tasks.pending} pending. `;
        
        // Add current tasks info
        if (currentTasksInProgress.length > 0) {
            const highestProgressTask = currentTasksInProgress.sort((a, b) => (b.progress || 0) - (a.progress || 0))[0];
            summary += `Currently working on ${currentTasksInProgress.length} task(s), with "${highestProgressTask.title}" at ${highestProgressTask.progress || 0}% completion. `;
        }
        
        // Add next tasks info
        if (nextTasks.length > 0) {
            const highPriorityTasks = nextTasks.filter(task => task.priority === TaskPriority.HIGH);
            if (highPriorityTasks.length > 0) {
                summary += `${highPriorityTasks.length} high priority task(s) upcoming. `;
            }
        }
        
        // Add overdue tasks info
        if (overdueTasks.length > 0) {
            const criticalOverdue = overdueTasks.filter(task => task.priority === TaskPriority.HIGH);
            summary += `${overdueTasks.length} overdue task(s)${criticalOverdue.length > 0 ? `, ${criticalOverdue.length} critical` : ''}. `;
        }
        
        // Add efficiency info
        if (taskEfficiency) {
            const efficiencyDescription = taskEfficiency.efficiencyRatio > 1 ? 'above average' : 'below average';
            summary += `Task efficiency is ${efficiencyDescription} and ${taskEfficiency.trend}. `;
        }
        
        // Add productivity info
        summary += `Overall productivity score: ${dailyReport.productivity.score.toFixed(1)}/10.`;
        
        return summary;
    }
} 