import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('دسترسی غیرمجاز');

    const roleHierarchy: Record<UserRole, number> = {
      GUEST: 0,
      USER: 1,
      VERIFIED_USER: 2,
      RECRUITER: 3,
      COMPANY_ADMIN: 3,
      MODERATOR: 4,
      SUPER_ADMIN: 5,
    };

    const userLevel = roleHierarchy[user.role] ?? 0;
    const hasRole = requiredRoles.some(
      (role) => userLevel >= roleHierarchy[role],
    );

    if (!hasRole) {
      throw new ForbiddenException('شما دسترسی لازم برای این عملیات را ندارید');
    }

    return true;
  }
}
