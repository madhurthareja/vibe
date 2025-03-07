import { Request, Response, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const FetchStreak: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { studentId, sectionId } = req.query;

    if (!studentId || !sectionId) {
        res.status(400).json({ error: 'Missing studentId or sectionId' });
        return;
    }

    try {
        const streak = await prisma.streak.findUnique({
            where: {
                studentId_sectionId: {
                    studentId: studentId as string,
                    sectionId: sectionId as string,
                },
            },
        });

        if (!streak) {
            res.status(404).json({ error: 'Streak not found' });
            return;
        }

        res.json({
            currentStreak: streak.currentStreak,
            longestStreak: streak.longestStreak,
        });
        return;
    } catch (error) {
        console.error('Error fetching streak:', error);
        res.status(500).json({ error: 'Internal server error' });
        return;
    }
};
