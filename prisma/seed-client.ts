import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client.js';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

export const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(connectionString),
});

export const defaultPassword = 'Admin123456';
