-- CreateTable
CREATE TABLE "telegram_channel_scrape" (
    "id" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "tg_id" TEXT NOT NULL,
    "message_count" INTEGER NOT NULL,
    "scraped_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telegram_channel_scrape_pkey" PRIMARY KEY ("id")
);
