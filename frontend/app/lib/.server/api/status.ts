import { BadgeType } from "~/lib/.client/components/Badges";
import { prisma } from "../prisma";

async function get(params: { messageId: string }) {
  const { messageId } = params;

  const candidate = await prisma.status.findFirst({
    where: {
      messageId,
    },
  });

  if (!candidate) {
    return prisma.status.create({
      data: {
        messageId,
      },
    });
  }

  return candidate;
}

async function decline(params: { messageId: string }) {
  const { messageId } = params;

  return prisma.status.upsert({
    where: {
      messageId,
    },
    update: {
      status: "DECLINED",
    },
    create: {
      messageId,
      status: "DECLINED",
    },
  });
}

async function resolve(params: { messageId: string }) {
  const { messageId } = params;

  return prisma.status.upsert({
    where: {
      messageId,
    },
    update: {
      status: "DONE",
    },
    create: {
      messageId,
      status: "DONE",
    },
  });
}

async function upsert(params: { messageId: string; status: BadgeType }) {
  const { messageId, status } = params;

  return prisma.status.upsert({
    where: {
      messageId,
    },
    update: {
      status,
    },
    create: {
      messageId,
      status,
    },
  });
}

export const status = Object.freeze({
  resolve,
  decline,
  get,
  upsert,
});
