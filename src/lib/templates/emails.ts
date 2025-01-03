import {
  SignupEmailData,
  VerificationEmailData,
  PasswordResetData,
  PasswordChangedData,
  InvoiceData,
  OrderData,
  DailyReportData,
  OrderDeliveredData,
  OrderOutForDeliveryData,
  OrderResellerNotificationData,
  OrderInternalNotificationData,
  OrderWarehouseFulfillmentData
} from '../types/email-templates.types';

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

// Helper function for common sections
const createSection = (title: string, content: string) => `
  <div style="${BASE_STYLES.card}">
    <h3 style="${BASE_STYLES.heading}">${title}</h3>
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
            <p style="${BASE_STYLES.text}">Your account is almost ready! Just one click to get started.</p>
            
            <div style="text-align: center; margin: 24px 0;">
              <a href="${data.verificationLink}" style="${BASE_STYLES.button}">
                Verify My Email
              </a>
            </div>

            <p style="color: #718096; font-size: 14px;">
              This link expires in ${data.expiryHours} hours
            </p>
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

export const NewOrder = (data: OrderData): string => {
  return `
    <div style="${BASE_STYLES?.wrapper}">
      <div style="${BASE_STYLES?.container}">
        <div style="${BASE_STYLES?.header}">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
            <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
          </svg>
          <h1 style="margin: 16px 0 8px; font-size: 18px; text-transform: uppercase;">Order Confirmed! 🎉</h1>
          <p style="margin: 0; opacity: 0.9; font-size: 16px;">Tracking #: ${data?.orderId}</p>
        </div>

        <div style="padding: 24px 20px;">
          <div style="${BASE_STYLES?.card}">
            <h2 style="${BASE_STYLES?.heading}">Thank you, ${data?.name}! 💫</h2>
            <p style="${BASE_STYLES?.text}">We're excited to be preparing your order. Here's everything you need to know:</p>

            <div style="text-align: center; margin: 24px 0;">
              <a href="/track-order/${data?.orderId}" 
                 style="${BASE_STYLES.button}">
                Track Your Order
              </a>
            </div>
          </div>

          ${createSection("✨ What's Next?", `
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="margin-bottom: 16px; display: flex; align-items: start;">
                <span style="background: #e6efff; border-radius: 50%; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">1</span>
                <div>
                  <strong style="display: block; margin-bottom: 4px;">Order Preparation</strong>
                  <span style="color: #718096">We're carefully preparing your items for shipping</span>
                </div>
              </li>
              <li style="margin-bottom: 16px; display: flex; align-items: start;">
                <span style="background: #e6efff; border-radius: 50%; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">2</span>
                <div>
                  <strong style="display: block; margin-bottom: 4px;">Shipping Updates</strong>
                  <span style="color: #718096">We'll notify you when your order ships and is out for delivery</span>
                </div>
              </li>
              <li style="display: flex; align-items: start;">
                <span style="background: #e6efff; border-radius: 50%; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">3</span>
                <div>
                  <strong style="display: block; margin-bottom: 4px;">Delivery Day</strong>
                  <span style="color: #718096">We'll ensure a smooth delivery to your doorstep</span>
                </div>
              </li>
            </ul>
          `)}

          <div style="${BASE_STYLES.alert}">
            <p style="margin: 0; font-weight: 500;">💝 Special Thank You Gift</p>
            <p style="margin: 8px 0 0; color: #718096">Use code <strong>THANKYOU10</strong> on your next order for 10% off!</p>
          </div>
        </div>

        <div style="${BASE_STYLES.footer}">
          <p style="margin: 0 0 12px;">Need assistance with your order?</p>
          <div style="display: flex; justify-content: center; gap: 16px;">
            <a href="#" style="${BASE_STYLES.link}">Contact Support</a>
            <a href="#" style="${BASE_STYLES.link}">FAQs</a>
            <a href="#" style="${BASE_STYLES.link}">Track Order</a>
          </div>
        </div>
      </div>
    </div>
  `;
};

export const NewOrderInternal = (data: OrderInternalNotificationData): string => {
  return `
    <div style="${BASE_STYLES?.wrapper}">
      <div style="${BASE_STYLES?.container}">
        <div style="${BASE_STYLES?.header}">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
            <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
          </svg>
          <h1 style="margin: 16px 0 8px; font-size: 24px;">New Order Received</h1>
          <p style="margin: 0; opacity: 0.9;">Tracking #: ${data?.orderId}</p>
        </div>
        <div style="${BASE_STYLES?.footer}">
          <p style="margin: 0; opacity: 0.9;">View order details in your dashboard or the attached PDF file.</p>
        </div>
      </div>
    </div>
  `;
};

export const NewOrderReseller = (data: OrderResellerNotificationData): string => {
  return `
    <div style="${BASE_STYLES?.wrapper}">
      <div style="${BASE_STYLES?.container}">
        <div style="${BASE_STYLES?.header}">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
            <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
          </svg>
          <h1 style="margin: 16px 0 8px; font-size: 24px;">New Sale!</h1>
          <p style="margin: 0; opacity: 0.9;">Tracking #: ${data?.orderId}</p>
        </div>

        <div style="padding: 24px 20px;">
          <div style="${BASE_STYLES?.card}">
            <h2 style="${BASE_STYLES?.heading}">Hi ${data?.name},</h2>
            <p style="${BASE_STYLES?.text}">Congratulations! A purchase has been made to some of your products.</p>
          </div>
        </div>
        <div style="${BASE_STYLES?.footer}">
          <p style="margin: 0; opacity: 0.9;">View order details in your dashboard or the attached PDF file.</p>
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
    <div style="${BASE_STYLES?.container}">
      <div style="${BASE_STYLES?.header}">
        <h1>Password Successfully Changed 🔒</h1>
      </div>

      <div style="padding: 20px;">
        <h2>Dear ${data?.name},</h2>
        <p>Your password was successfully changed on ${data?.date} from ${data?.deviceInfo}.</p>

        <div style="${BASE_STYLES?.alert}">
          <p><strong>Important Security Notice:</strong></p>
          <ul>
            <li>Contact our security team immediately if unauthorized</li>
            <li>Review your recent account activity</li>
            <li>Enable two-factor authentication if not already active</li>
          </ul>
        </div>

        <p>We take your account security seriously. Stay safe!</p>
      </div>

      <div style="${BASE_STYLES?.footer}">
        <p>Best regards,<br>Your Security Team</p>
      </div>
    </div>
    `;
}

export const OrderOutForDelivery = (data: OrderOutForDeliveryData): string => {
  return `
    <div style="${BASE_STYLES?.container}">
      <div style="${BASE_STYLES?.header}">
        <h1>Great News! Your Order is On Its Way 🚚</h1>
      </div>

      <div style="padding: 20px;">
        <h2>Dear ${data?.name},</h2>
        <p>Your order #${data?.orderId} is out for delivery! Here's what you need to know:</p>

        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Delivery Details</h3>
          <ul>
            <li>Estimated delivery time: ${data?.estimatedDeliveryTime}</li>
            <li>Delivery address: ${data?.deliveryAddress}</li>
            <li>Carrier: ${data?.carrier}</li>
            <li>Tracking number: <strong>${data?.trackingNumber}</strong></li>
          </ul>
        </div>

        <div style="${BASE_STYLES?.alert}">
          <p><strong>Tips for a smooth delivery:</strong></p>
          <ul>
            <li>Ensure someone is available to receive the package</li>
            <li>Keep your phone handy - our driver might need to reach you</li>
          </ul>
        </div>
      </div>

      <div style="${BASE_STYLES?.footer}">
        <p>Questions about your delivery? Our customer service team is here 24/7!</p>
      </div>
    </div>
    `;
}

export const OrderDelivered = (data: OrderDeliveredData): string => {
  return `
    <div style="${BASE_STYLES?.container}">
      <div style="${BASE_STYLES?.header}">
        <h1>Your Order Has Arrived! 🎉</h1>
      </div>

      <div style="padding: 20px;">
        <h2>Dear ${data?.name},</h2>
        <p>Great news! Order #${data?.orderId} has been successfully delivered.</p>

        <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>What's Next?</h3>
          <ul>
            <li>Review your purchase - your feedback helps others!</li>
            <li>Need to return something? Visit our easy returns portal</li>
            <li>Save 10% on your next order with code: THANKYOU10</li>
          </ul>
        </div>
      </div>

      <div style="${BASE_STYLES?.footer}">
        <p>Thank you for choosing us. We truly value having you as part of our family!</p>
        <p>P.S. Have questions about your order? Our support team is always here to help.</p>
      </div>
    </div>
    `;
}

export const DailyReport = (data: DailyReportData): string => {
  return `
    <div style="${BASE_STYLES?.container}">
      <div style="${BASE_STYLES?.header}">
        <h1>Daily Wrap ⭐</h1>
      </div>

      <div style="padding: 20px;">
        <h2>Hi ${data?.name},</h2>
        <p>Your daily highlights:</p>
        
        ${data?.metrics?.xp ? `
        <div style="background-color: #fff3cd; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <h3 style="color: #856404; margin-bottom: 16px;">✨ XP & Level</h3>
          <div style="display: grid; gap: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: white; border-radius: 8px;">
              <span>Current Level</span>
              <strong style="color: #856404">${data?.metrics?.xp?.level}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: white; border-radius: 8px;">
              <span>Total XP</span>
              <strong style="color: #856404">${data?.metrics?.xp?.currentXP}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: white; border-radius: 8px;">
              <span>Today's XP</span>
              <strong style="color: #28a745">+${data?.metrics?.xp?.todayXP}</strong>
            </div>
          </div>
        </div>
        ` : ''}

        ${data?.metrics?.attendance ? `
        <div style="background-color: #d1ecf1; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <h3 style="color: #0c5460; margin-bottom: 16px;">⏰ Today's Schedule</h3>
          <div style="display: grid; gap: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: white; border-radius: 8px;">
              <span>Status</span>
              <strong style="color: ${data?.metrics?.attendance?.status === 'PRESENT' ? '#28a745' : '#6c757d'}">${data?.metrics?.attendance?.status}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: white; border-radius: 8px;">
              <span>Start Time</span>
              <strong>${data?.metrics?.attendance?.startTime}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: white; border-radius: 8px;">
              <span>End Time</span>
              <strong>${data?.metrics?.attendance?.endTime || 'Still Working'}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: white; border-radius: 8px;">
              <span>Duration</span>
              <strong style="color: #0c5460">${data?.metrics?.attendance?.duration || `${data?.metrics?.attendance?.totalHours}h`}</strong>
            </div>
            ${data?.metrics?.attendance?.afterHours > 0 ? `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: white; border-radius: 8px;">
              <span>After Hours</span>
              <strong style="color: #28a745">+${data?.metrics?.attendance?.afterHours}h</strong>
            </div>
            ` : ''}
            ${data?.metrics?.attendance?.checkInLocation ? `
            <div style="padding: 12px; background: white; border-radius: 8px;">
              <div style="margin-bottom: 8px; color: #0c5460;">Check-in Location</div>
              <div style="font-size: 14px; color: #666;">
                <div>Coordinates: ${data?.metrics?.attendance?.checkInLocation?.latitude}, ${data?.metrics?.attendance?.checkInLocation?.longitude}</div>
                ${data?.metrics?.attendance?.checkInLocation?.notes ? `
                <div style="margin-top: 4px; font-style: italic;">${data?.metrics?.attendance?.checkInLocation?.notes}</div>
                ` : ''}
              </div>
            </div>
            ` : ''}
            ${data?.metrics?.attendance?.checkOutLocation ? `
            <div style="padding: 12px; background: white; border-radius: 8px;">
              <div style="margin-bottom: 8px; color: #0c5460;">Check-out Location</div>
              <div style="font-size: 14px; color: #666;">
                <div>Coordinates: ${data?.metrics?.attendance?.checkOutLocation?.latitude}, ${data?.metrics?.attendance?.checkOutLocation?.longitude}</div>
                ${data?.metrics?.attendance?.checkOutLocation?.notes ? `
                <div style="margin-top: 4px; font-style: italic;">${data?.metrics?.attendance?.checkOutLocation?.notes}</div>
                ` : ''}
              </div>
            </div>
            ` : ''}
            ${data?.metrics?.attendance?.verifiedBy ? `
            <div style="padding: 12px; background: white; border-radius: 8px;">
              <div style="margin-bottom: 4px; color: #0c5460;">Verified By</div>
              <div style="font-size: 14px; color: #666;">
                <div>${data?.metrics?.attendance?.verifiedBy}</div>
                <div style="font-size: 12px; color: #999; margin-top: 4px;">
                  ${new Date(data?.metrics?.attendance?.verifiedAt).toLocaleString()}
                </div>
              </div>
            </div>
            ` : ''}
          </div>
        </div>
        ` : ''}

        ${data?.metrics?.checkIns?.length > 0 ? `
        <div style="background-color: #d4edda; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <h3 style="color: #155724; margin-bottom: 16px;">📍 Today's Check-ins</h3>
          <div style="display: grid; gap: 16px;">
            ${data?.metrics?.checkIns?.map(checkIn => `
              <div style="padding: 16px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: #666">${checkIn.time}</span>
                  ${checkIn.photo ? `<span style="color: #28a745">📸</span>` : ''}
                </div>
                <div style="color: #155724; font-weight: 500;">${checkIn.location}</div>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <h3 style="color: #0066FF; margin-bottom: 16px;">🎯 Today's Achievements</h3>
          <div style="display: grid; gap: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              <span>Orders Processed</span>
              <strong style="color: #0066FF">${data?.metrics?.totalOrders}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              <span>Revenue Generated</span>
              <strong style="color: #28a745">${data?.metrics?.totalRevenue}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              <span>New Customers</span>
              <strong style="color: #17a2b8">${data?.metrics?.newCustomers}</strong>
            </div>
          </div>
        </div>

        <div style="background-color: #e8f5e9; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <h3 style="color: #28a745; margin-bottom: 16px;">📈 Growth Indicators</h3>
          <div style="display: grid; gap: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>Orders Growth</span>
              <strong style="color: ${data?.metrics?.orderGrowth.startsWith('+') ? '#28a745' : '#dc3545'}">${data?.metrics?.orderGrowth}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>Revenue Growth</span>
              <strong style="color: ${data?.metrics?.revenueGrowth.startsWith('+') ? '#28a745' : '#dc3545'}">${data?.metrics?.revenueGrowth}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>Customer Growth</span>
              <strong style="color: ${data?.metrics?.customerGrowth.startsWith('+') ? '#28a745' : '#dc3545'}">${data?.metrics?.customerGrowth}</strong>
            </div>
          </div>
        </div>

        ${data?.metrics?.userSpecific ? `
          <div style="background-color: #e3f2fd; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <h3 style="color: #0066FF; margin-bottom: 16px;">🌟 Your Personal Impact</h3>
            <div style="display: grid; gap: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>Leads Generated</span>
                <strong>${data?.metrics?.userSpecific?.todayLeads}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>Claims Processed</span>
                <strong>${data?.metrics?.userSpecific?.todayClaims}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>Tasks Completed</span>
                <strong>${data?.metrics?.userSpecific?.todayTasks}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>Orders Handled</span>
                <strong>${data?.metrics?.userSpecific?.todayOrders}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>Hours Worked</span>
                <strong>${data?.metrics?.userSpecific?.hoursWorked} hrs</strong>
              </div>
            </div>
          </div>
        ` : ''}

        <div style="${BASE_STYLES?.alert}">
          <p style="margin: 0; font-weight: 500;">💡 Quick Tip</p>
          <p style="margin: 8px 0 0;">Set your goals for tomorrow and start fresh! Remember, every small win counts towards big success.</p>
        </div>
      </div>

      <div style="${BASE_STYLES?.footer}">
        <p>Keep up the amazing work! 🚀</p>
        <p style="font-size: 14px; color: #6c757d;">This report was generated on ${new Date(data?.date).toLocaleDateString()} at ${new Date(data?.date).toLocaleTimeString()}</p>
      </div>
    </div>
  `;
}

export const OrderResellerNotification = (data: OrderResellerNotificationData): string => {
  return `
    <div style="${BASE_STYLES?.wrapper}">
      <div style="${BASE_STYLES?.container}">
        <div style="${BASE_STYLES?.header}">
          <h1 style="margin: 16px 0 8px; font-size: 24px;">New Order from Your Referral! 🎯</h1>
          <p style="margin: 0; opacity: 0.9;">Order ${data?.orderId}</p>
        </div>

        <div style="padding: 24px 20px;">
          <div style="${BASE_STYLES?.card}">
            <h2 style="${BASE_STYLES?.heading}">Order Details</h2>
            
            <div style="${BASE_STYLES.highlight}">
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between;">
                  <span>Order Total</span>
                  <span style="font-weight: 600">${data?.total} ${data?.currency}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Your Commission</span>
                  <span style="font-weight: 600; color: #0066FF">${data?.resellerCommission} ${data?.currency}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Reseller Code Used</span>
                  <span style="font-weight: 500">${data?.resellerCode}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style="${BASE_STYLES?.footer}">
          <p>Keep up the great work! 🌟</p>
        </div>
      </div>
    </div>
  `;
};

export const OrderInternalNotification = (data: OrderInternalNotificationData): string => {
  return `
    <div style="${BASE_STYLES?.wrapper}">
      <div style="${BASE_STYLES?.container}">
        <div style="${BASE_STYLES?.header}">
          <h1 style="margin: 16px 0 8px; font-size: 24px;">New Order Received 📦</h1>
          <p style="margin: 0; opacity: 0.9;">Internal Processing Required</p>
        </div>

        <div style="padding: 24px 20px;">
          <div style="${BASE_STYLES?.card}">
            <div style="${BASE_STYLES?.highlight}">
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between;">
                  <span>Order ID</span>
                  <span style="font-weight: 600">${data?.orderId}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Customer Type</span>
                  <span style="font-weight: 500">${data?.customerType}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Priority</span>
                  <span style="font-weight: 600; color: ${data?.priority === 'high' ? '#dc3545' :
      data?.priority === 'medium' ? '#ffc107' : '#28a745'
    }">${data?.priority?.toUpperCase()}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Total Value</span>
                  <span style="font-weight: 600">${data?.total} ${data?.currency}</span>
                </div>
              </div>
            </div>
            ${data?.notes ? `
              <div style="${BASE_STYLES?.alert}">
                <p style="margin: 0;"><strong>Notes:</strong> ${data?.notes}</p>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
};

export const OrderWarehouseFulfillment = (data: OrderWarehouseFulfillmentData): string => {
  return `
    <div style="${BASE_STYLES?.wrapper}">
      <div style="${BASE_STYLES?.container}">
        <div style="${BASE_STYLES?.header}">
          <h1 style="margin: 16px 0 8px; font-size: 24px;">New Fulfillment Request 📦</h1>
          <p style="margin: 0; opacity: 0.9;">Priority: ${data?.fulfillmentPriority?.toUpperCase()}</p>
        </div>

        <div style="padding: 24px 20px;">
          <div style="${BASE_STYLES?.card}">
            <h2 style="${BASE_STYLES?.heading}">Order #${data?.orderId}</h2>
            
            <div style="${BASE_STYLES.highlight}">
              <h3 style="margin: 0 0 12px;">Items to Fulfill</h3>
              ${data?.items?.map(item => `
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                  <div>
                    <strong>SKU: ${item?.sku}</strong>
                    ${item?.location ? `<br><small>Location: ${item?.location}</small>` : ''}
                  </div>
                  <span style="font-weight: 500">Qty: ${item?.quantity}</span>
                </div>
              `).join('')}
            </div>

            ${data?.shippingInstructions ? `
              <div style="${BASE_STYLES?.alert}">
                <p style="margin: 0 0 8px;"><strong>Shipping Instructions:</strong></p>
                <p style="margin: 0;">${data?.shippingInstructions}</p>
              </div>
            ` : ''}

            ${data?.packagingRequirements ? `
              <div style="${BASE_STYLES?.alert}" style="margin-top: 16px;">
                <p style="margin: 0 0 8px;"><strong>Packaging Requirements:</strong></p>
                <p style="margin: 0;">${data?.packagingRequirements}</p>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
};


