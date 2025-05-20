import { Prisma, PrismaClient } from '../generated/prisma';
import { DefaultArgs } from '../generated/prisma/runtime/library';

export * from './prisma.module';
export * from './prisma.service';

export type PrismaTransaction = Prisma.TransactionClient;
export type PaginationArgs = { take: number; skip: number };

export const TransactionIsolationLevel = Object.freeze(Prisma.TransactionIsolationLevel);
