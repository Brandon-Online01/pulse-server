import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientCommunicationSchedule } from '../entities/client-communication-schedule.entity';
import { Client } from '../entities/client.entity';
import { User } from '../../user/entities/user.entity';
import { Task } from '../../tasks/entities/task.entity';
import { CreateCommunicationScheduleDto, UpdateCommunicationScheduleDto, CommunicationScheduleQueryDto } from '../dto/communication-schedule.dto';
import { CommunicationFrequency, CommunicationType } from '../../lib/enums/client.enums';
import { TaskType, TaskPriority, RepetitionType, TaskStatus } from '../../lib/enums/task.enums';
import { PaginatedResponse } from '../../lib/interfaces/product.interfaces';
import { addDays, addWeeks, addMonths, addYears, format, startOfDay, setHours, setMinutes } from 'date-fns';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ClientCommunicationScheduleService {
    constructor(
        @InjectRepository(ClientCommunicationSchedule)
        private scheduleRepository: Repository<ClientCommunicationSchedule>,
        @InjectRepository(Client)
        private clientRepository: Repository<Client>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Task)
        private taskRepository: Repository<Task>,
        private eventEmitter: EventEmitter2,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache,
    ) {}

    /**
     * Create a new communication schedule for a client
     */
    async createSchedule(
        clientId: number,
        createDto: CreateCommunicationScheduleDto,
        orgId?: number,
        branchId?: number,
        createdByUserId?: number
    ): Promise<{ message: string; schedule?: ClientCommunicationSchedule }> {
        try {
            // Find the client
            const client = await this.clientRepository.findOne({
                where: { uid: clientId, isDeleted: false },
                relations: ['assignedSalesRep', 'organisation', 'branch']
            });

            if (!client) {
                throw new NotFoundException('Client not found');
            }

            // Determine who should be assigned to this communication
            let assignedUser: User = null;
            if (createDto.assignedToUserId) {
                assignedUser = await this.userRepository.findOne({
                    where: { uid: createDto.assignedToUserId }
                });
                if (!assignedUser) {
                    throw new BadRequestException('Assigned user not found');
                }
            } else if (client.assignedSalesRep) {
                assignedUser = client.assignedSalesRep;
            }

            // Validate custom frequency
            if (createDto.frequency === CommunicationFrequency.CUSTOM && !createDto.customFrequencyDays) {
                throw new BadRequestException('Custom frequency requires customFrequencyDays to be specified');
            }

            // Create the schedule
            const schedule = this.scheduleRepository.create({
                client,
                clientUid: client.uid,
                communicationType: createDto.communicationType,
                frequency: createDto.frequency,
                customFrequencyDays: createDto.customFrequencyDays,
                preferredTime: createDto.preferredTime,
                preferredDays: createDto.preferredDays,
                nextScheduledDate: createDto.nextScheduledDate ? new Date(createDto.nextScheduledDate) : null,
                isActive: createDto.isActive !== undefined ? createDto.isActive : true,
                notes: createDto.notes,
                assignedTo: assignedUser,
                assignedToUid: assignedUser?.uid,
                metadata: createDto.metadata,
                organisation: client.organisation,
                organisationUid: client.organisation?.uid,
                branch: client.branch,
                branchUid: client.branch?.uid
            });

            // Calculate next scheduled date if not provided
            if (!schedule.nextScheduledDate) {
                schedule.nextScheduledDate = this.calculateNextScheduleDate(schedule);
            }

            const savedSchedule = await this.scheduleRepository.save(schedule);

            // Create the first task for this schedule
            if (schedule.isActive && schedule.nextScheduledDate) {
                await this.createTaskFromSchedule(savedSchedule);
            }

            // Clear cache
            await this.clearScheduleCache(clientId);

            return {
                message: 'Communication schedule created successfully',
                schedule: savedSchedule
            };
        } catch (error) {
            return {
                message: error?.message || 'Failed to create communication schedule'
            };
        }
    }

    /**
     * Update an existing communication schedule
     */
    async updateSchedule(
        scheduleId: number,
        updateDto: UpdateCommunicationScheduleDto,
        orgId?: number,
        branchId?: number
    ): Promise<{ message: string; schedule?: ClientCommunicationSchedule }> {
        try {
            const schedule = await this.scheduleRepository.findOne({
                where: { uid: scheduleId, isDeleted: false },
                relations: ['client', 'assignedTo', 'organisation', 'branch']
            });

            if (!schedule) {
                throw new NotFoundException('Communication schedule not found');
            }

            // Update assigned user if provided
            if (updateDto.assignedToUserId) {
                const assignedUser = await this.userRepository.findOne({
                    where: { uid: updateDto.assignedToUserId }
                });
                if (!assignedUser) {
                    throw new BadRequestException('Assigned user not found');
                }
                schedule.assignedTo = assignedUser;
                schedule.assignedToUid = assignedUser.uid;
            }

            // Update other fields
            if (updateDto.communicationType) schedule.communicationType = updateDto.communicationType;
            if (updateDto.frequency) schedule.frequency = updateDto.frequency;
            if (updateDto.customFrequencyDays) schedule.customFrequencyDays = updateDto.customFrequencyDays;
            if (updateDto.preferredTime) schedule.preferredTime = updateDto.preferredTime;
            if (updateDto.preferredDays) schedule.preferredDays = updateDto.preferredDays;
            if (updateDto.nextScheduledDate) schedule.nextScheduledDate = new Date(updateDto.nextScheduledDate);
            if (updateDto.isActive !== undefined) schedule.isActive = updateDto.isActive;
            if (updateDto.notes) schedule.notes = updateDto.notes;
            if (updateDto.metadata) schedule.metadata = updateDto.metadata;

            // Validate custom frequency
            if (schedule.frequency === CommunicationFrequency.CUSTOM && !schedule.customFrequencyDays) {
                throw new BadRequestException('Custom frequency requires customFrequencyDays to be specified');
            }

            // Recalculate next scheduled date if frequency changed
            if (updateDto.frequency || updateDto.customFrequencyDays || updateDto.preferredDays || updateDto.preferredTime) {
                schedule.nextScheduledDate = this.calculateNextScheduleDate(schedule);
                
                // Create new task for updated schedule
                if (schedule.isActive && schedule.nextScheduledDate) {
                    await this.createTaskFromSchedule(schedule);
                }
            }

            const updatedSchedule = await this.scheduleRepository.save(schedule);

            // Clear cache
            await this.clearScheduleCache(schedule.client.uid);

            return {
                message: 'Communication schedule updated successfully',
                schedule: updatedSchedule
            };
        } catch (error) {
            return {
                message: error?.message || 'Failed to update communication schedule'
            };
        }
    }

    /**
     * Get all communication schedules for a client
     */
    async getClientSchedules(
        clientId: number,
        query: CommunicationScheduleQueryDto,
        orgId?: number,
        branchId?: number
    ): Promise<PaginatedResponse<ClientCommunicationSchedule>> {
        try {
            const { page = 1, limit = 10, communicationType, frequency, isActive, assignedToUserId } = query;

            const whereClause: any = {
                client: { uid: clientId },
                isDeleted: false
            };

            if (communicationType) whereClause.communicationType = communicationType;
            if (frequency) whereClause.frequency = frequency;
            if (isActive !== undefined) whereClause.isActive = isActive;
            if (assignedToUserId) whereClause.assignedTo = { uid: assignedToUserId };

            const [schedules, total] = await this.scheduleRepository.findAndCount({
                where: whereClause,
                relations: ['client', 'assignedTo'],
                skip: (page - 1) * limit,
                take: limit,
                order: { createdAt: 'DESC' }
            });

            return {
                data: schedules,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                },
                message: 'Communication schedules retrieved successfully'
            };
        } catch (error) {
            return {
                data: [],
                meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
                message: error?.message || 'Failed to retrieve communication schedules'
            };
        }
    }

    /**
     * Delete a communication schedule
     */
    async deleteSchedule(scheduleId: number): Promise<{ message: string }> {
        try {
            const schedule = await this.scheduleRepository.findOne({
                where: { uid: scheduleId, isDeleted: false },
                relations: ['client']
            });

            if (!schedule) {
                throw new NotFoundException('Communication schedule not found');
            }

            // Soft delete
            schedule.isDeleted = true;
            schedule.isActive = false;
            await this.scheduleRepository.save(schedule);

            // Clear cache
            await this.clearScheduleCache(schedule.client.uid);

            return {
                message: 'Communication schedule deleted successfully'
            };
        } catch (error) {
            return {
                message: error?.message || 'Failed to delete communication schedule'
            };
        }
    }

    /**
     * Calculate the next scheduled date based on frequency and preferences
     */
    private calculateNextScheduleDate(schedule: ClientCommunicationSchedule): Date {
        const now = new Date();
        let nextDate = startOfDay(now);

        // Add time based on frequency
        switch (schedule.frequency) {
            case CommunicationFrequency.DAILY:
                nextDate = addDays(nextDate, 1);
                break;
            case CommunicationFrequency.WEEKLY:
                nextDate = addWeeks(nextDate, 1);
                break;
            case CommunicationFrequency.BIWEEKLY:
                nextDate = addWeeks(nextDate, 2);
                break;
            case CommunicationFrequency.MONTHLY:
                nextDate = addMonths(nextDate, 1);
                break;
            case CommunicationFrequency.QUARTERLY:
                nextDate = addMonths(nextDate, 3);
                break;
            case CommunicationFrequency.SEMIANNUALLY:
                nextDate = addMonths(nextDate, 6);
                break;
            case CommunicationFrequency.ANNUALLY:
                nextDate = addYears(nextDate, 1);
                break;
            case CommunicationFrequency.CUSTOM:
                if (schedule.customFrequencyDays) {
                    nextDate = addDays(nextDate, schedule.customFrequencyDays);
                }
                break;
            default:
                return null; // No scheduling for NONE
        }

        // Adjust for preferred days if specified
        if (schedule.preferredDays && schedule.preferredDays.length > 0) {
            // Find the next occurrence of one of the preferred days
            let daysToAdd = 0;
            const maxDaysToCheck = 14; // Check up to 2 weeks ahead

            while (daysToAdd < maxDaysToCheck) {
                const checkDate = addDays(nextDate, daysToAdd);
                const dayOfWeek = checkDate.getDay();
                
                if (schedule.preferredDays.includes(dayOfWeek)) {
                    nextDate = checkDate;
                    break;
                }
                daysToAdd++;
            }
        }

        // Set preferred time if specified
        if (schedule.preferredTime) {
            const [hours, minutes] = schedule.preferredTime.split(':').map(Number);
            nextDate = setHours(setMinutes(nextDate, minutes), hours);
        } else {
            // Default to 9 AM
            nextDate = setHours(nextDate, 9);
        }

        return nextDate;
    }

    /**
     * Create a task from a communication schedule
     */
    private async createTaskFromSchedule(schedule: ClientCommunicationSchedule): Promise<Task> {
        try {
            // Map communication type to task type
            const taskTypeMap = {
                [CommunicationType.PHONE_CALL]: TaskType.CALL,
                [CommunicationType.EMAIL]: TaskType.EMAIL,
                [CommunicationType.IN_PERSON_VISIT]: TaskType.VISIT,
                [CommunicationType.VIDEO_CALL]: TaskType.VIRTUAL_MEETING,
                [CommunicationType.WHATSAPP]: TaskType.WHATSAPP,
                [CommunicationType.SMS]: TaskType.SMS
            };

            const taskType = taskTypeMap[schedule.communicationType] || TaskType.FOLLOW_UP;

            // Create task title and description
            const title = `${schedule.communicationType.replace('_', ' ').toLowerCase()} with ${schedule.client.name}`;
            const description = `Scheduled ${schedule.communicationType.replace('_', ' ').toLowerCase()} communication with ${schedule.client.name}${schedule.notes ? `\n\nNotes: ${schedule.notes}` : ''}`;

            // Determine repetition type based on frequency
            const repetitionTypeMap = {
                [CommunicationFrequency.DAILY]: RepetitionType.DAILY,
                [CommunicationFrequency.WEEKLY]: RepetitionType.WEEKLY,
                [CommunicationFrequency.MONTHLY]: RepetitionType.MONTHLY,
                [CommunicationFrequency.ANNUALLY]: RepetitionType.YEARLY,
                [CommunicationFrequency.BIWEEKLY]: RepetitionType.NONE, // Handle manually
                [CommunicationFrequency.QUARTERLY]: RepetitionType.NONE, // Handle manually
                [CommunicationFrequency.SEMIANNUALLY]: RepetitionType.NONE, // Handle manually
                [CommunicationFrequency.CUSTOM]: RepetitionType.NONE, // Handle manually
                [CommunicationFrequency.NONE]: RepetitionType.NONE
            };

            const task = this.taskRepository.create({
                title,
                description,
                taskType,
                priority: TaskPriority.MEDIUM,
                deadline: schedule.nextScheduledDate,
                repetitionType: repetitionTypeMap[schedule.frequency] || RepetitionType.NONE,
                repetitionDeadline: schedule.frequency !== CommunicationFrequency.NONE ? addMonths(schedule.nextScheduledDate, 12) : null, // Set 1 year repetition deadline
                clients: [{ uid: schedule.client.uid }],
                assignees: schedule.assignedTo ? [{ uid: schedule.assignedTo.uid }] : [],
                creator: schedule.assignedTo,
                organisation: schedule.organisation,
                branch: schedule.branch,
                targetCategory: 'communication_schedule',
                status: TaskStatus.PENDING,
                progress: 0,
                isOverdue: false,
                isDeleted: false
            });

            const savedTask = await this.taskRepository.save(task);

            // Update the schedule's next date for non-repeating frequencies
            if ([CommunicationFrequency.BIWEEKLY, CommunicationFrequency.QUARTERLY, CommunicationFrequency.SEMIANNUALLY, CommunicationFrequency.CUSTOM].includes(schedule.frequency)) {
                schedule.nextScheduledDate = this.calculateNextScheduleDate(schedule);
                await this.scheduleRepository.save(schedule);
            }

            return savedTask;
        } catch (error) {
            console.error('Error creating task from schedule:', error);
            throw error;
        }
    }

    /**
     * Process all active schedules and create tasks for due communications
     */
    async processScheduledCommunications(): Promise<{ message: string; tasksCreated: number }> {
        try {
            const now = new Date();
            const schedules = await this.scheduleRepository.find({
                where: {
                    isActive: true,
                    isDeleted: false
                },
                relations: ['client', 'assignedTo', 'organisation', 'branch']
            });

            let tasksCreated = 0;

            for (const schedule of schedules) {
                // Check if it's time to create a new task
                if (schedule.nextScheduledDate && schedule.nextScheduledDate <= now) {
                    try {
                        await this.createTaskFromSchedule(schedule);
                        tasksCreated++;
                    } catch (error) {
                        console.error(`Error creating task for schedule ${schedule.uid}:`, error);
                    }
                }
            }

            return {
                message: `Processed ${schedules.length} schedules, created ${tasksCreated} tasks`,
                tasksCreated
            };
        } catch (error) {
            return {
                message: error?.message || 'Failed to process scheduled communications',
                tasksCreated: 0
            };
        }
    }

    /**
     * Get upcoming communications for a user or client
     */
    async getUpcomingCommunications(
        userId?: number,
        clientId?: number,
        days: number = 7
    ): Promise<{ schedules: ClientCommunicationSchedule[]; message: string }> {
        try {
            const endDate = addDays(new Date(), days);
            const whereClause: any = {
                isActive: true,
                isDeleted: false,
                nextScheduledDate: { $lte: endDate }
            };

            if (userId) whereClause.assignedTo = { uid: userId };
            if (clientId) whereClause.client = { uid: clientId };

            const schedules = await this.scheduleRepository.find({
                where: whereClause,
                relations: ['client', 'assignedTo'],
                order: { nextScheduledDate: 'ASC' }
            });

            return {
                schedules,
                message: 'Upcoming communications retrieved successfully'
            };
        } catch (error) {
            return {
                schedules: [],
                message: error?.message || 'Failed to retrieve upcoming communications'
            };
        }
    }

    /**
     * Clear cache for a client's schedules
     */
    private async clearScheduleCache(clientId: number): Promise<void> {
        try {
            const keys = [`client_schedules_${clientId}`, `client_${clientId}_communications`];
            await Promise.all(keys.map(key => this.cacheManager.del(key)));
        } catch (error) {
            console.error('Error clearing schedule cache:', error);
        }
    }
} 