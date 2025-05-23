import { telegram_channel } from "@prisma/client";
import { prisma } from "../prisma";

type TelegramChannelModel = telegram_channel;

export async function getAll(): Promise<TelegramChannelModel[]> {
  return prisma.telegram_channel.findMany();
}
