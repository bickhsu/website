/*
  Warnings:

  - The values [General,Personal,Work] on the enum `DomainEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DomainEnum_new" AS ENUM ('GENERAL', 'PERSONAL', 'WORK');
ALTER TABLE "public"."execution_units" ALTER COLUMN "domain" DROP DEFAULT;
ALTER TABLE "public"."keyframes" ALTER COLUMN "domain" DROP DEFAULT;
ALTER TABLE "public"."knowledge_fragments" ALTER COLUMN "domain" DROP DEFAULT;
ALTER TABLE "public"."sequences" ALTER COLUMN "domain" DROP DEFAULT;
ALTER TABLE "execution_units" ALTER COLUMN "domain" TYPE "DomainEnum_new" USING (upper("domain"::text)::"DomainEnum_new");
ALTER TABLE "knowledge_fragments" ALTER COLUMN "domain" TYPE "DomainEnum_new" USING (upper("domain"::text)::"DomainEnum_new");
ALTER TABLE "sequences" ALTER COLUMN "domain" TYPE "DomainEnum_new" USING (upper("domain"::text)::"DomainEnum_new");
ALTER TABLE "keyframes" ALTER COLUMN "domain" TYPE "DomainEnum_new" USING (upper("domain"::text)::"DomainEnum_new");
ALTER TYPE "DomainEnum" RENAME TO "DomainEnum_old";
ALTER TYPE "DomainEnum_new" RENAME TO "DomainEnum";
DROP TYPE "public"."DomainEnum_old";
ALTER TABLE "execution_units" ALTER COLUMN "domain" SET DEFAULT 'GENERAL';
ALTER TABLE "keyframes" ALTER COLUMN "domain" SET DEFAULT 'GENERAL';
ALTER TABLE "knowledge_fragments" ALTER COLUMN "domain" SET DEFAULT 'GENERAL';
ALTER TABLE "sequences" ALTER COLUMN "domain" SET DEFAULT 'GENERAL';
COMMIT;

-- AlterTable
ALTER TABLE "execution_units" ALTER COLUMN "domain" SET DEFAULT 'GENERAL';

-- AlterTable
ALTER TABLE "keyframes" ALTER COLUMN "domain" SET DEFAULT 'GENERAL';

-- AlterTable
ALTER TABLE "knowledge_fragments" ALTER COLUMN "domain" SET DEFAULT 'GENERAL';

-- AlterTable
ALTER TABLE "sequences" ALTER COLUMN "domain" SET DEFAULT 'GENERAL';
