import { Injectable, Logger } from '@nestjs/common';
import fetch from 'node-fetch';

export interface ExpoPushMessage {
	to: string;
	title: string;
	body: string;
	data?: Record<string, any>;
	sound?: string | boolean;
	badge?: number;
	priority?: 'default' | 'normal' | 'high';
	channelId?: string;
}

export interface ExpoPushTicket {
	status: 'ok' | 'error';
	id?: string;
	message?: string;
	details?: any;
}

export interface ExpoPushReceipt {
	status: 'ok' | 'error';
	message?: string;
	details?: any;
}

@Injectable()
export class ExpoPushService {
	private readonly logger = new Logger(ExpoPushService.name);
	private readonly EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
	private readonly EXPO_RECEIPT_URL = 'https://exp.host/--/api/v2/push/getReceipts';
	private readonly MAX_BATCH_SIZE = 100; // Expo's recommended batch size

	async sendPushNotifications(messages: ExpoPushMessage[]): Promise<ExpoPushTicket[]> {
		try {
			// Handle batch size limitations
			if (messages.length > this.MAX_BATCH_SIZE) {
				this.logger.warn(`📦 Large batch detected (${messages.length} messages). Processing in chunks...`);
				return this.sendInBatches(messages);
			}

			const response = await fetch(this.EXPO_PUSH_URL, {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Accept-encoding': 'gzip, deflate',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(messages),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();
			this.logger.log(`✅ Sent ${messages.length} push notification(s)`);

			// Log any errors from the response
			if (result.data) {
				const errors = result.data.filter((ticket: ExpoPushTicket) => ticket.status === 'error');
				if (errors.length > 0) {
					this.logger.warn(`⚠️ ${errors.length} notifications failed:`, errors);
				}
			}

			return result.data || [];
		} catch (error) {
			this.logger.error('❌ Failed to send push notifications:', error);
			throw error;
		}
	}

	/**
	 * Send notifications in batches to respect Expo's limits
	 */
	private async sendInBatches(messages: ExpoPushMessage[]): Promise<ExpoPushTicket[]> {
		const batches = this.chunkArray(messages, this.MAX_BATCH_SIZE);
		const allTickets: ExpoPushTicket[] = [];

		for (let i = 0; i < batches.length; i++) {
			this.logger.log(`📦 Sending batch ${i + 1}/${batches.length} (${batches[i].length} messages)`);
			
			const batchTickets = await this.sendSingleBatch(batches[i]);
			allTickets.push(...batchTickets);

			// Add small delay between batches to avoid rate limiting
			if (i < batches.length - 1) {
				await this.delay(100);
			}
		}

		return allTickets;
	}

	/**
	 * Send a single batch of messages
	 */
	private async sendSingleBatch(messages: ExpoPushMessage[]): Promise<ExpoPushTicket[]> {
		const response = await fetch(this.EXPO_PUSH_URL, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Accept-encoding': 'gzip, deflate',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(messages),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const result = await response.json();
		return result.data || [];
	}

	/**
	 * Check delivery receipts for sent notifications
	 */
	async checkPushReceipts(ticketIds: string[]): Promise<Map<string, ExpoPushReceipt>> {
		try {
			// Handle batch size limitations for receipts too
			if (ticketIds.length > this.MAX_BATCH_SIZE) {
				return this.checkReceiptsInBatches(ticketIds);
			}

			const response = await fetch(this.EXPO_RECEIPT_URL, {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Accept-encoding': 'gzip, deflate',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ ids: ticketIds }),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();
			
			// Log receipt summary
			const receipts = result.data || {};
			const successCount = Object.values(receipts).filter((r: any) => r.status === 'ok').length;
			const errorCount = Object.values(receipts).filter((r: any) => r.status === 'error').length;
			
			this.logger.log(`📨 Receipt check: ${successCount} delivered, ${errorCount} failed`);
			
			return new Map(Object.entries(receipts));
		} catch (error) {
			this.logger.error('❌ Failed to check push receipts:', error);
			throw error;
		}
	}

	/**
	 * Check receipts in batches
	 */
	private async checkReceiptsInBatches(ticketIds: string[]): Promise<Map<string, ExpoPushReceipt>> {
		const batches = this.chunkArray(ticketIds, this.MAX_BATCH_SIZE);
		const allReceipts = new Map<string, ExpoPushReceipt>();

		for (const batch of batches) {
			const batchReceipts = await this.checkSingleReceiptBatch(batch);
			batchReceipts.forEach((receipt, id) => allReceipts.set(id, receipt));
		}

		return allReceipts;
	}

	/**
	 * Check receipts for a single batch
	 */
	private async checkSingleReceiptBatch(ticketIds: string[]): Promise<Map<string, ExpoPushReceipt>> {
		const response = await fetch(this.EXPO_RECEIPT_URL, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Accept-encoding': 'gzip, deflate',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ ids: ticketIds }),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const result = await response.json();
		return new Map(Object.entries(result.data || {}));
	}

	async sendSingleNotification(message: ExpoPushMessage): Promise<ExpoPushTicket> {
		const tickets = await this.sendPushNotifications([message]);
		return tickets[0];
	}

	/**
	 * Utility function to chunk arrays
	 */
	private chunkArray<T>(array: T[], size: number): T[][] {
		const chunks: T[][] = [];
		for (let i = 0; i < array.length; i += size) {
			chunks.push(array.slice(i, i + size));
		}
		return chunks;
	}

	/**
	 * Utility function for delays
	 */
	private delay(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	/**
	 * Create task assignment notification with emoji
	 */
	createTaskAssignmentNotification(
		pushToken: string,
		taskTitle: string,
		taskId: number,
		assignedBy: string,
	): ExpoPushMessage {
		console.log('pushToken', pushToken, 'sending task assignment notification');

		return {
			to: pushToken,
			title: '📋 New Task Assigned',
			body: `${taskTitle} - Assigned by ${assignedBy}`,
			data: {
				type: 'task_assigned',
				taskId: taskId,
				screen: '/sales/tasks',
				action: 'view_task',
			},
			sound: 'default',
			badge: 1,
			priority: 'high',
			channelId: 'tasks',
		};
	}

	/**
	 * Create task reminder notification with emoji
	 */
	createTaskReminderNotification(
		pushToken: string,
		taskTitle: string,
		taskId: number,
		timeLeft: string,
	): ExpoPushMessage {
		return {
			to: pushToken,
			title: '⏰ Task Deadline Approaching',
			body: `"${taskTitle}" is due ${timeLeft}`,
			data: {
				type: 'task_reminder',
				taskId: taskId,
				screen: '/sales/tasks',
				action: 'view_task',
			},
			sound: 'default',
			badge: 1,
			priority: 'high',
			channelId: 'tasks',
		};
	}

	/**
	 * Create lead assignment notification with emoji
	 */
	createLeadAssignmentNotification(
		pushToken: string,
		leadName: string,
		leadId: number,
		assignedBy: string,
	): ExpoPushMessage {
		return {
			to: pushToken,
			title: '💰 New Lead Assigned',
			body: `${leadName} - New sales opportunity assigned by ${assignedBy}`,
			data: {
				type: 'lead_assigned',
				leadId: leadId,
				screen: '/sales/leads',
				action: 'view_lead',
			},
			sound: 'default',
			badge: 1,
			priority: 'high',
			channelId: 'sales',
		};
	}

	/**
	 * Create task completion notification with emoji
	 */
	createTaskCompletionNotification(
		pushToken: string,
		taskTitle: string,
		taskId: number,
		completedBy: string,
	): ExpoPushMessage {
		return {
			to: pushToken,
			title: '✅ Task Completed',
			body: `"${taskTitle}" has been completed by ${completedBy}`,
			data: {
				type: 'task_completed',
				taskId: taskId,
				screen: '/sales/tasks',
				action: 'view_task',
			},
			sound: 'default',
			badge: 1,
			priority: 'normal',
			channelId: 'tasks',
		};
	}

	/**
	 * Create overdue task notification with emoji
	 */
	createOverdueTaskNotification(
		pushToken: string,
		taskCount: number,
		overdueCount: number,
		missedCount: number,
	): ExpoPushMessage {
		return {
			to: pushToken,
			title: '🚨 Overdue & Missed Tasks',
			body: `You have ${taskCount} task(s) that need attention (${overdueCount} overdue, ${missedCount} missed)`,
			data: {
				type: 'tasks_overdue',
				screen: '/sales/tasks',
				action: 'view_overdue_tasks',
			},
			sound: 'default',
			badge: taskCount,
			priority: 'high',
			channelId: 'important',
		};
	}

	/**
	 * Validate if a token looks like a valid Expo push token
	 */
	isValidExpoPushToken(token: string): boolean {
		return token && typeof token === 'string' && token.startsWith('ExponentPushToken[');
	}
}
