import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not, In, LessThan, IsNull } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Task } from './entities/task.entity';
import { User } from '../user/entities/user.entity';
import { CommunicationService } from '../communication/communication.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailType } from '../lib/enums/email.enums';
import { TaskStatus } from '../lib/enums/task.enums';
import { NotificationType, NotificationStatus } from '../lib/enums/notification.enums';

@Injectable()
export class TaskReminderService {
	private readonly logger = new Logger(TaskReminderService.name);

	constructor(
		@InjectRepository(Task)
		private readonly taskRepository: Repository<Task>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		private readonly communicationService: CommunicationService,
		private readonly notificationsService: NotificationsService,
	) {}

	@Cron('*/5 * * * *') // Run every 5 minutes
	async checkUpcomingDeadlines() {
		const now = new Date();
		const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60000);

		// Find tasks due in 30 minutes
		const tasks = await this.taskRepository.find({
			where: {
				deadline: Between(now, thirtyMinutesFromNow),
				status: Not(In([TaskStatus.COMPLETED, TaskStatus.CANCELLED])),
				isDeleted: false,
			},
			relations: ['creator', 'subtasks'],
		});

		// Send reminders for each task
		for (const task of tasks) {
			await this.sendReminders(task);
		}
	}

	// Run every day at 8:00 AM
	@Cron(CronExpression.EVERY_DAY_AT_8AM)
	async checkOverdueAndMissedTasks() {
		this.logger.log('Starting overdue and missed tasks check...');
		
		const now = new Date();
		
		try {
			// Get all users
			const users = await this.userRepository.find();
			
			for (const user of users) {
				await this.processUserOverdueAndMissedTasks(user);
			}
			
			this.logger.log('Overdue and missed tasks check completed');
		} catch (error) {
			this.logger.error('Error checking overdue and missed tasks', error.stack);
		}
	}

	private async processUserOverdueAndMissedTasks(user: User) {
		const now = new Date();
		
		try {
			// Find overdue tasks (tasks with status OVERDUE)
			const overdueTasks = await this.taskRepository.find({
				where: {
					status: TaskStatus.OVERDUE,
					isDeleted: false,
					assignees: { uid: user.uid }
				},
				order: { deadline: 'ASC' }
			});
			
			// Find missed tasks (tasks with status MISSED or tasks with deadline in past and not completed)
			const missedTasks = await this.taskRepository.find({
				where: [
					{
						status: TaskStatus.MISSED,
						isDeleted: false,
						assignees: { uid: user.uid }
					},
					{
						deadline: LessThan(now),
						status: Not(In([TaskStatus.COMPLETED, TaskStatus.CANCELLED, TaskStatus.OVERDUE])),
						isDeleted: false,
						assignees: { uid: user.uid }
					}
				],
				order: { deadline: 'ASC' }
			});
			
			// If there are any overdue or missed tasks, send an email notification
			if (overdueTasks.length > 0 || missedTasks.length > 0) {
				await this.sendOverdueAndMissedTasksReminder(user, overdueTasks, missedTasks);
			}
		} catch (error) {
			this.logger.error(`Error processing overdue/missed tasks for user ${user.uid}`, error.stack);
		}
	}

	private async sendOverdueAndMissedTasksReminder(user: User, overdueTasks: Task[], missedTasks: Task[]) {
		try {
			const now = new Date();
			
			// Format overdue tasks for the email
			const formattedOverdueTasks = overdueTasks.map(task => {
				const deadlineDate = task.deadline ? new Date(task.deadline) : null;
				const daysOverdue = deadlineDate ? Math.ceil((now.getTime() - deadlineDate.getTime()) / (1000 * 3600 * 24)) : 0;
				
				return {
					uid: task.uid,
					title: task.title,
					description: task.description,
					deadline: deadlineDate ? deadlineDate.toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'short',
						day: 'numeric'
					}) : 'No deadline',
					priority: task.priority,
					status: task.status,
					progress: task.progress,
					daysOverdue
				};
			});
			
			// Format missed tasks for the email
			const formattedMissedTasks = missedTasks.map(task => {
				const deadlineDate = task.deadline ? new Date(task.deadline) : null;
				const daysOverdue = deadlineDate ? Math.ceil((now.getTime() - deadlineDate.getTime()) / (1000 * 3600 * 24)) : 0;
				
				return {
					uid: task.uid,
					title: task.title,
					description: task.description,
					deadline: deadlineDate ? deadlineDate.toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'short',
						day: 'numeric'
					}) : 'No deadline',
					priority: task.priority,
					status: task.status,
					progress: task.progress,
					daysOverdue
				};
			});
			
			// Prepare email data
			const emailData = {
				name: user.name || 'Team Member',
				overdueTasks: formattedOverdueTasks,
				missedTasks: formattedMissedTasks,
				overdueMissedCount: {
					overdue: formattedOverdueTasks.length,
					missed: formattedMissedTasks.length,
					total: formattedOverdueTasks.length + formattedMissedTasks.length
				},
				dashboardLink: `${process.env.DASHBOARD_URL}/tasks`
			};
			
			// Send email notification
			await this.communicationService.sendEmail(
				EmailType.TASK_OVERDUE_MISSED,
				[user.email],
				emailData
			);
			
			// Create in-app notification
			await this.notificationsService.create({
				title: 'Overdue & Missed Tasks',
				message: `You have ${emailData.overdueMissedCount.total} task(s) that need attention (${emailData.overdueMissedCount.overdue} overdue, ${emailData.overdueMissedCount.missed} missed)`,
				type: NotificationType.TASK_REMINDER,
				owner: user
			});
			
			this.logger.log(`Sent overdue/missed tasks reminder to user ${user.uid} (${user.email})`);
		} catch (error) {
			this.logger.error(`Error sending overdue/missed tasks reminder to user ${user.uid}`, error.stack);
		}
	}

	private async sendReminders(task: Task) {
		// Get all assignees' full user objects
		const assignees = await this.userRepository.findBy({
			uid: In(task.assignees.map((a) => a.uid)),
		});

		// Prepare common task data
		const taskData = {
			uid: task.uid,
			title: task.title,
			description: task.description,
			deadline: task.deadline.toLocaleString(),
			priority: task.priority,
			status: task.status,
			progress: task.progress,
			creator: {
				name: `${task.creator.name} ${task.creator.surname}`,
				email: task.creator.email,
			},
			assignees: assignees.map((a) => ({
				name: `${a.name} ${a.surname}`,
				email: a.email,
			})),
			subtasks: task.subtasks?.map((st) => ({
				title: st.title,
				status: st.status,
			})),
		};

		// Send to creator
		await this.communicationService.sendEmail(EmailType.TASK_REMINDER_CREATOR, [task.creator.email], {
			name: `${task.creator.name} ${task.creator.surname}`,
			task: taskData,
		});

		// Create notification for creator
		await this.notificationsService.create({
			title: 'Task Deadline Alert',
			message: `Your created task "${task.title}" is due in 30 minutes`,
			type: NotificationType.TASK_REMINDER,
			owner: task.creator,
		});

		// Send to each assignee
		for (const assignee of assignees) {
			await this.communicationService.sendEmail(EmailType.TASK_REMINDER_ASSIGNEE, [assignee.email], {
				name: `${assignee.name} ${assignee.surname}`,
				task: taskData,
			});

			// Create notification for assignee
			await this.notificationsService.create({
				title: 'Task Due Soon',
				message: `Task "${task.title}" requires your attention and is due in 30 minutes`,
				type: NotificationType.TASK_REMINDER,
				owner: assignee,
			});
		}
	}
}
