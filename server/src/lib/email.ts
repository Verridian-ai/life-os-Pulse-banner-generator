import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ionos.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        const info = await transporter.sendMail({
            from: `"${process.env.SMTP_FROM_NAME || 'Nanobanna Pro'}" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });
        console.log('Message sent: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
};

const getEmailTemplate = (title: string, message: string, buttonText: string, link: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f4f4f5; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
        .header { background-color: #000000; padding: 30px; text-align: center; }
        .logo { font-size: 24px; font-weight: 700; color: #ffffff; text-decoration: none; letter-spacing: -0.5px; }
        .content { padding: 40px 40px; }
        .h1 { font-size: 24px; font-weight: 700; color: #111827; margin-bottom: 24px; margin-top: 0; text-align: center; }
        .text { font-size: 16px; color: #4b5563; margin-bottom: 24px; text-align: center; }
        .button-container { text-align: center; margin: 32px 0; }
        .button { background-color: #2563eb; color: #ffffff !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2); transition: background-color 0.2s; }
        .button:hover { background-color: #1d4ed8; }
        .footer { padding: 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center; font-size: 14px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Nanobanna Pro</div>
        </div>
        <div class="content">
            <h1 class="h1">${title}</h1>
            <p class="text">${message}</p>
            <div class="button-container">
                <a href="${link}" class="button" target="_blank">${buttonText}</a>
            </div>
            <p class="text" style="font-size: 14px; color: #6b7280;">If you didn't request this, you can safely ignore this email.</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Verridian AI. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

export const sendVerificationEmail = async (email: string, code: string) => {
    // In dev, use localhost; in prod, use real domain
    const baseUrl = process.env.NODE_ENV === 'production'
        ? 'https://life-os-banner.verridian.ai'
        : 'http://localhost:5173';

    const link = `${baseUrl}/verify-email?code=${code}&email=${encodeURIComponent(email)}`;

    return sendEmail(
        email,
        'Verify your email',
        getEmailTemplate(
            'Verify your email',
            'Please verify your email address to continue knowing your account is secure.',
            'Verify Email',
            link
        )
    );
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
    const baseUrl = process.env.NODE_ENV === 'production'
        ? 'https://life-os-banner.verridian.ai'
        : 'http://localhost:5173';

    const link = `${baseUrl}/reset-password?token=${token}`;

    return sendEmail(
        email,
        'Reset your password',
        getEmailTemplate(
            'Reset Password Request',
            'We received a request to reset your password. Click the button below to choose a new one.',
            'Reset Password',
            link
        )
    );
};
