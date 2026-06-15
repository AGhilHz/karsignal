import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TrustLevel } from '@prisma/client';
import { TRUST_LEVEL_KEY } from '../decorators/trust-level.decorator';

@Injectable()
export class TrustLevelGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredLevel = this.reflector.getAllAndOverride<TrustLevel>(TRUST_LEVEL_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredLevel) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException();

    const levelOrder: Record<TrustLevel, number> = {
      LEVEL_0_UNVERIFIED: 0,
      LEVEL_1_PHONE_VERIFIED: 1,
      LEVEL_2_IDENTITY_VERIFIED: 2,
      LEVEL_3_EMPLOYMENT_VERIFIED: 3,
      LEVEL_4_INTERVIEW_VERIFIED: 4,
    };

    if (levelOrder[user.trustLevel] < levelOrder[requiredLevel]) {
      throw new ForbiddenException(
        'برای این عملیات باید سطح اعتماد بالاتری داشته باشید. لطفاً حساب خود را تأیید کنید.',
      );
    }

    return true;
  }
}
