import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ExpoPushService, ExpoPushMessage } from './expo-push.service';
import { CommunicationService } from '../../communication/communication.service';
import {
	NotificationData,
	NotificationResult,
	NotificationEvent,
	NotificationPriority,
	NotificationChannel,
	NotificationTemplate,
	NotificationRecipient,
} from '../types/unified-notification.types';
import { EmailType } from '../enums/email.enums';

@Injectable()
export class UnifiedNotificationService {
	private readonly logger = new Logger(UnifiedNotificationService.name);

	// Pre-defined notification templates
	private readonly templates: Map<NotificationEvent, NotificationTemplate> = new Map([
		// Task Templates
		[
			NotificationEvent.TASK_CREATED,
			{
				event: NotificationEvent.TASK_CREATED,
				title: '📋 New Task Created',
				messageTemplate: '{taskTitle} has been created by {createdBy}',
				priority: NotificationPriority.NORMAL,
				channel: NotificationChannel.TASKS,
				defaultData: { screen: '/sales/tasks', action: 'view_task' },
				pushSettings: { sound: 'default', badge: 1 },
			},
		],
		[
			NotificationEvent.TASK_ASSIGNED,
			{
				event: NotificationEvent.TASK_ASSIGNED,
				title: '📋 New Task Assigned',
				messageTemplate: '{taskTitle} - Assigned by {assignedBy}',
				priority: NotificationPriority.HIGH,
				channel: NotificationChannel.TASKS,
				defaultData: { screen: '/sales/tasks', action: 'view_task' },
				pushSettings: { sound: 'default', badge: 1 },
			},
		],
		[
			NotificationEvent.TASK_UPDATED,
			{
				event: NotificationEvent.TASK_UPDATED,
				title: '📝 Task Updated',
				messageTemplate: '{taskTitle} has been updated by {updatedBy}',
				priority: NotificationPriority.NORMAL,
				channel: NotificationChannel.TASKS,
				defaultData: { screen: '/sales/tasks', action: 'view_task' },
				pushSettings: { sound: 'default', badge: 1 },
			},
		],
		[
			NotificationEvent.TASK_COMPLETED,
			{
				event: NotificationEvent.TASK_COMPLETED,
				title: '✅ Task Completed',
				messageTemplate: '{taskTitle} has been completed by {completedBy}',
				priority: NotificationPriority.NORMAL,
				channel: NotificationChannel.TASKS,
				defaultData: { screen: '/sales/tasks', action: 'view_task' },
				pushSettings: { sound: 'default', badge: 1 },
			},
		],
		[
			NotificationEvent.TASK_STATUS_CHANGED,
			{
				event: NotificationEvent.TASK_STATUS_CHANGED,
				title: '🔄 Task Status Changed',
				messageTemplate: '{taskTitle} status changed to {newStatus}',
				priority: NotificationPriority.NORMAL,
				channel: NotificationChannel.TASKS,
				defaultData: { screen: '/sales/tasks', action: 'view_task' },
				pushSettings: { sound: 'default', badge: 1 },
			},
		],
		[
			NotificationEvent.TASK_DELETED,
			{
				event: NotificationEvent.TASK_DELETED,
				title: '🗑️ Task Deleted',
				messageTemplate: '{taskTitle} has been deleted by {deletedBy}',
				priority: NotificationPriority.NORMAL,
				channel: NotificationChannel.TASKS,
				defaultData: { screen: '/sales/tasks', action: 'view_tasks' },
				pushSettings: { sound: 'default', badge: 1 },
			},
		],
		[
			NotificationEvent.TASK_REMINDER,
			{
				event: NotificationEvent.TASK_REMINDER,
				title: '⏰ Task Deadline Approaching',
				messageTemplate: '{taskTitle} is due {timeLeft}',
				priority: NotificationPriority.HIGH,
				channel: NotificationChannel.REMINDERS,
				defaultData: { screen: '/sales/tasks', action: 'view_task' },
				pushSettings: { sound: 'default', badge: 1 },
			},
		],
		[
			NotificationEvent.TASK_OVERDUE,
			{
				event: NotificationEvent.TASK_OVERDUE,
				title: '🚨 Overdue & Missed Tasks',
				messageTemplate:
					'You have {taskCount} task(s) that need attention ({overdueCount} overdue, {missedCount} missed)',
				priority: NotificationPriority.URGENT,
				channel: NotificationChannel.IMPORTANT,
				defaultData: { screen: '/sales/tasks', action: 'view_overdue_tasks' },
				pushSettings: { sound: 'default', badge: 1 },
			},
		],
		[
			NotificationEvent.TASK_FLAG_CREATED,
			{
				event: NotificationEvent.TASK_FLAG_CREATED,
				title: '🚩 Task Flag Created',
				messageTemplate: 'Flag "{flagTitle}" created for task {taskTitle} by {createdBy}',
				priority: NotificationPriority.HIGH,
				channel: NotificationChannel.IMPORTANT,
				defaultData: { screen: '/sales/tasks', action: 'view_task' },
				pushSettings: { sound: 'default', badge: 1 },
			},
		],
		[
			NotificationEvent.TASK_FLAG_RESOLVED,
			{
				event: NotificationEvent.TASK_FLAG_RESOLVED,
				title: '✅ Task Flag Resolved',
				messageTemplate: 'Flag "{flagTitle}" for task {taskTitle} has been resolved',
				priority: NotificationPriority.NORMAL,
				channel: NotificationChannel.TASKS,
				defaultData: { screen: '/sales/tasks', action: 'view_task' },
				pushSettings: { sound: 'default', badge: 1 },
			},
		],

		// Lead Templates
		[
			NotificationEvent.LEAD_CREATED,
			{
				event: NotificationEvent.LEAD_CREATED,
				title: '🎯 New Lead Created',
				messageTemplate: 'Lead "{leadName}" has been created by {createdBy}',
				priority: NotificationPriority.NORMAL,
				channel: NotificationChannel.LEADS,
				defaultData: { screen: '/sales/leads', action: 'view_lead' },
				pushSettings: { sound: 'default', badge: 1 },
			},
		],
		[
			NotificationEvent.LEAD_ASSIGNED,
			{
				event: NotificationEvent.LEAD_ASSIGNED,
				title: '💰 New Lead Assigned',
				messageTemplate: '{leadName} - New sales opportunity assigned by {assignedBy}',
				priority: NotificationPriority.HIGH,
				channel: NotificationChannel.SALES,
				defaultData: { screen: '/sales/leads', action: 'view_lead' },
				pushSettings: { sound: 'default', badge: 1 },
			},
		],
		[
			NotificationEvent.LEAD_UPDATED,
			{
				event: NotificationEvent.LEAD_UPDATED,
				title: '📝 Lead Updated',
				messageTemplate: 'Lead "{leadName}" has been updated by {updatedBy}',
				priority: NotificationPriority.NORMAL,
				channel: NotificationChannel.LEADS,
				defaultData: { screen: '/sales/leads', action: 'view_lead' },
				pushSettings: { sound: 'default', badge: 1 },
			},
		],
		[
			NotificationEvent.LEAD_STATUS_CHANGED,
			{
				event: NotificationEvent.LEAD_STATUS_CHANGED,
				title: '🔄 Lead Status Changed',
				messageTemplate: 'Lead "{leadName}" status changed to {newStatus}',
				priority: NotificationPriority.NORMAL,
				channel: NotificationChannel.LEADS,
				defaultData: { screen: '/sales/leads', action: 'view_lead' },
				pushSettings: { sound: 'default', badge: 1 },
			},
		],
		[
			NotificationEvent.LEAD_CONVERTED,
			{
				event: NotificationEvent.LEAD_CONVERTED,
				title: '🎉 Lead Converted!',
				messageTemplate: 'Lead "{leadName}" has been converted to a client!',
				priority: NotificationPriority.HIGH,
				channel: NotificationChannel.SALES,
				defaultData: { screen: '/sales/leads', action: 'view_lead' },
				pushSettings: { sound: 'default', badge: 1 },
			},
		],
		[
			NotificationEvent.LEAD_DELETED,
			{
				event: NotificationEvent.LEAD_DELETED,
				title: '🗑️ Lead Deleted',
				messageTemplate: 'Lead "{leadName}" has been deleted by {deletedBy}',
				priority: NotificationPriority.NORMAL,
				channel: NotificationChannel.LEADS,
				defaultData: { screen: '/sales/leads', action: 'view_leads' },
				pushSettings: { sound: 'default', badge: 1 },
			},
		],
		[
			NotificationEvent.LEAD_REMINDER,
			{
				event: NotificationEvent.LEAD_REMINDER,
				title: '📞 Lead Follow-up Reminder',
				messageTemplate: 'You have {leadsCount} pending lead(s) requiring follow-up',
				priority: NotificationPriority.NORMAL,
				channel: NotificationChannel.REMINDERS,
				defaultData: { screen: '/sales/leads', action: 'view_leads' },
				pushSettings: { sound: 'default', badge: 1 },
			},
		],
	]);

	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		private readonly expoPushService: ExpoPushService,
		@Inject(forwardRef(() => CommunicationService))
		private readonly communicationService: CommunicationService,
	) {}

	/**
	 * Main method to send unified notifications (both email and push)
	 */
	async sendNotification(data: NotificationData): Promise<NotificationResult> {
		this.logger.log(`🚀 Sending ${data.event} notification to ${data.recipients.length} recipient(s)`);

		try {
			// Enrich recipients with missing data (email, push tokens, etc.)
			const enrichedRecipients = await this.enrichRecipients(data.recipients);

			const results: NotificationResult = {
				success: true,
				message: 'Notifications processed successfully',
			};

			// Send push notifications
			const pushResults = await this.sendPushNotifications(data, enrichedRecipients);
			results.pushResults = pushResults;

			// Send email notifications if configured
			if (data.email) {
				const emailResults = await this.sendEmailNotifications(data, enrichedRecipients);
				results.emailResults = emailResults;
			}

			// Mark as failed if both push and email failed
			if (pushResults.sent === 0 && (!results.emailResults || results.emailResults.sent === 0)) {
				results.success = false;
				results.message = 'All notifications failed to send';
			}

			return results;
		} catch (error) {
			this.logger.error(`❌ Failed to send ${data.event} notification:`, error);
			return {
				success: false,
				message: `Failed to send notification: ${error.message}`,
			};
		}
	}

	/**
	 * Convenience method using predefined templates
	 */
	async sendTemplatedNotification(
		event: NotificationEvent,
		userIds: number[],
		variables: Record<string, any>,
		options?: {
			sendEmail?: boolean;
			emailTemplate?: EmailType;
			emailData?: Record<string, any>;
			customData?: Record<string, any>;
			priority?: NotificationPriority;
		},
	): Promise<NotificationResult> {
		const template = this.templates.get(event);
		if (!template) {
			throw new Error(`No template found for event: ${event}`);
		}

		// Interpolate message template
		const message = this.interpolateTemplate(template.messageTemplate, variables);

		const recipients: NotificationRecipient[] = userIds.map((userId) => ({ userId }));

		const notificationData: NotificationData = {
			event,
			title: template.title,
			message,
			priority: options?.priority || template.priority,
			channel: template.channel,
			recipients,
			data: {
				...template.defaultData,
				...options?.customData,
				id: variables.id || variables.taskId || variables.leadId,
				type: event,
				metadata: variables,
			},
			push: {
				sound: template.pushSettings?.sound || 'default',
				badge: template.pushSettings?.badge || 1,
			},
			source: {
				service: 'UnifiedNotificationService',
				method: 'sendTemplatedNotification',
				entityId: variables.id || variables.taskId || variables.leadId,
				entityType: event.includes('task') ? 'task' : 'lead',
			},
		};

		// Add email configuration if requested
		if (options?.sendEmail && options?.emailTemplate) {
			notificationData.email = {
				template: options.emailTemplate,
				templateData: options.emailData || variables,
			};
		}

		return this.sendNotification(notificationData);
	}

	/**
	 * Enrich recipients with email addresses and push tokens from database
	 */
	private async enrichRecipients(recipients: NotificationRecipient[]): Promise<NotificationRecipient[]> {
		const userIds = recipients.map((r) => r.userId).filter(Boolean);

		if (userIds.length === 0) {
			return recipients;
		}

		const users = await this.userRepository.find({
			where: { uid: In(userIds) },
			select: ['uid', 'email', 'expoPushToken', 'name', 'surname', 'username'],
		});

		return recipients.map((recipient) => {
			const user = users.find((u) => u.uid === recipient.userId);
			if (!user) return recipient;

			return {
				...recipient,
				email: recipient.email || user.email,
				pushToken: recipient.pushToken || user.expoPushToken,
				name: recipient.name || `${user.name || ''} ${user.surname || ''}`.trim() || user.username,
			};
		});
	}

	/**
	 * Send push notifications to all valid recipients
	 */
	private async sendPushNotifications(
		data: NotificationData,
		recipients: NotificationRecipient[],
	): Promise<{ sent: number; failed: number; errors?: string[] }> {
		const pushRecipients = recipients.filter(
			(r) => r.pushToken && this.expoPushService.isValidExpoPushToken(r.pushToken) && r.prefersPush !== false,
		);

		if (pushRecipients.length === 0) {
			return { sent: 0, failed: 0 };
		}

		try {
			const messages: ExpoPushMessage[] = pushRecipients.map((recipient) => ({
				to: recipient.pushToken!,
				title: data.title,
				body: data.message,
				data: {
					...data.data,
					recipientId: recipient.userId,
				},
				sound: data.push?.silent ? false : data.push?.sound || 'default',
				badge: data.push?.badge || 1,
				priority: this.mapPriorityToExpo(data.priority),
				channelId: data.channel,
			}));

			const tickets = await this.expoPushService.sendPushNotifications(messages);

			const sent = tickets.filter((t) => t.status === 'ok').length;
			const failed = tickets.filter((t) => t.status === 'error').length;
			const errors = tickets
				.filter((t) => t.status === 'error')
				.map((t) => t.message)
				.filter(Boolean);

			// Handle invalid tokens by clearing them from user records
			const invalidTokenErrors = tickets
				.filter((t) => t.status === 'error' && t.message?.includes('InvalidCredentials'))
				.map((t, index) => pushRecipients[index]?.userId)
				.filter(Boolean);

			if (invalidTokenErrors.length > 0) {
				this.logger.warn(`🧹 Cleaning up ${invalidTokenErrors.length} invalid push tokens`);
				await this.cleanupInvalidTokens(invalidTokenErrors);
			}

			// Check receipts for successful tickets (optional - can be done async)
			const successfulTickets = tickets
				.filter((t) => t.status === 'ok' && t.id)
				.map((t) => t.id!)
				.filter(Boolean);

			if (successfulTickets.length > 0) {
				// Check receipts asynchronously without blocking the response
				setTimeout(async () => {
					try {
						await this.checkAndLogReceipts(successfulTickets);
					} catch (error) {
						this.logger.error('Failed to check notification receipts:', error);
					}
				}, 30000); // Check receipts after 30 seconds
			}

			this.logger.log(`📱 Push notifications: ${sent} sent, ${failed} failed`);

			return { sent, failed, errors: errors.length > 0 ? errors : undefined };
		} catch (error) {
			this.logger.error('❌ Push notification batch failed:', error);
			return { sent: 0, failed: pushRecipients.length, errors: [error.message] };
		}
	}

	/**
	 * Clean up invalid push tokens from user records
	 */
	private async cleanupInvalidTokens(userIds: number[]): Promise<void> {
		try {
			await this.userRepository.update({ uid: In(userIds) }, { expoPushToken: null });
			this.logger.log(`✅ Cleaned up invalid tokens for ${userIds.length} users`);
		} catch (error) {
			this.logger.error('Failed to cleanup invalid tokens:', error);
		}
	}

	/**
	 * Check receipts and log delivery status
	 */
	private async checkAndLogReceipts(ticketIds: string[]): Promise<void> {
		try {
			const receipts = await this.expoPushService.checkPushReceipts(ticketIds);

			let deliveredCount = 0;
			let failedCount = 0;
			const failedReasons: string[] = [];

			receipts.forEach((receipt, ticketId) => {
				if (receipt.status === 'ok') {
					deliveredCount++;
				} else {
					failedCount++;
					if (receipt.message) {
						failedReasons.push(receipt.message);
					}
				}
			});

			this.logger.log(`📨 Delivery receipts: ${deliveredCount} delivered, ${failedCount} failed`);

			if (failedReasons.length > 0) {
				this.logger.warn('📨 Failed delivery reasons:', failedReasons);
			}
		} catch (error) {
			this.logger.error('Failed to check delivery receipts:', error);
		}
	}

	/**
	 * Send email notifications to all valid recipients
	 */
	private async sendEmailNotifications(
		data: NotificationData,
		recipients: NotificationRecipient[],
	): Promise<{ sent: number; failed: number; errors?: string[] }> {
		const emailRecipients = recipients.filter((r) => r.email && r.prefersEmail !== false);

		if (emailRecipients.length === 0 || !data.email?.template) {
			return { sent: 0, failed: 0 };
		}

		try {
			const emails = emailRecipients.map((r) => r.email!);

			// Use any type for template data since we're handling dynamic data
			await (this.communicationService as any).sendEmail(
				data.email.template as EmailType,
				emails,
				data.email.templateData || {},
			);

			this.logger.log(`📧 Email notifications: ${emails.length} sent`);

			return { sent: emails.length, failed: 0 };
		} catch (error) {
			this.logger.error('❌ Email notification batch failed:', error);
			return { sent: 0, failed: emailRecipients.length, errors: [error.message] };
		}
	}

	/**
	 * Map internal priority to Expo priority format
	 */
	private mapPriorityToExpo(priority: NotificationPriority): 'default' | 'normal' | 'high' {
		switch (priority) {
			case NotificationPriority.LOW:
				return 'default';
			case NotificationPriority.NORMAL:
				return 'normal';
			case NotificationPriority.HIGH:
			case NotificationPriority.URGENT:
				return 'high';
			default:
				return 'normal';
		}
	}

	/**
	 * Simple template interpolation
	 */
	private interpolateTemplate(template: string, variables: Record<string, any>): string {
		return template.replace(/\{(\w+)\}/g, (match, key) => {
			return variables[key]?.toString() || match;
		});
	}

	/**
	 * Get available notification templates
	 */
	getTemplates(): NotificationTemplate[] {
		return Array.from(this.templates.values());
	}

	/**
	 * Add or update a notification template
	 */
	setTemplate(template: NotificationTemplate): void {
		this.templates.set(template.event, template);
	}
}
