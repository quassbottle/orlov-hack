-- CreateEnum
CREATE TYPE "status_type" AS ENUM ('PROGRESS', 'DONE', 'DECLINED');

-- CreateTable
CREATE TABLE "status" (
    "id" SERIAL NOT NULL,
    "message_id" TEXT NOT NULL,
    "status" "status_type" NOT NULL DEFAULT 'PROGRESS',

    CONSTRAINT "status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telegram_channel" (
    "tag" TEXT NOT NULL,

    CONSTRAINT "telegram_channel_pkey" PRIMARY KEY ("tag")
);

-- CreateTable
CREATE TABLE "telegram_channel_scrape" (
    "id" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "tg_id" TEXT NOT NULL,
    "message_count" INTEGER,
    "scraped_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_message_id" TEXT,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "telegram_channel_scrape_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "status_message_id_key" ON "status"("message_id");

-- CreateIndex
CREATE INDEX "telegram_channel_scrape_scraped_at_idx" ON "telegram_channel_scrape"("scraped_at");

-- CreateIndex
CREATE INDEX "telegram_channel_scrape_tag_idx" ON "telegram_channel_scrape"("tag");
