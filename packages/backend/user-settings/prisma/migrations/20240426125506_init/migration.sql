-- CreateTable
CREATE TABLE "user_settings" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "tags" TEXT[],
    "value" JSONB NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_settings_username_idx" ON "user_settings"("username");

-- CreateIndex
CREATE INDEX "user_settings_key_idx" ON "user_settings"("key");

-- CreateIndex
CREATE INDEX "user_settings_tags_idx" ON "user_settings" USING GIN ("tags");

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_username_key_tags_key" ON "user_settings"("username", "key", "tags");
