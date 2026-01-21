import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const userId = parseInt(params.id);
        if (isNaN(userId)) {
            return NextResponse.json(
                { error: 'Invalid user ID' },
                { status: 400 }
            );
        }

        const challenges = await prisma.userChallenge.findMany({
            where: { userId },
            include: {
                challenge: true,
            },
            orderBy: { startDate: 'desc' },
        });

        return NextResponse.json(challenges);
    } catch (error) {
        console.error('Error fetching user challenges:', error);
        return NextResponse.json(
            { error: 'Failed to fetch challenges' },
            { status: 500 }
        );
    }
}
