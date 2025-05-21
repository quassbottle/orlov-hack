import bcrypt from "bcrypt";
import { prisma } from "../prisma";

export async function createUser(params: {
  username: string;
  password: string;
}) {
  const hash = await bcrypt.hash(params.password, 10);
  return prisma.user.create({
    data: {
      username: params.username,
      password: hash,
    },
  });
}
