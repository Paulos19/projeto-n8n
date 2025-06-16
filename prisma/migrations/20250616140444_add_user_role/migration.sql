/*
  Warnings:

  - You are about to drop the `accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `avaliacoes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `chat_interactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `customer_reviews` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `gemini_chat_messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sellers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `verification_tokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- DropForeignKey
ALTER TABLE "ChatbotActiveSession" DROP CONSTRAINT "ChatbotActiveSession_userId_fkey";

-- DropForeignKey
ALTER TABLE "ChatbotArchivedChat" DROP CONSTRAINT "ChatbotArchivedChat_userId_fkey";

-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_userId_fkey";

-- DropForeignKey
ALTER TABLE "avaliacoes" DROP CONSTRAINT "avaliacoes_sellerId_fkey";

-- DropForeignKey
ALTER TABLE "avaliacoes" DROP CONSTRAINT "avaliacoes_userId_fkey";

-- DropForeignKey
ALTER TABLE "chat_interactions" DROP CONSTRAINT "chat_interactions_sellerId_fkey";

-- DropForeignKey
ALTER TABLE "chat_interactions" DROP CONSTRAINT "chat_interactions_userId_fkey";

-- DropForeignKey
ALTER TABLE "customer_reviews" DROP CONSTRAINT "customer_reviews_userId_fkey";

-- DropForeignKey
ALTER TABLE "gemini_chat_messages" DROP CONSTRAINT "gemini_chat_messages_userId_fkey";

-- DropForeignKey
ALTER TABLE "sellers" DROP CONSTRAINT "sellers_storeOwnerId_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_userId_fkey";

-- DropTable
DROP TABLE "accounts";

-- DropTable
DROP TABLE "avaliacoes";

-- DropTable
DROP TABLE "chat_interactions";

-- DropTable
DROP TABLE "customer_reviews";

-- DropTable
DROP TABLE "gemini_chat_messages";

-- DropTable
DROP TABLE "sellers";

-- DropTable
DROP TABLE "sessions";

-- DropTable
DROP TABLE "users";

-- DropTable
DROP TABLE "verification_tokens";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "identifier" TEXT,
    "passwordHash" TEXT,
    "webhookApiKey" TEXT,
    "instanceName" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seller" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "evolutionInstanceName" TEXT NOT NULL,
    "evolutionApiKey" TEXT NOT NULL,
    "sellerWhatsAppNumber" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "storeOwnerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Seller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Avaliacao" (
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

    CONSTRAINT "Avaliacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerReview" (
    "id" TEXT NOT NULL,
    "reviewerName" TEXT,
    "rating" INTEGER,
    "comment" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatInteraction" (
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

    CONSTRAINT "ChatInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeminiChatMessage" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeminiChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
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

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_identifier_key" ON "User"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "User_webhookApiKey_key" ON "User"("webhookApiKey");

-- CreateIndex
CREATE UNIQUE INDEX "Seller_storeOwnerId_evolutionInstanceName_key" ON "Seller"("storeOwnerId", "evolutionInstanceName");

-- CreateIndex
CREATE UNIQUE INDEX "Seller_storeOwnerId_evolutionApiKey_key" ON "Seller"("storeOwnerId", "evolutionApiKey");

-- CreateIndex
CREATE UNIQUE INDEX "Seller_storeOwnerId_sellerWhatsAppNumber_key" ON "Seller"("storeOwnerId", "sellerWhatsAppNumber");

-- CreateIndex
CREATE INDEX "Avaliacao_userId_idx" ON "Avaliacao"("userId");

-- CreateIndex
CREATE INDEX "Avaliacao_sellerId_idx" ON "Avaliacao"("sellerId");

-- CreateIndex
CREATE INDEX "CustomerReview_userId_idx" ON "CustomerReview"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatInteraction_messageId_key" ON "ChatInteraction"("messageId");

-- CreateIndex
CREATE INDEX "ChatInteraction_remoteJid_idx" ON "ChatInteraction"("remoteJid");

-- CreateIndex
CREATE INDEX "ChatInteraction_eventTimestamp_idx" ON "ChatInteraction"("eventTimestamp");

-- CreateIndex
CREATE INDEX "ChatInteraction_userId_idx" ON "ChatInteraction"("userId");

-- CreateIndex
CREATE INDEX "ChatInteraction_sellerId_idx" ON "ChatInteraction"("sellerId");

-- CreateIndex
CREATE INDEX "GeminiChatMessage_userId_createdAt_idx" ON "GeminiChatMessage"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "Seller" ADD CONSTRAINT "Seller_storeOwnerId_fkey" FOREIGN KEY ("storeOwnerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerReview" ADD CONSTRAINT "CustomerReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatInteraction" ADD CONSTRAINT "ChatInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatInteraction" ADD CONSTRAINT "ChatInteraction_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeminiChatMessage" ADD CONSTRAINT "GeminiChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatbotActiveSession" ADD CONSTRAINT "ChatbotActiveSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatbotArchivedChat" ADD CONSTRAINT "ChatbotArchivedChat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
