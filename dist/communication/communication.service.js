"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const nodemailer = require("nodemailer");
const config_1 = require("@nestjs/config");
const notifications_service_1 = require("../notifications/notifications.service");
const create_notification_dto_1 = require("../notifications/dto/create-notification.dto");
const email_enums_1 = require("../lib/enums/email.enums");
const user_service_1 = require("../user/user.service");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const communication_log_entity_1 = require("./entities/communication-log.entity");
const emails_1 = require("../lib/templates/emails");
const emails_2 = require("../lib/templates/emails");
let CommunicationService = class CommunicationService {
    constructor(configService, notificationsService, userService, communicationLogRepository) {
        this.configService = configService;
        this.notificationsService = notificationsService;
        this.userService = userService;
        this.communicationLogRepository = communicationLogRepository;
        this.emailService = nodemailer.createTransport({
            host: this.configService.get('SMTP_HOST'),
            port: this.configService.get('SMTP_PORT'),
            secure: this.configService.get('SMTP_PORT') === 465,
            auth: {
                user: this.configService.get('SMTP_USER'),
                pass: this.configService.get('SMTP_PASS'),
            },
            tls: {
                rejectUnauthorized: false,
            },
        });
    }
    async sendEmail(emailType, recipientsEmails, data) {
        try {
            if (!recipientsEmails) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const template = this.getEmailTemplate(emailType, data);
            const result = await this.emailService.sendMail({
                from: this.configService.get('SMTP_FROM'),
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
        }
        catch (error) {
            throw error;
        }
    }
    getEmailTemplate(type, data) {
        switch (type) {
            case email_enums_1.EmailType.SIGNUP:
                return {
                    subject: 'Welcome to Our Platform',
                    body: (0, emails_1.Signup)(data),
                };
            case email_enums_1.EmailType.VERIFICATION:
                return {
                    subject: 'Verify Your Email',
                    body: (0, emails_1.Verification)(data),
                };
            case email_enums_1.EmailType.PASSWORD_RESET:
                return {
                    subject: 'Password Reset Request',
                    body: (0, emails_1.PasswordReset)(data),
                };
            case email_enums_1.EmailType.NEW_QUOTATION_CLIENT:
                return {
                    subject: 'Your Quotation Details',
                    body: (0, emails_1.NewQuotationClient)(data),
                };
            case email_enums_1.EmailType.NEW_QUOTATION_INTERNAL:
                return {
                    subject: 'New Quotation from Customer',
                    body: (0, emails_1.NewQuotationInternal)(data),
                };
            case email_enums_1.EmailType.NEW_QUOTATION_RESELLER:
                return {
                    subject: 'New Quotation from Your Referral',
                    body: (0, emails_1.NewQuotationReseller)(data),
                };
            case email_enums_1.EmailType.INVOICE:
                return {
                    subject: 'Invoice for Your Quotation',
                    body: (0, emails_1.Invoice)(data),
                };
            case email_enums_1.EmailType.PASSWORD_CHANGED:
                return {
                    subject: 'Password Successfully Changed',
                    body: (0, emails_1.PasswordChanged)(data),
                };
            case email_enums_1.EmailType.DAILY_REPORT:
                return {
                    subject: 'Daily Report',
                    body: (0, emails_1.DailyReport)(data),
                };
            case email_enums_1.EmailType.LICENSE_CREATED:
                return {
                    subject: 'License Created Successfully',
                    body: (0, emails_1.LicenseCreated)(data),
                };
            case email_enums_1.EmailType.LICENSE_UPDATED:
                return {
                    subject: 'License Updated',
                    body: (0, emails_1.LicenseUpdated)(data),
                };
            case email_enums_1.EmailType.LICENSE_LIMIT_REACHED:
                return {
                    subject: 'License Limit Reached',
                    body: (0, emails_1.LicenseLimitReached)(data),
                };
            case email_enums_1.EmailType.LICENSE_RENEWED:
                return {
                    subject: 'License Renewed Successfully',
                    body: (0, emails_1.LicenseRenewed)(data),
                };
            case email_enums_1.EmailType.LICENSE_SUSPENDED:
                return {
                    subject: 'License Suspended',
                    body: (0, emails_1.LicenseSuspended)(data),
                };
            case email_enums_1.EmailType.LICENSE_ACTIVATED:
                return {
                    subject: 'License Activated Successfully',
                    body: (0, emails_1.LicenseActivated)(data),
                };
            case email_enums_1.EmailType.NEW_TASK:
                return {
                    subject: 'New Task Assigned',
                    body: (0, emails_2.NewTask)(data),
                };
            case email_enums_1.EmailType.TASK_UPDATED:
                return {
                    subject: 'Task Updated',
                    body: (0, emails_2.TaskUpdated)(data),
                };
            default:
                throw new common_1.NotFoundException(`Unknown email template type: ${type}`);
        }
    }
    async sendNotification(notification, recipients) {
        try {
            const users = await this.userService.getUsersByRole(recipients);
            const notifications = users.users.map((user) => ({
                ...notification,
                owner: user
            }));
            await Promise.all(notifications.map(notif => this.notificationsService.create(notif)));
        }
        catch (error) {
            throw error;
        }
    }
};
exports.CommunicationService = CommunicationService;
__decorate([
    (0, event_emitter_1.OnEvent)('send.email'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof T !== "undefined" && T) === "function" ? _a : Object, Array, Object]),
    __metadata("design:returntype", Promise)
], CommunicationService.prototype, "sendEmail", null);
__decorate([
    (0, event_emitter_1.OnEvent)('send.notification'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_notification_dto_1.CreateNotificationDto, Array]),
    __metadata("design:returntype", Promise)
], CommunicationService.prototype, "sendNotification", null);
exports.CommunicationService = CommunicationService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, typeorm_1.InjectRepository)(communication_log_entity_1.CommunicationLog)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        notifications_service_1.NotificationsService,
        user_service_1.UserService,
        typeorm_2.Repository])
], CommunicationService);
//# sourceMappingURL=communication.service.js.map