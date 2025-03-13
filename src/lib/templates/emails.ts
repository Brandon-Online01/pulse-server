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
} from '../types/email-templates.types';
import { formatDate } from '../utils/date.utils';

const BASE_STYLES = {
  wrapper: '@media (max-width: 600px) { width: 100% !important; padding: 10px !important; } width: 100%; padding: 20px; background-color: #f9fafb;',
  container: 'max-width: 600px; margin: 0 auto; font-family: "Unbounded", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);',
  button: 'display: inline-block; padding: 16px 32px; background-color: #A855F7; color: white; text-decoration: none; border-radius: 12px; font-weight: 600; text-align: center; transition: all 0.2s; box-shadow: 0 4px 6px rgba(168, 85, 247, 0.2); font-family: "Unbounded", sans-serif;',
  header: 'background-color: #A855F7; color: white; padding: 40px 20px; text-align: center; border-radius: 0;',
  footer: 'background-color: #ffffff; padding: 32px 20px; text-align: center; margin-top: 32px; color: #6c757d; border-top: 1px solid #f3f4f6;',
  alert: 'background-color: #faf5ff; border-left: 4px solid #A855F7; padding: 20px; margin: 24px 0; border-radius: 8px;',
  card: 'background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); padding: 32px; margin: 24px 0; border: 1px solid #f3f4f6;',
  heading: 'margin: 0 0 20px; color: #A855F7; font-size: 22px; font-weight: 600; font-family: "Unbounded", sans-serif;',
  text: 'margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.8; font-family: "Unbounded", sans-serif;',
  link: 'color: #A855F7; text-decoration: none; font-weight: 500; transition: color 0.2s; margin: 0 12px; font-family: "Unbounded", sans-serif;',
  grid: 'display: grid; grid-template-columns: 1fr; gap: 24px; @media (min-width: 480px) { grid-template-columns: 1fr 1fr; }',
  highlight: 'background: #faf5ff; border-radius: 12px; padding: 24px; margin-bottom: 32px; border: 1px solid #e9d5ff;',
  badge: 'display: inline-block; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500; background-color: #A855F7; color: white; font-family: "Unbounded", sans-serif;',
  divider: 'border: 0; border-top: 1px solid #f3f4f6; margin: 32px 0;',
  icon: 'display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: #faf5ff; border-radius: 50%; margin-right: 16px; font-size: 20px;',
  flexRow: 'display: flex; align-items: center;',
  flexColumn: 'display: flex; flex-direction: column; gap: 8px;',
  tag: 'display: inline-block; padding: 6px 12px; border-radius: 8px; font-size: 14px; font-weight: 500; background: #faf5ff; color: #A855F7; margin: 0 12px 12px 0; font-family: "Unbounded", sans-serif;',
};

const createSection = (title: string, content: string) => `
  <div style="${BASE_STYLES?.card}">
    <h3 style="${BASE_STYLES?.heading}">${title}</h3>
    ${content}
  </div>
`;

export const Signup = (data: SignupEmailData): string => `
    <div style="${BASE_STYLES.wrapper}">
      <div style="${BASE_STYLES.container}">
        <div style="${BASE_STYLES.header}">
          <h1 style="margin: 16px 0 8px; font-size: 24px;">Welcome to Pulse! 🚀</h1>
          <p style="margin: 0; opacity: 0.9;">Your journey to excellence begins</p>
        </div>

        <div style="padding: 24px 20px;">
          <div style="${BASE_STYLES.card}">
            <h2 style="${BASE_STYLES.heading}">Hi ${data.name},</h2>
            <p style="${BASE_STYLES.text}">Thank you for choosing Pulse. Let's get your account set up!</p>
            
            <div style="text-align: center; margin: 24px 0;">
              <a href="/sign-in" style="${BASE_STYLES.button}">
                Sign In Now
              </a>
            </div>
          </div>

          ${createSection("🔐 Security Tips", `
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="margin-bottom: 12px; display: flex; align-items: center;">
                <span style="color: #A855F7; margin-right: 8px;">✓</span>
                Enable two-factor authentication
              </li>
              <li style="margin-bottom: 12px; display: flex; align-items: center;">
                <span style="color: #A855F7; margin-right: 8px;">✓</span>
                Use a strong, unique password
              </li>
              <li style="display: flex; align-items: center;">
                <span style="color: #A855F7; margin-right: 8px;">✓</span>
                Keep your recovery email updated
              </li>
            </ul>
          `)}
        </div>

        <div style="${BASE_STYLES.footer}">
          <p style="margin: 0;">Need help? Our support team is ready to assist you.</p>
        </div>
      </div>
    </div>
`;

export const Verification = (data: VerificationEmailData): string => `
    <div style="${BASE_STYLES.wrapper}">
      <div style="${BASE_STYLES.container}">
        <div style="${BASE_STYLES.header}">
          <h1 style="margin: 16px 0 8px; font-size: 24px;">Verify Your Email 📧</h1>
          <p style="margin: 0; opacity: 0.9;">One quick step to secure your account</p>
        </div>

        <div style="padding: 24px 20px;">
          <div style="${BASE_STYLES.card}">
            <h2 style="${BASE_STYLES.heading}">Hi ${data.name},</h2>
            <p style="${BASE_STYLES.text}">Please verify your email to complete your registration:</p>
            
            <div style="text-align: center; margin: 24px 0;">
              <a href="${data.verificationLink}" style="${BASE_STYLES.button}">
                Verify Email
              </a>
            </div>

            <div style="${BASE_STYLES.alert}">
              <p style="margin: 0;">
                <strong>Note:</strong> This link expires in ${data.expiryHours} hours.
                If you didn't request this, please ignore this email.
              </p>
            </div>
          </div>
        </div>

        <div style="${BASE_STYLES.footer}">
          <p style="margin: 0;">Having trouble? Contact our support team.</p>
        </div>
      </div>
    </div>
`;

export const PasswordReset = (data: PasswordResetData): string => `
    <div style="${BASE_STYLES.wrapper}">
      <div style="${BASE_STYLES.container}">
        <div style="${BASE_STYLES.header}">
          <h1 style="margin: 16px 0 8px; font-size: 24px;">Reset Your Password 🔒</h1>
          <p style="margin: 0; opacity: 0.9;">Secure your account</p>
        </div>

        <div style="padding: 24px 20px;">
          <div style="${BASE_STYLES.card}">
            <h2 style="${BASE_STYLES.heading}">Hi ${data.name},</h2>
            <p style="${BASE_STYLES.text}">We received a request to reset your password. Click the button below to proceed:</p>
            
            <div style="text-align: center; margin: 24px 0;">
              <a href="${data.resetLink}" style="${BASE_STYLES.button}">
                Reset Password
              </a>
            </div>

            <div style="${BASE_STYLES.alert}">
              <p style="margin: 0;">
                <strong>Important:</strong> This link expires in 1 hour.
                If you didn't request this reset, please contact support immediately.
              </p>
            </div>
          </div>
        </div>

        <div style="${BASE_STYLES.footer}">
          <p style="margin: 0;">For security reasons, never share your password reset link.</p>
        </div>
      </div>
    </div>
`;

export const PasswordChanged = (data: PasswordChangedData): string => `
    <div style="${BASE_STYLES.wrapper}">
      <div style="${BASE_STYLES.container}">
        <div style="${BASE_STYLES.header}">
          <h1 style="margin: 16px 0 8px; font-size: 24px;">Password Updated Successfully 🔐</h1>
          <p style="margin: 0; opacity: 0.9;">Your account is secure</p>
        </div>

        <div style="padding: 24px 20px;">
          <div style="${BASE_STYLES.card}">
            <h2 style="${BASE_STYLES.heading}">Hi ${data.name},</h2>
            <p style="${BASE_STYLES.text}">Your password was successfully changed on ${data.changeTime}.</p>

            <div style="${BASE_STYLES.alert}">
              <p style="margin: 0;">
                <strong>Security Notice:</strong> If you didn't make this change,
                please contact our support team immediately.
              </p>
            </div>

            <div style="text-align: center; margin: 24px 0;">
              <a href="/sign-in" style="${BASE_STYLES.button}">
                Sign In
              </a>
            </div>
          </div>
        </div>

        <div style="${BASE_STYLES.footer}">
          <p style="margin: 0;">Keep your account secure - never share your password.</p>
        </div>
      </div>
    </div>
`;

export const NewQuotationClient = (data: QuotationData): string => {
  const itemsList = data.quotationItems.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${item.quantity}x</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
        <div style="font-weight: 500;">${item.product.name}</div>
        <div style="font-size: 12px; color: #666;">Code: ${item.product.code}</div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">${new Intl.NumberFormat('en-US', { style: 'currency', currency: data.currency }).format(item.totalPrice)}</td>
    </tr>
  `).join('');

  return `
    <div style="${BASE_STYLES.wrapper}">
      <div style="${BASE_STYLES.container}">
        <div style="${BASE_STYLES.header}">
          <h1 style="margin: 16px 0 8px; font-size: 24px;">Quotation Generated</h1>
          <p style="margin: 0; opacity: 0.9;">Reference: ${data.quotationId}</p>
        </div>

        <div style="padding: 24px 20px;">
          <div style="${BASE_STYLES.card}">
            <h2 style="${BASE_STYLES.heading}">Dear ${data.name},</h2>
            <p style="${BASE_STYLES.text}">Thank you for your interest in our products. We are pleased to provide you with the following quotation:</p>
            
            <div style="margin: 24px 0; background: #f7fafc; border-radius: 8px; padding: 16px;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr>
                    <th style="text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0;">Quantity</th>
                    <th style="text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0;">Product</th>
                    <th style="text-align: right; padding: 12px; border-bottom: 2px solid #e2e8f0;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                  <tr>
                    <td colspan="2" style="padding: 12px; font-weight: 600;">Total Amount</td>
                    <td style="padding: 12px; text-align: right; font-weight: 600;">${new Intl.NumberFormat('en-US', { style: 'currency', currency: data.currency }).format(data.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style="${BASE_STYLES.alert}">
              <p style="margin: 0; font-weight: 500;">Important Information:</p>
              <ul style="margin: 8px 0 0;">
                <li>This quotation is valid until ${new Date(data.validUntil).toLocaleDateString()}</li>
                <li>Prices are quoted in ${data.currency}</li>
                <li>Terms and conditions apply</li>
              </ul>
            </div>
          </div>

          <div style="${BASE_STYLES.card}">
            <h3 style="${BASE_STYLES.heading}">Next Steps</h3>
            <p style="${BASE_STYLES.text}">To proceed with this quotation:</p>
            <ol style="margin: 16px 0; padding-left: 20px;">
              <li>Review the quotation details carefully</li>
              <li>Contact us for any clarifications needed</li>
              <li>Accept the quotation through our platform or by replying to this email</li>
            </ol>
          </div>
        </div>

        <div style="${BASE_STYLES.footer}">
          <p style="margin: 0;">Thank you for choosing our services. We look forward to serving you.</p>
        </div>
      </div>
    </div>
  `;
};

export const NewQuotationInternal = (data: QuotationInternalData): string => {
  const itemsList = data.quotationItems.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${item.quantity}x</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${item.product.uid}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">${new Intl.NumberFormat('en-US', { style: 'currency', currency: data.currency }).format(item.totalPrice)}</td>
    </tr>
  `).join('');

  return `
    <div style="${BASE_STYLES.wrapper}">
      <div style="${BASE_STYLES.container}">
        <div style="${BASE_STYLES.header}">
          <h1 style="margin: 16px 0 8px; font-size: 24px;">New Quotation Alert</h1>
          <p style="margin: 0; opacity: 0.9;">Internal Reference: ${data.quotationId}</p>
        </div>

        <div style="padding: 24px 20px;">
          <div style="${BASE_STYLES.card}">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
              <div>
                <h4 style="margin: 0 0 8px; color: #4a5568;">Customer Type</h4>
                <p style="margin: 0; font-weight: 500;">${data.customerType}</p>
              </div>
              <div>
                <h4 style="margin: 0 0 8px; color: #4a5568;">Priority</h4>
                <span style="background: ${data.priority === 'high' ? '#fed7d7' : data.priority === 'medium' ? '#fefcbf' : '#e6fffa'}; 
                             color: ${data.priority === 'high' ? '#c53030' : data.priority === 'medium' ? '#b7791f' : '#2c7a7b'}; 
                             padding: 4px 12px; 
                             border-radius: 12px; 
                             font-weight: 500;">
                  ${data.priority.toUpperCase()}
                </span>
              </div>
            </div>

            <div style="margin: 24px 0; background: #f7fafc; border-radius: 8px; padding: 16px;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr>
                    <th style="text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0;">Quantity</th>
                    <th style="text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0;">Product</th>
                    <th style="text-align: right; padding: 12px; border-bottom: 2px solid #e2e8f0;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                  <tr>
                    <td colspan="2" style="padding: 12px; font-weight: 600;">Total Amount</td>
                    <td style="padding: 12px; text-align: right; font-weight: 600;">${new Intl.NumberFormat('en-US', { style: 'currency', currency: data.currency }).format(data.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            ${data.notes ? `
              <div style="${BASE_STYLES.alert}">
                <p style="margin: 0; font-weight: 500;">Additional Notes:</p>
                <p style="margin: 8px 0 0;">${data.notes}</p>
              </div>
            ` : ''}
          </div>

          <div style="${BASE_STYLES.card}">
            <h3 style="${BASE_STYLES.heading}">Required Actions</h3>
            <ol style="margin: 16px 0; padding-left: 20px;">
              <li>Review quotation details and pricing</li>
              <li>Check stock availability</li>
              <li>Verify customer information</li>
              <li>Process within 24 hours</li>
            </ol>
          </div>
        </div>

        <div style="${BASE_STYLES.footer}">
          <p style="margin: 0;">Internal quotation notification - please handle according to priority level</p>
        </div>
      </div>
    </div>
  `;
};

export const NewQuotationReseller = (data: QuotationResellerData): string => {
  const itemsList = data.quotationItems.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${item.quantity}x</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${item.product.uid}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">${new Intl.NumberFormat('en-US', { style: 'currency', currency: data.currency }).format(item.totalPrice)}</td>
    </tr>
  `).join('');

  return `
    <div style="${BASE_STYLES.wrapper}">
      <div style="${BASE_STYLES.container}">
        <div style="${BASE_STYLES.header}">
          <h1 style="margin: 16px 0 8px; font-size: 24px;">New Reseller Quotation</h1>
          <p style="margin: 0; opacity: 0.9;">Reference: ${data.quotationId}</p>
        </div>

        <div style="padding: 24px 20px;">
          <div style="${BASE_STYLES.card}">
            <h2 style="${BASE_STYLES.heading}">Dear ${data.name},</h2>
            <p style="${BASE_STYLES.text}">A new quotation has been generated under your reseller account:</p>

            <div style="margin: 24px 0; background: #f7fafc; border-radius: 8px; padding: 16px;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr>
                    <th style="text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0;">Quantity</th>
                    <th style="text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0;">Product</th>
                    <th style="text-align: right; padding: 12px; border-bottom: 2px solid #e2e8f0;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                  <tr>
                    <td colspan="2" style="padding: 12px; font-weight: 600;">Total Amount</td>
                    <td style="padding: 12px; text-align: right; font-weight: 600;">${new Intl.NumberFormat('en-US', { style: 'currency', currency: data.currency }).format(data.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style="${BASE_STYLES.highlight}">
              <h4 style="margin: 0 0 8px; color: #4a5568;">Commission Details</h4>
              <p style="margin: 0;">
                <strong>Reseller Code:</strong> ${data.resellerCode}<br>
                <strong>Commission Amount:</strong> ${new Intl.NumberFormat('en-US', { style: 'currency', currency: data.currency }).format(data.resellerCommission)}
              </p>
            </div>

            <div style="${BASE_STYLES.alert}">
              <p style="margin: 0; font-weight: 500;">Important Information:</p>
              <ul style="margin: 8px 0 0;">
                <li>Quotation valid until ${new Date(data.validUntil).toLocaleDateString()}</li>
                <li>Commission will be processed upon order completion</li>
                <li>Standard reseller terms and conditions apply</li>
              </ul>
            </div>
          </div>
        </div>

        <div style="${BASE_STYLES.footer}">
          <p style="margin: 0;">Thank you for your continued partnership.</p>
        </div>
      </div>
    </div>
  `;
};

export const QuotationStatusUpdate = (data: QuotationData): string => {
  const itemsList = data.quotationItems.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-family: 'Unbounded', sans-serif;">${item.quantity}x</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-family: 'Unbounded', sans-serif;">
        <div style="font-weight: 500; font-family: 'Unbounded', sans-serif;">${item.product.name}</div>
        <div style="font-size: 12px; color: #666; font-family: 'Unbounded', sans-serif;">Code: ${item.product.code}</div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: 'Unbounded', sans-serif;">${new Intl.NumberFormat('en-US', { style: 'currency', currency: data.currency }).format(item.totalPrice)}</td>
    </tr>
  `).join('');

  // Get status information
  const statusInfo = {
    pending: {
      title: 'Pending Review',
      description: 'Your quotation is currently being reviewed by our team.',
      color: '#A855F7', // Purple color (matching the header)
      next: 'Our team will process your quotation shortly.'
    },
    inprogress: {
      title: 'In Progress',
      description: 'Your quotation is currently being processed.',
      color: '#A855F7', // Purple color (matching the header)
      next: 'We\'re working on preparing your order based on the quotation.'
    },
    approved: {
      title: 'Approved',
      description: 'Your quotation has been approved.',
      color: '#A855F7', // Purple color (matching the header)
      next: 'We\'ll be in touch soon to arrange delivery or collection details.'
    },
    rejected: {
      title: 'Not Approved',
      description: 'Unfortunately, your quotation could not be approved at this time.',
      color: '#A855F7', // Purple color (matching the header)
      next: 'Please contact our customer service for more information.'
    },
    completed: {
      title: 'Completed',
      description: 'Your order has been successfully completed.',
      color: '#A855F7', // Purple color (matching the header)
      next: 'Thank you for your business!'
    },
    cancelled: {
      title: 'Cancelled',
      description: 'Your quotation has been cancelled as requested.',
      color: '#A855F7', // Purple color (matching the header)
      next: 'If you wish to place a new order, please create a new quotation.'
    },
    postponed: {
      title: 'Postponed',
      description: 'Your quotation has been temporarily postponed.',
      color: '#A855F7', // Purple color (matching the header) 
      next: 'We\'ll contact you with additional information about next steps.'
    },
    outfordelivery: {
      title: 'Out for Delivery',
      description: 'Your order is now out for delivery.',
      color: '#A855F7', // Purple color (matching the header)
      next: 'You should receive your items shortly.'
    },
    delivered: {
      title: 'Delivered',
      description: 'Your order has been delivered successfully.',
      color: '#A855F7', // Purple color (matching the header)
      next: 'We hope you enjoy your purchase!'
    }
  };

  const status = data.status.toLowerCase();
  const statusDisplay = statusInfo[status] || statusInfo.pending;

  return `
    <div style="${BASE_STYLES.wrapper}">
      <div style="${BASE_STYLES.container}">
        <div style="${BASE_STYLES.header}">
          <h1 style="margin: 16px 0 8px; font-size: 24px; font-family: 'Unbounded', sans-serif;">Quotation Status Update</h1>
          <p style="margin: 0; opacity: 0.9; font-family: 'Unbounded', sans-serif;">Reference: ${data.quotationId}</p>
        </div>

        <div style="padding: 24px 20px;">
          <div style="${BASE_STYLES.card}">
            <h2 style="${BASE_STYLES.heading}">Dear ${data.name},</h2>
            <p style="${BASE_STYLES.text}">This is to inform you that the status of your quotation has been updated to:</p>
            
            <div style="${BASE_STYLES.highlight}">
              <div style="display: inline-block; width: 100%; text-align: center;">
                <div style="display: inline-block; padding: 8px 24px; border-radius: 16px; background-color: #faf5ff; color: #A855F7; font-weight: 600; font-family: 'Unbounded', sans-serif; margin-bottom: 12px;">
                  ${statusDisplay.title}
                </div>
              </div>
              <p style="margin: 12px 0 0; color: #4b5563; font-family: 'Unbounded', sans-serif; text-align: center; font-size: 15px;">${statusDisplay.description}</p>
            </div>

            <div style="margin: 24px 0; background: #f7fafc; border-radius: 8px; padding: 16px;">
              <h3 style="margin: 0 0 16px; font-size: 18px; color: #A855F7; font-family: 'Unbounded', sans-serif;">Quotation Details</h3>
              <table style="width: 100%; border-collapse: collapse; font-family: 'Unbounded', sans-serif;">
                <thead>
                  <tr>
                    <th style="text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0; font-family: 'Unbounded', sans-serif;">Quantity</th>
                    <th style="text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0; font-family: 'Unbounded', sans-serif;">Product</th>
                    <th style="text-align: right; padding: 12px; border-bottom: 2px solid #e2e8f0; font-family: 'Unbounded', sans-serif;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                  <tr>
                    <td colspan="2" style="padding: 12px; font-weight: 600; font-family: 'Unbounded', sans-serif;">Total Amount</td>
                    <td style="padding: 12px; text-align: right; font-weight: 600; font-family: 'Unbounded', sans-serif;">${new Intl.NumberFormat('en-US', { style: 'currency', currency: data.currency }).format(data.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style="${BASE_STYLES.alert}">
              <p style="margin: 0; font-weight: 500; font-family: 'Unbounded', sans-serif;">Next Steps:</p>
              <p style="margin: 8px 0 0; font-family: 'Unbounded', sans-serif;">${statusDisplay.next}</p>
            </div>
          </div>

          <div style="${BASE_STYLES.card}">
            <h3 style="${BASE_STYLES.heading}">Need Help?</h3>
            <p style="${BASE_STYLES.text}">If you have any questions or concerns about your quotation:</p>
            <ul style="margin: 16px 0; padding-left: 20px; font-family: 'Unbounded', sans-serif;">
              <li style="margin-bottom: 8px;">Reply to this email</li>
              <li style="margin-bottom: 8px;">Contact our customer support</li>
              <li style="margin-bottom: 8px;">Check your account on our platform for the latest status</li>
            </ul>
          </div>
        </div>

        <div style="${BASE_STYLES.footer}">
          <p style="margin: 0; font-family: 'Unbounded', sans-serif;">Thank you for choosing our services. We appreciate your business.</p>
        </div>
      </div>
    </div>
  `;
};

export const Invoice = (data: InvoiceData): string => {
  return `
    <div style="${BASE_STYLES?.wrapper}">
      <div style="${BASE_STYLES?.container}">
        <div style="${BASE_STYLES?.header}">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
          </svg>
          <h1 style="margin: 16px 0 8px; font-size: 24px;">Invoice #${data?.invoiceId}</h1>
          <p style="margin: 0; opacity: 0.9;">${data?.date}</p>
        </div>

        <div style="padding: 24px 20px;">
          <div style="${BASE_STYLES?.card}">
            <div style="display: grid; gap: 16px;">
              <div style="${BASE_STYLES?.highlight}">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #4a5568">Amount Due</span>
                  <span style="font-size: 24px; font-weight: 600; color: #0066FF">${data?.amount}</span>
                </div>
              </div>
              
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #718096">Payment Method</span>
                  <span style="font-weight: 500">${data?.paymentMethod}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #718096">Invoice Date</span>
                  <span style="font-weight: 500">${data?.date}</span>
                </div>
              </div>
            </div>
          </div>

          <div style="text-align: center; margin: 24px 0;">
            <a href="#" style="${BASE_STYLES?.button}">
              Download Invoice
            </a>
          </div>
        </div>

        <div style="${BASE_STYLES?.footer}">
          <p style="margin: 0;">Thank you for your business!</p>
        </div>
      </div>
    </div>
  `;
};

export const DailyReport = (data: DailyReportData): string => {
  const {
    name,
    date,
    metrics: {
      xp,
      attendance,
      totalQuotations,
      totalRevenue,
      newCustomers,
      quotationGrowth,
      revenueGrowth,
      customerGrowth,
      userSpecific,
    },
    tracking,
  } = data;

  const xpSection = xp ? `
    <div style="${BASE_STYLES.card}">
      <h3 style="${BASE_STYLES.heading}">✨ XP & Level</h3>
      <div style="display: grid; gap: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f7fafc; border-radius: 8px;">
          <span>Current Level</span>
          <strong style="color: #4a5568">${xp.level}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f7fafc; border-radius: 8px;">
          <span>Total XP</span>
          <strong style="color: #4a5568">${xp.currentXP}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f7fafc; border-radius: 8px;">
          <span>Today's XP</span>
          <strong style="color: #48bb78">+${xp.todayXP}</strong>
        </div>
      </div>
    </div>
  ` : '';

  const attendanceSection = attendance ? `
    <div style="${BASE_STYLES.card}">
      <h3 style="${BASE_STYLES.heading}">⏰ Today's Schedule</h3>
      <div style="display: grid; gap: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f7fafc; border-radius: 8px;">
          <span>Status</span>
          <strong style="color: ${attendance.status === 'PRESENT' ? '#48bb78' : '#a0aec0'}">${attendance.status}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f7fafc; border-radius: 8px;">
          <span>Start Time</span>
          <strong>${attendance.startTime}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f7fafc; border-radius: 8px;">
          <span>End Time</span>
          <strong>${attendance.endTime || 'Still Working'}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f7fafc; border-radius: 8px;">
          <span>Duration</span>
          <strong>${attendance.duration || `${attendance.totalHours}h`}</strong>
        </div>
      </div>
    </div>
  ` : '';

  const metricsSection = `
    <div style="${BASE_STYLES.card}">
      <h3 style="${BASE_STYLES.heading}">Today's Performance</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px;">
        <div>
          <h4 style="margin: 0 0 8px; color: #4a5568;">Quotations</h4>
          <p style="margin: 0; font-size: 24px; font-weight: 600;">${totalQuotations}</p>
          <span style="color: ${quotationGrowth.startsWith('+') ? '#48bb78' : '#f56565'};">${quotationGrowth}</span>
        </div>
        <div>
          <h4 style="margin: 0 0 8px; color: #4a5568;">Revenue</h4>
          <p style="margin: 0; font-size: 24px; font-weight: 600;">${totalRevenue}</p>
          <span style="color: ${revenueGrowth.startsWith('+') ? '#48bb78' : '#f56565'};">${revenueGrowth}</span>
        </div>
        <div>
          <h4 style="margin: 0 0 8px; color: #4a5568;">New Customers</h4>
          <p style="margin: 0; font-size: 24px; font-weight: 600;">${newCustomers}</p>
          <span style="color: ${customerGrowth.startsWith('+') ? '#48bb78' : '#f56565'};">${customerGrowth}</span>
        </div>
      </div>
    </div>
  `;

  const userMetricsSection = userSpecific ? `
    <div style="${BASE_STYLES.card}">
      <h3 style="${BASE_STYLES.heading}">Your Activity</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 16px;">
        <div>
          <h4 style="margin: 0 0 8px; color: #4a5568;">Leads</h4>
          <p style="margin: 0; font-size: 20px; font-weight: 600;">${userSpecific.todayLeads}</p>
        </div>
        <div>
          <h4 style="margin: 0 0 8px; color: #4a5568;">Claims</h4>
          <p style="margin: 0; font-size: 20px; font-weight: 600;">${userSpecific.todayClaims}</p>
        </div>
        <div>
          <h4 style="margin: 0 0 8px; color: #4a5568;">Tasks</h4>
          <p style="margin: 0; font-size: 20px; font-weight: 600;">${userSpecific.todayTasks}</p>
        </div>
        <div>
          <h4 style="margin: 0 0 8px; color: #4a5568;">Quotations</h4>
          <p style="margin: 0; font-size: 20px; font-weight: 600;">${userSpecific.todayQuotations}</p>
        </div>
        <div>
          <h4 style="margin: 0 0 8px; color: #4a5568;">Hours</h4>
          <p style="margin: 0; font-size: 20px; font-weight: 600;">${userSpecific.hoursWorked}</p>
        </div>
      </div>
    </div>
  ` : '';

  const trackingSection = tracking ? `
    <div style="${BASE_STYLES.card}">
      <h3 style="${BASE_STYLES.heading}">📍 Location Tracking</h3>
      <div style="display: grid; gap: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f7fafc; border-radius: 8px;">
          <span>Total Distance</span>
          <strong>${tracking.totalDistance}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f7fafc; border-radius: 8px;">
          <span>Average Time per Location</span>
          <strong>${tracking.averageTimePerLocation}</strong>
                </div>
        ${tracking.locations.map(location => `
          <div style="padding: 12px; background: #f7fafc; border-radius: 8px;">
            <div style="font-weight: 500; margin-bottom: 4px;">${location.address}</div>
            <div style="color: #718096; font-size: 14px;">Time spent: ${location.timeSpent}</div>
                </div>
              `).join('')}
            </div>
          </div>
  ` : '';

  return `
    <div style="${BASE_STYLES.wrapper}">
      <div style="${BASE_STYLES.container}">
        <div style="${BASE_STYLES.header}">
          <h1 style="margin: 16px 0 8px; font-size: 24px;">Daily Wrap ⭐</h1>
          <p style="margin: 0; opacity: 0.9;">${new Date(date).toLocaleDateString()}</p>
          </div>

        <div style="padding: 24px 20px;">
          <h2 style="${BASE_STYLES.heading}">Hi ${name},</h2>
          <p style="${BASE_STYLES.text}">Here's your daily performance summary:</p>
          
          ${xpSection}
          ${attendanceSection}
          ${metricsSection}
          ${userMetricsSection}
          ${trackingSection}

          <div style="${BASE_STYLES.alert}">
            <p style="margin: 0; font-weight: 500;">💡 Quick Tip</p>
            <p style="margin: 8px 0 0;">Set your goals for tomorrow and start fresh! Remember, every small win counts towards big success.</p>
          </div>
        </div>

        <div style="${BASE_STYLES.footer}">
          <p style="margin: 0;">Keep up the amazing work! 🚀</p>
          <p style="font-size: 14px; color: #6c757d;">Generated on ${new Date(date).toLocaleString()}</p>
        </div>
      </div>
    </div>
  `;
};

export const LicenseCreated = (data: LicenseEmailData): string => `
    <div style="${BASE_STYLES.wrapper}">
      <div style="${BASE_STYLES.container}">
        <div style="${BASE_STYLES.header}">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
          </svg>
          <h1 style="margin: 16px 0 8px; font-size: 24px;">License Created Successfully! 🎉</h1>
          <p style="margin: 0; opacity: 0.9;">License Key: ${data.licenseKey}</p>
        </div>

        <div style="padding: 24px 20px;">
          <div style="${BASE_STYLES.card}">
            <h2 style="${BASE_STYLES.heading}">Welcome, ${data.name}! 💫</h2>
            <p style="${BASE_STYLES.text}">Your new license has been created successfully. Here are your license details:</p>

            <div style="${BASE_STYLES.highlight}">
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between;">
                  <span>Plan</span>
                  <span style="font-weight: 600">${data.plan}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Valid Until</span>
                  <span style="font-weight: 600">${formatDate(data.validUntil)}</span>
                </div>
              </div>
            </div>

            ${createSection("📊 License Limits", `
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                  <span>Max Users</span>
                  <strong>${data.limits.maxUsers}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                  <span>Max Branches</span>
                  <strong>${data.limits.maxBranches}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                  <span>Storage Limit</span>
                  <strong>${Math.floor(data.limits.storageLimit / 1024)}GB</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                  <span>API Call Limit</span>
                  <strong>${data.limits.apiCallLimit.toLocaleString()}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                  <span>Integration Limit</span>
                  <strong>${data.limits.integrationLimit}</strong>
                </div>
              </div>
            `)}
          </div>
        </div>

        <div style="${BASE_STYLES.footer}">
          <p style="margin: 0 0 12px;">Need help getting started?</p>
          <div style="display: flex; justify-content: center; gap: 16px;">
            <a href="#" style="${BASE_STYLES.link}">Documentation</a>
            <a href="#" style="${BASE_STYLES.link}">Support</a>
            <a href="#" style="${BASE_STYLES.link}">API Guide</a>
          </div>
        </div>
      </div>
    </div>
`;

export const LicenseUpdated = (data: LicenseEmailData): string => `
    <div style="${BASE_STYLES.wrapper}">
      <div style="${BASE_STYLES.container}">
        <div style="${BASE_STYLES.header}">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
            <path d="M21 10.12h-6.78l2.74-2.82c-2.73-2.7-7.15-2.8-9.88-.1-2.73 2.71-2.73 7.08 0 9.79s7.15 2.71 9.88 0C18.32 15.65 19 14.08 19 12.1h2c0 1.98-.88 4.55-2.64 6.29-3.51 3.48-9.21 3.48-12.72 0-3.5-3.47-3.53-9.11-.02-12.58s9.14-3.47 12.65 0L21 3v7.12zM12.5 8v4.25l3.5 2.08-.72 1.21L11 13V8h1.5z"/>
          </svg>
          <h1 style="margin: 16px 0 8px; font-size: 24px;">License Updated</h1>
          <p style="margin: 0; opacity: 0.9;">License Key: ${data.licenseKey}</p>
        </div>

        <div style="padding: 24px 20px;">
          <div style="${BASE_STYLES.card}">
            <h2 style="${BASE_STYLES.heading}">Hi ${data.name},</h2>
            <p style="${BASE_STYLES.text}">Your license has been updated successfully. Here are your current license details:</p>

            <div style="${BASE_STYLES.highlight}">
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between;">
                  <span>Plan</span>
                  <span style="font-weight: 600">${data.plan}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Valid Until</span>
                  <span style="font-weight: 600">${formatDate(data.validUntil)}</span>
                </div>
              </div>
            </div>

            ${createSection("📊 Updated License Limits", `
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                  <span>Max Users</span>
                  <strong>${data.limits.maxUsers}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                  <span>Max Branches</span>
                  <strong>${data.limits.maxBranches}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                  <span>Storage Limit</span>
                  <strong>${Math.floor(data.limits.storageLimit / 1024)}GB</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                  <span>API Call Limit</span>
                  <strong>${data.limits.apiCallLimit.toLocaleString()}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                  <span>Integration Limit</span>
                  <strong>${data.limits.integrationLimit}</strong>
                </div>
              </div>
            `)}
          </div>
        </div>

        <div style="${BASE_STYLES.footer}">
          <p>Review our documentation to learn about new features and capabilities.</p>
        </div>
      </div>
    </div>
`;

export const LicenseLimitReached = (data: LicenseLimitData): string => `
    <div style="${BASE_STYLES.wrapper}">
      <div style="${BASE_STYLES.container}">
        <div style="${BASE_STYLES.header}">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <h1 style="margin: 16px 0 8px; font-size: 24px;">License Limit Reached ⚠️</h1>
          <p style="margin: 0; opacity: 0.9;">Action Required</p>
        </div>

        <div style="padding: 24px 20px;">
          <div style="${BASE_STYLES.card}">
            <h2 style="${BASE_STYLES.heading}">Hi ${data.name},</h2>
            <p style="${BASE_STYLES.text}">Your license has reached its limit for the following:</p>

            <div style="${BASE_STYLES.alert}">
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between;">
                  <span>Metric</span>
                  <strong style="color: #dc3545">${data.metric}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Current Usage</span>
                  <strong style="color: #dc3545">${data.currentValue}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>License Limit</span>
                  <strong>${data.limit}</strong>
                </div>
              </div>
            </div>

            ${createSection("📈 Next Steps", `
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin-bottom: 12px; display: flex; align-items: center;">
                  <span style="background: #dc3545; color: white; margin-right: 8px; padding: 4px 8px; border-radius: 4px;">1</span>
                  Review your current usage
                </li>
                <li style="margin-bottom: 12px; display: flex; align-items: center;">
                  <span style="background: #ffc107; color: white; margin-right: 8px; padding: 4px 8px; border-radius: 4px;">2</span>
                  Consider upgrading your plan
                </li>
                <li style="display: flex; align-items: center;">
                  <span style="background: #28a745; color: white; margin-right: 8px; padding: 4px 8px; border-radius: 4px;">3</span>
                  Contact support for assistance
                </li>
              </ul>
            `)}
          </div>
        </div>

        <div style="${BASE_STYLES.footer}">
          <p>Need immediate assistance? Our support team is ready to help!</p>
        </div>
      </div>
    </div>
`;

export const LicenseRenewed = (data: LicenseEmailData): string => `
    <div style="${BASE_STYLES.wrapper}">
      <div style="${BASE_STYLES.container}">
        <div style="${BASE_STYLES.header}">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
            <path d="M21 10.12h-6.78l2.74-2.82c-2.73-2.7-7.15-2.8-9.88-.1-2.73 2.71-2.73 7.08 0 9.79s7.15 2.71 9.88 0C18.32 15.65 19 14.08 19 12.1h2c0 1.98-.88 4.55-2.64 6.29-3.51 3.48-9.21 3.48-12.72 0-3.5-3.47-3.53-9.11-.02-12.58s9.14-3.47 12.65 0L21 3v7.12z"/>
          </svg>
          <h1 style="margin: 16px 0 8px; font-size: 24px;">License Renewed Successfully! 🎉</h1>
          <p style="margin: 0; opacity: 0.9;">License Key: ${data.licenseKey}</p>
        </div>

        <div style="padding: 24px 20px;">
          <div style="${BASE_STYLES.card}">
            <h2 style="${BASE_STYLES.heading}">Thank you, ${data.name}! 💫</h2>
            <p style="${BASE_STYLES.text}">Your license has been renewed successfully. Here are your updated license details:</p>

            <div style="${BASE_STYLES.highlight}">
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between;">
                  <span>Plan</span>
                  <span style="font-weight: 600">${data.plan}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Valid Until</span>
                  <span style="font-weight: 600">${formatDate(data.validUntil)}</span>
                </div>
              </div>
            </div>

            ${createSection("📊 License Limits", `
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                  <span>Max Users</span>
                  <strong>${data.limits.maxUsers}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                  <span>Max Branches</span>
                  <strong>${data.limits.maxBranches}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                  <span>Storage Limit</span>
                  <strong>${Math.floor(data.limits.storageLimit / 1024)}GB</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                  <span>API Call Limit</span>
                  <strong>${data.limits.apiCallLimit.toLocaleString()}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                  <span>Integration Limit</span>
                  <strong>${data.limits.integrationLimit}</strong>
                </div>
              </div>
            `)}
          </div>
        </div>

        <div style="${BASE_STYLES.footer}">
          <p>Thank you for your continued trust in our services! 🙏</p>
        </div>
      </div>
    </div>
`;

export const LicenseSuspended = (data: LicenseEmailData): string => `
    <div style="${BASE_STYLES.wrapper}">
      <div style="${BASE_STYLES.container}">
        <div style="${BASE_STYLES.header}">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <h1 style="margin: 16px 0 8px; font-size: 24px;">License Suspended ⚠️</h1>
          <p style="margin: 0; opacity: 0.9;">Immediate Action Required</p>
        </div>

        <div style="padding: 24px 20px;">
          <div style="${BASE_STYLES.card}">
            <h2 style="${BASE_STYLES.heading}">Hi ${data.name},</h2>
            <p style="${BASE_STYLES.text}">Your license has been suspended. Please contact support immediately to resolve this issue.</p>

            <div style="${BASE_STYLES.alert}">
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between;">
                  <span>License Key</span>
                  <strong>${data.licenseKey}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Plan</span>
                  <strong>${data.plan}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Valid Until</span>
                  <strong>${formatDate(data.validUntil)}</strong>
                </div>
              </div>
            </div>

            ${createSection("⚡ Next Steps", `
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin-bottom: 12px; display: flex; align-items: center;">
                  <span style="background: #dc3545; color: white; margin-right: 8px; padding: 4px 8px; border-radius: 4px;">1</span>
                  Contact support immediately
                </li>
                <li style="margin-bottom: 12px; display: flex; align-items: center;">
                  <span style="background: #ffc107; color: white; margin-right: 8px; padding: 4px 8px; border-radius: 4px;">2</span>
                  Review account status
                </li>
                <li style="display: flex; align-items: center;">
                  <span style="background: #28a745; color: white; margin-right: 8px; padding: 4px 8px; border-radius: 4px;">3</span>
                  Prepare necessary documentation
                </li>
              </ul>
            `)}
          </div>
        </div>

        <div style="${BASE_STYLES.footer}">
          <p>Our support team is available 24/7 to assist you.</p>
        </div>
      </div>
    </div>
`;

export const LicenseActivated = (data: LicenseEmailData): string => `
    <div style="${BASE_STYLES.wrapper}">
      <div style="${BASE_STYLES.container}">
        <div style="${BASE_STYLES.header}">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <h1 style="margin: 16px 0 8px; font-size: 24px;">License Activated! 🎉</h1>
          <p style="margin: 0; opacity: 0.9;">License Key: ${data.licenseKey}</p>
        </div>

        <div style="padding: 24px 20px;">
          <div style="${BASE_STYLES.card}">
            <h2 style="${BASE_STYLES.heading}">Welcome back, ${data.name}! 🌟</h2>
            <p style="${BASE_STYLES.text}">Your license has been activated successfully. You now have full access to all features and services according to your plan.</p>

            <div style="${BASE_STYLES.highlight}">
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between;">
                  <span>Plan</span>
                  <span style="font-weight: 600">${data.plan}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Valid Until</span>
                  <span style="font-weight: 600">${formatDate(data.validUntil)}</span>
                </div>
              </div>
            </div>

            ${createSection("📊 Available Resources", `
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                  <span>Max Users</span>
                  <strong>${data.limits.maxUsers}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                  <span>Max Branches</span>
                  <strong>${data.limits.maxBranches}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                  <span>Storage Limit</span>
                  <strong>${Math.floor(data.limits.storageLimit / 1024)}GB</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                  <span>API Call Limit</span>
                  <strong>${data.limits.apiCallLimit.toLocaleString()}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                  <span>Integration Limit</span>
                  <strong>${data.limits.integrationLimit}</strong>
                </div>
              </div>
            `)}
          </div>
        </div>

        <div style="${BASE_STYLES.footer}">
          <p style="margin: 0 0 12px;">Ready to get started?</p>
          <div style="display: flex; justify-content: center; gap: 16px;">
            <a href="#" style="${BASE_STYLES.link}">Documentation</a>
            <a href="#" style="${BASE_STYLES.link}">API Guide</a>
            <a href="#" style="${BASE_STYLES.link}">Support</a>
          </div>
        </div>
      </div>
    </div>
`;

export const NewTask = (data: TaskEmailData): string => {
  const formatDeadline = (date: string) => {
    const deadlineDate = new Date(date);
    return deadlineDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityEmoji = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH': return '🔴';
      case 'MEDIUM': return '🟡';
      case 'LOW': return '🟢';
      default: return '⚪';
    }
  };

  const getTaskTypeEmoji = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'IN_PERSON_MEETING': return '👥';
      case 'VIRTUAL_MEETING': return '💻';
      case 'PHONE_CALL': return '📱';
      case 'EMAIL': return '📧';
      case 'DOCUMENT': return '📄';
      case 'RESEARCH': return '🔍';
      case 'DEVELOPMENT': return '💻';
      case 'DESIGN': return '🎨';
      case 'REVIEW': return '👀';
      default: return '📋';
    }
  };

  const subtasksList = data.subtasks?.length > 0 
    ? `<div style="${BASE_STYLES.card}">
        <div style="${BASE_STYLES.flexRow}">
          <span style="${BASE_STYLES.icon}">📝</span>
          <h3 style="${BASE_STYLES.heading}">Subtasks</h3>
        </div>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${data.subtasks.map((subtask, index) => `
            <li style="margin-bottom: 20px; padding: 20px; background: #faf5ff; border-radius: 12px;">
              <div style="${BASE_STYLES.flexRow}">
                <span style="color: #A855F7; margin-right: 16px; font-size: 18px; font-family: Unbounded, sans-serif;">${index + 1}</span>
                <div style="${BASE_STYLES.flexColumn}">
                  <strong style="color: #1f2937; font-family: Unbounded, sans-serif; font-size: 16px; margin-bottom: 8px;">${subtask.title}</strong>
                  ${subtask.description ? `<span style="font-size: 14px; color: #6b7280; font-family: Unbounded, sans-serif; line-height: 1.6;">${subtask.description}</span>` : ''}
                </div>
              </div>
            </li>
          `).join('')}
        </ul>
      </div>`
    : '';

  return `
    <div style="${BASE_STYLES.wrapper}">
      <div style="${BASE_STYLES.container}">
        <div style="${BASE_STYLES.header}">
          <div style="font-size: 56px; margin-bottom: 24px;">✨</div>
          <h1 style="margin: 0 0 12px; font-size: 28px; font-family: Unbounded, sans-serif; font-weight: 600;">New Task Assigned</h1>
          <p style="margin: 0; opacity: 0.9; font-family: Unbounded, sans-serif; font-size: 16px;">Task ID: ${data.taskId}</p>
        </div>

        <div style="padding: 32px 24px;">
          <div style="${BASE_STYLES.card}">
            <div style="${BASE_STYLES.flexRow}">
              <div style="${BASE_STYLES.icon}">${getTaskTypeEmoji(data.taskType)}</div>
              <h2 style="${BASE_STYLES.heading}">${data.title}</h2>
            </div>
            
            <div style="margin: 24px 0;">
              <span style="${BASE_STYLES.tag}">${getPriorityEmoji(data.priority)} ${data.priority}</span>
              <span style="${BASE_STYLES.tag}">${getTaskTypeEmoji(data.taskType)} ${data.taskType.replace(/_/g, ' ')}</span>
              <span style="${BASE_STYLES.tag}">🎯 ${data.status}</span>
            </div>

            <div style="${BASE_STYLES.highlight}">
              <p style="${BASE_STYLES.text}">${data.description}</p>
            </div>

            <hr style="${BASE_STYLES.divider}" />

            <div style="${BASE_STYLES.grid}">
              <div style="${BASE_STYLES.flexColumn}">
                <span style="color: #6b7280; font-size: 14px; font-family: Unbounded, sans-serif;">⏰ Deadline</span>
                <strong style="color: #1f2937; font-family: Unbounded, sans-serif; font-size: 16px; margin-top: 8px;">${formatDeadline(data.deadline)}</strong>
              </div>
              <div style="${BASE_STYLES.flexColumn}">
                <span style="color: #6b7280; font-size: 14px; font-family: Unbounded, sans-serif;">👤 Assigned by</span>
                <strong style="color: #1f2937; font-family: Unbounded, sans-serif; font-size: 16px; margin-top: 8px;">${data.assignedBy}</strong>
              </div>
            </div>
          </div>

          ${subtasksList}

          ${data.attachments?.length > 0 ? `
            <div style="${BASE_STYLES.card}">
              <div style="${BASE_STYLES.flexRow}">
                <span style="${BASE_STYLES.icon}">📎</span>
                <h3 style="${BASE_STYLES.heading}">Attachments</h3>
              </div>
              <div style="display: grid; gap: 16px;">
                ${data.attachments.map(attachment => `
                  <a href="${attachment.url}" style="${BASE_STYLES.flexRow}; padding: 16px; background: #faf5ff; border-radius: 12px; text-decoration: none;">
                    <span style="margin-right: 16px; font-size: 20px;">📄</span>
                    <span style="color: #A855F7; font-family: Unbounded, sans-serif;">${attachment.name}</span>
                  </a>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <div style="text-align: center; margin-top: 40px;">
            <a href="${process.env.FRONTEND_URL}/tasks/${data.taskId}" style="${BASE_STYLES.button}">
              View Task Details
            </a>
          </div>
        </div>

        <div style="${BASE_STYLES.footer}">
          <p style="margin: 0 0 20px; font-family: Unbounded, sans-serif;">Need help? Contact our support team</p>
          <div style="${BASE_STYLES.flexRow}; justify-content: center;">
            <a href="#" style="${BASE_STYLES.link}">Help Center</a>
            <span style="margin: 0 12px; color: #d1d5db;">•</span>
            <a href="#" style="${BASE_STYLES.link}">Support</a>
          </div>
        </div>
      </div>
    </div>
  `;
};

export const TaskUpdated = (data: TaskEmailData): string => {
  const formatDeadline = (date: string) => {
    const deadlineDate = new Date(date);
    return deadlineDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityEmoji = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH': return '🔴';
      case 'MEDIUM': return '🟡';
      case 'LOW': return '🟢';
      default: return '⚪';
    }
  };

  const getTaskTypeEmoji = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'IN_PERSON_MEETING': return '👥';
      case 'VIRTUAL_MEETING': return '💻';
      case 'PHONE_CALL': return '📱';
      case 'EMAIL': return '📧';
      case 'DOCUMENT': return '📄';
      case 'RESEARCH': return '🔍';
      case 'DEVELOPMENT': return '💻';
      case 'DESIGN': return '🎨';
      case 'REVIEW': return '👀';
      default: return '📋';
    }
  };

  const subtasksList = data.subtasks?.length > 0 
    ? `<div style="${BASE_STYLES.card}">
        <div style="${BASE_STYLES.flexRow}">
          <span style="${BASE_STYLES.icon}">📝</span>
          <h3 style="${BASE_STYLES.heading}">Subtasks</h3>
        </div>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${data.subtasks.map((subtask, index) => `
            <li style="margin-bottom: 12px; padding: 12px; background: #faf5ff; border-radius: 8px;">
              <div style="${BASE_STYLES.flexRow}">
                <span style="color: #A855F7; margin-right: 8px;">${index + 1}</span>
                <div style="${BASE_STYLES.flexColumn}">
                  <strong style="color: #1f2937;">${subtask.title}</strong>
                  ${subtask.description ? `<span style="font-size: 14px; color: #6b7280;">${subtask.description}</span>` : ''}
                  <span style="font-size: 12px; color: #A855F7; margin-top: 4px;">Status: ${subtask.status}</span>
                </div>
              </div>
            </li>
          `).join('')}
        </ul>
      </div>`
    : '';

  return `
    <div style="${BASE_STYLES.wrapper}">
      <div style="${BASE_STYLES.container}">
        <div style="${BASE_STYLES.header}">
          <div style="font-size: 48px; margin-bottom: 16px;">🔄</div>
          <h1 style="margin: 16px 0 8px; font-size: 24px;">Task Updated</h1>
          <p style="margin: 0; opacity: 0.9;">Task ID: ${data.taskId}</p>
        </div>

        <div style="padding: 24px 20px;">
          <div style="${BASE_STYLES.card}">
            <div style="${BASE_STYLES.flexRow}">
              <div style="${BASE_STYLES.icon}">${getTaskTypeEmoji(data.taskType)}</div>
              <h2 style="${BASE_STYLES.heading}">${data.title}</h2>
            </div>
            
            <div style="margin: 16px 0;">
              <span style="${BASE_STYLES.tag}">${getPriorityEmoji(data.priority)} ${data.priority}</span>
              <span style="${BASE_STYLES.tag}">${getTaskTypeEmoji(data.taskType)} ${data.taskType.replace(/_/g, ' ')}</span>
              <span style="${BASE_STYLES.tag}">🎯 ${data.status}</span>
            </div>

            <div style="${BASE_STYLES.highlight}">
              <p style="${BASE_STYLES.text}">${data.description}</p>
            </div>

            <hr style="${BASE_STYLES.divider}" />

            <div style="${BASE_STYLES.grid}">
              <div style="${BASE_STYLES.flexColumn}">
                <span style="color: #6b7280; font-size: 14px;">⏰ Deadline</span>
                <strong style="color: #1f2937;">${data.deadline ? formatDeadline(data.deadline) : 'No deadline set'}</strong>
              </div>
              <div style="${BASE_STYLES.flexColumn}">
                <span style="color: #6b7280; font-size: 14px;">👤 Last updated by</span>
                <strong style="color: #1f2937;">${data.assignedBy}</strong>
              </div>
            </div>
          </div>

          ${subtasksList}

          ${data.attachments?.length > 0 ? `
            <div style="${BASE_STYLES.card}">
              <div style="${BASE_STYLES.flexRow}">
                <span style="${BASE_STYLES.icon}">📎</span>
                <h3 style="${BASE_STYLES.heading}">Attachments</h3>
              </div>
              <div style="display: grid; gap: 12px;">
                ${data.attachments.map(attachment => `
                  <a href="${attachment.url}" style="${BASE_STYLES.flexRow}; padding: 12px; background: #faf5ff; border-radius: 8px; text-decoration: none;">
                    <span style="margin-right: 8px;">📄</span>
                    <span style="color: #A855F7;">${attachment.name}</span>
                  </a>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <div style="text-align: center; margin-top: 32px;">
            <a href="${process.env.FRONTEND_URL}/tasks/${data.taskId}" style="${BASE_STYLES.button}">
              View Updated Task
            </a>
          </div>
        </div>

        <div style="${BASE_STYLES.footer}">
          <p style="margin: 0 0 16px;">Need help? Contact our support team</p>
          <div style="${BASE_STYLES.flexRow}; justify-content: center;">
            <a href="#" style="${BASE_STYLES.link}">Help Center</a>
            <span style="margin: 0 8px;">•</span>
            <a href="#" style="${BASE_STYLES.link}">Support</a>
          </div>
        </div>
      </div>
    </div>
  `;
};

export const TaskReminderAssignee = (data: TaskReminderData): string => `
    <div style="${BASE_STYLES.wrapper}">
      <div style="${BASE_STYLES.container}">
        <div style="${BASE_STYLES.header}">
          <div style="font-size: 48px; margin-bottom: 16px;">⏰</div>
          <h1 style="margin: 16px 0 8px; font-size: 24px;">Task Deadline Approaching</h1>
          <p style="margin: 0; opacity: 0.9;">Action Required</p>
        </div>

        <div style="padding: 24px 20px;">
          <div style="${BASE_STYLES.card}">
            <h2 style="${BASE_STYLES.heading}">Hi ${data.name},</h2>
            <p style="${BASE_STYLES.text}">You have a task that requires your attention and is due in 30 minutes:</p>

            <div style="${BASE_STYLES.highlight}">
              <h3 style="margin: 0 0 16px;">${data.task.title}</h3>
              <p style="margin: 0 0 12px;"><strong>Description:</strong> ${data.task.description}</p>
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between;">
                  <span>Deadline</span>
                  <strong>${data.task.deadline}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Priority</span>
                  <strong style="color: ${
                    data.task.priority === 'HIGH' ? '#dc3545' : 
                    data.task.priority === 'MEDIUM' ? '#ffc107' : '#28a745'
                  }">${data.task.priority}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Status</span>
                  <strong>${data.task.status}</strong>
                </div>
              </div>
            </div>

            <div style="${BASE_STYLES.card}">
              <h3 style="${BASE_STYLES.heading}">Progress</h3>
              <div style="background: #e9ecef; border-radius: 10px; padding: 3px;">
                <div style="background: #0d6efd; border-radius: 8px; padding: 8px; color: white; text-align: center; width: ${data.task.progress}%">
                  ${data.task.progress}%
                </div>
              </div>
            </div>

            ${data.task.subtasks?.length ? `
              <div style="${BASE_STYLES.card}">
                <h3 style="${BASE_STYLES.heading}">Subtasks</h3>
                <ul style="list-style: none; padding: 0; margin: 0;">
                  ${data.task.subtasks.map(st => `
                    <li style="padding: 12px; background: #f7fafc; border-radius: 8px; margin-bottom: 8px;">
                      ${st.title} - ${st.status}
                    </li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}
          </div>

          <div style="${BASE_STYLES.alert}">
            <p style="margin: 0;"><strong>Action Required:</strong> Please complete your assigned work before the deadline.</p>
            <p style="margin: 8px 0 0;">Task assigned by: ${data.task.creator.name}</p>
          </div>
        </div>

        <div style="${BASE_STYLES.footer}">
          <p style="margin: 0;">This is an automated reminder. For questions, please contact your task creator directly.</p>
        </div>
      </div>
    </div>
`;

export const TaskReminderCreator = (data: TaskReminderData): string => {
  return `
    <div style="${BASE_STYLES.wrapper}">
      <div style="${BASE_STYLES.container}">
        <div style="${BASE_STYLES.header}">
          <div style="font-size: 48px; margin-bottom: 16px;">🔔</div>
          <h1 style="margin: 16px 0 8px; font-size: 24px;">Task Deadline Alert</h1>
          <p style="margin: 0; opacity: 0.9;">Creator Notice</p>
        </div>

        <div style="padding: 24px 20px;">
          <div style="${BASE_STYLES.card}">
            <h2 style="${BASE_STYLES.heading}">Hi ${data.name},</h2>
            <p style="${BASE_STYLES.text}">A task you created is approaching its deadline in 30 minutes:</p>

            <div style="${BASE_STYLES.highlight}">
              <h3 style="margin: 0 0 16px;">${data.task.title}</h3>
              <p style="margin: 0 0 12px;"><strong>Description:</strong> ${data.task.description}</p>
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between;">
                  <span>Deadline</span>
                  <strong>${data.task.deadline}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Priority</span>
                  <strong style="color: ${
                    data.task.priority === 'HIGH' ? '#dc3545' : 
                    data.task.priority === 'MEDIUM' ? '#ffc107' : '#28a745'
                  }">${data.task.priority}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Status</span>
                  <strong>${data.task.status}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Progress</span>
                  <strong>${data.task.progress}%</strong>
                </div>
              </div>
            </div>

            <div style="${BASE_STYLES.card}">
              <h3 style="${BASE_STYLES.heading}">Assignees</h3>
              <div style="display: grid; gap: 8px;">
                ${data.task.assignees.map(assignee => `
                  <div style="padding: 12px; background: #f7fafc; border-radius: 8px;">
                    <strong>${assignee.name}</strong>
                    <div style="color: #666; font-size: 14px;">${assignee.email}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            ${data.task.subtasks?.length ? `
              <div style="${BASE_STYLES.card}">
                <h3 style="${BASE_STYLES.heading}">Subtasks Status</h3>
                <ul style="list-style: none; padding: 0; margin: 0;">
                  ${data.task.subtasks.map(st => `
                    <li style="padding: 12px; background: #f7fafc; border-radius: 8px; margin-bottom: 8px;">
                      ${st.title} - ${st.status}
                    </li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}
          </div>

          <div style="${BASE_STYLES.alert}">
            <p style="margin: 0;"><strong>Note:</strong> All assignees have been notified of the approaching deadline.</p>
          </div>
        </div>

        <div style="${BASE_STYLES.footer}">
          <p style="margin: 0;">This is an automated reminder. You're receiving this as the task creator.</p>
        </div>
      </div>
    </div>
  `;
};