/*
  Warnings:

  - You are about to drop the column `created_at` on the `telegram_channel` table. All the data in the column will be lost.
  - You are about to drop the column `last_message_id` on the `telegram_channel` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `telegram_channel` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `telegram_channel` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `telegram_channel` table. All the data in the column will be lost.
  - Added the required column `tag` to the `telegram_channel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "telegram_channel" DROP COLUMN "created_at",
DROP COLUMN "last_message_id",
DROP COLUMN "title",
DROP COLUMN "updated_at",
DROP COLUMN "url",
ADD COLUMN     "tag" TEXT NOT NULL;
