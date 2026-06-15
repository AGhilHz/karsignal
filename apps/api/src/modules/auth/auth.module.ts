import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TrustService } from './trust.service';
import { AnonymityService } from './anonymity.service';
import { OtpService } from './otp.service';
import { EmailService } from './email.service';
import { PasswordResetService } from './password-reset.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN', '15m') },
      }),
    }),
    BullModule.registerQueue({ name: 'notifications' }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TrustService,
    AnonymityService,
    OtpService,
    EmailService,
    PasswordResetService,
    JwtStrategy,
    JwtRefreshStrategy,
    LocalStrategy,
  ],
  exports: [AuthService, TrustService, AnonymityService, EmailService, JwtModule],
})
export class AuthModule {}
