import { Injectable, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
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
	AttendanceMorningReport,
	AttendanceEveningReport,
} from '../lib/templates/emails';
// Quotation related templates
import {
	NewQuotationClient,
	NewQuotationInternal,
	NewQuotationReseller,
	NewQuotationWarehouseFulfillment,
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
	LicenseTransferredFrom,
	LicenseTransferredTo,
} from '../lib/templates/emails';
// Task related templates
import { TaskReminderAssignee, TaskReminderCreator, TaskOverdueMissed } from '../lib/templates/emails';
// User related templates
import { NewUserAdminNotification, NewUserWelcome, UserReInvitation } from '../lib/templates/emails';
// Lead related templates
import { LeadConvertedClient, LeadConvertedCreator, LeadReminder, LeadAssignedToUser } from '../lib/templates/emails';
// Client auth templates
import { ClientPasswordReset, ClientPasswordChanged } from '../lib/templates/emails';
// Warning templates
import { WarningIssued, WarningUpdated, WarningExpired } from '../lib/templates/emails';
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
	LicenseTransferEmailData,
	QuotationInternalData,
	QuotationResellerData,
	QuotationWarehouseData,
	QuotationData,
	NewUserAdminNotificationData,
	NewUserWelcomeData,
	UserReInvitationData,
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
	OrderReceivedClientData,
	WarningIssuedEmailData,
	WarningUpdatedEmailData,
	WarningExpiredEmailData,
	MorningReportData,
	EveningReportData,
} from '../lib/types/email-templates.types';
import {
	TaskFlagCreated,
	TaskFlagUpdated,
	TaskFlagResolved,
	TaskFeedbackAdded,
	OrderReceivedClient,
} from '../lib/templates/emails';

@Injectable()
export class CommunicationService {
	private readonly emailService: nodemailer.Transporter;

	constructor(
		private readonly configService: ConfigService,
		private readonly userService: UserService,
		@InjectRepository(CommunicationLog)
		private communicationLogRepository: Repository<CommunicationLog>,
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
	async sendEmail<T extends EmailType>(emailType: T, recipientsEmails: string[], data: EmailTemplateData<T>) {
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
			const smtpHost = this.configService.get<string>('SMTP_HOST');
			const smtpUser = this.configService.get<string>('SMTP_USER');
			const smtpFrom = this.configService.get<string>('SMTP_FROM');
			console.error('Email service error:', error.message, {
				SMTP_HOST: smtpHost,
				SMTP_USER: smtpUser,
				SMTP_FROM: smtpFrom,
			});
			throw error;
		}
	}

	private getEmailTemplate<T extends EmailType>(type: T, data: EmailTemplateData<T>): EmailTemplate {
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
			case EmailType.NEW_QUOTATION_WAREHOUSE_FULFILLMENT:
				return {
					subject: 'New Quotation from Warehouse Fulfillment',
					body: NewQuotationWarehouseFulfillment(data as QuotationWarehouseData),
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
			case EmailType.LICENSE_TRANSFERRED_FROM:
				return {
					subject: 'License Transferred From',
					body: LicenseTransferredFrom(data as LicenseTransferEmailData),
				};
			case EmailType.LICENSE_TRANSFERRED_TO:
				return {
					subject: 'License Transferred To',
					body: LicenseTransferredTo(data as LicenseTransferEmailData),
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
			case EmailType.QUOTATION_READY_FOR_REVIEW:
				return {
					subject: 'Quotation Ready for Review',
					body: QuotationStatusUpdate(data as QuotationData),
				};
			case EmailType.QUOTATION_UPDATED:
				return {
					subject: 'Quotation Updated',
					body: QuotationStatusUpdate(data as QuotationData),
				};
			case EmailType.QUOTATION_SOURCING:
				return {
					subject: 'Quotation Items Being Sourced',
					body: QuotationStatusUpdate(data as QuotationData),
				};
			case EmailType.QUOTATION_PACKING:
				return {
					subject: 'Quotation Items Being Packed',
					body: QuotationStatusUpdate(data as QuotationData),
				};
			case EmailType.QUOTATION_PAID:
				return {
					subject: 'Quotation Payment Received',
					body: QuotationStatusUpdate(data as QuotationData),
				};
			case EmailType.QUOTATION_SHIPPED:
				return {
					subject: 'Quotation Items Shipped',
					body: QuotationStatusUpdate(data as QuotationData),
				};
			case EmailType.QUOTATION_DELIVERED:
				return {
					subject: 'Quotation Items Delivered',
					body: QuotationStatusUpdate(data as QuotationData),
				};
			case EmailType.QUOTATION_RETURNED:
				return {
					subject: 'Quotation Items Returned',
					body: QuotationStatusUpdate(data as QuotationData),
				};
			case EmailType.QUOTATION_COMPLETED:
				return {
					subject: 'Quotation Completed',
					body: QuotationStatusUpdate(data as QuotationData),
				};
			case EmailType.NEW_USER_ADMIN_NOTIFICATION:
				return {
					subject: 'New User Registration Alert',
					body: NewUserAdminNotification(data as NewUserAdminNotificationData),
				};
			case EmailType.NEW_USER_WELCOME:
				return {
					subject: 'Your Account is Ready - Welcome to the Team!',
					body: NewUserWelcome(data as NewUserWelcomeData),
				};
			case EmailType.USER_RE_INVITATION:
				return {
					subject: 'You\'re Invited Back to the Platform!',
					body: UserReInvitation(data as UserReInvitationData),
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
			case EmailType.ORDER_RECEIVED_CLIENT:
				return {
					subject: 'Your Order Request Has Been Received',
					body: OrderReceivedClient(data as OrderReceivedClientData),
				};
			case EmailType.CLIENT_PASSWORD_RESET:
				return {
					subject: 'Password Reset Request',
					body: ClientPasswordReset(data as PasswordResetData),
				};
			case EmailType.CLIENT_PASSWORD_CHANGED:
				return {
					subject: 'Password Successfully Changed',
					body: ClientPasswordChanged(data as PasswordChangedData),
				};
			case EmailType.WARNING_ISSUED:
				return {
					subject: 'Warning Issued',
					body: WarningIssued(data as WarningIssuedEmailData),
				};
			case EmailType.WARNING_UPDATED:
				return {
					subject: 'Warning Updated',
					body: WarningUpdated(data as WarningUpdatedEmailData),
				};
			case EmailType.WARNING_EXPIRED:
				return {
					subject: 'Warning Expired',
					body: WarningExpired(data as WarningExpiredEmailData),
				};
			case EmailType.ATTENDANCE_MORNING_REPORT:
				return {
					subject: 'Daily Attendance Morning Report',
					body: AttendanceMorningReport(data as MorningReportData),
				};
			case EmailType.ATTENDANCE_EVENING_REPORT:
				return {
					subject: 'Daily Attendance Evening Report',
					body: AttendanceEveningReport(data as EveningReportData),
				};
			default:
				throw new NotFoundException(`Unknown email template type: ${type}`);
		}
	}
}
