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
} from '../types/email-templates.types';
import { formatDate } from '../utils/date.utils';

const BASE_STYLES = {
  wrapper: '@media (max-width: 600px) { width: 100% !important; padding: 10px !important; } width: 100%; padding: 20px;',
  container: 'max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #2d3748; background-color: #ffffff;',
  button: 'display: inline-block; padding: 14px 28px; background-color: #0066FF; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; text-align: center; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,102,255,0.1);',
  header: 'background: linear-gradient(135deg, #0066FF, #5B8DEF); color: white; padding: 32px 20px; text-align: center; border-radius: 12px 12px 0 0;',
  footer: 'background-color: #f8f9fa; padding: 24px 20px; text-align: center; border-radius: 0 0 12px 12px; margin-top: 24px; color: #6c757d;',
  alert: 'background-color: #fff8f0; border-left: 4px solid #ff9800; padding: 16px; margin: 16px 0; border-radius: 4px;',
  card: 'background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 20px; margin: 16px 0;',
  heading: 'margin: 0 0 16px; color: #0066FF; font-size: 20px; font-weight: 600;',
  text: 'margin: 0 0 16px; color: var(--text-color, #000000); font-size: 16px; line-height: 1.6; font-family: "Unbounded", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;',
  link: 'color: #6B46C1; text-decoration: none; font-weight: 500; transition: color 0.2s; margin-right: 5px; margin-left: 5px;',
  grid: 'display: grid; grid-template-columns: 1fr; gap: 16px; @media (min-width: 480px) { grid-template-columns: 1fr 1fr; }',
  highlight: 'background: #f7fafc; border-radius: 8px; padding: 16px; margin-bottom: 24px;',
  badge: 'display: inline-block; padding: 4px 12px; border-radius: 16px; font-size: 14px; font-weight: 500;',
};

const createSection = (title: string, content: string) => `
  <div style="${BASE_STYLES?.card}">
    <h3 style="${BASE_STYLES?.heading}">${title}</h3>
    ${content}
  </div>
`;

export const Signup = (data: SignupEmailData): string => {
  const welcomeSection = data.welcomeOffers ? `
    <div style="${BASE_STYLES.card}">
      <h3 style="${BASE_STYLES.heading}">🎁 Your VIP Welcome Package</h3>
      <div style="display: grid; gap: 12px;">
        ${data.welcomeOffers.map(offer => `
          <div style="background: #f7fafc; padding: 12px; border-radius: 6px; display: flex; align-items: center;">
            <span style="background: #0066FF; color: white; ${BASE_STYLES.badge}">NEW</span>
            <span style="margin-left: 12px">${offer}</span>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  return `
    <div style="${BASE_STYLES.wrapper}">
      <div style="${BASE_STYLES.container}">
        <div style="${BASE_STYLES.header}">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"/>
          </svg>
          <h1 style="margin: 16px 0 8px; font-size: 24px;">Welcome to the Future</h1>
          <p style="margin: 0; opacity: 0.9;">We're thrilled to have you, ${data.name}!</p>
        </div>

        <div style="padding: 24px 20px;">
          <div style="${BASE_STYLES.card}">
            <p style="${BASE_STYLES.text}">Your journey to excellence begins now. Let's make it official!</p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${data.verificationLink}" style="${BASE_STYLES.button}">
                Activate Your Account
              </a>
            </div>
          </div>

          ${welcomeSection}

          ${createSection("🚀 Quick Start Guide", `
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="margin-bottom: 12px; display: flex; align-items: center;">
                <span style="background: #e6efff; border-radius: 50%; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px;">1</span>
                Complete your profile
              </li>
              <li style="margin-bottom: 12px; display: flex; align-items: center;">
                <span style="background: #e6efff; border-radius: 50%; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px;">2</span>
                Explore our features
              </li>
              <li style="display: flex; align-items: center;">
                <span style="background: #e6efff; border-radius: 50%; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px;">3</span>
                Connect with the community
              </li>
            </ul>
          `)}
        </div>

        <div style="${BASE_STYLES.footer}">
          <p style="margin: 0 0 16px;">Join our growing community</p>
          <div style="display: flex; justify-content: center; gap: 16px;">
            <a href="#" style="${BASE_STYLES.link}">Twitter</a>
            <a href="#" style="${BASE_STYLES.link}">LinkedIn</a>
            <a href="#" style="${BASE_STYLES.link}">Discord</a>
          </div>
        </div>
      </div>
    </div>
  `;
};

export const Verification = (data: VerificationEmailData): string => {
  return `
    <div style="${BASE_STYLES.wrapper}">
      <div style="${BASE_STYLES.container}">
        <div style="${BASE_STYLES.header}">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
          </svg>
          <h1 style="margin: 16px 0 8px; font-size: 24px;">Verify Your Email</h1>
          <p style="margin: 0; opacity: 0.9;">One small step for security</p>
        </div>

        <div style="padding: 24px 20px;">
          <div style="${BASE_STYLES.card}">
            <h2 style="${BASE_STYLES.heading}">Hi ${data.name},</h2>
            <p style="${BASE_STYLES.text}">Your verification code is:</p>
            
            <div style="text-align: center; margin: 24px 0;">
              <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px; padding: 16px; background: #f7fafc; border-radius: 8px;">
                ${data.verificationCode}
              </div>
            </div>
          </div>

          ${createSection("🔐 Security First", `
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="margin-bottom: 12px; display: flex; align-items: center;">
                <span style="color: #0066FF; margin-right: 8px;">✓</span>
                Enable two-factor authentication
              </li>
              <li style="margin-bottom: 12px; display: flex; align-items: center;">
                <span style="color: #0066FF; margin-right: 8px;">✓</span>
                Use a strong password
              </li>
              <li style="display: flex; align-items: center;">
                <span style="color: #0066FF; margin-right: 8px;">✓</span>
                Keep your recovery email updated
              </li>
            </ul>
          `)}
        </div>

        <div style="${BASE_STYLES.footer}">
          <p style="margin: 0;">Didn't request this? Please ignore this email.</p>
        </div>
      </div>
    </div>
  `;
};

export const PasswordReset = (data: PasswordResetData): string => {
  return `
    <div style="${BASE_STYLES.wrapper}">
      <div style="${BASE_STYLES.container}">
        <div style="${BASE_STYLES.header}">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
            <path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM8.9 6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2H8.9V6z"/>
          </svg>
          <h1 style="margin: 16px 0 8px; font-size: 24px;">Reset Your Password</h1>
          <p style="margin: 0; opacity: 0.9;">We've got you covered</p>
        </div>

        <div style="padding: 24px 20px;">
          <div style="${BASE_STYLES.card}">
            <h2 style="${BASE_STYLES.heading}">Hi ${data.name},</h2>
            <p style="${BASE_STYLES.text}">We received a request to reset your password. No worries - it happens to the best of us!</p>
            
            <div style="text-align: center; margin: 24px 0;">
              <a href="${data.resetLink}" style="${BASE_STYLES.button}">
                Reset Password
              </a>
            </div>

            <div style="${BASE_STYLES.alert}">
              <p style="margin: 0; font-weight: 500;">⚡ Quick Tips:</p>
              <ul style="margin: 8px 0 0; padding-left: 20px;">
                <li>Link expires in 1 hour</li>
                <li>Use a unique password</li>
                <li>Never share your credentials</li>
              </ul>
            </div>
          </div>
        </div>

        <div style="${BASE_STYLES.footer}">
          <p style="margin: 0;">Didn't request this reset? Please contact support immediately.</p>
        </div>
      </div>
    </div>
  `;
};

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

export const PasswordChanged = (data: PasswordChangedData): string => {
  return `
    <div style="${BASE_STYLES.container}">
      <div style="${BASE_STYLES.header}">
        <h1>Password Successfully Changed 🔒</h1>
      </div>

      <div style="padding: 20px;">
        <h2>Dear ${data.name},</h2>
        <p>Your password was successfully changed on ${data.changeTime}.</p>

        <div style="${BASE_STYLES.alert}">
          <p><strong>Important Security Notice:</strong></p>
          <ul>
            <li>Contact our security team immediately if unauthorized</li>
            <li>Review your recent account activity</li>
            <li>Enable two-factor authentication if not already active</li>
          </ul>
        </div>

        <p>We take your account security seriously. Stay safe!</p>
      </div>

      <div style="${BASE_STYLES.footer}">
        <p>Best regards,<br>Your Security Team</p>
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