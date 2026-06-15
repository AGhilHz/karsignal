import { SetMetadata } from '@nestjs/common';
import { TrustLevel } from '@prisma/client';
export const TRUST_LEVEL_KEY = 'trustLevel';
export const RequireTrustLevel = (level: TrustLevel) => SetMetadata(TRUST_LEVEL_KEY, level);
