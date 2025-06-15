import * as Handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as juice from 'juice';
import {
	SignupEmailData,
	VerificationEmailData,
	PasswordResetData,
	PasswordChangedData,
	InvoiceData,
	DailyReportData,
	LicenseEmailData,
	LicenseLimitData,
	QuotationData,
	QuotationInternalData,
	QuotationResellerData,
	TaskEmailData,
	TaskReminderData,
	NewUserAdminNotificationData,
	NewUserWelcomeData,
	TaskCompletedEmailData,
	LeadConvertedClientData,
	LeadConvertedCreatorData,
	TaskFlagEmailData,
	TaskFeedbackEmailData,
	LeadReminderData,
	TaskOverdueMissedData,
	LeadAssignedToUserData,
	OrderReceivedClientData,
	QuotationWarehouseData,
	LicenseTransferEmailData,
	WarningIssuedEmailData,
	WarningUpdatedEmailData,
	WarningExpiredEmailData,
	LeaveApplicationConfirmationData,
	LeaveNewApplicationAdminData,
	LeaveStatusUpdateUserData,
	LeaveStatusUpdateAdminData,
	LeaveDeletedNotificationData,
	MorningReportData,
	EveningReportData,
} from '../types/email-templates.types';

class EmailTemplateService {
	private templatesPath: string;
	private compiledTemplates: Map<string, HandlebarsTemplateDelegate> = new Map();

	constructor() {
		console.log('Initializing Email Template Service...');
		
		// Try multiple potential template paths for maximum deployment compatibility
		const potentialPaths = [
			// Primary: Relative to project root (works for most deployments)
			join(process.cwd(), 'dist', 'lib', 'templates', 'handlebars'),
			// Fallback: Relative to current service file location
			join(__dirname, '../templates/handlebars'),
			// Alternative: Direct relative to source in case dist structure differs
			join(process.cwd(), 'src', 'lib', 'templates', 'handlebars')
		];

		this.templatesPath = this.findValidTemplatesPath(potentialPaths);
		this.initializeHandlebars();
		
		console.log('Email Template Service initialization completed successfully');
	}

	private findValidTemplatesPath(paths: string[]): string {
		const { existsSync } = require('fs');
		
		for (const path of paths) {
			if (existsSync(path)) {
				console.log(`Using templates path: ${path}`);
				return path;
			}
		}
		
		// If no valid path found, log all attempted paths and use the first one
		console.warn('No valid templates path found. Attempted paths:', paths);
		console.warn('Using first path as fallback:', paths[0]);
		return paths[0];
	}

	private initializeHandlebars() {
		// Clear any existing compiled templates to ensure fresh compilation
		this.compiledTemplates.clear();
		
		// Register partials
		this.registerPartials();

		// Register helpers
		this.registerHelpers();
		
		// Preload all email templates
		this.preloadAllTemplates();
	}

	private registerPartials() {
		const partialsPath = join(this.templatesPath, 'partials');
		const layoutsPath = join(this.templatesPath, 'layouts');

		try {
			// Register base layout with proper layout functionality
			const baseLayoutPath = join(layoutsPath, 'base.hbs');
			console.log(`Attempting to load base layout from: ${baseLayoutPath}`);
			
			const { existsSync } = require('fs');
			if (existsSync(baseLayoutPath)) {
				const baseLayout = readFileSync(baseLayoutPath, 'utf8');
				
				// Register as both a partial and a block helper for layout functionality
				Handlebars.registerPartial('base', baseLayout);
				
				// Register a custom block helper for layout support
				Handlebars.registerHelper('base', function(options: any) {
					try {
						// The content between {{#base}} and {{/base}} is available in options.fn(this)
						const content = options.fn(this);
						const layoutData = { ...this, body: content };
						const template = Handlebars.compile(baseLayout);
						const result = template(layoutData);
						console.log('Layout helper successfully rendered content');
						return new Handlebars.SafeString(result);
					} catch (error) {
						console.error('Error in base layout helper:', error);
						// Return the content without layout as fallback
						return new Handlebars.SafeString(options.fn(this));
					}
				});
				
				console.log('Successfully registered base layout and helper');
			} else {
				console.error(`Base layout not found at: ${baseLayoutPath}`);
				throw new Error(`Base layout file not found: ${baseLayoutPath}`);
			}

			// Register additional partials if they exist
			const partials = ['header', 'footer', 'button', 'card', 'alert'];
			partials.forEach((partial) => {
				try {
					const partialPath = join(partialsPath, `${partial}.hbs`);
					if (existsSync(partialPath)) {
						const content = readFileSync(partialPath, 'utf8');
						Handlebars.registerPartial(partial, content);
						console.log(`Registered partial: ${partial}`);
					}
				} catch (error) {
					console.warn(`Could not load partial: ${partial}`, error.message);
				}
			});
		} catch (error) {
			console.error('Critical error in registerPartials:', error.message);
			throw error; // Re-throw since base layout is critical for email templates
		}
	}

	private registerHelpers() {
		// Import and register all helpers
		try {
			require('../templates/handlebars/helpers/index');
		} catch (error) {
			console.warn('Could not load Handlebars helpers:', error.message);

			// Register essential helpers as fallback
			Handlebars.registerHelper('formatDate', function (date: string | Date) {
				if (!date) return 'N/A';
				const dateObj = new Date(date);
				return dateObj.toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'long',
					day: 'numeric',
				});
			});

			Handlebars.registerHelper('formatCurrency', function (amount: number, currency: string) {
				return new Intl.NumberFormat('en-US', {
					style: 'currency',
					currency: currency || 'USD',
				}).format(amount);
			});

			Handlebars.registerHelper('fallback', function (value: any, fallback: any) {
				return value || fallback;
			});

			Handlebars.registerHelper('concat', function (...args: any[]) {
				args.pop();
				return args.join('');
			});
		}
	}

	private getTemplate(templatePath: string): HandlebarsTemplateDelegate {
		if (this.compiledTemplates.has(templatePath)) {
			return this.compiledTemplates.get(templatePath)!;
		}

		try {
			const fullPath = join(this.templatesPath, 'emails', templatePath);
			console.log(`Attempting to load template from: ${fullPath}`);
			
			const { existsSync } = require('fs');
			if (!existsSync(fullPath)) {
				console.error(`Template file does not exist: ${fullPath}`);
				console.error(`Templates base path: ${this.templatesPath}`);
				console.error(`Requested template path: ${templatePath}`);
				throw new Error(`Template file not found: ${fullPath}`);
			}
			
			const templateContent = readFileSync(fullPath, 'utf8');
			const compiled = Handlebars.compile(templateContent);
			this.compiledTemplates.set(templatePath, compiled);
			return compiled;
		} catch (error) {
			console.error(`Error loading template ${templatePath}:`, error);
			throw new Error(`Template not found: ${templatePath} - ${error.message}`);
		}
	}

	private renderTemplate(templatePath: string, data: any): string {
		try {
			const template = this.getTemplate(templatePath);

			// Inject environment-based global variables into template context
			const enrichedData = {
				...data,
				// Global environment variables
				appName: process.env.APP_NAME || 'LORO',
				appUrl: process.env.APP_URL || 'https://loro.co.za/landing-page',
				supportEmail: process.env.SUPPORT_EMAIL || 'support@loro.africa',
				supportPhone: process.env.SUPPORT_PHONE || '+27 12 345 6789',
				companyName: process.env.COMPANY_NAME || 'LORO',
				companyReg: process.env.COMPANY_REG || '2023/123456/07',
				vatNumber: process.env.VAT_NUMBER || '4567890123',
				headerTagline: process.env.HEADER_TAGLINE || 'Empowering African Business',
				currentYear: new Date().getFullYear(),
				// Social media links from environment
				socialLinks: {
					linkedin: process.env.SOCIAL_LINKEDIN_URL || '#',
					twitter: process.env.SOCIAL_TWITTER_URL || '#',
					facebook: process.env.SOCIAL_FACEBOOK_URL || '#',
					instagram: process.env.SOCIAL_INSTAGRAM_URL || '#',
				},
				// Legal links from environment
				privacyPolicyUrl:
					process.env.PRIVACY_POLICY_URL || `${process.env.APP_URL || 'https://loro.co.za/landing-page'}/privacy`,
				termsUrl: process.env.TERMS_URL || `${process.env.APP_URL || 'https://loro.co.za/landing-page'}/terms`,
				unsubscribeUrl:
					process.env.UNSUBSCRIBE_URL ||
					`${process.env.APP_URL || 'https://loro.co.za/landing-page'}/unsubscribe`,
			};

			console.log(`Rendering template: ${templatePath}`);
			const renderedTemplate = template(enrichedData);
			
			// Inline CSS for email client compatibility
			console.log(`Inlining CSS for template: ${templatePath}`);
			const inlinedTemplate = juice(renderedTemplate);
			
			console.log(`Successfully rendered and inlined template: ${templatePath}`);
			return inlinedTemplate;
		} catch (error) {
			console.error(`Error rendering template ${templatePath}:`, error);
			console.error('Template data:', JSON.stringify(data, null, 2));
			throw new Error(`Template rendering failed: ${templatePath} - ${error.message}`);
		}
	}

	// Auth Templates
	signup(data: SignupEmailData): string {
		return this.renderTemplate('auth/signup.hbs', data);
	}

	verification(data: VerificationEmailData): string {
		return this.renderTemplate('auth/verification.hbs', data);
	}

	passwordReset(data: PasswordResetData): string {
		return this.renderTemplate('auth/password-reset.hbs', data);
	}

	passwordChanged(data: PasswordChangedData): string {
		return this.renderTemplate('auth/password-changed.hbs', data);
	}

	// Quotation Templates
	newQuotationClient(data: QuotationData): string {
		return this.renderTemplate('quotations/client-new.hbs', data);
	}

	newQuotationInternal(data: QuotationInternalData): string {
		return this.renderTemplate('quotations/internal-new.hbs', data);
	}

	newQuotationReseller(data: QuotationResellerData): string {
		return this.renderTemplate('quotations/reseller-new.hbs', data);
	}

	quotationStatusUpdate(data: QuotationData): string {
		return this.renderTemplate('quotations/status-update.hbs', data);
	}

	newQuotationWarehouseFulfillment(data: QuotationWarehouseData): string {
		return this.renderTemplate('quotations/warehouse-fulfillment.hbs', data);
	}

	// Business Templates
	invoice(data: InvoiceData): string {
		return this.renderTemplate('business/invoice.hbs', data);
	}

	orderReceivedClient(data: OrderReceivedClientData): string {
		return this.renderTemplate('business/order-received-client.hbs', data);
	}

	// Task Templates
	newTask(data: TaskEmailData): string {
		return this.renderTemplate('tasks/new-task.hbs', data);
	}

	taskUpdated(data: TaskEmailData): string {
		return this.renderTemplate('tasks/updated.hbs', data);
	}

	taskCompleted(data: TaskCompletedEmailData): string {
		return this.renderTemplate('tasks/completed.hbs', data);
	}

	taskReminderAssignee(data: TaskReminderData): string {
		return this.renderTemplate('tasks/reminder-assignee.hbs', data);
	}

	taskReminderCreator(data: TaskReminderData): string {
		return this.renderTemplate('tasks/reminder-creator.hbs', data);
	}

	taskFlagCreated(data: TaskFlagEmailData): string {
		return this.renderTemplate('tasks/flag-created.hbs', data);
	}

	taskFlagUpdated(data: TaskFlagEmailData): string {
		return this.renderTemplate('tasks/flag-updated.hbs', data);
	}

	taskFlagResolved(data: TaskFlagEmailData): string {
		return this.renderTemplate('tasks/flag-resolved.hbs', data);
	}

	taskFeedbackAdded(data: TaskFeedbackEmailData): string {
		return this.renderTemplate('tasks/feedback-added.hbs', data);
	}

	taskOverdueMissed(data: TaskOverdueMissedData): string {
		return this.renderTemplate('tasks/overdue-missed.hbs', data);
	}

	// Lead Templates
	leadReminder(data: LeadReminderData): string {
		return this.renderTemplate('leads/reminder.hbs', data);
	}

	leadConvertedClient(data: LeadConvertedClientData): string {
		return this.renderTemplate('leads/converted-client.hbs', data);
	}

	leadConvertedCreator(data: LeadConvertedCreatorData): string {
		return this.renderTemplate('leads/converted-creator.hbs', data);
	}

	leadAssignedToUser(data: LeadAssignedToUserData): string {
		return this.renderTemplate('leads/assigned-to-user.hbs', data);
	}

	// License Templates
	licenseCreated(data: LicenseEmailData): string {
		return this.renderTemplate('licenses/created.hbs', data);
	}

	licenseUpdated(data: LicenseEmailData): string {
		return this.renderTemplate('licenses/updated.hbs', data);
	}

	licenseRenewed(data: LicenseEmailData): string {
		return this.renderTemplate('licenses/renewed.hbs', data);
	}

	licenseActivated(data: LicenseEmailData): string {
		return this.renderTemplate('licenses/activated.hbs', data);
	}

	licenseSuspended(data: LicenseEmailData): string {
		return this.renderTemplate('licenses/suspended.hbs', data);
	}

	licenseLimitReached(data: LicenseLimitData): string {
		return this.renderTemplate('licenses/limit-reached.hbs', data);
	}

	licenseTransferredFrom(data: LicenseTransferEmailData): string {
		return this.renderTemplate('licenses/transferred-from.hbs', data);
	}

	licenseTransferredTo(data: LicenseTransferEmailData): string {
		return this.renderTemplate('licenses/transferred-to.hbs', data);
	}

	// Report Templates
	dailyReport(data: DailyReportData): string {
		return this.renderTemplate('reports/daily-report.hbs', data);
	}

	userDailyReport(data: DailyReportData): string {
		return this.renderTemplate('reports/user-daily-report.hbs', data);
	}

	// System Templates
	newUserAdminNotification(data: NewUserAdminNotificationData): string {
		return this.renderTemplate('system/new-user-admin-notification.hbs', data);
	}

	// User welcome template
	newUserWelcome(data: NewUserWelcomeData): string {
		return this.renderTemplate('auth/new-user-welcome.hbs', data);
	}

	// Client Templates
	clientPasswordReset(data: PasswordResetData): string {
		return this.renderTemplate('client/password-reset.hbs', data);
	}

	clientPasswordChanged(data: PasswordChangedData): string {
		return this.renderTemplate('client/password-changed.hbs', data);
	}

	// Warning Templates
	warningIssued(data: WarningIssuedEmailData): string {
		return this.renderTemplate('warnings/issued.hbs', data);
	}

	warningUpdated(data: WarningUpdatedEmailData): string {
		return this.renderTemplate('warnings/updated.hbs', data);
	}

	warningExpired(data: WarningExpiredEmailData): string {
		return this.renderTemplate('warnings/expired.hbs', data);
	}

	// Leave Templates
	leaveApplicationConfirmation(data: LeaveApplicationConfirmationData): string {
		return this.renderTemplate('leave/application-confirmation.hbs', data);
	}

	leaveNewApplicationAdmin(data: LeaveNewApplicationAdminData): string {
		return this.renderTemplate('leave/new-application-admin.hbs', data);
	}

	leaveStatusUpdateUser(data: LeaveStatusUpdateUserData): string {
		return this.renderTemplate('leave/status-update-user.hbs', data);
	}

	leaveStatusUpdateAdmin(data: LeaveStatusUpdateAdminData): string {
		return this.renderTemplate('leave/status-update-admin.hbs', data);
	}

	leaveDeletedNotification(data: LeaveDeletedNotificationData): string {
		return this.renderTemplate('leave/deleted-notification.hbs', data);
	}

	// Attendance Report Templates
	attendanceMorningReport(data: MorningReportData): string {
		return this.renderTemplate('attendance/morning-report.hbs', data);
	}

	attendanceEveningReport(data: EveningReportData): string {
		return this.renderTemplate('attendance/evening-report.hbs', data);
	}

	/**
	 * Clear the compiled template cache and reinitialize Handlebars
	 * Useful for development or when templates are updated
	 */
	public clearCache(): void {
		console.log('Clearing email template cache and reinitializing...');
		this.compiledTemplates.clear();
		this.initializeHandlebars();
		console.log('Email template service refreshed');
	}

	private preloadAllTemplates(): void {
		console.log('Preloading all email templates...');
		
		// List of all email templates
		const templates = [
			'auth/signup.hbs',
			'auth/verification.hbs',
			'auth/password-reset.hbs',
			'auth/password-changed.hbs',
			'quotations/client-new.hbs',
			'quotations/internal-new.hbs',
			'quotations/reseller-new.hbs',
			'quotations/status-update.hbs',
			'quotations/warehouse-fulfillment.hbs',
			'business/invoice.hbs',
			'business/order-received-client.hbs',
			'tasks/new-task.hbs',
			'tasks/updated.hbs',
			'tasks/completed.hbs',
			'tasks/reminder-assignee.hbs',
			'tasks/reminder-creator.hbs',
			'tasks/flag-created.hbs',
			'tasks/flag-updated.hbs',
			'tasks/flag-resolved.hbs',
			'tasks/feedback-added.hbs',
			'tasks/overdue-missed.hbs',
			'leads/reminder.hbs',
			'leads/converted-client.hbs',
			'leads/converted-creator.hbs',
			'leads/assigned-to-user.hbs',
			'licenses/created.hbs',
			'licenses/updated.hbs',
			'licenses/renewed.hbs',
			'licenses/activated.hbs',
			'licenses/suspended.hbs',
			'licenses/limit-reached.hbs',
			'licenses/transferred-from.hbs',
			'licenses/transferred-to.hbs',
			'reports/daily-report.hbs',
			'reports/user-daily-report.hbs',
			'system/new-user-admin-notification.hbs',
			'auth/new-user-welcome.hbs',
			'client/password-reset.hbs',
			'client/password-changed.hbs',
			'warnings/issued.hbs',
			'warnings/updated.hbs',
			'warnings/expired.hbs',
			'leave/application-confirmation.hbs',
			'leave/new-application-admin.hbs',
			'leave/status-update-user.hbs',
			'leave/status-update-admin.hbs',
			'leave/deleted-notification.hbs',
			'attendance/morning-report.hbs',
			'attendance/evening-report.hbs',
		];

		templates.forEach((template) => {
			try {
				this.getTemplate(template);
				console.log(`Successfully preloaded template: ${template}`);
			} catch (error) {
				console.error(`Failed to preload template: ${template}`, error);
			}
		});
	}
}

// Export singleton instance
export const emailTemplateService = new EmailTemplateService();
export default emailTemplateService;
