import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { AccessLevel } from '../lib/enums/user.enums';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateNotificationDto } from '../notifications/dto/create-notification.dto';
import { EmailType } from '../lib/enums/email.enums';
import { EmailTemplate } from '../lib/interfaces/email.interface';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunicationLog } from './entities/communication-log.entity';

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
	async sendEmail(
		emailType: EmailType,
		recipientRoles: AccessLevel[],
		data: Record<string, any>
	) {
		try {
			const users = await this.userService.getUsersByRole(recipientRoles);

			const recipients = users?.users?.map((user: User) => user?.email);

			if (!recipients) {
				throw new Error(process.env.NOT_FOUND_MESSAGE);
			}

			const template = this.getEmailTemplate(emailType, data);

			const result = await this.emailService.sendMail({
				from: this.configService.get<string>('SMTP_FROM'),
				to: recipients,
				subject: template.subject,
				html: template.body,
			});

			await this.communicationLogRepository.save({
				emailType,
				recipientRoles,
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

	private getEmailTemplate(type: EmailType, data: Record<string, any>): EmailTemplate {
		switch (type) {
			case EmailType.SIGNUP:
				return {
					subject: 'Welcome to Our Platform',
					body: this.renderSignupTemplate(data),
				};
			case EmailType.VERIFICATION:
				return {
					subject: 'Verify Your Email',
					body: this.renderVerificationTemplate(data),
				};
			case EmailType.PASSWORD_RESET:
				return {
					subject: 'Password Reset Request',
					body: this.renderPasswordResetTemplate(data),
				};
			case EmailType.ORDER_CONFIRMATION:
				return {
					subject: 'Order Confirmation',
					body: this.renderOrderTemplate(data),
				};
			case EmailType.INVOICE:
				return {
					subject: 'Invoice for Your Order',
					body: this.renderInvoiceTemplate(data),
				};
			case EmailType.PASSWORD_CHANGED:
				return {
					subject: 'Password Successfully Changed',
					body: this.renderPasswordChangedTemplate(data),
				};
			case EmailType.ORDER_OUT_FOR_DELIVERY:
				return {
					subject: 'Your Order is Out for Delivery',
					body: this.renderOrderOutForDeliveryTemplate(data),
				};
			case EmailType.ORDER_DELIVERED:
				return {
					subject: 'Your Order Has Been Delivered',
					body: this.renderOrderDeliveredTemplate(data),
				};
			case EmailType.DAILY_REPORT:
				return {
					subject: 'Daily Report',
					body: this.renderDailyReportTemplate(data),
				};
			default:
				throw new Error(`Unknown email template type: ${type}`);
		}
	}

	private renderSignupTemplate(data: Record<string, any>): string {
		return `
			< h1 > Welcome ${data.name}! </h1>
			< p > Thank you for joining our platform.</p>
				< p > Please click the link below to verify your email: </p>
					< a href = "${data.verificationLink}" > Verify Email </a>
						`;
	}

	private renderVerificationTemplate(data: Record<string, any>): string {
		return `
						< h1 > Verify Your Email </h1>
							< p > Hello ${data.name}, </p>
								< p > Please click the link below to verify your email: </p>
									< a href = "${data.verificationLink}" > Verify Email </a>
										`;
	}

	private renderPasswordResetTemplate(data: Record<string, any>): string {
		return `
										< h1 > Reset Your Password </h1>
											< p > Hello ${data.name}, </p>
												< p > Click the link below to reset your password: </p>
													< a href = "${data.resetLink}" > Reset Password </a>
														`;
	}

	private renderOrderTemplate(data: Record<string, any>): string {
		return `
														< h1 > Order Confirmation </h1>
															< p > Thank you for your order #${data.orderId} </p>
																< p > Total: ${data.total} </p>
																	`;
	}

	private renderInvoiceTemplate(data: Record<string, any>): string {
		return `
																	< h1 > Invoice </h1>
																	< p > Invoice #${data.invoiceId} </p>
																		< p > Amount: ${data.amount} </p>
																			`;
	}

	private renderPasswordChangedTemplate(data: Record<string, any>): string {
		return `
																			< h1 > Password Changed Successfully </h1>
																				< p > Hello ${data.name}, </p>
																					< p > Your password has been successfully changed.If you did not make this change, please contact support immediately.</p>
																						`;
	}

	private renderOrderOutForDeliveryTemplate(data: Record<string, any>): string {
		return `
																						< h1 > Your Order is Out for Delivery </h1>
																							< p > Order #${data.orderId} is now out for delivery! </p>
																								< p > Estimated delivery time: ${data.estimatedDeliveryTime} </p>
																									`;
	}

	private renderOrderDeliveredTemplate(data: Record<string, any>): string {
		return `
																									< h1 > Order Delivered </h1>
																										< p > Order #${data.orderId} has been delivered.</p>
																											< p > Thank you for shopping with us! </p>
																												`;
	}

	private renderDailyReportTemplate(data: Record<string, any>): string {
		return `
																												< h1 > Daily Report - ${data.date} </h1>
																													< p > Summary of today's activities:</p>
																														< p > Total Orders: ${data.totalOrders} </p>
																															< p > Total Revenue: ${data.totalRevenue} </p>
																																< p > New Customers: ${data.newCustomers} </p>
																																	`;
	}

	@OnEvent('send.notification')
	async sendNotification(notification: CreateNotificationDto, recipients: AccessLevel[]) {
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
