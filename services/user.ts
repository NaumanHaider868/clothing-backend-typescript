import { Role } from '@prisma/client';
import { prisma } from '../config';
import { hashPassword } from '../utils';
import { HttpError } from '../utils/httpError';
import { toPublicUser } from '../utils/user';

const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  userId: true,
  isVerified: true,
  phone: true,
  address: true,
  createdAt: true,
  updatedAt: true,
};

const listUsers = () =>
  prisma.users.findMany({
    select: userSelect,
    orderBy: { createdAt: 'desc' },
  });

const createStaff = async (input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  phone?: string | null;
}) => {
  if (input.role === Role.USER) {
    throw new HttpError(422, 'Create a customer from the store signup. Team roles are admin, manager, and editor.');
  }

  const existing = await prisma.users.findUnique({ where: { email: input.email } });
  if (existing) throw new HttpError(409, 'A user with this email already exists');

  const password = await hashPassword(input.password);
  if (!password) throw new HttpError(422, 'Password is required');

  const user = await prisma.users.create({
    data: {
      email: input.email,
      password,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone || null,
      role: input.role,
      isVerified: true,
    },
    select: userSelect,
  });

  return user;
};

const updateUserRole = async (actorId: number, userId: number, role: Role) => {
  if (actorId === userId) {
    throw new HttpError(400, 'You cannot change your own role');
  }

  const user = await prisma.users.findUnique({ where: { id: userId } });
  if (!user) throw new HttpError(404, 'User not found');

  if (user.role === Role.ADMIN && role !== Role.ADMIN) {
    const admins = await prisma.users.count({ where: { role: Role.ADMIN } });
    if (admins <= 1) throw new HttpError(400, 'The store needs at least one admin');
  }

  const updated = await prisma.users.update({
    where: { id: userId },
    data: { role },
    select: userSelect,
  });
  return updated;
};

const updateProfile = async (
  userId: number,
  input: { firstName?: string; lastName?: string; phone?: string | null; address?: string | null }
) => {
  const user = await prisma.users.update({
    where: { id: userId },
    data: {
      ...(input.firstName !== undefined ? { firstName: input.firstName } : {}),
      ...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
      ...(input.phone !== undefined ? { phone: input.phone || null } : {}),
      ...(input.address !== undefined ? { address: input.address || null } : {}),
    },
  });
  return toPublicUser(user);
};

export { listUsers, createStaff, updateUserRole, updateProfile };
