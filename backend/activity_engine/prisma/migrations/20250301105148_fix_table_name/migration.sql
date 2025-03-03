/*
  Warnings:

  - You are about to drop the `StudentSectionItemProgress` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "StudentSectionItemProgress";

-- CreateTable
CREATE TABLE "student_section_item_progress" (
    "studentId" TEXT NOT NULL,
    "sectionItemId" TEXT NOT NULL,
    "courseInstanceId" TEXT NOT NULL,
    "progress" "ProgressEnum" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_section_item_progress_pkey" PRIMARY KEY ("studentId","sectionItemId","courseInstanceId")
);

-- CreateTable
CREATE TABLE "TotalProgress" (
    "id" SERIAL NOT NULL,
    "studentId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL,
    "courseInstanceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TotalProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AverageProgress" (
    "id" SERIAL NOT NULL,
    "progress" INTEGER NOT NULL,
    "courseInstanceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AverageProgress_pkey" PRIMARY KEY ("id")
);
