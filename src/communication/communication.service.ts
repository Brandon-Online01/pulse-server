import { Injectable, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateNotificationDto } from '../notifications/dto/create-notification.dto';
import { EmailType } from '../lib/enums/email.enums';
import { EmailTemplate } from '../lib/interfaces/email.interface';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunicationLog } from './entities/communication-log.entity';
// Core email templates
import { 
	Signup, 
	Verification, 
	PasswordReset, 
	PasswordChanged, 
	DailyReport,
	NewTask,
	TaskUpdated,
	TaskCompleted,
	UserDailyReport,
} from '../lib/templates/emails';
// Quotation related templates
import {
	NewQuotationClient,
	NewQuotationInternal,
	NewQuotationReseller,
	QuotationStatusUpdate,
	Invoice,
} from '../lib/templates/emails';
// License related templates
import {
	LicenseCreated,
	LicenseUpdated,
	LicenseLimitReached,
	LicenseRenewed,
	LicenseSuspended,
	LicenseActivated,
} from '../lib/templates/emails';
// Task related templates
import {
	TaskReminderAssignee,
	TaskReminderCreator,
	TaskOverdueMissed,
} from '../lib/templates/emails';
// User related templates
import {
	NewUserAdminNotification,
} from '../lib/templates/emails';
// Lead related templates
import {
	LeadConvertedClient,
	LeadConvertedCreator,
	LeadReminder,
	LeadAssignedToUser,
} from '../lib/templates/emails';
// Email data types
import { 
	DailyReportData, 
	InvoiceData, 
	PasswordChangedData, 
	PasswordResetData, 
	VerificationEmailData, 
	SignupEmailData, 
	EmailTemplateData, 
	LicenseEmailData,
	LicenseLimitData, 
	QuotationInternalData, 
	QuotationResellerData, 
	QuotationData,
	NewUserAdminNotificationData, 
	TaskReminderData, 
	TaskCompletedEmailData,
	LeadConvertedClientData,
	LeadConvertedCreatorData,
	LeadReminderData,
	LeadAssignedToUserData,
	TaskEmailData,
	TaskFlagEmailData,
	TaskFeedbackEmailData,
	TaskOverdueMissedData,
} from '../lib/types/email-templates.types';
import { 
	TaskFlagCreated,
	TaskFlagUpdated,
	TaskFlagResolved,
	TaskFeedbackAdded,
} from '../lib/templates/emails';

@Injectable()
export class CommunicationService {
	private readonly emailService: nodemailer.Transporter;

	constructor(
		private readonly configService: ConfigService,
		private readonly notificationsService: NotificationsService,
		private readonly userService: UserService,
		@InjectRepository(CommunicationLog)
		private communicationLogRepository: Repository<CommunicationLog>
	) {
		this.emailService = nodemailer.createTransport({
			host: this.configService.get<string>('SMTP_HOST'),
			port: this.configService.get<number>('SMTP_PORT'),
			secure: this.configService.get<number>('SMTP_PORT') === 465,
			auth: {
				user: this.configService.get<string>('SMTP_USER'),
				pass: this.configService.get<string>('SMTP_PASS'),
			},
			tls: {
				rejectUnauthorized: false,
			},
		});
	}

	@OnEvent('send.email')
	async sendEmail<T extends EmailType>(
		emailType: T,
		recipientsEmails: string[],
		data: EmailTemplateData<T>
	) {
		try {
			if (!recipientsEmails) {
				throw new NotFoundException(process.env.NOT_FOUND_MESSAGE);
			}

			const template = this.getEmailTemplate(emailType, data);

			const result = await this.emailService.sendMail({
				from: this.configService.get<string>('SMTP_FROM'),
				to: recipientsEmails,
				subject: template.subject,
				html: template.body,
			});

			await this.communicationLogRepository.save({
				emailType,
				recipientEmails: recipientsEmails,
				accepted: result.accepted,
				rejected: result.rejected,
				messageId: result.messageId,
				messageSize: result.messageSize,
				envelopeTime: result.envelopeTime,
				messageTime: result.messageTime,
				response: result.response,
				envelope: result.envelope,
			});

			return result;
		} catch (error) {
			throw error;
		}
	}

	private getEmailTemplate<T extends EmailType>(
		type: T,
		data: EmailTemplateData<T>
	): EmailTemplate {
		switch (type) {
			case EmailType.SIGNUP:
				return {
					subject: 'Welcome to Our Platform',
					body: Signup(data as SignupEmailData),
				};
			case EmailType.VERIFICATION:
				return {
					subject: 'Verify Your Email',
					body: Verification(data as VerificationEmailData),
				};
			case EmailType.PASSWORD_RESET:
				return {
					subject: 'Password Reset Request',
					body: PasswordReset(data as PasswordResetData),
				};
			case EmailType.NEW_QUOTATION_CLIENT:
				return {
					subject: 'Your Quotation Details',
					body: NewQuotationClient(data as QuotationData),
				};
			case EmailType.NEW_QUOTATION_INTERNAL:
				return {
					subject: 'New Quotation from Customer',
					body: NewQuotationInternal(data as QuotationInternalData),
				};
			case EmailType.NEW_QUOTATION_RESELLER:
				return {
					subject: 'New Quotation from Your Referral',
					body: NewQuotationReseller(data as QuotationResellerData),
				};
			case EmailType.INVOICE:
				return {
					subject: 'Invoice for Your Quotation',
					body: Invoice(data as InvoiceData),
				};
			case EmailType.PASSWORD_CHANGED:
				return {
					subject: 'Password Successfully Changed',
					body: PasswordChanged(data as PasswordChangedData),
				};
			case EmailType.DAILY_REPORT:
				return {
					subject: 'Daily Report',
					body: DailyReport(data as DailyReportData),
				};
			case EmailType.USER_DAILY_REPORT:
				return {
					subject: 'Your Daily Activity Summary',
					body: UserDailyReport(data as DailyReportData),
				};
			case EmailType.LICENSE_CREATED:
				return {
					subject: 'License Created Successfully',
					body: LicenseCreated(data as LicenseEmailData),
				};
			case EmailType.LICENSE_UPDATED:
				return {
					subject: 'License Updated',
					body: LicenseUpdated(data as LicenseEmailData),
				};
			case EmailType.LICENSE_LIMIT_REACHED:
				return {
					subject: 'License Limit Reached',
					body: LicenseLimitReached(data as LicenseLimitData),
				};
			case EmailType.LICENSE_RENEWED:
				return {
					subject: 'License Renewed Successfully',
					body: LicenseRenewed(data as LicenseEmailData),
				};
			case EmailType.LICENSE_SUSPENDED:
				return {
					subject: 'License Suspended',
					body: LicenseSuspended(data as LicenseEmailData),
				};
			case EmailType.LICENSE_ACTIVATED:
				return {
					subject: 'License Activated Successfully',
					body: LicenseActivated(data as LicenseEmailData),
				};
			case EmailType.NEW_TASK:
				return {
					subject: 'New Task Assigned',
					body: NewTask(data as TaskEmailData),
				};
			case EmailType.TASK_UPDATED:
				return {
					subject: 'Task Updated',
					body: TaskUpdated(data as TaskEmailData),
				};
			case EmailType.TASK_COMPLETED:
				return {
					subject: 'Task Completed Successfully',
					body: TaskCompleted(data as TaskCompletedEmailData),
				};
			case EmailType.QUOTATION_APPROVED:
				return {
					subject: 'Quotation Approved',
					body: QuotationStatusUpdate(data as QuotationData),
				};
			case EmailType.QUOTATION_REJECTED:
				return {
					subject: 'Quotation Not Approved',
					body: QuotationStatusUpdate(data as QuotationData),
				};
			case EmailType.QUOTATION_STATUS_UPDATE:
				return {
					subject: 'Quotation Status Update',
					body: QuotationStatusUpdate(data as QuotationData),
				};
			case EmailType.NEW_USER_ADMIN_NOTIFICATION:
				return {
					subject: 'New User Registration Alert',
					body: NewUserAdminNotification(data as NewUserAdminNotificationData),
				};
			case EmailType.TASK_REMINDER_ASSIGNEE:
				return {
					subject: 'Task Deadline Approaching',
					body: TaskReminderAssignee(data as TaskReminderData),
				};
			case EmailType.TASK_REMINDER_CREATOR:
				return {
					subject: 'Task Deadline Alert',
					body: TaskReminderCreator(data as TaskReminderData),
				};
			case EmailType.TASK_OVERDUE_MISSED:
				return {
					subject: 'Action Required: Overdue & Missed Tasks',
					body: TaskOverdueMissed(data as TaskOverdueMissedData),
				};
			case EmailType.LEAD_CONVERTED_CLIENT:
				return {
					subject: 'Welcome Aboard! Your Account Has Been Upgraded',
					body: LeadConvertedClient(data as LeadConvertedClientData),
				};
			case EmailType.LEAD_CONVERTED_CREATOR:
				return {
					subject: 'Lead Successfully Converted to Client',
					body: LeadConvertedCreator(data as LeadConvertedCreatorData),
				};
			case EmailType.LEAD_REMINDER:
				return {
					subject: 'Pending Leads Require Your Attention',
					body: LeadReminder(data as LeadReminderData),
				};
			case EmailType.LEAD_ASSIGNED_TO_USER:
				return {
					subject: 'You have been assigned a new lead',
					body: LeadAssignedToUser(data as LeadAssignedToUserData),
				};
			case EmailType.TASK_FLAG_CREATED:
				return {
					subject: 'New Task Flag Created',
					body: TaskFlagCreated(data as TaskFlagEmailData),
				};
			case EmailType.TASK_FLAG_UPDATED:
				return {
					subject: 'Task Flag Status Updated',
					body: TaskFlagUpdated(data as TaskFlagEmailData),
				};
			case EmailType.TASK_FLAG_RESOLVED:
				return {
					subject: 'Task Flag Resolved',
					body: TaskFlagResolved(data as TaskFlagEmailData),
				};
			case EmailType.TASK_FEEDBACK_ADDED:
				return {
					subject: 'New Task Feedback Received',
					body: TaskFeedbackAdded(data as TaskFeedbackEmailData),
				};
			default:
				throw new NotFoundException(`Unknown email template type: ${type}`);
		}
	}

	@OnEvent('send.notification')
	async sendNotification(notification: CreateNotificationDto, recipients: string[]) {
		try {
			const users = await this.userService.getUsersByRole(recipients);

			const notifications = users.users.map((user: User) => ({
				...notification,
				owner: user
			}));

			await Promise.all(
				notifications.map(notif => this.notificationsService.create(notif))
			);
		} catch (error) {
			throw error;
		}
	}

} 
