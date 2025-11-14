import { Resend } from "resend";

// Initialize Resend only if API key is available
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const emailFrom = `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`;

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  // If Resend is not configured, log the verification link for development
  if (!resend) {
    console.log("\n=================================");
    console.log("📧 VERIFICATION EMAIL (Development Mode)");
    console.log("=================================");
    console.log(`To: ${email}`);
    console.log(`Verification URL: ${verifyUrl}`);
    console.log("=================================\n");
    return { success: true };
  }

  try {
    await resend.emails.send({
      from: emailFrom,
      to: email,
      subject: "Verify your email address",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Verify Your Email</h1>
            </div>
            <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi there,</p>
              <p style="font-size: 16px; margin-bottom: 30px;">
                Thank you for signing up! Please click the button below to verify your email address and complete your registration.
              </p>
              <div style="text-align: center; margin: 40px 0;">
                <a href="${verifyUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 50px; font-weight: 600; display: inline-block; font-size: 16px;">
                  Verify Email Address
                </a>
              </div>
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="font-size: 14px; color: #667eea; word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px;">
                ${verifyUrl}
              </p>
              <p style="font-size: 14px; color: #999; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
                This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
              </p>
            </div>
          </body>
        </html>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  // If Resend is not configured, log the reset link for development
  if (!resend) {
    console.log("\n=================================");
    console.log("📧 PASSWORD RESET EMAIL (Development Mode)");
    console.log("=================================");
    console.log(`To: ${email}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log("=================================\n");
    return { success: true };
  }

  try {
    await resend.emails.send({
      from: emailFrom,
      to: email,
      subject: "Reset your password",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Reset Your Password</h1>
            </div>
            <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi there,</p>
              <p style="font-size: 16px; margin-bottom: 30px;">
                We received a request to reset your password. Click the button below to create a new password.
              </p>
              <div style="text-align: center; margin: 40px 0;">
                <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 50px; font-weight: 600; display: inline-block; font-size: 16px;">
                  Reset Password
                </a>
              </div>
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="font-size: 14px; color: #667eea; word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px;">
                ${resetUrl}
              </p>
              <p style="font-size: 14px; color: #999; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
                This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
              </p>
            </div>
          </body>
        </html>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  // If Resend is not configured, log for development
  if (!resend) {
    console.log("\n=================================");
    console.log("📧 WELCOME EMAIL (Development Mode)");
    console.log("=================================");
    console.log(`To: ${email}`);
    console.log(`Name: ${name}`);
    console.log("=================================\n");
    return { success: true };
  }

  try {
    await resend.emails.send({
      from: emailFrom,
      to: email,
      subject: "Welcome! Let's get you started",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome Aboard! 🎉</h1>
            </div>
            <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
              <p style="font-size: 16px; margin-bottom: 30px;">
                Welcome to our platform! We're excited to have you on board. Your account has been successfully created and you're ready to get started.
              </p>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h3 style="margin-top: 0; color: #667eea;">Quick Start Guide:</h3>
                <ul style="margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 10px;">Complete your profile in the dashboard</li>
                  <li style="margin-bottom: 10px;">Explore our features and tools</li>
                  <li style="margin-bottom: 10px;">Check out our documentation</li>
                  <li>Join our community</li>
                </ul>
              </div>
              <div style="text-align: center; margin: 40px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 50px; font-weight: 600; display: inline-block; font-size: 16px;">
                  Go to Dashboard
                </a>
              </div>
              <p style="font-size: 14px; color: #999; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
                If you have any questions, feel free to reply to this email or contact our support team.
              </p>
            </div>
          </body>
        </html>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return { success: false, error };
  }
}

export async function sendSubscriptionConfirmationEmail(
  email: string,
  name: string,
  planName: string,
  periodEnd: Date
) {
  // If Resend is not configured, log for development
  if (!resend) {
    console.log("\n=================================");
    console.log("📧 SUBSCRIPTION CONFIRMATION EMAIL (Development Mode)");
    console.log("=================================");
    console.log(`To: ${email}`);
    console.log(`Name: ${name}`);
    console.log(`Plan: ${planName}`);
    console.log(`Period End: ${periodEnd.toLocaleDateString()}`);
    console.log("=================================\n");
    return { success: true };
  }

  try {
    await resend.emails.send({
      from: emailFrom,
      to: email,
      subject: `Subscription Confirmed - ${planName} Plan`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Subscription Activated! 🎊</h1>
            </div>
            <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
              <p style="font-size: 16px; margin-bottom: 30px;">
                Your subscription to the <strong>${planName}</strong> plan has been successfully activated. Thank you for choosing us!
              </p>
              <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #10b981;">
                <h3 style="margin-top: 0; color: #059669;">Subscription Details:</h3>
                <p style="margin: 10px 0;"><strong>Plan:</strong> ${planName}</p>
                <p style="margin: 10px 0;"><strong>Next billing date:</strong> ${periodEnd.toLocaleDateString()}</p>
              </div>
              <div style="text-align: center; margin: 40px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 50px; font-weight: 600; display: inline-block; font-size: 16px;">
                  View Billing Details
                </a>
              </div>
              <p style="font-size: 14px; color: #999; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
                You can manage your subscription, update payment methods, or view invoices anytime from your billing dashboard.
              </p>
            </div>
          </body>
        </html>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send subscription confirmation email:", error);
    return { success: false, error };
  }
}

export async function sendSubscriptionCanceledEmail(
  email: string,
  name: string,
  periodEnd: Date
) {
  // If Resend is not configured, log for development
  if (!resend) {
    console.log("\n=================================");
    console.log("📧 SUBSCRIPTION CANCELED EMAIL (Development Mode)");
    console.log("=================================");
    console.log(`To: ${email}`);
    console.log(`Name: ${name}`);
    console.log(`Access Until: ${periodEnd.toLocaleDateString()}`);
    console.log("=================================\n");
    return { success: true };
  }

  try {
    await resend.emails.send({
      from: emailFrom,
      to: email,
      subject: "Subscription Canceled - We're Sorry to See You Go",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Subscription Canceled</h1>
            </div>
            <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
              <p style="font-size: 16px; margin-bottom: 30px;">
                We're sorry to see you go. Your subscription has been canceled, but you'll continue to have access to all features until <strong>${periodEnd.toLocaleDateString()}</strong>.
              </p>
              <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f59e0b;">
                <p style="margin: 0;"><strong>Access until:</strong> ${periodEnd.toLocaleDateString()}</p>
                <p style="margin: 10px 0 0 0; font-size: 14px; color: #92400e;">
                  You can reactivate your subscription anytime before this date.
                </p>
              </div>
              <div style="text-align: center; margin: 40px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 50px; font-weight: 600; display: inline-block; font-size: 16px;">
                  Reactivate Subscription
                </a>
              </div>
              <p style="font-size: 14px; color: #999; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
                We'd love to hear your feedback. Please let us know if there's anything we could have done better.
              </p>
            </div>
          </body>
        </html>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send subscription canceled email:", error);
    return { success: false, error };
  }
}

export async function sendInvoiceEmail(
  email: string,
  name: string,
  invoiceUrl: string,
  amount: number,
  invoiceNumber: string
) {
  // If Resend is not configured, log for development
  if (!resend) {
    console.log("\n=================================");
    console.log("📧 INVOICE EMAIL (Development Mode)");
    console.log("=================================");
    console.log(`To: ${email}`);
    console.log(`Name: ${name}`);
    console.log(`Invoice: ${invoiceNumber}`);
    console.log(`Amount: $${(amount / 100).toFixed(2)}`);
    console.log(`URL: ${invoiceUrl}`);
    console.log("=================================\n");
    return { success: true };
  }

  try {
    await resend.emails.send({
      from: emailFrom,
      to: email,
      subject: `Invoice ${invoiceNumber} - Payment Confirmed`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Payment Received</h1>
            </div>
            <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
              <p style="font-size: 16px; margin-bottom: 30px;">
                Thank you for your payment! Your invoice has been paid successfully.
              </p>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h3 style="margin-top: 0; color: #667eea;">Invoice Details:</h3>
                <p style="margin: 10px 0;"><strong>Invoice Number:</strong> ${invoiceNumber}</p>
                <p style="margin: 10px 0;"><strong>Amount Paid:</strong> $${(amount / 100).toFixed(2)}</p>
              </div>
              <div style="text-align: center; margin: 40px 0;">
                <a href="${invoiceUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 50px; font-weight: 600; display: inline-block; font-size: 16px;">
                  View Invoice
                </a>
              </div>
              <p style="font-size: 14px; color: #999; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
                You can download a copy of your invoice anytime from your billing dashboard.
              </p>
            </div>
          </body>
        </html>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send invoice email:", error);
    return { success: false, error };
  }
}

export async function sendSupportReplyEmail(
  email: string,
  name: string,
  subject: string
) {
  // If Resend is not configured, log for development
  if (!resend) {
    console.log("\n=================================");
    console.log("📧 SUPPORT REPLY EMAIL (Development Mode)");
    console.log("=================================");
    console.log(`To: ${email}`);
    console.log(`Name: ${name}`);
    console.log(`Subject: ${subject}`);
    console.log("=================================\n");
    return { success: true };
  }

  try {
    await resend.emails.send({
      from: emailFrom,
      to: email,
      subject: `Re: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">We've Received Your Message</h1>
            </div>
            <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
              <p style="font-size: 16px; margin-bottom: 30px;">
                Thank you for contacting our support team. We've received your message and one of our team members will get back to you as soon as possible.
              </p>
              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #3b82f6;">
                <p style="margin: 0;"><strong>Subject:</strong> ${subject}</p>
                <p style="margin: 10px 0 0 0; font-size: 14px; color: #1e40af;">
                  Expected response time: 24-48 hours
                </p>
              </div>
              <p style="font-size: 14px; color: #999; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
                In the meantime, you might find answers in our documentation or FAQ section.
              </p>
            </div>
          </body>
        </html>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send support reply email:", error);
    return { success: false, error };
  }
}

// Admin Notification Emails

export async function sendAdminSubscriptionNotification(
  userEmail: string,
  userName: string,
  planName: string,
  amount: number,
  action: "created" | "trial" | "upgraded" | "downgraded"
) {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.log("ADMIN_EMAIL not configured, skipping admin notification");
    return { success: false, error: "Admin email not configured" };
  }

  // If Resend is not configured, log for development
  if (!resend) {
    console.log("\n=================================");
    console.log("📧 ADMIN NOTIFICATION (Development Mode)");
    console.log("=================================");
    console.log(`To: ${adminEmail}`);
    console.log(`Action: ${action}`);
    console.log(`User: ${userName} (${userEmail})`);
    console.log(`Plan: ${planName}`);
    console.log(`Amount: $${(amount / 100).toFixed(2)}`);
    console.log("=================================\n");
    return { success: true };
  }

  const actionText = {
    created: "New Subscription",
    trial: "New Trial Started",
    upgraded: "Subscription Upgraded",
    downgraded: "Subscription Downgraded",
  }[action];

  const actionColor = {
    created: "#10b981",
    trial: "#3b82f6",
    upgraded: "#8b5cf6",
    downgraded: "#f59e0b",
  }[action];

  try {
    await resend.emails.send({
      from: emailFrom,
      to: adminEmail,
      subject: `${actionText}: ${userName} - ${planName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: ${actionColor}; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">${actionText}</h1>
            </div>
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin-top: 0; color: ${actionColor};">Subscription Details</h3>
                <p style="margin: 8px 0;"><strong>User:</strong> ${userName}</p>
                <p style="margin: 8px 0;"><strong>Email:</strong> ${userEmail}</p>
                <p style="margin: 8px 0;"><strong>Plan:</strong> ${planName}</p>
                <p style="margin: 8px 0;"><strong>Amount:</strong> $${(amount / 100).toFixed(2)}</p>
                <p style="margin: 8px 0;"><strong>Action:</strong> ${actionText}</p>
              </div>
              <p style="font-size: 14px; color: #666;">
                This is an automated notification from your subscription management system.
              </p>
            </div>
          </body>
        </html>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send admin notification:", error);
    return { success: false, error };
  }
}
