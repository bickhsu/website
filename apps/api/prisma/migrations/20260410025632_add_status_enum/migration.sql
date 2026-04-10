/*
  Warnings:

  - The `status` column on the `sequences` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "StatusEnum" AS ENUM ('ACTIVE', 'ARCHIVED');

-- AlterTable
ALTER TABLE "sequences" DROP COLUMN "status",
ADD COLUMN     "status" "StatusEnum" DEFAULT 'ACTIVE';
