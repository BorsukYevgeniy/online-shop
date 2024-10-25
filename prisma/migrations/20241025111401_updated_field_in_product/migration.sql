/*
  Warnings:

  - You are about to drop the column `photos` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "photos",
ADD COLUMN     "images" TEXT[];
