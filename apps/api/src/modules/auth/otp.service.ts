import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from './email.service';
import axios from 'axios';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private emailService: EmailService,
  ) {}

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendEmailOtp(userId: string, email: string): Promise<void> {
    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.prisma.verification.upsert({
      where: { token: `email_${userId}` },
      create: {
        userId,
        type: 'email_otp',
        code,
        token: `email_${userId}`,
        expiresAt,
      },
      update: { code, expiresAt },
    });

    await this.emailService.sendEmailVerification(email, code);
  }

  async verifyEmailOtp(userId: string, code: string): Promise<boolean> {
    const verification = await this.prisma.verification.findFirst({
      where: {
        userId,
        type: 'email_otp',
        code,
        verifiedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verification) return false;

    await this.prisma.verification.update({
      where: { id: verification.id },
      data: { verifiedAt: new Date() },
    });

    return true;
  }

  async sendPhoneOtp(userId: string, phone: string): Promise<void> {
    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await this.prisma.verification.upsert({
      where: { token: `phone_${userId}` },
      create: {
        userId,
        type: 'phone_otp',
        code,
        token: `phone_${userId}`,
        expiresAt,
        metadata: { phone },
      },
      update: { code, expiresAt, metadata: { phone } },
    });

    await this.sendSms(phone, `کد تأیید شما: ${code}\nاعتبار: ۵ دقیقه`);
  }

  async verifyPhoneOtp(userId: string, code: string): Promise<boolean> {
    const verification = await this.prisma.verification.findFirst({
      where: {
        userId,
        type: 'phone_otp',
        code,
        verifiedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verification) return false;

    await this.prisma.verification.update({
      where: { id: verification.id },
      data: { verifiedAt: new Date() },
    });

    return true;
  }

  private async sendSms(phone: string, message: string): Promise<void> {
    const apiKey = this.config.get('KAVENEGAR_API_KEY');
    if (!apiKey) {
      this.logger.warn(`SMS not configured. Would send to ${phone}: ${message}`);
      return;
    }

    try {
      await axios.post(
        `https://api.kavenegar.com/v1/${apiKey}/sms/send.json`,
        null,
        {
          params: {
            receptor: phone,
            message,
            sender: this.config.get('KAVENEGAR_SENDER'),
          },
        },
      );
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${phone}`, error);
    }
  }
}
