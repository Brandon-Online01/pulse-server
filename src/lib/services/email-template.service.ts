import Handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { join } from 'path';
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
} from '../types/email-templates.types';

class EmailTemplateService {
  private templatesPath: string;
  private compiledTemplates: Map<string, HandlebarsTemplateDelegate> = new Map();

  constructor() {
    this.templatesPath = join(__dirname, '../templates/handlebars');
    this.initializeHandlebars();
  }

  private initializeHandlebars() {
    // Register partials
    this.registerPartials();
    
    // Register helpers
    this.registerHelpers();
  }

  private registerPartials() {
    const partialsPath = join(this.templatesPath, 'partials');
    const layoutsPath = join(this.templatesPath, 'layouts');
    
    try {
      // Register layout
      const baseLayout = readFileSync(join(layoutsPath, 'base.hbs'), 'utf8');
      Handlebars.registerPartial('layouts/base', baseLayout);

      // Register partials
      const partials = ['header', 'footer', 'button', 'card', 'alert'];
      partials.forEach(partial => {
        try {
          const content = readFileSync(join(partialsPath, `${partial}.hbs`), 'utf8');
          Handlebars.registerPartial(`partials/${partial}`, content);
        } catch (error) {
          console.warn(`Could not load partial: ${partial}`, error.message);
        }
      });
    } catch (error) {
      console.warn('Could not load some partials:', error.message);
    }
  }

  private registerHelpers() {
    // Import and register all helpers
    try {
      require('../templates/handlebars/helpers');
    } catch (error) {
      console.warn('Could not load Handlebars helpers:', error.message);
      
      // Register essential helpers as fallback
      Handlebars.registerHelper('formatDate', function(date: string | Date) {
        if (!date) return 'N/A';
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      });

      Handlebars.registerHelper('formatCurrency', function(amount: number, currency: string) {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency || 'USD',
        }).format(amount);
      });

      Handlebars.registerHelper('fallback', function(value: any, fallback: any) {
        return value || fallback;
      });

      Handlebars.registerHelper('concat', function(...args: any[]) {
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
      const templateContent = readFileSync(fullPath, 'utf8');
      const compiled = Handlebars.compile(templateContent);
      this.compiledTemplates.set(templatePath, compiled);
      return compiled;
    } catch (error) {
      console.error(`Error loading template ${templatePath}:`, error);
      throw new Error(`Template not found: ${templatePath}`);
    }
  }

  private renderTemplate(templatePath: string, data: any): string {
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
      privacyPolicyUrl: process.env.PRIVACY_POLICY_URL || `${process.env.APP_URL || 'https://loro.co.za/landing-page'}/privacy`,
      termsUrl: process.env.TERMS_URL || `${process.env.APP_URL || 'https://loro.co.za/landing-page'}/terms`,
      unsubscribeUrl: process.env.UNSUBSCRIBE_URL || `${process.env.APP_URL || 'https://loro.co.za/landing-page'}/unsubscribe`,
    };
    
    return template(enrichedData);
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
}

// Export singleton instance
export const emailTemplateService = new EmailTemplateService();
export default emailTemplateService; 