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

export interface AttendanceReportUser {
	uid: number;
	name: string;
	email: string;
	role: string;
	userProfile?: {
		avatar?: string;
	};
	branch?: {
		uid: number;
		name: string;
	};
}

export interface AttendanceSummary {
	totalEmployees: number;
	presentCount: number;
	absentCount: number;
	attendanceRate: number;
}

export interface PunctualityBreakdown {
	earlyArrivals: AttendanceReportUser[];
	onTimeArrivals: AttendanceReportUser[];
	lateArrivals: AttendanceReportUser[];
	earlyPercentage: number;
	onTimePercentage: number;
	latePercentage: number;
}

export interface EmployeeAttendanceMetric {
	user: AttendanceReportUser;
	todayCheckIn: string | null;
	todayCheckOut: string | null;
	hoursWorked: number;
	isLate: boolean;
	lateMinutes: number;
	yesterdayHours: number;
	comparisonText: string;
	timingDifference: string;
}

export interface MorningReportData extends BaseEmailData {
	organizationName: string;
	reportDate: string;
	organizationStartTime: string;
	summary: {
		totalEmployees: number;
		presentCount: number;
		absentCount: number;
		attendanceRate: number;
	};
	punctuality: {
		earlyArrivals: Array<{
			uid: number;
			name: string;
			surname: string;
			fullName: string;
			email: string;
			role: string;
			branch?: {
				uid: number;
				name: string;
			};
			checkInTime?: string;
			earlyMinutes?: number;
		}>;
		onTimeArrivals: Array<{
			uid: number;
			name: string;
			surname: string;
			fullName: string;
			email: string;
			role: string;
			branch?: {
				uid: number;
				name: string;
			};
			checkInTime?: string;
		}>;
		lateArrivals: Array<{
			uid: number;
			name: string;
			surname: string;
			fullName: string;
			email: string;
			role: string;
			branch?: {
				uid: number;
				name: string;
			};
			checkInTime?: string;
			lateMinutes?: number;
		}>;
		veryLateArrivals: Array<{
			uid: number;
			name: string;
			surname: string;
			fullName: string;
			email: string;
			role: string;
			branch?: {
				uid: number;
				name: string;
			};
			checkInTime?: string;
			lateMinutes?: number;
		}>;
		earlyPercentage: number;
		onTimePercentage: number;
		latePercentage: number;
		veryLatePercentage: number;
		averageLateMinutes: number;
		totalLateMinutes: number;
	};
	presentEmployees: Array<{
		uid: number;
		name: string;
		surname: string;
		fullName: string;
		email: string;
		role: string;
		branch?: {
			uid: number;
			name: string;
		};
		checkInTime?: string;
		userProfile?: {
			avatar?: string;
		};
	}>;
	absentEmployees: Array<{
		uid: number;
		name: string;
		surname: string;
		fullName: string;
		email: string;
		role: string;
		branch?: {
			uid: number;
			name: string;
		};
		userProfile?: {
			avatar?: string;
		};
	}>;
	insights: string[];
	recommendations: string[];
	generatedAt: string;
	dashboardUrl: string;
	hasEmployees: boolean;
	latenessSummary: {
		totalLateEmployees: number;
		totalLateMinutes: number;
		averageLateMinutes: number;
		worstLateArrival: {
			employee: string;
			minutes: number;
		} | null;
	};
}

export interface EveningReportData extends BaseEmailData {
	organizationName: string;
	reportDate: string;
	organizationStartTime: string;
	organizationCloseTime: string;
	employeeMetrics: Array<{
		uid: number;
		name: string;
		surname: string;
		email: string;
		role: string;
		branch?: {
			uid: number;
			name: string;
		};
		checkInTime: string | null;
		checkOutTime: string | null;
		hoursWorked: number;
		isLate: boolean;
		lateMinutes: number;
		status: string;
		yesterdayComparison: {
			hoursChange: number;
			punctualityChange: string;
		};
		avatar: string | null;
	}>;
	summary: {
		totalEmployees: number;
		completedShifts: number;
		averageHours: number;
		totalOvertimeMinutes: number;
	};
	insights: string[];
	hasEmployees: boolean;
	latenessSummary: {
		totalLateEmployees: number;
		totalLateMinutes: number;
		averageLateMinutes: number;
		punctualityTrend: string;
	};
	// Additional template fields
	totalEmployees: number;
	workedTodayCount: number;
	totalHoursWorked: number;
	averageHoursWorked: number;
	attendanceChange: number;
	hoursChange: number;
	punctualityChange: number;
	performanceTrend: string;
	attendanceRate: number;
	yesterdayAttendanceRate?: number;
	punctualityRate: number;
	overallPerformance: {
		description: string;
	};
	topPerformers?: Array<{
		name: string;
		surname: string;
		hoursWorked: number;
		achievement: string;
		metric: string;
	}> | null;
	improvementAreas?: Array<{
		area: string;
		description: string;
		count: number;
	}> | null;
	tomorrowActions: string[];
	generatedAt: string;
	dashboardUrl: string;
}

export interface OvertimeReminderData extends BaseEmailData {
	employeeName: string;
	employeeEmail: string;
	checkInTime: string;
	organizationCloseTime: string;
	currentTime: string;
	minutesOvertime: number;
	overtimeDuration: string;
	shiftDuration: string;
	organizationName: string;
	clockOutUrl: string;
	dashboardUrl: string;
	breakDetails?: {
		totalBreakTime: string;
		breakCount: number;
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

export interface NewUserWelcomeData extends BaseEmailData {
	email: string;
	firstName?: string;
	lastName?: string;
	loginUrl: string;
	supportEmail: string;
	supportPhone?: string;
	organizationName?: string;
	branchName?: string;
	dashboardUrl: string;
}

export interface UserReInvitationData extends BaseEmailData {
	userEmail: string;
	userName: string;
	userFirstName: string;
	platformName: string;
	loginUrl: string;
	supportEmail: string;
	organizationName: string;
	branchName: string;
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

export interface LeaveApplicationConfirmationData extends BaseEmailData {
	applicantName: string;
	leaveId: number;
	leaveType: string;
	startDate: string;
	endDate: string;
	duration: number;
	status: string;
	isHalfDay: boolean;
	halfDayPeriod?: string;
	motivation?: string;
	tags?: string[];
	isPaid: boolean;
	paidAmount?: number;
	isDelegated?: boolean;
	delegatedToName?: string;
	isPublicHoliday: boolean;
	createdAt: string;
}

export interface LeaveNewApplicationAdminData extends BaseEmailData {
	adminName: string;
	applicantName: string;
	applicantEmail: string;
	applicantDepartment?: string;
	branchName?: string;
	leaveId: number;
	leaveType: string;
	startDate: string;
	endDate: string;
	duration: number;
	isHalfDay: boolean;
	halfDayPeriod?: string;
	motivation?: string;
	tags?: string[];
	isPaid: boolean;
	paidAmount?: number;
	isDelegated?: boolean;
	delegatedToName?: string;
	isPublicHoliday: boolean;
	attachments?: string[];
	createdAt: string;
}

export interface LeaveStatusUpdateUserData extends BaseEmailData {
	applicantName: string;
	leaveId: number;
	leaveType: string;
	startDate: string;
	endDate: string;
	duration: number;
	status: string;
	processedBy?: string;
	processedAt?: string;
	comments?: string;
	rejectionReason?: string;
	cancellationReason?: string;
	isDelegated?: boolean;
	returnDate?: string;
	createdAt: string;
}

export interface LeaveStatusUpdateAdminData extends BaseEmailData {
	adminName: string;
	applicantName: string;
	applicantEmail: string;
	applicantDepartment?: string;
	branchName?: string;
	leaveId: number;
	leaveType: string;
	startDate: string;
	endDate: string;
	duration: number;
	status: string;
	previousStatus: string;
	actionTakenBy?: string;
	updateTime: string;
	comments?: string;
	rejectionReason?: string;
	cancellationReason?: string;
	isDelegated?: boolean;
	returnDate?: string;
	createdAt: string;
	pendingCount?: number;
	monthlyApprovals?: number;
	adequateCoverage?: boolean;
	upcomingLeaves?: Array<{
		employeeName: string;
		startDate: string;
		endDate: string;
		duration: number;
	}>;
}

export interface LeaveDeletedNotificationData extends BaseEmailData {
	recipientName: string;
	isApplicant: boolean;
	applicantName: string;
	applicantEmail: string;
	leaveId: number;
	leaveType: string;
	startDate: string;
	endDate: string;
	duration: number;
	statusWhenDeleted: string;
	deletedAt: string;
	deletedBy?: string;
	motivation?: string;
	deletionReason?: string;
	createdAt: string;
	remainingPendingCount?: number;
	adequateCoverage?: boolean;
}

// Asset related email data types
export interface AssetEmailData extends BaseEmailData {
	assetId: number;
	brand: string;
	serialNumber: string;
	modelNumber: string;
	purchaseDate: string;
	hasInsurance: boolean;
	insuranceProvider?: string;
	insuranceExpiryDate?: string;
	owner: {
		name: string;
		email: string;
		uid: number;
	};
	branch?: {
		name: string;
		uid: number;
	};
	organization: {
		name: string;
		uid: number;
	};
	dashboardLink: string;
}

export interface AssetTransferredEmailData extends AssetEmailData {
	previousOwner?: {
		name: string;
		email: string;
		uid: number;
	};
	transferredBy: {
		name: string;
		email: string;
	};
	transferDate: string;
	transferReason?: string;
}

export interface AssetUpdatedEmailData extends AssetEmailData {
	updatedFields: string[];
	updatedBy: {
		name: string;
		email: string;
	};
	updateDate: string;
	updateReason?: string;
}

export interface AssetInsuranceExpiryWarningEmailData extends AssetEmailData {
	daysUntilExpiry: number;
	warningType: 'critical' | 'warning' | 'notice'; // 1, 7, 30 days
	renewalInstructions?: string;
	contactInfo?: {
		name: string;
		email: string;
		phone?: string;
	};
}

export interface AssetAdminNotificationEmailData extends BaseEmailData {
	adminName: string;
	action: 'created' | 'deleted' | 'transferred' | 'updated';
	asset: {
		id: number;
		brand: string;
		serialNumber: string;
		modelNumber: string;
	};
	actionBy: {
		name: string;
		email: string;
	};
	actionDate: string;
	actionDetails?: string;
	dashboardLink: string;
}

// Additional auth email data types
export interface LoginNotificationEmailData extends BaseEmailData {
	loginTime: string;
	ipAddress?: string;
	location?: string;
	device?: string;
	browser?: string;
	suspicious?: boolean;
	securityTips?: string[];
}

export interface EmailVerifiedEmailData extends BaseEmailData {
	verificationDate: string;
	nextSteps?: string[];
	loginUrl: string;
}

// Claims related email data
export interface ClaimEmailData extends BaseEmailData {
	claimId: number;
	amount: string;
	category: string;
	status: string;
	comments?: string;
	submittedDate: string;
	submittedBy: {
		name: string;
		email: string;
	};
	branch?: {
		name: string;
	};
	organization: {
		name: string;
	};
	dashboardLink: string;
}

export interface ClaimStatusUpdateEmailData extends ClaimEmailData {
	previousStatus: string;
	processedBy?: {
		name: string;
		email: string;
	};
	processedAt?: string;
	rejectionReason?: string;
	approvalNotes?: string;
}

// Lead creation and update email data
export interface LeadCreatedEmailData extends BaseEmailData {
	leadId: number;
	leadName: string;
	leadEmail?: string;
	leadPhone?: string;
	leadCompany?: string;
	leadSource?: string;
	priority: string;
	temperature: string;
	score?: number;
	createdBy: {
		name: string;
		email: string;
	};
	assignees?: Array<{
		name: string;
		email: string;
	}>;
	notes?: string;
	branch?: {
		name: string;
	};
	organization: {
		name: string;
	};
	dashboardLink: string;
}

export interface LeadStatusUpdateEmailData extends BaseEmailData {
	leadId: number;
	leadName: string;
	leadEmail?: string;
	leadPhone?: string;
	leadCompany?: string;
	newStatus: string;
	previousStatus: string;
	statusReason?: string;
	nextSteps?: string;
	updatedBy: {
		name: string;
		email: string;
	};
	updatedAt: string;
	assignees?: Array<{
		name: string;
		email: string;
	}>;
	dashboardLink: string;
}

// Journal related email data
export interface JournalEmailData extends BaseEmailData {
	journalId: number;
	title: string;
	content?: string;
	status: string;
	category?: string;
	tags?: string[];
	createdBy: {
		name: string;
		email: string;
	};
	createdAt: string;
	branch?: {
		name: string;
	};
	organization: {
		name: string;
	};
	dashboardLink: string;
}

export interface JournalUpdatedEmailData extends JournalEmailData {
	updatedFields: string[];
	updatedBy: {
		name: string;
		email: string;
	};
	updatedAt: string;
	previousStatus?: string;
}

export interface JournalDeletedEmailData extends JournalEmailData {
	deletedBy: {
		name: string;
		email: string;
	};
	deletedAt: string;
	deletionReason?: string;
}

export interface EmailDataMap {
	[EmailType.SIGNUP]: SignupEmailData;
	[EmailType.VERIFICATION]: VerificationEmailData;
	[EmailType.PASSWORD_RESET]: PasswordResetData;
	[EmailType.PASSWORD_CHANGED]: PasswordChangedData;
	[EmailType.INVOICE]: InvoiceData;
	[EmailType.DAILY_REPORT]: DailyReportData;
	[EmailType.ATTENDANCE_MORNING_REPORT]: MorningReportData;
	[EmailType.ATTENDANCE_EVENING_REPORT]: EveningReportData;
	// Overtime email mappings
	[EmailType.OVERTIME_REMINDER]: OvertimeReminderData;
	// Quotation email mappings
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
	// License email mappings
	[EmailType.LICENSE_CREATED]: LicenseEmailData;
	[EmailType.LICENSE_UPDATED]: LicenseEmailData;
	[EmailType.LICENSE_LIMIT_REACHED]: LicenseLimitData;
	[EmailType.LICENSE_RENEWED]: LicenseEmailData;
	[EmailType.LICENSE_SUSPENDED]: LicenseEmailData;
	[EmailType.LICENSE_ACTIVATED]: LicenseEmailData;
	[EmailType.LICENSE_TRANSFERRED_FROM]: LicenseTransferEmailData;
	[EmailType.LICENSE_TRANSFERRED_TO]: LicenseTransferEmailData;
	// Task email mappings
	[EmailType.NEW_TASK]: TaskEmailData;
	[EmailType.TASK_UPDATED]: TaskEmailData;
	[EmailType.TASK_COMPLETED]: TaskCompletedEmailData;
	[EmailType.TASK_REMINDER_ASSIGNEE]: TaskReminderData;
	[EmailType.TASK_REMINDER_CREATOR]: TaskReminderData;
	[EmailType.TASK_OVERDUE_MISSED]: TaskOverdueMissedData;
	// New user email mappings
	[EmailType.NEW_USER_ADMIN_NOTIFICATION]: NewUserAdminNotificationData;
	[EmailType.NEW_USER_WELCOME]: NewUserWelcomeData;
	// Lead email mappings
	[EmailType.LEAD_CONVERTED_CLIENT]: LeadConvertedClientData;
	[EmailType.LEAD_CONVERTED_CREATOR]: LeadConvertedCreatorData;
	[EmailType.LEAD_REMINDER]: LeadReminderData;
	[EmailType.LEAD_ASSIGNED_TO_USER]: LeadAssignedToUserData;
	// Task flag email mappings
	[EmailType.TASK_FLAG_CREATED]: TaskFlagEmailData;
	[EmailType.TASK_FLAG_UPDATED]: TaskFlagEmailData;
	[EmailType.TASK_FLAG_RESOLVED]: TaskFlagEmailData;
	[EmailType.TASK_FEEDBACK_ADDED]: TaskFeedbackEmailData;
	[EmailType.ORDER_RECEIVED_CLIENT]: OrderReceivedClientData;
	// Warning email mappings
	[EmailType.WARNING_ISSUED]: WarningIssuedEmailData;
	[EmailType.WARNING_UPDATED]: WarningUpdatedEmailData;
	[EmailType.WARNING_EXPIRED]: WarningExpiredEmailData;
	// Leave email mappings
	[EmailType.LEAVE_APPLICATION_CONFIRMATION]: LeaveApplicationConfirmationData;
	[EmailType.LEAVE_NEW_APPLICATION_ADMIN]: LeaveNewApplicationAdminData;
	[EmailType.LEAVE_STATUS_UPDATE_USER]: LeaveStatusUpdateUserData;
	[EmailType.LEAVE_STATUS_UPDATE_ADMIN]: LeaveStatusUpdateAdminData;
	[EmailType.LEAVE_DELETED_NOTIFICATION]: LeaveDeletedNotificationData;
	[EmailType.USER_RE_INVITATION]: UserReInvitationData;
	// Asset related email mappings
	[EmailType.ASSET_ASSIGNED]: AssetEmailData;
	[EmailType.ASSET_TRANSFERRED]: AssetTransferredEmailData;
	[EmailType.ASSET_UPDATED]: AssetUpdatedEmailData;
	[EmailType.ASSET_REMOVED]: AssetEmailData;
	[EmailType.ASSET_RESTORED]: AssetEmailData;
	[EmailType.ASSET_INSURANCE_EXPIRY_WARNING]: AssetInsuranceExpiryWarningEmailData;
	[EmailType.ASSET_CREATED_ADMIN]: AssetAdminNotificationEmailData;
	[EmailType.ASSET_DELETED_ADMIN]: AssetAdminNotificationEmailData;
	// Additional auth email mappings
	[EmailType.LOGIN_NOTIFICATION]: LoginNotificationEmailData;
	[EmailType.CLIENT_LOGIN_NOTIFICATION]: LoginNotificationEmailData;
	[EmailType.EMAIL_VERIFIED]: EmailVerifiedEmailData;
	// Claims email mappings
	[EmailType.CLAIM_CREATED]: ClaimEmailData;
	[EmailType.CLAIM_STATUS_UPDATE]: ClaimStatusUpdateEmailData;
	[EmailType.CLAIM_APPROVED]: ClaimStatusUpdateEmailData;
	[EmailType.CLAIM_REJECTED]: ClaimStatusUpdateEmailData;
	[EmailType.CLAIM_PAID]: ClaimStatusUpdateEmailData;
	// Additional lead email mappings
	[EmailType.LEAD_CREATED]: LeadCreatedEmailData;
	[EmailType.LEAD_STATUS_UPDATE]: LeadStatusUpdateEmailData;
	// Journal email mappings
	[EmailType.JOURNAL_CREATED]: JournalEmailData;
	[EmailType.JOURNAL_UPDATED]: JournalUpdatedEmailData;
	[EmailType.JOURNAL_DELETED]: JournalDeletedEmailData;
}

export type EmailTemplateData<T extends EmailType> = T extends keyof EmailDataMap ? EmailDataMap[T] : never;
