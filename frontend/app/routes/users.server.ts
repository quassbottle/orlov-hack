import { LoaderFunctionArgs } from "@remix-run/node";
import { UserModel, prisma } from "~/lib/.server/prisma";

export const loader = async ({
  params,
  request,
}: LoaderFunctionArgs): Promise<UserModel[]> => {
  return prisma.user.findMany();
};
