import bcrypt from "bcrypt";
import { prisma } from "../prisma";

export async function verifyLogin(params: {
  username: string;
  password: string;
}) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
  });
  if (!user) return null;

  const isValid = await bcrypt.compare(params.password, user.password);
  return isValid ? user : null;
}
