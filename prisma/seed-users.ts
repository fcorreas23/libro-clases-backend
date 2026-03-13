import bcrypt from 'bcrypt';
import type { Role } from '@prisma/client';
import { defaultPassword, prisma } from './seed-client.js';
import { type SeededUser, usersToSeed } from './seed-data.js';

export async function seedRoles() {
  const roleNames = ['admin', 'director', 'utp', 'teacher', 'inspector'];

  const roles = await Promise.all(
    roleNames.map((name) =>
      prisma.role.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  return new Map<string, Role>(roles.map((role) => [role.name, role]));
}

export async function seedUsers(roleByName: Map<string, Role>) {
  const passwordHash = await bcrypt.hash(defaultPassword, 10);
  const users: SeededUser[] = [];

  for (const userData of usersToSeed) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        passwordHash,
        isActive: true,
      },
      create: {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        passwordHash,
        isActive: true,
      },
    });

    const role = roleByName.get(userData.role);
    if (!role) {
      throw new Error(`Role not found for ${userData.role}`);
    }

    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: role.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        roleId: role.id,
      },
    });

    users.push({ ...userData, id: user.id });
  }

  return users;
}
