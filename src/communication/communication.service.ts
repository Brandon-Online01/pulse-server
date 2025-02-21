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
import { LicenseCreated, LicenseUpdated, LicenseLimitReached, LicenseRenewed, LicenseSuspended, LicenseActivated, NewQuotationClient, NewQuotationInternal, NewQuotationReseller, Signup, Verification, PasswordReset, Invoice, PasswordChanged, DailyReport } from '../lib/templates/emails';
import { DailyReportData, InvoiceData, PasswordChangedData, PasswordResetData, VerificationEmailData, SignupEmailData, EmailTemplateData, LicenseEmailData, LicenseLimitData, QuotationInternalData, QuotationResellerData, QuotationData } from '../lib/types/email-templates.types';
import { NewTask, TaskUpdated } from '../lib/templates/emails';
import { TaskEmailData } from '../lib/types/email-templates.types';

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
