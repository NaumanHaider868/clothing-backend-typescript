import { Role } from '@prisma/client';

interface AuthUser {
  id: number;
  userId: string;
  email: string;
  role: Role;
  firstName: string | null;
  lastName: string | null;
}

export type { AuthUser };
