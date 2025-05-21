-- AlterTable
ALTER TABLE "telegram_channel_scrape" ADD COLUMN     "ended_at" TIMESTAMP(3),
ALTER COLUMN "message_count" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "telegram_channel_scrape_tag_idx" ON "telegram_channel_scrape"("tag");

-- CreateIndex
CREATE INDEX "telegram_channel_scrape_scraped_at_idx" ON "telegram_channel_scrape"("scraped_at");
