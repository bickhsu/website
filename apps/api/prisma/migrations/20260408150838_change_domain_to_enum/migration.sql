/*
  Warnings:

  - The `domain` column on the `execution_units` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "execution_units" DROP COLUMN "domain",
ADD COLUMN     "domain" "DomainEnum" DEFAULT 'General';
