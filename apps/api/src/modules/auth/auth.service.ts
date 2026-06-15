import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { TrustService } from './trust.service';
import { AnonymityService } from './anonymity.service';
import { OtpService } from './otp.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User, UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    private trustService: TrustService,
    private anonymityService: AnonymityService,
    private otpService: OtpService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('این ایمیل قبلاً ثبت شده است');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Generate anonymous token (cryptographically separated from identity)
    const anonymousTokenHash = await this.anonymityService.generateAnonymousToken(dto.email);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        anonymousTokenHash,
        profile: {
          create: {
            firstName: dto.firstName,
            lastName: dto.lastName,
          },
        },
      },
      include: { profile: true },
    });

    // Send email verification OTP
    await this.otpService.sendEmailOtp(user.id, user.email);

    const tokens = await this.generateTokens(user);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async login(dto: LoginDto, userAgent?: string, ipAddress?: string) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('ایمیل یا رمز عبور اشتباه است');
    }
    if (user.isBanned) {
      throw new UnauthorizedException(`حساب شما مسدود شده است: ${user.banReason}`);
    }

    const tokens = await this.generateTokens(user);

    // Create session
    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: await bcrypt.hash(tokens.refreshToken, 8),
        userAgent,
        ipAddress,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return { user: this.sanitizeUser(user), ...tokens };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) return null;
    const isValid = await bcrypt.compare(password, user.passwordHash);
    return isValid ? user : null;
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const sessions = await this.prisma.session.findMany({
      where: { userId, expiresAt: { gt: new Date() } },
    });

    let validSession: typeof sessions[0] | null = null;
    for (const session of sessions) {
      const isValid = await bcrypt.compare(refreshToken, session.refreshToken);
      if (isValid) {
        validSession = session;
        break;
      }
    }

    if (!validSession) {
      throw new UnauthorizedException('نشست نامعتبر است');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.isBanned) {
      throw new UnauthorizedException();
    }

    const tokens = await this.generateTokens(user);

    // Rotate refresh token
    await this.prisma.session.update({
      where: { id: validSession.id },
      data: {
        refreshToken: await bcrypt.hash(tokens.refreshToken, 8),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return tokens;
  }

  async logout(userId: string, refreshToken: string) {
    const sessions = await this.prisma.session.findMany({ where: { userId } });
    for (const session of sessions) {
      const isValid = await bcrypt.compare(refreshToken, session.refreshToken);
      if (isValid) {
        await this.prisma.session.delete({ where: { id: session.id } });
        break;
      }
    }
  }

  async verifyEmailOtp(userId: string, code: string) {
    const verified = await this.otpService.verifyEmailOtp(userId, code);
    if (!verified) {
      throw new BadRequestException('کد تأیید نامعتبر یا منقضی شده است');
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { emailVerifiedAt: new Date() },
    });
    await this.trustService.recalculateTrustScore(userId);
    return { message: 'ایمیل با موفقیت تأیید شد' };
  }

  async sendPhoneOtp(userId: string, phone: string) {
    // Check phone not already used
    const existing = await this.prisma.user.findFirst({
      where: { phone, id: { not: userId } },
    });
    if (existing) {
      throw new ConflictException('این شماره قبلاً ثبت شده است');
    }
    await this.otpService.sendPhoneOtp(userId, phone);
    return { message: 'کد تأیید ارسال شد' };
  }

  async verifyPhoneOtp(userId: string, phone: string, code: string) {
    const verified = await this.otpService.verifyPhoneOtp(userId, code);
    if (!verified) {
      throw new BadRequestException('کد تأیید نامعتبر یا منقضی شده است');
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { phone, phoneVerifiedAt: new Date() },
    });
    await this.trustService.recalculateTrustScore(userId);
    return { message: 'شماره موبایل با موفقیت تأیید شد' };
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      trustLevel: user.trustLevel,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(
        { sub: user.id },
        {
          secret: this.config.get('JWT_REFRESH_SECRET'),
          expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  sanitizeUser(user: User) {
    const { passwordHash, anonymousTokenHash, ...safe } = user as any;
    return safe;
  }
}
