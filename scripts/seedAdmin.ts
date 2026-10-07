import { config } from 'dotenv';
import { Role } from '@prisma/client';
import { prisma } from '../config';
import { hashPassword } from '../utils';

config();

const seedAdmin = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD before seeding the admin');
  }

  const existing = await prisma.users.findUnique({ where: { email } });
  if (existing) {
    if (existing.role !== Role.ADMIN) {
      await prisma.users.update({ where: { id: existing.id }, data: { role: Role.ADMIN, isVerified: true } });
      console.log('Existing user promoted to admin:', email);
    } else {
      console.log('Admin already exists:', email);
    }
    return;
  }

  const hashed = await hashPassword(password);
  if (!hashed) throw new Error('ADMIN_PASSWORD is empty');

  await prisma.users.create({
    data: {
      email,
      password: hashed,
      firstName: process.env.ADMIN_FIRST_NAME || 'Store',
      lastName: process.env.ADMIN_LAST_NAME || 'Owner',
      role: Role.ADMIN,
      isVerified: true,
    },
  });
  console.log('Admin created:', email);
};

seedAdmin()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
