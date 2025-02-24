import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not, In } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { Task } from './entities/task.entity';
import { User } from '../user/entities/user.entity';
import { CommunicationService } from '../communication/communication.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailType } from '../lib/enums/email.enums';
import { TaskStatus } from '../lib/enums/task.enums';
import { NotificationType, NotificationStatus } from '../lib/enums/notification.enums';

@Injectable()
export class TaskReminderService {
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
			status: NotificationStatus.UNREAD,
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
				status: NotificationStatus.UNREAD,
			});
		}
	}
}
