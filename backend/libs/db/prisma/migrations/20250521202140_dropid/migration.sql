/*
  Warnings:

  - The primary key for the `telegram_channel` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `telegram_channel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "telegram_channel" DROP CONSTRAINT "telegram_channel_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "telegram_channel_pkey" PRIMARY KEY ("tag");
