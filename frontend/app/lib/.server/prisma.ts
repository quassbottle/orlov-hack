import { PrismaClient } from "@prisma/client";
import { singleton } from "./singleton";
import { User } from "@prisma/client/wasm";

export const prisma = singleton("prisma", () => new PrismaClient());

export type UserModel = User;
