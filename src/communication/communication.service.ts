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
import { LicenseCreated, LicenseUpdated, LicenseLimitReached, LicenseRenewed, LicenseSuspended, LicenseActivated } from '../lib/templates/emails';
import { Signup, Verification, PasswordReset, NewOrder, Invoice, PasswordChanged, OrderOutForDelivery, OrderDelivered, DailyReport, NewOrderInternal, OrderResellerNotification, OrderInternalNotification, OrderWarehouseFulfillment, NewOrderReseller } from '../lib/templates/emails';
import { DailyReportData, InvoiceData, OrderData, OrderDeliveredData, OrderOutForDeliveryData, PasswordChangedData, PasswordResetData, VerificationEmailData, SignupEmailData, EmailTemplateData, OrderResellerNotificationData, OrderInternalNotificationData, OrderWarehouseFulfillmentData, LicenseEmailData, LicenseLimitData } from '../lib/types/email-templates.types';

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
			case EmailType.ORDER_CONFIRMATION:
				return {
					subject: 'Order Confirmation',
					body: NewOrder(data as OrderData),
				};
			case EmailType.INVOICE:
				return {
					subject: 'Invoice for Your Order',
					body: Invoice(data as InvoiceData),
				};
			case EmailType.PASSWORD_CHANGED:
				return {
					subject: 'Password Successfully Changed',
					body: PasswordChanged(data as PasswordChangedData),
				};
			case EmailType.ORDER_OUT_FOR_DELIVERY:
				return {
					subject: 'Your Order is Out for Delivery',
					body: OrderOutForDelivery(data as OrderOutForDeliveryData),
				};
			case EmailType.ORDER_DELIVERED:
				return {
					subject: 'Your Order Has Been Delivered',
					body: OrderDelivered(data as OrderDeliveredData),
				};
			case EmailType.DAILY_REPORT:
				return {
					subject: 'Daily Report',
					body: DailyReport(data as DailyReportData),
				};
			case EmailType.ORDER_RESELLER_NOTIFICATION:
				return {
					subject: 'New Order from Your Referral',
					body: OrderResellerNotification(data as OrderResellerNotificationData),
				};
			case EmailType.ORDER_INTERNAL_NOTIFICATION:
				return {
					subject: 'New Order from a Valued Customer',
					body: OrderInternalNotification(data as OrderInternalNotificationData),
				};
			case EmailType.ORDER_WAREHOUSE_FULFILLMENT:
				return {
					subject: 'New Order from a Valued Customer',
					body: OrderWarehouseFulfillment(data as OrderWarehouseFulfillmentData),
				};
			case EmailType.NEW_ORDER_CLIENT:
				return {
					subject: 'Your Order Confirmation',
					body: NewOrder(data as OrderData),
				};
			case EmailType.NEW_ORDER_INTERNAL:
				return {
					subject: 'New Order from a Valued Customer',
					body: NewOrderInternal(data as OrderInternalNotificationData),
				};
			case EmailType.NEW_ORDER_RESELLER:
				return {
					subject: 'New Purchase from Your Products',
					body: NewOrderReseller(data as OrderResellerNotificationData),
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
