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
} from '../types/email-templates.types';
import { formatDate } from '../utils/date.utils';

const BASE_STYLES = {
	wrapper:
		'@media (max-width: 600px) { width: 100% !important; padding: 10px !important; } width: 100%; padding: 20px; background-color: #f9fafb;',
	container:
		'max-width: 600px; margin: 0 auto; font-family: "Unbounded", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);',
	button: 'display: inline-block; padding: 16px 32px; background-color: #A855F7; color: white; text-decoration: none; border-radius: 12px; font-weight: 600; text-align: center; transition: all 0.2s; box-shadow: 0 4px 6px rgba(168, 85, 247, 0.2); font-family: "Unbounded", sans-serif;',
	header: 'background-color: #A855F7; color: white; padding: 40px 20px; text-align: center; border-radius: 0;',
	footer: 'background-color: #ffffff; padding: 32px 20px; text-align: center; margin-top: 32px; color: #6c757d; border-top: 1px solid #f3f4f6;',
	alert: 'background-color: #faf5ff; border-left: 4px solid #A855F7; padding: 20px; margin: 24px 0; border-radius: 8px;',
	card: 'background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); padding: 32px; margin: 24px 0; border: 1px solid #f3f4f6;',
	heading:
		'margin: 0 0 20px; color: #A855F7; font-size: 22px; font-weight: 600; font-family: "Unbounded", sans-serif;',
	text: 'margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.8; font-family: "Unbounded", sans-serif;',
	link: 'color: #A855F7; text-decoration: none; font-weight: 500; transition: color 0.2s; margin: 0 12px; font-family: "Unbounded", sans-serif;',
	grid: 'display: grid; grid-template-columns: 1fr; gap: 24px; @media (min-width: 480px) { grid-template-columns: 1fr 1fr; }',
	highlight:
		'background: #faf5ff; border-radius: 12px; padding: 24px; margin-bottom: 32px; border: 1px solid #e9d5ff;',
	badge: 'display: inline-block; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500; background-color: #A855F7; color: white; font-family: "Unbounded", sans-serif;',
	divider: 'border: 0; border-top: 1px solid #f3f4f6; margin: 32px 0;',
	icon: 'display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: #faf5ff; border-radius: 50%; margin-right: 16px; font-size: 20px;',
	flexRow: 'display: flex; align-items: center;',
	flexColumn: 'display: flex; flex-direction: column; gap: 8px;',
	tag: 'display: inline-block; padding: 6px 12px; border-radius: 8px; font-size: 14px; font-weight: 500; background: #faf5ff; color: #A855F7; margin: 0 12px 12px 0; font-family: "Unbounded", sans-serif;',
	subheading:
		'margin: 0 0 16px; color: #A855F7; font-size: 18px; font-weight: 600; font-family: "Unbounded", sans-serif;',
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
            <p style="${BASE_STYLES.text}">Thank you for choosing Pulse. Your account has been created successfully!</p>
            
            <div style="text-align: center; margin: 24px 0;">
              <a href="${data.webAppLink || '/sign-in'}" style="${BASE_STYLES.button}">
                Sign In Now
              </a>
            </div>

            ${
				data.mobileAppLink
					? `
            <div style="${BASE_STYLES.alert}">
              <p style="margin: 0;">
                <strong>Mobile App:</strong> You can also access your account on our mobile app.
                <a href="${data.mobileAppLink}" style="color: #A855F7; font-weight: 500;">Download now</a>
              </p>
            </div>
            `
					: ''
			}
          </div>

          ${createSection(
				'🔐 Security Tips',
				`
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
          `,
			)}
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
	const itemsList = data.quotationItems
		.map(
			(item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${item.quantity}x</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
        <div style="font-weight: 500;">${item.product.name}</div>
        <div style="font-size: 12px; color: #666;">Code: ${item.product.code}</div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">${new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: data.currency,
		}).format(item.totalPrice)}</td>
    </tr>
  `,
		)
		.join('');

	// Generate approve/decline URLs if reviewUrl is available
	const approveUrl = data.reviewUrl ? `${data.reviewUrl}&action=approve` : '';
	const declineUrl = data.reviewUrl ? `${data.reviewUrl}&action=decline` : '';

	return `
    <div style="${BASE_STYLES.wrapper}">
      <div style="${BASE_STYLES.container}">
        <div style="${BASE_STYLES.header}">
          <h1 style="margin: 16px 0 8px; font-size: 24px; font-family: Unbounded, sans-serif; font-weight: 600;">Quotation Generated</h1>
          <p style="margin: 0; opacity: 0.9;">Reference: ${data.quotationId}</p>
        </div>

        <div style="padding: 24px 20px;">
          <div style="${BASE_STYLES.card}">
            <h2 style="${BASE_STYLES.heading}">Dear ${data.name},</h2>
            <p style="${
				BASE_STYLES.text
			}">Thank you for your interest in our products. We are pleased to provide you with the following quotation:</p>
            
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
                    <td style="padding: 12px; text-align: right; font-weight: 600;">${new Intl.NumberFormat('en-US', {
						style: 'currency',
						currency: data.currency,
					}).format(data.total)}</td>
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
            <h3 style="${BASE_STYLES.heading}">Your Decision</h3>
            <p style="${BASE_STYLES.text}">Please review this quotation and choose one of the following options:</p>
            
            <div style="text-align: center; margin: 32px 0;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center" style="border-radius: 8px;" bgcolor="#10b981">
                          <a href="${approveUrl}" target="_blank" style="${
		BASE_STYLES.button
	}; background-color: #10b981; color: white; font-weight: 600; padding: 12px 24px; font-size: 16px; text-decoration: none; display: inline-block; border-radius: 8px;">
                            APPROVE
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td width="20">&nbsp;</td>
                  <td>
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center" style="border-radius: 8px;" bgcolor="#ef4444">
                          <a href="${declineUrl}" target="_blank" style="${
		BASE_STYLES.button
	}; background-color: #ef4444; color: white; font-weight: 600; padding: 12px 24px; font-size: 16px; text-decoration: none; display: inline-block; border-radius: 8px;">
                            DECLINE
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td width="20">&nbsp;</td>
                  <td>
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center" style="border-radius: 8px;" bgcolor="#6b7280">
                          <a href="${data.reviewUrl}" target="_blank" style="${
		BASE_STYLES.button
	}; background-color: #6b7280; color: white; font-weight: 600; padding: 12px 24px; font-size: 16px; text-decoration: none; display: inline-block; border-radius: 8px;">
                            REVIEW DETAILS
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">Click the appropriate button above to respond to this quotation</p>
            </div>
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
	const itemsList = data.quotationItems
		.map(
			(item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${item.quantity}x</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${item.product.uid}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">${new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: data.currency,
		}).format(item.totalPrice)}</td>
    </tr>
  `,
		)
		.join('');

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
                <span style="background: ${
					data.priority === 'high' ? '#fed7d7' : data.priority === 'medium' ? '#fefcbf' : '#e6fffa'
				}; 
                             color: ${
									data.priority === 'high'
										? '#c53030'
										: data.priority === 'medium'
										? '#b7791f'
										: '#2c7a7b'
								}; 
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
                    <td style="padding: 12px; text-align: right; font-weight: 600;">${new Intl.NumberFormat('en-US', {
						style: 'currency',
						currency: data.currency,
					}).format(data.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            ${
				data.notes
					? `
              <div style="${BASE_STYLES.alert}">
                <p style="margin: 0; font-weight: 500;">Additional Notes:</p>
                <p style="margin: 8px 0 0;">${data.notes}</p>
              </div>
            `
					: ''
			}
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
	const itemsList = data.quotationItems
		.map(
			(item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${item.quantity}x</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${item.product.uid}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">${new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: data.currency,
		}).format(item.totalPrice)}</td>
    </tr>
  `,
		)
		.join('');

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
                    <td style="padding: 12px; text-align: right; font-weight: 600;">${new Intl.NumberFormat('en-US', {
						style: 'currency',
						currency: data.currency,
					}).format(data.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style="${BASE_STYLES.highlight}">
              <h4 style="margin: 0 0 8px; color: #4a5568;">Commission Details</h4>
              <p style="margin: 0;">
                <strong>Reseller Code:</strong> ${data.resellerCode}<br>
                <strong>Commission Amount:</strong> ${new Intl.NumberFormat('en-US', {
					style: 'currency',
					currency: data.currency,
				}).format(data.resellerCommission)}
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
	const itemsList = data.quotationItems
		.map(
			(item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-family: 'Unbounded', sans-serif;">${
			item.quantity
		}x</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-family: 'Unbounded', sans-serif;">
        <div style="font-weight: 500; font-family: 'Unbounded', sans-serif;">${item.product.name}</div>
        <div style="font-size: 12px; color: #666; font-family: 'Unbounded', sans-serif;">Code: ${
			item.product.code
		}</div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: 'Unbounded', sans-serif;">${new Intl.NumberFormat(
			'en-US',
			{ style: 'currency', currency: data.currency },
		).format(item.totalPrice)}</td>
    </tr>
  `,
		)
		.join('');

	// Get status information
	const statusInfo = {
		pending: {
			title: 'Pending Review',
			description: 'Your quotation is currently being reviewed by our team.',
			color: '#A855F7', // Purple color (matching the header)
			next: 'Our team will process your quotation shortly.',
		},
		inprogress: {
			title: 'In Progress',
			description: 'Your quotation is currently being processed.',
			color: '#A855F7', // Purple color (matching the header)
			next: "We're working on preparing your order based on the quotation.",
		},
		approved: {
			title: 'Approved',
			description: 'Your quotation has been approved.',
			color: '#A855F7', // Purple color (matching the header)
			next: "We'll be in touch soon to arrange delivery or collection details.",
		},
		rejected: {
			title: 'Not Approved',
			description: 'Unfortunately, your quotation could not be approved at this time.',
			color: '#A855F7', // Purple color (matching the header)
			next: 'Please contact our customer service for more information.',
		},
		completed: {
			title: 'Completed',
			description: 'Your order has been successfully completed.',
			color: '#A855F7', // Purple color (matching the header)
			next: 'Thank you for your business!',
		},
		cancelled: {
			title: 'Cancelled',
			description: 'Your quotation has been cancelled as requested.',
			color: '#A855F7', // Purple color (matching the header)
			next: 'If you wish to place a new order, please create a new quotation.',
		},
		postponed: {
			title: 'Postponed',
			description: 'Your quotation has been temporarily postponed.',
			color: '#A855F7', // Purple color (matching the header)
			next: "We'll contact you with additional information about next steps.",
		},
		outfordelivery: {
			title: 'Out for Delivery',
			description: 'Your order is now out for delivery.',
			color: '#A855F7', // Purple color (matching the header)
			next: 'You should receive your items shortly.',
		},
		delivered: {
			title: 'Delivered',
			description: 'Your order has been delivered successfully.',
			color: '#A855F7', // Purple color (matching the header)
			next: 'We hope you enjoy your purchase!',
		},
		sourcing: {
			title: 'Sourcing',
			description: 'We are currently sourcing the items from your quotation.',
			color: '#A855F7', // Purple color (matching the header)
			next: "Once all items are sourced, we'll move to the packing phase.",
		},
		packing: {
			title: 'Packing',
			description: 'Your order is currently being packed.',
			color: '#A855F7', // Purple color (matching the header)
			next: 'Once packing is complete, your order will move to fulfillment.',
		},
		in_fulfillment: {
			title: 'In Fulfillment',
			description: 'Your order is now in the fulfillment process.',
			color: '#A855F7', // Purple color (matching the header)
			next: "We're preparing your order for shipping or pickup.",
		},
		paid: {
			title: 'Paid',
			description: "We've received payment for your order.",
			color: '#A855F7', // Purple color (matching the header)
			next: 'Your order will be prepared for delivery soon.',
		},
		returned: {
			title: 'Returned',
			description: 'Your order has been marked as returned.',
			color: '#A855F7', // Purple color (matching the header)
			next: 'Our team will process the return and contact you regarding next steps.',
		},
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
            <p style="${
				BASE_STYLES.text
			}">This is to inform you that the status of your quotation has been updated to:</p>
            
            <div style="${BASE_STYLES.highlight}">
              <div style="display: inline-block; width: 100%; text-align: center;">
                <div style="display: inline-block; padding: 8px 24px; border-radius: 16px; background-color: #faf5ff; color: #A855F7; font-weight: 600; font-family: 'Unbounded', sans-serif; margin-bottom: 12px;">
                  ${statusDisplay.title}
                </div>
              </div>
              <p style="margin: 12px 0 0; color: #4b5563; font-family: 'Unbounded', sans-serif; text-align: center; font-size: 15px;">${
					statusDisplay.description
				}</p>
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
                    <td style="padding: 12px; text-align: right; font-weight: 600; font-family: 'Unbounded', sans-serif;">${new Intl.NumberFormat(
						'en-US',
						{ style: 'currency', currency: data.currency },
					).format(data.total)}</td>
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

	const xpSection = xp
		? `
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
  `
		: '';

	const attendanceSection = attendance
		? `
    <div style="${BASE_STYLES.card}">
      <h3 style="${BASE_STYLES.heading}">⏰ Today's Schedule</h3>
      <div style="display: grid; gap: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f7fafc; border-radius: 8px;">
          <span>Status</span>
          <strong style="color: ${attendance.status === 'PRESENT' ? '#48bb78' : '#a0aec0'}">${
				attendance.status
		  }</strong>
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
  `
		: '';

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

	const userMetricsSection = userSpecific
		? `
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
  `
		: '';

	const trackingSection = tracking
		? `
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
        ${tracking.locations
			.map(
				(location) => `
          <div style="padding: 12px; background: #f7fafc; border-radius: 8px;">
            <div style="font-weight: 500; margin-bottom: 4px;">${location.address}</div>
            <div style="color: #718096; font-size: 14px;">Time spent: ${location.timeSpent}</div>
                </div>
              `,
			)
			.join('')}
            </div>
          </div>
  `
		: '';

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
            <p style="${
				BASE_STYLES.text
			}">Your new license has been created successfully. Here are your license details:</p>

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

            ${createSection(
				'📊 License Limits',
				`
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
            `,
			)}
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
            <p style="${
				BASE_STYLES.text
			}">Your license has been updated successfully. Here are your current license details:</p>

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

            ${createSection(
				'📊 Updated License Limits',
				`
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
            `,
			)}
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

            ${createSection(
				'📈 Next Steps',
				`
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
            `,
			)}
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
            <p style="${
				BASE_STYLES.text
			}">Your license has been renewed successfully. Here are your updated license details:</p>

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

            ${createSection(
				'📊 License Limits',
				`
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
            `,
			)}
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
            <p style="${
				BASE_STYLES.text
			}">Your license has been suspended. Please contact support immediately to resolve this issue.</p>

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

            ${createSection(
				'⚡ Next Steps',
				`
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
            `,
			)}
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
            <p style="${
				BASE_STYLES.text
			}">Your license has been activated successfully. You now have full access to all features and services according to your plan.</p>

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

            ${createSection(
				'📊 Available Resources',
				`
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
            `,
			)}
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
			minute: '2-digit',
		});
	};

	const getPriorityEmoji = (priority: string) => {
		switch (priority?.toUpperCase()) {
			case 'HIGH':
				return '🔴';
			case 'MEDIUM':
				return '🟡';
			case 'LOW':
				return '🟢';
			default:
				return '⚪';
		}
	};

	const getTaskTypeEmoji = (type: string) => {
		switch (type?.toUpperCase()) {
			case 'IN_PERSON_MEETING':
				return '👥';
			case 'VIRTUAL_MEETING':
				return '💻';
			case 'PHONE_CALL':
				return '📱';
			case 'EMAIL':
				return '📧';
			case 'DOCUMENT':
				return '📄';
			case 'RESEARCH':
				return '🔍';
			case 'DEVELOPMENT':
				return '💻';
			case 'DESIGN':
				return '🎨';
			case 'REVIEW':
				return '👀';
			default:
				return '📋';
		}
	};

	const subtasksList =
		data.subtasks?.length > 0
			? `<div style="${BASE_STYLES.card}">
        <div style="${BASE_STYLES.flexRow}">
          <span style="${BASE_STYLES.icon}">📝</span>
          <h3 style="${BASE_STYLES.heading}">Subtasks</h3>
        </div>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${data.subtasks
				.map(
					(subtask, index) => `
            <li style="margin-bottom: 20px; padding: 20px; background: #faf5ff; border-radius: 12px;">
              <div style="${BASE_STYLES.flexRow}">
                <span style="color: #A855F7; margin-right: 16px; font-size: 18px; font-family: Unbounded, sans-serif;">${
					index + 1
				}</span>
                <div style="${BASE_STYLES.flexColumn}">
                  <strong style="color: #1f2937; font-family: Unbounded, sans-serif; font-size: 16px; margin-bottom: 8px;">${
						subtask.title
					}</strong>
                  ${
						subtask.description
							? `<span style="font-size: 14px; color: #6b7280; font-family: Unbounded, sans-serif; line-height: 1.6;">${subtask.description}</span>`
							: ''
					}
                </div>
              </div>
            </li>
          `,
				)
				.join('')}
        </ul>
      </div>`
			: '';

	return `
    <div style="${BASE_STYLES.wrapper}">
      <div style="${BASE_STYLES.container}">
        <div style="${BASE_STYLES.header}">
          <div style="font-size: 56px; margin-bottom: 24px;">✨</div>
          <h1 style="margin: 0 0 12px; font-size: 28px; font-family: Unbounded, sans-serif; font-weight: 600;">New Task Assigned</h1>
          <p style="margin: 0; opacity: 0.9; font-family: Unbounded, sans-serif; font-size: 16px;">Task ID: ${
				data.taskId
			}</p>
        </div>

        <div style="padding: 32px 24px;">
          <div style="${BASE_STYLES.card}">
            <div style="${BASE_STYLES.flexRow}">
              <div style="${BASE_STYLES.icon}">${getTaskTypeEmoji(data.taskType)}</div>
              <h2 style="${BASE_STYLES.heading}">${data.title}</h2>
            </div>
            
            <div style="margin: 24px 0;">
              <span style="${BASE_STYLES.tag}">${getPriorityEmoji(data.priority)} ${data.priority}</span>
              <span style="${BASE_STYLES.tag}">${getTaskTypeEmoji(data.taskType)} ${data.taskType.replace(
		/_/g,
		' ',
	)}</span>
              <span style="${BASE_STYLES.tag}">🎯 ${data.status}</span>
            </div>

            <div style="${BASE_STYLES.highlight}">
              <p style="${BASE_STYLES.text}">${data.description}</p>
            </div>

            <hr style="${BASE_STYLES.divider}" />

            <div style="${BASE_STYLES.grid}">
              <div style="${BASE_STYLES.flexColumn}">
                <span style="color: #6b7280; font-size: 14px; font-family: Unbounded, sans-serif;">⏰ Deadline</span>
                <strong style="color: #1f2937; font-family: Unbounded, sans-serif; font-size: 16px; margin-top: 8px;">${formatDeadline(
					data.deadline,
				)}</strong>
              </div>
              <div style="${BASE_STYLES.flexColumn}">
                <span style="color: #6b7280; font-size: 14px; font-family: Unbounded, sans-serif;">👤 Assigned by</span>
                <strong style="color: #1f2937; font-family: Unbounded, sans-serif; font-size: 16px; margin-top: 8px;">${
					data.assignedBy
				}</strong>
              </div>
            </div>
          </div>

          ${subtasksList}

          ${
				data.attachments?.length > 0
					? `
            <div style="${BASE_STYLES.card}">
              <div style="${BASE_STYLES.flexRow}">
                <span style="${BASE_STYLES.icon}">📎</span>
                <h3 style="${BASE_STYLES.heading}">Attachments</h3>
              </div>
              <div style="display: grid; gap: 16px;">
                ${data.attachments
					.map(
						(attachment) => `
                  <a href="${attachment.url}" style="${BASE_STYLES.flexRow}; padding: 16px; background: #faf5ff; border-radius: 12px; text-decoration: none;">
                    <span style="margin-right: 16px; font-size: 20px;">📄</span>
                    <span style="color: #A855F7; font-family: Unbounded, sans-serif;">${attachment.name}</span>
                  </a>
                `,
					)
					.join('')}
              </div>
            </div>
          `
					: ''
			}

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
			minute: '2-digit',
		});
	};

	const getPriorityEmoji = (priority: string) => {
		switch (priority?.toUpperCase()) {
			case 'HIGH':
				return '🔴';
			case 'MEDIUM':
				return '🟡';
			case 'LOW':
				return '🟢';
			default:
				return '⚪';
		}
	};

	const getTaskTypeEmoji = (type: string) => {
		switch (type?.toUpperCase()) {
			case 'IN_PERSON_MEETING':
				return '👥';
			case 'VIRTUAL_MEETING':
				return '💻';
			case 'PHONE_CALL':
				return '📱';
			case 'EMAIL':
				return '📧';
			case 'DOCUMENT':
				return '📄';
			case 'RESEARCH':
				return '🔍';
			case 'DEVELOPMENT':
				return '💻';
			case 'DESIGN':
				return '🎨';
			case 'REVIEW':
				return '👀';
			default:
				return '📋';
		}
	};

	const subtasksList =
		data.subtasks?.length > 0
			? `<div style="${BASE_STYLES.card}">
        <div style="${BASE_STYLES.flexRow}">
          <span style="${BASE_STYLES.icon}">📝</span>
          <h3 style="${BASE_STYLES.heading}">Subtasks</h3>
        </div>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${data.subtasks
				.map(
					(subtask, index) => `
            <li style="margin-bottom: 12px; padding: 12px; background: #faf5ff; border-radius: 8px;">
              <div style="${BASE_STYLES.flexRow}">
                <span style="color: #A855F7; margin-right: 8px;">${index + 1}</span>
                <div style="${BASE_STYLES.flexColumn}">
                  <strong style="color: #1f2937;">${subtask.title}</strong>
                  ${
						subtask.description
							? `<span style="font-size: 14px; color: #6b7280;">${subtask.description}</span>`
							: ''
					}
                  <span style="font-size: 12px; color: #A855F7; margin-top: 4px;">Status: ${subtask.status}</span>
                </div>
              </div>
            </li>
          `,
				)
				.join('')}
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
              <span style="${BASE_STYLES.tag}">${getTaskTypeEmoji(data.taskType)} ${data.taskType.replace(
		/_/g,
		' ',
	)}</span>
              <span style="${BASE_STYLES.tag}">🎯 ${data.status}</span>
            </div>

            <div style="${BASE_STYLES.highlight}">
              <p style="${BASE_STYLES.text}">${data.description}</p>
            </div>

            <hr style="${BASE_STYLES.divider}" />

            <div style="${BASE_STYLES.grid}">
              <div style="${BASE_STYLES.flexColumn}">
                <span style="color: #6b7280; font-size: 14px;">⏰ Deadline</span>
                <strong style="color: #1f2937;">${
					data.deadline ? formatDeadline(data.deadline) : 'No deadline set'
				}</strong>
              </div>
              <div style="${BASE_STYLES.flexColumn}">
                <span style="color: #6b7280; font-size: 14px;">👤 Last updated by</span>
                <strong style="color: #1f2937;">${data.assignedBy}</strong>
              </div>
            </div>
          </div>

          ${subtasksList}

          ${
				data.attachments?.length > 0
					? `
            <div style="${BASE_STYLES.card}">
              <div style="${BASE_STYLES.flexRow}">
                <span style="${BASE_STYLES.icon}">📎</span>
                <h3 style="${BASE_STYLES.heading}">Attachments</h3>
              </div>
              <div style="display: grid; gap: 12px;">
                ${data.attachments
					.map(
						(attachment) => `
                  <a href="${attachment.url}" style="${BASE_STYLES.flexRow}; padding: 12px; background: #faf5ff; border-radius: 8px; text-decoration: none;">
                    <span style="margin-right: 8px;">📄</span>
                    <span style="color: #A855F7;">${attachment.name}</span>
                  </a>
                `,
					)
					.join('')}
              </div>
            </div>
          `
					: ''
			}

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
						data.task.priority === 'HIGH'
							? '#dc3545'
							: data.task.priority === 'MEDIUM'
							? '#ffc107'
							: '#28a745'
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
                <div style="background: #0d6efd; border-radius: 8px; padding: 8px; color: white; text-align: center; width: ${
					data.task.progress
				}%">
                  ${data.task.progress}%
                </div>
              </div>
            </div>

            ${
				data.task.subtasks?.length
					? `
              <div style="${BASE_STYLES.card}">
                <h3 style="${BASE_STYLES.heading}">Subtasks</h3>
                <ul style="list-style: none; padding: 0; margin: 0;">
                  ${data.task.subtasks
						.map(
							(st) => `
                    <li style="padding: 12px; background: #f7fafc; border-radius: 8px; margin-bottom: 8px;">
                      ${st.title} - ${st.status}
                    </li>
                  `,
						)
						.join('')}
                </ul>
              </div>
            `
					: ''
			}
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
						data.task.priority === 'HIGH'
							? '#dc3545'
							: data.task.priority === 'MEDIUM'
							? '#ffc107'
							: '#28a745'
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
                ${data.task.assignees
					.map(
						(assignee) => `
                  <div style="padding: 12px; background: #f7fafc; border-radius: 8px;">
                    <strong>${assignee.name}</strong>
                    <div style="color: #666; font-size: 14px;">${assignee.email}</div>
                  </div>
                `,
					)
					.join('')}
              </div>
            </div>

            ${
				data.task.subtasks?.length
					? `
              <div style="${BASE_STYLES.card}">
                <h3 style="${BASE_STYLES.heading}">Subtasks Status</h3>
                <ul style="list-style: none; padding: 0; margin: 0;">
                  ${data.task.subtasks
						.map(
							(st) => `
                    <li style="padding: 12px; background: #f7fafc; border-radius: 8px; margin-bottom: 8px;">
                      ${st.title} - ${st.status}
                    </li>
                  `,
						)
						.join('')}
                </ul>
              </div>
            `
					: ''
			}
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

export const NewUserAdminNotification = (data: NewUserAdminNotificationData): string => `
    <div style="${BASE_STYLES.wrapper}">
      <div style="${BASE_STYLES.container}">
        <div style="${BASE_STYLES.header}">
          <h1 style="margin: 16px 0 8px; font-size: 24px;">New User Registration 👤</h1>
          <p style="margin: 0; opacity: 0.9;">Administrator Notification</p>
        </div>

        <div style="padding: 24px 20px;">
          <div style="${BASE_STYLES.card}">
            <h2 style="${BASE_STYLES.heading}">Hello ${data.name},</h2>
            <p style="${BASE_STYLES.text}">A new user has registered on the platform. Here are the details:</p>
            
            <div style="${BASE_STYLES.highlight}">
              <div style="${BASE_STYLES.flexColumn}">
                <div style="${BASE_STYLES.flexRow}">
                  <strong style="width: 120px;">User Name:</strong>
                  <span>${data.newUserName}</span>
                </div>
                <div style="${BASE_STYLES.flexRow}">
                  <strong style="width: 120px;">Email:</strong>
                  <span>${data.newUserEmail}</span>
                </div>
                <div style="${BASE_STYLES.flexRow}">
                  <strong style="width: 120px;">Signup Time:</strong>
                  <span>${data.signupTime}</span>
                </div>
              </div>
            </div>
            
            <div style="text-align: center; margin: 24px 0;">
              <a href="${data.userDetailsLink}" style="${BASE_STYLES.button}">
                View User Details
              </a>
            </div>

            <div style="${BASE_STYLES.alert}">
              <p style="margin: 0;">
                <strong>Note:</strong> You're receiving this notification as an administrator.
                No action is required unless you identify suspicious activity.
              </p>
            </div>
          </div>
        </div>

        <div style="${BASE_STYLES.footer}">
          <p style="margin: 0;">This is an automated message. Please do not reply directly to this email.</p>
        </div>
      </div>
    </div>
`;

export const TaskCompleted = (data: TaskCompletedEmailData): string => {
	const formatDeadline = (date: string) => {
		if (!date) return 'No deadline set';
		try {
			const dateObj = new Date(date);
			return dateObj.toLocaleString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			});
		} catch (e) {
			return date;
		}
	};

	const getPriorityEmoji = (priority: string) => {
		switch (priority.toUpperCase()) {
			case 'HIGH':
				return '🔴';
			case 'MEDIUM':
				return '🟠';
			case 'LOW':
				return '🟢';
			default:
				return '⚪';
		}
	};

	const getTaskTypeEmoji = (type: string) => {
		switch (type.toUpperCase()) {
			case 'INSTALLATION':
				return '🔧';
			case 'REPAIR':
				return '🛠️';
			case 'MAINTENANCE':
				return '🔩';
			case 'INSPECTION':
				return '🔍';
			case 'CONSULTATION':
				return '💬';
			case 'DELIVERY':
				return '📦';
			case 'MEETING':
				return '👥';
			case 'TRAINING':
				return '📚';
			case 'OTHER':
				return '📝';
			default:
				return '📋';
		}
	};

	const jobCardsList =
		data.jobCards && data.jobCards.length > 0
			? `
    <div style="${BASE_STYLES.card}">
      <h3 style="margin: 0 0 16px; color: #374151; font-size: 16px;">Job Cards</h3>
      <ul style="list-style: none; padding: 0; margin: 0;">
        ${data.jobCards
			.map(
				(card) => `
          <li style="margin-bottom: 12px;">
            <a href="${card.url}" style="${BASE_STYLES.button}" target="_blank">
              View ${card.name}
            </a>
          </li>
        `,
			)
			.join('')}
      </ul>
    </div>
  `
			: '';

	const subtasksList =
		data.subtasks && data.subtasks.length > 0
			? `
    <div style="${BASE_STYLES.card}">
      <h3 style="margin: 0 0 16px; color: #374151; font-size: 16px;">Completed Work</h3>
      <ul style="list-style: none; padding: 0; margin: 0;">
        ${data.subtasks
			.map(
				(subtask) => `
          <li style="padding: 12px; background: #f7fafc; border-radius: 8px; margin-bottom: 8px;">
            <div style="font-weight: 600;">${subtask.title}</div>
            ${
				subtask.description
					? `<div style="font-size: 14px; color: #64748b; margin-top: 4px;">${subtask.description}</div>`
					: ''
			}
          </li>
        `,
			)
			.join('')}
      </ul>
    </div>
  `
			: '';

	return `
    <div style="${BASE_STYLES.wrapper}">
      <div style="${BASE_STYLES.container}">
        <div style="${BASE_STYLES.header}">
          <div style="font-size: 56px; margin-bottom: 24px;">✅</div>
          <h1 style="margin: 0 0 12px; font-size: 28px; font-family: Unbounded, sans-serif; font-weight: 600;">Task Completed</h1>
          <p style="margin: 0; opacity: 0.9; font-family: Unbounded, sans-serif; font-size: 16px;">Task ID: ${
				data.taskId
			}</p>
        </div>

        <div style="padding: 32px 24px;">
          <div style="${BASE_STYLES.card}">
            <div style="${BASE_STYLES.flexRow}">
              <div style="${BASE_STYLES.icon}">${getTaskTypeEmoji(data.taskType)}</div>
              <h2 style="${BASE_STYLES.heading}">${data.title}</h2>
            </div>
            
            <div style="margin: 24px 0;">
              <span style="${BASE_STYLES.tag}">${getPriorityEmoji(data.priority)} ${data.priority}</span>
              <span style="${BASE_STYLES.tag}">${getTaskTypeEmoji(data.taskType)} ${data.taskType.replace(
		/_/g,
		' ',
	)}</span>
              <span style="${BASE_STYLES.tag}">✅ COMPLETED</span>
            </div>

            <div style="${BASE_STYLES.highlight}">
              <p style="${BASE_STYLES.text}">${data.description}</p>
            </div>

            <hr style="${BASE_STYLES.divider}" />

            <div style="${BASE_STYLES.grid}">
              <div style="${BASE_STYLES.flexColumn}">
                <span style="color: #6b7280; font-size: 14px; font-family: Unbounded, sans-serif;">⏰ Completed On</span>
                <strong style="color: #1f2937; font-family: Unbounded, sans-serif; font-size: 16px; margin-top: 8px;">${formatDeadline(
					data.completionDate,
				)}</strong>
              </div>
              <div style="${BASE_STYLES.flexColumn}">
                <span style="color: #6b7280; font-size: 14px; font-family: Unbounded, sans-serif;">👤 Completed by</span>
                <strong style="color: #1f2937; font-family: Unbounded, sans-serif; font-size: 16px; margin-top: 8px;">${
					data.completedBy || data.assignedBy
				}</strong>
              </div>
            </div>
          </div>

          ${subtasksList}
          
          ${jobCardsList}

          <div style="text-align: center; margin: 32px 0;">
            <a href="${data.feedbackLink}" style="${BASE_STYLES.button}">
              Provide Feedback
            </a>
            <p style="margin-top: 12px; font-size: 14px; color: #6b7280;">Your feedback helps us improve our service</p>
          </div>

          <div style="${BASE_STYLES.alert}">
            <p style="margin: 0;">Thank you for your business! If you have any questions about the completed work, please contact us.</p>
          </div>
        </div>

        <div style="${BASE_STYLES.footer}">
          <p style="margin: 0;">This is an automated notification about a completed task.</p>
        </div>
      </div>
    </div>
  `;
};

export const LeadConvertedClient = (data: LeadConvertedClientData): string => `
    <div style="${BASE_STYLES.wrapper}">
      <div style="${BASE_STYLES.container}">
        <div style="${BASE_STYLES.header}">
          <h1 style="margin: 16px 0 8px; font-size: 24px;">Welcome Aboard! 🎉</h1>
          <p style="margin: 0; opacity: 0.9;">You're now an official client</p>
        </div>

        <div style="padding: 24px 20px;">
          <div style="${BASE_STYLES.card}">
            <h2 style="${BASE_STYLES.heading}">Dear ${data.name},</h2>
            <p style="${BASE_STYLES.text}">
              We're thrilled to announce that your account has been upgraded from lead to client status!
              This transition gives you access to our full suite of services and dedicated support.
            </p>
            
            ${
				data.dashboardLink
					? `
            <div style="text-align: center; margin: 24px 0;">
              <a href="${data.dashboardLink}" style="${BASE_STYLES.button}">
                Access Your Client Dashboard
              </a>
            </div>
            `
					: ''
			}

            <div style="${BASE_STYLES.alert}">
              <p style="margin: 0;">
                <strong>Client ID:</strong> ${data.clientId}<br>
                <strong>Conversion Date:</strong> ${data.conversionDate}
              </p>
            </div>
          </div>

          ${
				data.accountManagerName
					? createSection(
							'👋 Your Dedicated Manager',
							`
            <p style="${BASE_STYLES.text}">
              You've been assigned a dedicated account manager to ensure your experience with us is exceptional:
            </p>
            <div style="padding: 12px; background-color: #f8fafc; border-radius: 8px; margin-top: 12px;">
              <p style="margin: 0 0 8px; font-weight: 600;">${data.accountManagerName}</p>
              ${data.accountManagerEmail ? `<p style="margin: 0 0 6px;">📧 ${data.accountManagerEmail}</p>` : ''}
              ${data.accountManagerPhone ? `<p style="margin: 0;">📱 ${data.accountManagerPhone}</p>` : ''}
            </div>
          `,
					  )
					: ''
			}

          ${
				data.nextSteps && data.nextSteps.length > 0
					? createSection(
							'🚀 Next Steps',
							`
            <ul style="list-style: none; padding: 0; margin: 0;">
              ${data.nextSteps
					.map(
						(step) => `
                <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
                  <span style="color: #A855F7; margin-right: 8px;">✓</span>
                  <span>${step}</span>
                </li>
              `,
					)
					.join('')}
            </ul>
          `,
					  )
					: ''
			}
        </div>

        <div style="${BASE_STYLES.footer}">
          <p style="margin: 0;">We look forward to a successful partnership!</p>
        </div>
      </div>
    </div>
`;

export const LeadConvertedCreator = (data: LeadConvertedCreatorData): string => `
    <div style="${BASE_STYLES.wrapper}">
      <div style="${BASE_STYLES.container}">
        <div style="${BASE_STYLES.header}">
          <h1 style="margin: 16px 0 8px; font-size: 24px;">Lead Converted Successfully! 🏆</h1>
          <p style="margin: 0; opacity: 0.9;">New client acquisition</p>
        </div>

        <div style="padding: 24px 20px;">
          <div style="${BASE_STYLES.card}">
            <h2 style="${BASE_STYLES.heading}">Congratulations ${data.name}!</h2>
            <p style="${BASE_STYLES.text}">
              Your lead <strong>${data.clientName}</strong> has successfully been converted to a client.
              Great work on securing this new business relationship!
            </p>
            
            <div style="${BASE_STYLES.alert}">
              <p style="margin: 0;">
                <strong>Client ID:</strong> ${data.clientId}<br>
                <strong>Conversion Date:</strong> ${data.conversionDate}
              </p>
            </div>

            ${
				data.dashboardLink
					? `
            <div style="text-align: center; margin: 24px 0;">
              <a href="${data.dashboardLink}" style="${BASE_STYLES.button}">
                View Client Details
              </a>
            </div>
            `
					: ''
			}
          </div>

          ${createSection(
				'📋 Client Details',
				`
            <p style="${BASE_STYLES.text}">
              Here's a summary of the new client's information:
            </p>
            <div style="padding: 12px; background-color: #f8fafc; border-radius: 8px; margin-top: 12px;">
              <p style="margin: 0 0 8px; font-weight: 600;">${data.clientName}</p>
              <p style="margin: 0 0 6px;">📧 ${data.clientEmail}</p>
              ${data.clientPhone ? `<p style="margin: 0;">📱 ${data.clientPhone}</p>` : ''}
            </div>
          `,
			)}

          ${createSection(
				'⚡ Next Steps',
				`
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
                <span style="color: #A855F7; margin-right: 8px;">✓</span>
                <span>Schedule a welcome call with the client</span>
              </li>
              <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
                <span style="color: #A855F7; margin-right: 8px;">✓</span>
                <span>Review any pending quotations or proposals</span>
              </li>
              <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
                <span style="color: #A855F7; margin-right: 8px;">✓</span>
                <span>Develop an account growth strategy</span>
              </li>
            </ul>
          `,
			)}
        </div>

        <div style="${BASE_STYLES.footer}">
          <p style="margin: 0;">The client has been notified of their new status.</p>
        </div>
      </div>
    </div>
`;

export const LeadReminder = (data: LeadReminderData): string => `
    <div style="${BASE_STYLES.wrapper}">
      <div style="${BASE_STYLES.container}">
        <div style="${BASE_STYLES.header}">
          <h1 style="margin: 16px 0 8px; font-size: 24px;">Pending Leads Reminder 🔔</h1>
          <p style="margin: 0; opacity: 0.9;">You have ${data.leadsCount} lead(s) waiting for action</p>
        </div>

        <div style="padding: 24px 20px;">
          <div style="${BASE_STYLES.card}">
            <h2 style="${BASE_STYLES.heading}">Hi ${data.name},</h2>
            <p style="${BASE_STYLES.text}">
              This is a friendly reminder that you have ${
					data.leadsCount
				} lead(s) in pending status that require your attention.
              Timely follow-up increases conversion rates by up to 40%.
            </p>
            
            <div style="text-align: center; margin: 24px 0;">
              <a href="${data.dashboardLink}" style="${BASE_STYLES.button}">
                View Your Leads
              </a>
            </div>
          </div>

          <div style="${BASE_STYLES.card}">
            <h3 style="${BASE_STYLES.subheading}">Pending Leads:</h3>
            
            ${data.leads
				.map(
					(lead, index) => `
              <div style="padding: 16px; background: ${
					index % 2 === 0 ? '#f9fafb' : '#ffffff'
				}; border-radius: 8px; margin-bottom: 12px; border: 1px solid #f3f4f6;">
                <div style="${BASE_STYLES.flexRow}">
                  ${
						lead.image
							? `<div style="width: 48px; height: 48px; border-radius: 50%; background-color: #f3f4f6; margin-right: 16px; background-image: url('${lead.image}'); background-size: cover;"></div>`
							: `<div style="width: 48px; height: 48px; border-radius: 50%; background-color: #f3f4f6; margin-right: 16px; display: flex; align-items: center; justify-content: center; color: #A855F7; font-weight: 600;">${
									lead.name ? lead.name.charAt(0).toUpperCase() : '?'
							  }</div>`
					}
                  <div style="${BASE_STYLES.flexColumn}">
                    <span style="font-weight: 600; font-size: 16px;">${lead.name || 'Unnamed Lead'}</span>
                    ${lead.email ? `<span style="color: #6c757d; font-size: 14px;">${lead.email}</span>` : ''}
                    ${lead.phone ? `<span style="color: #6c757d; font-size: 14px;">${lead.phone}</span>` : ''}
                    <span style="color: #6c757d; font-size: 14px;">Created: ${lead.createdAt}</span>
                  </div>
                </div>
                ${
					lead.notes
						? `
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #f3f4f6;">
                  <p style="margin: 0; color: #6c757d; font-size: 14px;">${lead.notes}</p>
                </div>
                `
						: ''
				}
              </div>
            `,
				)
				.join('')}
          </div>

          ${createSection(
				'💡 Quick Tips',
				`
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="margin-bottom: 12px; display: flex; align-items: center;">
                <span style="color: #A855F7; margin-right: 8px;">✓</span>
                Respond to new leads within 5 minutes to increase conversion chances by 80%
              </li>
              <li style="margin-bottom: 12px; display: flex; align-items: center;">
                <span style="color: #A855F7; margin-right: 8px;">✓</span>
                Use email and phone for initial contact - don't rely on just one method
              </li>
              <li style="display: flex; align-items: center;">
                <span style="color: #A855F7; margin-right: 8px;">✓</span>
                Document all interactions in the lead's notes for better follow-up
              </li>
            </ul>
          `,
			)}
        </div>

        <div style="${BASE_STYLES.footer}">
          <p style="margin: 0;">This is an automated reminder from Loro.</p>
        </div>
      </div>
    </div>
`;

export const TaskFlagCreated = (data: TaskFlagEmailData): string => `
    <div style="${BASE_STYLES.wrapper}">
        <div style="${BASE_STYLES.container}">
            <div style="${BASE_STYLES.header}">
                <h1 style="margin: 16px 0 8px; font-size: 24px;">New Task Flag Created 🚩</h1>
                <p style="margin: 0; opacity: 0.9;">A new flag has been added to your task</p>
            </div>

            <div style="padding: 24px 20px;">
                <div style="${BASE_STYLES.card}">
                    <h2 style="${BASE_STYLES.heading}">Task Details</h2>
                    <p style="${BASE_STYLES.text}">
                        <strong>Task:</strong> ${data.taskTitle}<br>
                        <strong>Flag Title:</strong> ${data.flagTitle}<br>
                        <strong>Description:</strong> ${data.flagDescription}<br>
                        <strong>Created By:</strong> ${data.createdBy.name}<br>
                        ${
							data.flagDeadline
								? `<strong>Deadline:</strong> ${new Date(data.flagDeadline).toLocaleDateString()}<br>`
								: ''
						}
                        <strong>Status:</strong> ${data.flagStatus}
                    </p>

                    ${
						data.items && data.items.length > 0
							? `
                        <h3 style="${BASE_STYLES.subheading}">Checklist Items</h3>
                        <ul style="list-style: none; padding: 0;">
                            ${data.items
								.map(
									(item) => `
                                <li style="margin-bottom: 8px;">
                                    • ${item.title}${item.description ? ` - ${item.description}` : ''}
                                </li>
                            `,
								)
								.join('')}
                        </ul>
                    `
							: ''
					}

                    ${
						data.comments && data.comments.length > 0
							? `
                        <h3 style="${BASE_STYLES.subheading}">Initial Comments</h3>
                        ${data.comments
							.map(
								(comment) => `
                            <div style="margin-bottom: 16px;">
                                <p style="${BASE_STYLES.text}">
                                    <strong>${comment.createdBy.name}:</strong> ${comment.content}<br>
                                    <small style="color: #666;">${new Date(comment.createdAt).toLocaleString()}</small>
                                </p>
                            </div>
                        `,
							)
							.join('')}
                    `
							: ''
					}
                </div>
            </div>

            <div style="${BASE_STYLES.footer}">
                <p style="margin: 0;">Please review and take necessary action.</p>
            </div>
        </div>
    </div>
`;

export const TaskFlagUpdated = (data: TaskFlagEmailData): string => `
    <div style="${BASE_STYLES.wrapper}">
        <div style="${BASE_STYLES.container}">
            <div style="${BASE_STYLES.header}">
                <h1 style="margin: 16px 0 8px; font-size: 24px;">Task Flag Updated 🔄</h1>
                <p style="margin: 0; opacity: 0.9;">A flag status has been updated</p>
            </div>

            <div style="padding: 24px 20px;">
                <div style="${BASE_STYLES.card}">
                    <h2 style="${BASE_STYLES.heading}">Updated Flag Details</h2>
                    <p style="${BASE_STYLES.text}">
                        <strong>Task:</strong> ${data.taskTitle}<br>
                        <strong>Flag Title:</strong> ${data.flagTitle}<br>
                        <strong>New Status:</strong> ${data.flagStatus}<br>
                        <strong>Updated By:</strong> ${data.createdBy.name}
                    </p>

                    ${
						data.items && data.items.length > 0
							? `
                        <h3 style="${BASE_STYLES.subheading}">Checklist Progress</h3>
                        <ul style="list-style: none; padding: 0;">
                            ${data.items
								.map(
									(item) => `
                                <li style="margin-bottom: 8px;">
                                    • ${item.title} - ${item.status}
                                </li>
                            `,
								)
								.join('')}
                        </ul>
                    `
							: ''
					}
                </div>
            </div>

            <div style="${BASE_STYLES.footer}">
                <p style="margin: 0;">The task flag has been updated. Please review if any action is needed.</p>
            </div>
        </div>
    </div>
`;

export const TaskFlagResolved = (data: TaskFlagEmailData): string => `
    <div style="${BASE_STYLES.wrapper}">
        <div style="${BASE_STYLES.container}">
            <div style="${BASE_STYLES.header}">
                <h1 style="margin: 16px 0 8px; font-size: 24px;">Task Flag Resolved ✅</h1>
                <p style="margin: 0; opacity: 0.9;">A flag has been marked as resolved</p>
            </div>

            <div style="padding: 24px 20px;">
                <div style="${BASE_STYLES.card}">
                    <h2 style="${BASE_STYLES.heading}">Resolution Details</h2>
                    <p style="${BASE_STYLES.text}">
                        <strong>Task:</strong> ${data.taskTitle}<br>
                        <strong>Flag Title:</strong> ${data.flagTitle}<br>
                        <strong>Resolved By:</strong> ${data.createdBy.name}<br>
                        <strong>Resolution Time:</strong> ${new Date().toLocaleString()}
                    </p>

                    ${
						data.items && data.items.length > 0
							? `
                        <h3 style="${BASE_STYLES.subheading}">Completed Checklist</h3>
                        <ul style="list-style: none; padding: 0;">
                            ${data.items
								.map(
									(item) => `
                                <li style="margin-bottom: 8px;">
                                    • ${item.title} - ${item.status}
                                </li>
                            `,
								)
								.join('')}
                        </ul>
                    `
							: ''
					}

                    ${
						data.comments && data.comments.length > 0
							? `
                        <h3 style="${BASE_STYLES.subheading}">Latest Comments</h3>
                        ${data.comments
							.slice(-2)
							.map(
								(comment) => `
                            <div style="margin-bottom: 16px;">
                                <p style="${BASE_STYLES.text}">
                                    <strong>${comment.createdBy.name}:</strong> ${comment.content}<br>
                                    <small style="color: #666;">${new Date(comment.createdAt).toLocaleString()}</small>
                                </p>
                            </div>
                        `,
							)
							.join('')}
                    `
							: ''
					}
                </div>
            </div>

            <div style="${BASE_STYLES.footer}">
                <p style="margin: 0;">The flag has been successfully resolved. No further action is required.</p>
            </div>
        </div>
    </div>
`;

export const TaskFeedbackAdded = (data: TaskFeedbackEmailData): string => `
    <div style="${BASE_STYLES.wrapper}">
        <div style="${BASE_STYLES.container}">
            <div style="${BASE_STYLES.header}">
                <h1 style="margin: 16px 0 8px; font-size: 24px;">New Task Feedback Received 📝</h1>
                <p style="margin: 0; opacity: 0.9;">Feedback has been submitted for your task</p>
            </div>

            <div style="padding: 24px 20px;">
                <div style="${BASE_STYLES.card}">
                    <h2 style="${BASE_STYLES.heading}">Feedback Details</h2>
                    <p style="${BASE_STYLES.text}">
                        <strong>Task:</strong> ${data.taskTitle}<br>
                        <strong>Submitted By:</strong> ${data.submittedBy.name}<br>
                        <strong>Submitted On:</strong> ${new Date(data.submittedAt).toLocaleString()}<br>
                        ${data.rating ? `<strong>Rating:</strong> ${'⭐'.repeat(data.rating)}<br>` : ''}
                    </p>

                    <h3 style="${BASE_STYLES.subheading}">Feedback Content</h3>
                    <div style="${BASE_STYLES.alert}">
                        <p style="margin: 0;">${data.feedbackContent}</p>
                    </div>
                </div>
            </div>

            <div style="${BASE_STYLES.footer}">
                <p style="margin: 0;">Please review the feedback and take any necessary actions.</p>
            </div>
        </div>
    </div>
`;

export const TaskOverdueMissed = (data: TaskOverdueMissedData): string => {
	// Helper function for priority badges inside the function
	const getPriorityBadge = (priority) => {
		switch (priority) {
			case 'URGENT':
				return '🔴 Urgent';
			case 'HIGH':
				return '🟠 High';
			case 'MEDIUM':
				return '🟡 Medium';
			case 'LOW':
				return '🟢 Low';
			default:
				return priority;
		}
	};

	return `
    <div style="${BASE_STYLES.wrapper}">
      <div style="${BASE_STYLES.container}">
        <div style="${BASE_STYLES.header}">
          <h1 style="margin: 16px 0 8px; font-size: 24px;">Attention Required: Overdue & Missed Tasks ⚠️</h1>
          <p style="margin: 0; opacity: 0.9;">You have ${
				data.overdueMissedCount.total
			} task(s) that need your attention</p>
        </div>

        <div style="padding: 24px 20px;">
          <div style="${BASE_STYLES.card}">
            <h2 style="${BASE_STYLES.heading}">Hi ${data.name},</h2>
            <p style="${BASE_STYLES.text}">
              This is a notification regarding your overdue and missed tasks:
            </p>
            
            <div style="${BASE_STYLES.highlight}">
              <div style="${BASE_STYLES.flexRow}">
                <div style="text-align: center; padding: 0 12px; flex: 1;">
                  <div style="font-size: 32px; font-weight: 700; color: #EF4444;">${
						data.overdueMissedCount.overdue
					}</div>
                  <div style="font-size: 14px; color: #6c757d;">Overdue Tasks</div>
                </div>
                <div style="text-align: center; padding: 0 12px; flex: 1;">
                  <div style="font-size: 32px; font-weight: 700; color: #F59E0B;">${
						data.overdueMissedCount.missed
					}</div>
                  <div style="font-size: 14px; color: #6c757d;">Missed Tasks</div>
                </div>
                <div style="text-align: center; padding: 0 12px; flex: 1;">
                  <div style="font-size: 32px; font-weight: 700; color: #6366F1;">${data.overdueMissedCount.total}</div>
                  <div style="font-size: 14px; color: #6c757d;">Total</div>
                </div>
              </div>
            </div>
            
            <div style="text-align: center; margin: 24px 0;">
              <a href="${data.dashboardLink}" style="${BASE_STYLES.button}">
                View & Manage Tasks
              </a>
            </div>
          </div>

          ${
				data.overdueTasks.length > 0
					? `
          <div style="${BASE_STYLES.card}">
            <h3 style="${BASE_STYLES.subheading}">🔴 Overdue Tasks</h3>
            
            ${data.overdueTasks
				.map(
					(task, index) => `
              <div style="padding: 16px; background: ${
					index % 2 === 0 ? '#f9fafb' : '#ffffff'
				}; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #EF4444;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div>
                    <h4 style="margin: 0 0 8px; font-size: 16px; font-weight: 600;">${task.title}</h4>
                    <p style="margin: 0 0 8px; color: #6c757d; font-size: 14px;">${task.description}</p>
                  </div>
                  <div style="text-align: right;">
                    <span style="display: inline-block; padding: 4px 8px; background: #FEE2E2; color: #EF4444; border-radius: 4px; font-size: 12px; font-weight: 500;">
                      ${task.daysOverdue} day${task.daysOverdue !== 1 ? 's' : ''} overdue
                    </span>
                  </div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 12px;">
                  <div style="color: #6c757d; font-size: 12px;">
                    <span style="margin-right: 8px;">📆 Due: ${task.deadline}</span>
                    <span style="margin-right: 8px;">⏱️ Progress: ${task.progress}%</span>
                  </div>
                  <div>
                    <span style="display: inline-block; padding: 4px 8px; background: #F3F4F6; color: #374151; border-radius: 4px; font-size: 12px; font-weight: 500;">
                      ${getPriorityBadge(task.priority)}
                    </span>
                  </div>
                </div>
              </div>
            `,
				)
				.join('')}
          </div>
          `
					: ''
			}

          ${
				data.missedTasks.length > 0
					? `
          <div style="${BASE_STYLES.card}">
            <h3 style="${BASE_STYLES.subheading}">🟠 Missed Tasks</h3>
            
            ${data.missedTasks
				.map(
					(task, index) => `
              <div style="padding: 16px; background: ${
					index % 2 === 0 ? '#f9fafb' : '#ffffff'
				}; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #F59E0B;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div>
                    <h4 style="margin: 0 0 8px; font-size: 16px; font-weight: 600;">${task.title}</h4>
                    <p style="margin: 0 0 8px; color: #6c757d; font-size: 14px;">${task.description}</p>
                  </div>
                  <div style="text-align: right;">
                    <span style="display: inline-block; padding: 4px 8px; background: #FEF3C7; color: #F59E0B; border-radius: 4px; font-size: 12px; font-weight: 500;">
                      ${task.daysOverdue} day${task.daysOverdue !== 1 ? 's' : ''} missed
                    </span>
                  </div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 12px;">
                  <div style="color: #6c757d; font-size: 12px;">
                    <span style="margin-right: 8px;">📆 Was due: ${task.deadline}</span>
                    <span style="margin-right: 8px;">⏱️ Progress: ${task.progress}%</span>
                  </div>
                  <div>
                    <span style="display: inline-block; padding: 4px 8px; background: #F3F4F6; color: #374151; border-radius: 4px; font-size: 12px; font-weight: 500;">
                      ${getPriorityBadge(task.priority)}
                    </span>
                  </div>
                </div>
              </div>
            `,
				)
				.join('')}
          </div>
          `
					: ''
			}

          ${createSection(
				'💡 Productivity Tips',
				`
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="margin-bottom: 12px; display: flex; align-items: center;">
                <span style="color: #A855F7; margin-right: 8px;">✓</span>
                Complete smaller tasks first to build momentum
              </li>
              <li style="margin-bottom: 12px; display: flex; align-items: center;">
                <span style="color: #A855F7; margin-right: 8px;">✓</span>
                Break down large tasks into smaller, manageable steps
              </li>
              <li style="margin-bottom: 12px; display: flex; align-items: center;">
                <span style="color: #A855F7; margin-right: 8px;">✓</span>
                Set reminders 30 minutes before deadlines
              </li>
              <li style="display: flex; align-items: center;">
                <span style="color: #A855F7; margin-right: 8px;">✓</span>
                Reschedule tasks you can't complete rather than missing them
              </li>
            </ul>
          `,
			)}
        </div>

        <div style="${BASE_STYLES.footer}">
          <p style="margin: 0;">This is an automated notification from Loro.</p>
        </div>
      </div>
    </div>
  `;
};

// Add this at the end of the file, before the last export

export const UserDailyReport = (data: DailyReportData): string => {
	// Function to format attendance status with color
	const formatAttendanceStatus = (status: string): string => {
		const statusMap = {
			PRESENT: '#4CAF50',
			COMPLETED: '#2196F3',
			ON_BREAK: '#FF9800',
			NOT_PRESENT: '#F44336',
		};

		const statusColor = statusMap[status] || '#757575';

		return `<span style="color: ${statusColor}; font-weight: bold;">${status}</span>`;
	};

	// Productivity tips based on user's day
	const getProductivityTip = (): string => {
		const tips = [
			'Schedule your most challenging tasks during your peak energy hours.',
			'Break large projects into smaller, manageable tasks.',
			'Use the Pomodoro Technique: work for 25 minutes, then take a 5-minute break.',
			'Keep your workspace organized to minimize distractions.',
			'Set clear priorities for tomorrow before ending your day.',
			'Reflect on what went well today and what could be improved.',
		];

		return tips[Math.floor(Math.random() * tips.length)];
	};

	// Get metrics from data
	const { attendance, totalQuotations, totalRevenue, newCustomers, userSpecific } = data.metrics;
	const { todayLeads, todayClaims, todayTasks, todayQuotations, hoursWorked } = userSpecific || {
		todayLeads: 0,
		todayClaims: 0,
		todayTasks: 0,
		todayQuotations: 0,
		hoursWorked: 0,
	};

	// Format time values
	const formattedHours = typeof hoursWorked === 'number' ? hoursWorked.toFixed(1) : '0.0';

	return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Daily Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: #4361ee;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 6px 6px 0 0;
        }
        .content {
          background: #fff;
          padding: 20px;
          border: 1px solid #ddd;
          border-top: none;
          border-radius: 0 0 6px 6px;
        }
        .summary-card {
          background: #f9f9f9;
          border-radius: 6px;
          padding: 15px;
          margin-bottom: 20px;
          border-left: 4px solid #4361ee;
        }
        .metric-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
        }
        .metric-row:last-child {
          border-bottom: none;
        }
        .metric-label {
          font-weight: bold;
          color: #555;
        }
        .metric-value {
          font-weight: bold;
          color: #4361ee;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 2px solid #4361ee;
          color: #333;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #777;
          font-size: 12px;
        }
        .tip-box {
          background-color: #e3f2fd;
          border-left: 4px solid #2196F3;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .tip-title {
          font-weight: bold;
          color: #2196F3;
          margin-bottom: 10px;
        }
        .button {
          background-color: #4361ee;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 4px;
          display: inline-block;
          margin-top: 15px;
        }
        .tracking-section {
          background: #f5f5f5;
          border-radius: 6px;
          padding: 15px;
          margin-top: 20px;
        }
        .location-item {
          padding: 10px;
          margin-bottom: 8px;
          background: white;
          border-radius: 4px;
          border-left: 3px solid #ff9800;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Daily Activity Report</h1>
          <p>${data.date}</p>
        </div>
        
        <div class="content">
          <h2>Hi ${data.name},</h2>
          <p>Here's your daily activity summary. Below you'll find an overview of your productivity and accomplishments for the day.</p>
          
          <div class="summary-card">
            <div class="metric-row">
              <span class="metric-label">Hours Worked:</span>
              <span class="metric-value">${formattedHours} hours</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Tasks Completed:</span>
              <span class="metric-value">${todayTasks}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">New Leads:</span>
              <span class="metric-value">${todayLeads}</span>
            </div>
            ${
				attendance
					? `
            <div class="metric-row">
              <span class="metric-label">Attendance Status:</span>
              <span class="metric-value">${formatAttendanceStatus(attendance.status)}</span>
            </div>
            `
					: ''
			}
          </div>
          
          ${
				attendance
					? `
          <div class="section">
            <h3 class="section-title">Attendance Details</h3>
            <div class="metric-row">
              <span class="metric-label">Check-in Time:</span>
              <span class="metric-value">${attendance.startTime || 'N/A'}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Check-out Time:</span>
              <span class="metric-value">${attendance.endTime || 'N/A'}</span>
            </div>
          </div>
          `
					: ''
			}
        </div>
      </div>
    </body>
  </html>
  `;
};
