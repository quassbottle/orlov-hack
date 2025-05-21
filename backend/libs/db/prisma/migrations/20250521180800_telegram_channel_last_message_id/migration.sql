/*
  Warnings:

  - Added the required column `last_message_id` to the `telegram_channel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "telegram_channel" ADD COLUMN     "last_message_id" TEXT NOT NULL;
