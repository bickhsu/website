CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "DomainEnum" AS ENUM ('General', 'Personal', 'Work');

-- CreateTable
CREATE TABLE "articles" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR,
    "content" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contextual_edges" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "source_id" UUID NOT NULL,
    "source_type" VARCHAR(50) NOT NULL,
    "target_id" UUID NOT NULL,
    "target_type" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contextual_edges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "execution_units" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "status" VARCHAR(20) DEFAULT 'To-Do',
    "problem_statement" TEXT NOT NULL,
    "value_delivered" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "title" VARCHAR(150) NOT NULL DEFAULT 'Untitled Action',
    "execution_log" TEXT,
    "domain" VARCHAR(50) DEFAULT 'General',

    CONSTRAINT "execution_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_fragments" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "content" TEXT NOT NULL,
    "domain" "DomainEnum" DEFAULT 'General',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "title" VARCHAR(150) NOT NULL DEFAULT 'Untitled Fragment',
    "hook" TEXT,

    CONSTRAINT "knowledge_fragments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ix_articles_id" ON "articles"("id");

-- CreateIndex
CREATE INDEX "ix_articles_title" ON "articles"("title");

-- CreateIndex
CREATE INDEX "idx_edges_source" ON "contextual_edges"("source_id", "source_type");

-- CreateIndex
CREATE INDEX "idx_edges_target" ON "contextual_edges"("target_id", "target_type");

