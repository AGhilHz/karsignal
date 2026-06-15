import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.get('SMTP_HOST', 'smtp.gmail.com'),
      port: config.get<number>('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: config.get('SMTP_USER'),
        pass: config.get('SMTP_PASS'),
      },
    });
  }

  async sendEmailVerification(to: string, code: string): Promise<void> {
    await this.send(to, 'تأیید ایمیل - پلتفرم شفافیت شغلی', `
      <div dir="rtl" style="font-family: Tahoma, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #2563eb;">تأیید ایمیل</h2>
        <p>کد تأیید شما:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1f2937;">
          ${code}
        </div>
        <p style="color: #6b7280; font-size: 14px;">این کد ۱۰ دقیقه اعتبار دارد.</p>
      </div>
    `);
  }

  async sendPasswordReset(to: string, token: string, frontendUrl: string): Promise<void> {
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${token}`;
    await this.send(to, 'بازیابی رمز عبور - پلتفرم شفافیت شغلی', `
      <div dir="rtl" style="font-family: Tahoma, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #2563eb;">بازیابی رمز عبور</h2>
        <p>برای بازیابی رمز عبور روی لینک زیر کلیک کنید:</p>
        <a href="${resetUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
          بازیابی رمز عبور
        </a>
        <p style="color: #6b7280; font-size: 14px;">این لینک ۱ ساعت اعتبار دارد. اگر این درخواست را نداده‌اید، این ایمیل را نادیده بگیرید.</p>
      </div>
    `);
  }

  async sendWelcome(to: string, firstName: string): Promise<void> {
    await this.send(to, 'خوش آمدید به پلتفرم شفافیت شغلی', `
      <div dir="rtl" style="font-family: Tahoma, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #2563eb;">خوش آمدید، ${firstName}!</h2>
        <p>حساب شما با موفقیت ایجاد شد.</p>
        <p>برای افزایش امتیاز اعتماد و دسترسی به تمام امکانات، شماره موبایل خود را تأیید کنید.</p>
        <p style="color: #6b7280; font-size: 12px;">هویت شما هرگز با محتوای ناشناس مرتبط نمی‌شود.</p>
      </div>
    `);
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    const from = this.config.get('SMTP_FROM', 'noreply@platform.com');
    try {
      await this.transporter.sendMail({ from, to, subject, html });
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      // Don't throw — email failure shouldn't break the flow
    }
  }
}
