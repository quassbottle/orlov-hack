import { PrismaClient, User } from "@prisma/client";
import { singleton } from "./singleton";

export const prisma = singleton("prisma", () => new PrismaClient());

export type UserModel = User;
