import { PlatformRole } from '@prisma/client';

export interface AuthenticatedUser {
  sub: string;
  email: string;
  role: PlatformRole;
}