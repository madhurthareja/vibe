/*
  Warnings:

  - You are about to drop the `student_section_item_progress` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "student_section_item_progress";

-- CreateTable
CREATE TABLE "StudentSectionItemProgress" (
    "studentId" TEXT NOT NULL,
    "sectionItemId" TEXT NOT NULL,
    "courseInstanceId" TEXT NOT NULL,
    "progress" "ProgressEnum" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentSectionItemProgress_pkey" PRIMARY KEY ("studentId","sectionItemId","courseInstanceId")
);
