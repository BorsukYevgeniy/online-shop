/*
  Warnings:

  - A unique constraint covering the columns `[verificationLink]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - The required column `verificationLink` was added to the `User` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verificationLink" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_verificationLink_key" ON "User"("verificationLink");
