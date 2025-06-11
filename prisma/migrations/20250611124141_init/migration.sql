-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "identifier" TEXT,
    "passwordHash" TEXT,
    "webhookApiKey" TEXT,
    "instanceName" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sellers" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "evolutionInstanceName" TEXT NOT NULL,
    "evolutionApiKey" TEXT NOT NULL,
    "sellerWhatsAppNumber" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "storeOwnerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sellers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avaliacoes" (
    "id" TEXT NOT NULL,
    "nota_cliente" INTEGER,
    "pontos_fortes" TEXT[],
    "pontos_fracos" TEXT[],
    "tempo_resposta" TEXT,
    "clareza_comunicacao" TEXT,
    "resolucao_problema" TEXT,
    "sugestoes_melhoria" TEXT[],
    "resumo_atendimento" TEXT,
    "remoteJid" TEXT,
    "userId" TEXT,
    "sellerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avaliacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_reviews" (
    "id" TEXT NOT NULL,
    "reviewerName" TEXT,
    "rating" INTEGER,
    "comment" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_interactions" (
    "id" TEXT NOT NULL,
    "remoteJid" TEXT NOT NULL,
    "messageId" TEXT,
    "customerName" TEXT,
    "chatHistory" JSONB,
    "analysisSummary" TEXT,
    "analysisKeywords" TEXT[],
    "sellerInstanceName" TEXT,
    "interactionType" TEXT,
    "content" TEXT,
    "eventTimestamp" TIMESTAMP(3) NOT NULL,
    "source" TEXT,
    "status" TEXT,
    "metadata" JSONB,
    "userId" TEXT,
    "sellerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gemini_chat_messages" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gemini_chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "ChatbotActiveSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "messages" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatbotActiveSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatbotArchivedChat" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "messages" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatbotArchivedChat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_identifier_key" ON "users"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "users_webhookApiKey_key" ON "users"("webhookApiKey");

-- CreateIndex
CREATE UNIQUE INDEX "sellers_storeOwnerId_evolutionInstanceName_key" ON "sellers"("storeOwnerId", "evolutionInstanceName");

-- CreateIndex
CREATE UNIQUE INDEX "sellers_storeOwnerId_evolutionApiKey_key" ON "sellers"("storeOwnerId", "evolutionApiKey");

-- CreateIndex
CREATE UNIQUE INDEX "sellers_storeOwnerId_sellerWhatsAppNumber_key" ON "sellers"("storeOwnerId", "sellerWhatsAppNumber");

-- CreateIndex
CREATE INDEX "avaliacoes_userId_idx" ON "avaliacoes"("userId");

-- CreateIndex
CREATE INDEX "avaliacoes_sellerId_idx" ON "avaliacoes"("sellerId");

-- CreateIndex
CREATE INDEX "customer_reviews_userId_idx" ON "customer_reviews"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "chat_interactions_messageId_key" ON "chat_interactions"("messageId");

-- CreateIndex
CREATE INDEX "chat_interactions_remoteJid_idx" ON "chat_interactions"("remoteJid");

-- CreateIndex
CREATE INDEX "chat_interactions_eventTimestamp_idx" ON "chat_interactions"("eventTimestamp");

-- CreateIndex
CREATE INDEX "chat_interactions_userId_idx" ON "chat_interactions"("userId");

-- CreateIndex
CREATE INDEX "chat_interactions_sellerId_idx" ON "chat_interactions"("sellerId");

-- CreateIndex
CREATE INDEX "gemini_chat_messages_userId_createdAt_idx" ON "gemini_chat_messages"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "ChatbotActiveSession_userId_key" ON "ChatbotActiveSession"("userId");

-- AddForeignKey
ALTER TABLE "sellers" ADD CONSTRAINT "sellers_storeOwnerId_fkey" FOREIGN KEY ("storeOwnerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_reviews" ADD CONSTRAINT "customer_reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_interactions" ADD CONSTRAINT "chat_interactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_interactions" ADD CONSTRAINT "chat_interactions_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gemini_chat_messages" ADD CONSTRAINT "gemini_chat_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatbotActiveSession" ADD CONSTRAINT "ChatbotActiveSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatbotArchivedChat" ADD CONSTRAINT "ChatbotArchivedChat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
