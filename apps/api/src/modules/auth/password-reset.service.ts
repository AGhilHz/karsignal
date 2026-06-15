import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from './email.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class PasswordResetService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private config: ConfigService,
  ) {}

  async requestReset(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    // Always return success to prevent email enumeration
    if (!user) return;

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.verification.upsert({
      where: { token: `reset_${user.id}` },
      create: { userId: user.id, type: 'password_reset', token, expiresAt },
      update: { token, expiresAt, verifiedAt: null },
    });

    const frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:3000');
    await this.emailService.sendPasswordReset(email, token, frontendUrl);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const verification = await this.prisma.verification.findFirst({
      where: {
        type: 'password_reset',
        token,
        verifiedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verification) {
      throw new BadRequestException('لینک بازیابی نامعتبر یا منقضی شده است');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: verification.userId },
        data: { passwordHash },
      }),
      this.prisma.verification.update({
        where: { id: verification.id },
        data: { verifiedAt: new Date() },
      }),
      // Invalidate all sessions
      this.prisma.session.deleteMany({ where: { userId: verification.userId } }),
    ]);
  }
}
