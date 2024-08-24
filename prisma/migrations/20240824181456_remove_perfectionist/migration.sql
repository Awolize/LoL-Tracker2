/*
  Warnings:

  - You are about to drop the `_ChallengesPerfectionist` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ChallengesPerfectionist" DROP CONSTRAINT "_ChallengesPerfectionist_A_fkey";

-- DropForeignKey
ALTER TABLE "_ChallengesPerfectionist" DROP CONSTRAINT "_ChallengesPerfectionist_B_fkey";

-- DropTable
DROP TABLE "_ChallengesPerfectionist";
