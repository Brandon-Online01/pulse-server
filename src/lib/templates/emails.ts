import {
    SignupEmailData,
    VerificationEmailData,
    PasswordResetData,
    PasswordChangedData,
    InvoiceData,
    OrderData,
    DailyReportData,
    OrderDeliveredData,
    OrderOutForDeliveryData
} from '../types/email-templates.types';

const BASE_STYLES = {
    container: 'max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6;',
    button: 'display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; text-align: center;',
    header: 'background-color: #1a73e8; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;',
    footer: 'background-color: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; margin-top: 20px;',
    alert: 'background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0;',
};

export const renderSignupTemplate = (data: SignupEmailData): string => {
    return `
    <div style="${BASE_STYLES.container}">
      <div style="${BASE_STYLES.header}">
        <img src="your-logo-url" alt="Logo" style="max-width: 150px;" />
        <h1>🎉 Welcome to Our LORO!</h1>
      </div>
      
      <div style="padding: 20px;">
        <h2>Hello ${data.name}! </h2>
        <p style="font-size: 16px;">We're absolutely thrilled to have you join our community. Your journey with us begins now!</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.verificationLink}" style="${BASE_STYLES.button}">
            ✨ Verify Your Email
          </a>
        </div>

        ${data.welcomeOffers ? `
          <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>🎁 Welcome Gifts</h3>
            <ul>
              ${data.welcomeOffers.map(offer => `<li>${offer}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <div style="${BASE_STYLES.alert}">
          <p><strong>📌 Quick Tips:</strong></p>
          <ul>
            <li>Complete your profile to personalize your experience</li>
            <li>Check out our getting started guide</li>
            <li>Join our community forums</li>
          </ul>
        </div>
      </div>

      <div style="${BASE_STYLES.footer}">
        <p>Need help? Our support team is available 24/7</p>
        <div style="margin-top: 15px;">
          <a href="#" style="margin: 0 10px;">📘 Facebook</a>
          <a href="#" style="margin: 0 10px;">📸 Instagram</a>
          <a href="#" style="margin: 0 10px;">📱 Twitter</a>
        </div>
      </div>
    </div>
  `;
};

export const renderVerificationTemplate = (data: VerificationEmailData): string => {
    return `
    <div style="${BASE_STYLES.container}">
      <div style="${BASE_STYLES.header}">
        <h1>✨ Verify Your Email</h1>
      </div>

      <div style="padding: 20px;">
        <h2>Hello ${data.name},</h2>
        <p>You're just one click away from getting started! Please verify your email address to ensure the security of your account.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.verificationLink}" 
             style="${BASE_STYLES.button}">
            Verify Email Now
          </a>
        </div>

        <div style="${BASE_STYLES.alert}">
          <p>⚠️ This link will expire in ${data.expiryHours} hours</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>

        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin-top: 20px;">
          <h3>🔒 Security Tips:</h3>
          <ul>
            <li>Never share your password</li>
            <li>Enable two-factor authentication</li>
            <li>Use a strong, unique password</li>
          </ul>
        </div>
      </div>

      <div style="${BASE_STYLES.footer}">
        <p>Questions? Contact our support team</p>
      </div>
    </div>
  `;
};

export const renderPasswordResetTemplate = (data: PasswordResetData): string => {
    return `
    <div style="${BASE_STYLES.container}">
      <div style="${BASE_STYLES.header}">
        <h1>Reset Your Password 🔐</h1>
      </div>

      <div style="padding: 20px;">
        <h2>Hello ${data.name},</h2>
        <p>We received a request to reset your password. Don't worry, we've got you covered!</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.resetLink}" style="${BASE_STYLES.button}">Reset Password</a>
        </div>

        <div style="${BASE_STYLES.alert}">
          <p><strong>For your security:</strong></p>
          <ul>
            <li>This link expires in 1 hour</li>
            <li>If you didn't request this reset, please contact us immediately</li>
            <li>Never share your password with anyone</li>
          </ul>
        </div>
      </div>

      <div style="${BASE_STYLES.footer}">
        <p>Need help? Contact our support team</p>
      </div>
    </div>
    `;
}

export const renderOrderTemplate = (data: OrderData): string => {
    return `
    <div style="${BASE_STYLES.container}">
      <div style="${BASE_STYLES.header}">
        <h1>Thank You for Your Order! 🛍️</h1>
      </div>

      <div style="padding: 20px;">
        <h2>Dear ${data.name},</h2>
        <p>We're excited to confirm your order #${data.orderId}. Here's what happens next:</p>
        
        <ul>
          <li>You'll receive updates at every step of the delivery process</li>
          <li>Track your order anytime through your account dashboard</li>
          <li>Expected delivery: ${data.expectedDelivery}</li>
        </ul>

        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Order Summary</h3>
          <p>Order Total: ${data.total}</p>
          <p>Shipping Method: ${data.shippingMethod}</p>
        </div>
      </div>

      <div style="${BASE_STYLES.footer}">
        <p>Need help? We're just a click away!</p>
      </div>
    </div>
    `;
}

export const renderInvoiceTemplate = (data: InvoiceData): string => {
    return `
    <div style="${BASE_STYLES.container}">
      <div style="${BASE_STYLES.header}">
        <h1>Your Invoice is Ready 📋</h1>
      </div>

      <div style="padding: 20px;">
        <h2>Dear ${data.name},</h2>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Invoice Details</h3>
          <p>Invoice Number: #${data.invoiceId}</p>
          <p>Date: ${data.date}</p>
          <p>Amount: ${data.amount}</p>
          <p>Payment Method: ${data.paymentMethod}</p>
        </div>

        <div style="${BASE_STYLES.alert}">
          <p><strong>Quick Actions:</strong></p>
          <ul>
            <li>View and download your full invoice from your account dashboard</li>
            <li>Update your billing information in account settings</li>
          </ul>
        </div>
      </div>

      <div style="${BASE_STYLES.footer}">
        <p>Thank you for your business!</p>
      </div>
    </div>
    `;
}

export const renderPasswordChangedTemplate = (data: PasswordChangedData): string => {
    return `
    <div style="${BASE_STYLES.container}">
      <div style="${BASE_STYLES.header}">
        <h1>Password Successfully Changed 🔒</h1>
      </div>

      <div style="padding: 20px;">
        <h2>Dear ${data.name},</h2>
        <p>Your password was successfully changed on ${data.date} from ${data.deviceInfo}.</p>

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
}

export const renderOrderOutForDeliveryTemplate = (data: OrderOutForDeliveryData): string => {
    return `
    <div style="${BASE_STYLES.container}">
      <div style="${BASE_STYLES.header}">
        <h1>Great News! Your Order is On Its Way 🚚</h1>
      </div>

      <div style="padding: 20px;">
        <h2>Dear ${data.name},</h2>
        <p>Your order #${data.orderId} is out for delivery! Here's what you need to know:</p>

        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Delivery Details</h3>
          <ul>
            <li>Estimated delivery time: ${data.estimatedDeliveryTime}</li>
            <li>Delivery address: ${data.deliveryAddress}</li>
            <li>Carrier: ${data.carrier}</li>
            <li>Tracking number: <strong>${data.trackingNumber}</strong></li>
          </ul>
        </div>

        <div style="${BASE_STYLES.alert}">
          <p><strong>Tips for a smooth delivery:</strong></p>
          <ul>
            <li>Ensure someone is available to receive the package</li>
            <li>Keep your phone handy - our driver might need to reach you</li>
          </ul>
        </div>
      </div>

      <div style="${BASE_STYLES.footer}">
        <p>Questions about your delivery? Our customer service team is here 24/7!</p>
      </div>
    </div>
    `;
}

export const renderOrderDeliveredTemplate = (data: OrderDeliveredData): string => {
    return `
    <div style="${BASE_STYLES.container}">
      <div style="${BASE_STYLES.header}">
        <h1>Your Order Has Arrived! 🎉</h1>
      </div>

      <div style="padding: 20px;">
        <h2>Dear ${data.name},</h2>
        <p>Great news! Order #${data.orderId} has been successfully delivered.</p>

        <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>What's Next?</h3>
          <ul>
            <li>Review your purchase - your feedback helps others!</li>
            <li>Need to return something? Visit our easy returns portal</li>
            <li>Save 10% on your next order with code: THANKYOU10</li>
          </ul>
        </div>
      </div>

      <div style="${BASE_STYLES.footer}">
        <p>Thank you for choosing us. We truly value having you as part of our family!</p>
        <p>P.S. Have questions about your order? Our support team is always here to help.</p>
      </div>
    </div>
    `;
}

export const renderDailyReportTemplate = (data: DailyReportData): string => {
    return `
    <div style="${BASE_STYLES.container}">
      <div style="${BASE_STYLES.header}">
        <h1>Daily Business Insights 📊</h1>
      </div>

      <div style="padding: 20px;">
        <h2>Good morning!</h2>
        <p>Here's your daily overview for ${data.date}:</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3>Performance Highlights</h3>
          <ul>
            <li>Orders Processed: ${data.metrics.totalOrders}</li>
            <li>Revenue Generated: ${data.metrics.totalRevenue}</li>
            <li>New Customer Acquisitions: ${data.metrics.newCustomers}</li>
            <li>Customer Satisfaction Rate: ${data.metrics.satisfactionRate}%</li>
          </ul>
        </div>

        <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3>Key Metrics Comparison</h3>
          <p>Compared to Previous Day:</p>
          <ul>
            <li>Orders: ${data.metrics.orderGrowth}</li>
            <li>Revenue: ${data.metrics.revenueGrowth}</li>
            <li>Customer Growth: ${data.metrics.customerGrowth}</li>
          </ul>
        </div>
      </div>

      <div style="${BASE_STYLES.footer}">
        <p>For detailed analytics and insights, visit your dashboard.</p>
        <p>Keep up the great work! 🌟</p>
      </div>
    </div>
    `;
}
