import { EmailType } from '../enums/email.enums';
import { TaskStatus, TaskPriority, TaskFlagStatus, TaskFlagItemStatus } from '../enums/task.enums';
import { SubTaskStatus } from '../enums/status.enums';

export interface BaseEmailData {
	name: string;
}

export interface SignupEmailData extends BaseEmailData {
	verificationLink: string;
	welcomeOffers?: string[];
	webAppLink?: string;
	mobileAppLink?: string;
}

export interface VerificationEmailData extends BaseEmailData {
	verificationCode?: string;
	verificationLink: string;
	expiryHours: number;
}

export interface PasswordResetData extends BaseEmailData {
	resetLink: string;
}

export interface PasswordChangedData extends BaseEmailData {
	changeTime: string;
}

export interface InvoiceData extends BaseEmailData {
	invoiceId: string;
	date: Date;
	amount: number;
	currency: string;
	paymentMethod: string;
	items: Array<{
		description: string;
		quantity: number;
		unitPrice: number;
		total: number;
	}>;
}

export interface DailyReportData extends BaseEmailData {
	date: string;
	metrics: {
		xp?: {
			level: number;
			currentXP: number;
			todayXP: number;
		};
		attendance?: {
			status: string;
			startTime: string;
			endTime?: string;
			totalHours: number;
			duration?: string;
			checkInLocation?: {
				latitude: number;
				longitude: number;
				notes: string;
			};
			checkOutLocation?: {
				latitude: number;
				longitude: number;
				notes: string;
			};
			verifiedAt?: string;
			verifiedBy?: string;
		};
		totalQuotations: number;
		totalRevenue: string;
		newCustomers: number;
		quotationGrowth: string;
		revenueGrowth: string;
		customerGrowth: string;
		userSpecific?: {
			todayLeads: number;
			todayClaims: number;
			todayTasks: number;
			todayQuotations: number;
			hoursWorked: number;
		};
	};
	tracking?: {
		totalDistance: string;
		locations: Array<{
			address: string;
			timeSpent: string;
		}>;
		averageTimePerLocation: string;
	};
}

export interface QuotationData extends BaseEmailData {
	quotationId: string;
	validUntil: Date;
	total: number;
	currency: string;
	status?: string;
	reviewUrl?: string;
	quotationItems: Array<{
		quantity: number;
		product: {
			uid: number;
			name: string;
			code: string;
		};
		totalPrice: number;
	}>;
}

export interface QuotationInternalData extends QuotationData {
	customerType: string;
	priority: 'low' | 'medium' | 'high';
	notes?: string;
}

export interface QuotationResellerData extends QuotationData {
	resellerCommission: number;
	resellerCode: string;
}

export interface QuotationWarehouseData extends QuotationData {
	fulfillmentPriority: 'standard' | 'express' | 'rush';
	shippingInstructions?: string;
	packagingRequirements?: string;
	items: Array<{
		sku: string;
		quantity: number;
		location?: string;
	}>;
}

export interface LicenseEmailData extends BaseEmailData {
	licenseKey: string;
	organisationName: string;
	plan: string;
	validUntil: Date;
	features: string[];
	limits: {
		maxUsers: number;
		maxBranches: number;
		storageLimit: number;
		apiCallLimit: number;
		integrationLimit: number;
	};
}

export interface LicenseLimitData extends LicenseEmailData {
	metric: string;
	currentValue: number;
	limit: number;
}

export interface LicenseTransferEmailData extends BaseEmailData {
	licenseKey: string;
	transferredBy: string;
	transferDate: string;
	organizationName: string;
	newOrganizationName?: string;
	oldOrganizationName?: string;
}

export interface TaskEmailData extends BaseEmailData {
	taskId: string;
	title: string;
	description: string;
	deadline?: string;
	priority: string;
	taskType: string;
	status: string;
	assignedBy: string;
	subtasks?: Array<{
		title: string;
		status: string;
		description?: string;
	}>;
	clients?: Array<{
		name: string;
		category?: string;
	}>;
	attachments?: Array<{
		name: string;
		url: string;
	}>;
}

export interface TaskCompletedEmailData extends TaskEmailData {
	completionDate: string;
	completedBy?: string;
	feedbackLink: string;
	jobCards?: Array<{
		name: string;
		url: string;
	}>;
}

export interface TaskReminderData extends BaseEmailData {
	task: {
		uid: number;
		title: string;
		description: string;
		deadline: string;
		priority: TaskPriority;
		status: TaskStatus;
		progress: number;
		creator: {
			name: string;
			email: string;
		};
		assignees: Array<{
			name: string;
			email: string;
		}>;
		subtasks?: Array<{
			title: string;
			status: SubTaskStatus;
		}>;
	};
}

export interface TaskOverdueMissedData extends BaseEmailData {
	overdueTasks: Array<{
		uid: number;
		title: string;
		description: string;
		deadline: string;
		priority: TaskPriority;
		status: TaskStatus;
		progress: number;
		daysOverdue: number;
	}>;
	missedTasks: Array<{
		uid: number;
		title: string;
		description: string;
		deadline: string;
		priority: TaskPriority;
		status: TaskStatus;
		progress: number;
		daysOverdue: number;
	}>;
	overdueMissedCount: {
		overdue: number;
		missed: number;
		total: number;
	};
	dashboardLink: string;
}

export interface LeadReminderData extends BaseEmailData {
	leads: Array<{
		uid: number;
		name: string;
		email?: string;
		phone?: string;
		createdAt: string;
		image?: string;
		latitude?: number;
		longitude?: number;
		notes?: string;
	}>;
	dashboardLink: string;
	leadsCount: number;
}

export interface TaskFlagEmailData extends BaseEmailData {
	taskId: number;
	taskTitle: string;
	flagId: number;
	flagTitle: string;
	flagDescription: string;
	flagStatus: TaskFlagStatus;
	flagDeadline?: string;
	createdBy: {
		name: string;
		email: string;
	};
	items?: Array<{
		title: string;
		description?: string;
		status: TaskFlagItemStatus;
	}>;
	attachments?: Array<string>;
	comments?: Array<{
		content: string;
		createdAt: string;
		createdBy: { name: string };
	}>;
}

export interface TaskFeedbackEmailData extends BaseEmailData {
	taskId: number;
	taskTitle: string;
	feedbackContent: string;
	rating?: number;
	submittedBy: {
		name: string;
		email: string;
	};
	submittedAt: string;
}

export interface NewUserAdminNotificationData extends BaseEmailData {
	newUserEmail: string;
	newUserName: string;
	signupTime: string;
	userDetailsLink: string;
}

export interface LeadConvertedClientData extends BaseEmailData {
	clientId: number;
	conversionDate: string;
	nextSteps?: string[];
	dashboardLink?: string;
	accountManagerName?: string;
	accountManagerEmail?: string;
	accountManagerPhone?: string;
}

export interface LeadConvertedCreatorData extends BaseEmailData {
	clientId: number;
	clientName: string;
	clientEmail: string;
	clientPhone?: string;
	conversionDate: string;
	dashboardLink?: string;
}

export interface LeadAssignedToUserData extends BaseEmailData {
	assigneeName: string;
	leadId: number | string;
	leadName: string;
	leadCreatorName: string;
	leadDetails?: string;
	leadLink: string;
}

export interface OrderReceivedClientData extends BaseEmailData {
	quotationId: string;
	message: string;
}

export interface WarningIssuedEmailData {
	userName: string;
	userEmail: string;
	warningId: number;
	reason: string;
	severity: string;
	issuedAt: string;
	expiresAt: string;
	issuedBy: {
		name: string;
		email: string;
	};
	dashboardLink: string;
}

export interface WarningUpdatedEmailData {
	userName: string;
	userEmail: string;
	warningId: number;
	reason: string;
	severity: string;
	issuedAt: string;
	expiresAt: string;
	updatedFields: string[];
	issuedBy: {
		name: string;
		email: string;
	};
	dashboardLink: string;
}

export interface WarningExpiredEmailData {
	userName: string;
	userEmail: string;
	warningId: number;
	reason: string;
	severity: string;
	issuedAt: string;
	expiresAt: string;
	issuedBy: {
		name: string;
		email: string;
	};
	dashboardLink: string;
}

export interface EmailDataMap {
	[EmailType.SIGNUP]: SignupEmailData;
	[EmailType.VERIFICATION]: VerificationEmailData;
	[EmailType.PASSWORD_RESET]: PasswordResetData;
	[EmailType.PASSWORD_CHANGED]: PasswordChangedData;
	[EmailType.INVOICE]: InvoiceData;
	[EmailType.DAILY_REPORT]: DailyReportData;
	[EmailType.NEW_QUOTATION_CLIENT]: QuotationData;
	[EmailType.NEW_QUOTATION_INTERNAL]: QuotationInternalData;
	[EmailType.NEW_QUOTATION_RESELLER]: QuotationResellerData;
	[EmailType.NEW_QUOTATION_WAREHOUSE_FULFILLMENT]: QuotationWarehouseData;
	[EmailType.QUOTATION_APPROVED]: QuotationData;
	[EmailType.QUOTATION_REJECTED]: QuotationData;
	[EmailType.QUOTATION_STATUS_UPDATE]: QuotationData;
	[EmailType.QUOTATION_READY_FOR_REVIEW]: QuotationData;
	[EmailType.QUOTATION_UPDATED]: QuotationData;
	[EmailType.QUOTATION_SOURCING]: QuotationData;
	[EmailType.QUOTATION_PACKING]: QuotationData;
	[EmailType.QUOTATION_IN_FULFILLMENT]: QuotationData;
	[EmailType.QUOTATION_PAID]: QuotationData;
	[EmailType.QUOTATION_SHIPPED]: QuotationData;
	[EmailType.QUOTATION_DELIVERED]: QuotationData;
	[EmailType.QUOTATION_RETURNED]: QuotationData;
	[EmailType.QUOTATION_COMPLETED]: QuotationData;
	[EmailType.LICENSE_CREATED]: LicenseEmailData;
	[EmailType.LICENSE_UPDATED]: LicenseEmailData;
	[EmailType.LICENSE_LIMIT_REACHED]: LicenseLimitData;
	[EmailType.LICENSE_RENEWED]: LicenseEmailData;
	[EmailType.LICENSE_SUSPENDED]: LicenseEmailData;
	[EmailType.LICENSE_ACTIVATED]: LicenseEmailData;
	[EmailType.LICENSE_TRANSFERRED_FROM]: LicenseTransferEmailData;
	[EmailType.LICENSE_TRANSFERRED_TO]: LicenseTransferEmailData;
	[EmailType.NEW_TASK]: TaskEmailData;
	[EmailType.TASK_UPDATED]: TaskEmailData;
	[EmailType.TASK_COMPLETED]: TaskCompletedEmailData;
	[EmailType.TASK_REMINDER_ASSIGNEE]: TaskReminderData;
	[EmailType.TASK_REMINDER_CREATOR]: TaskReminderData;
	[EmailType.TASK_OVERDUE_MISSED]: TaskOverdueMissedData;
	[EmailType.NEW_USER_ADMIN_NOTIFICATION]: NewUserAdminNotificationData;
	[EmailType.LEAD_CONVERTED_CLIENT]: LeadConvertedClientData;
	[EmailType.LEAD_CONVERTED_CREATOR]: LeadConvertedCreatorData;
	[EmailType.LEAD_REMINDER]: LeadReminderData;
	[EmailType.LEAD_ASSIGNED_TO_USER]: LeadAssignedToUserData;
	[EmailType.TASK_FLAG_CREATED]: TaskFlagEmailData;
	[EmailType.TASK_FLAG_UPDATED]: TaskFlagEmailData;
	[EmailType.TASK_FLAG_RESOLVED]: TaskFlagEmailData;
	[EmailType.TASK_FEEDBACK_ADDED]: TaskFeedbackEmailData;
	[EmailType.ORDER_RECEIVED_CLIENT]: OrderReceivedClientData;
	[EmailType.WARNING_ISSUED]: WarningIssuedEmailData;
	[EmailType.WARNING_UPDATED]: WarningUpdatedEmailData;
	[EmailType.WARNING_EXPIRED]: WarningExpiredEmailData;
}

export type EmailTemplateData<T extends EmailType> = T extends keyof EmailDataMap ? EmailDataMap[T] : never;
