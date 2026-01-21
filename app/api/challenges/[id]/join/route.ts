import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const challengeId = parseInt(params.id);

        // Get internal user ID
        const user = await prisma.user.findUnique({
            where: { clerkId },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
        }

        // Check if challenge exists
        const challenge = await prisma.challenge.findUnique({
            where: { id: challengeId },
        });

        if (!challenge) {
            return NextResponse.json(
                { error: 'Challenge not found' },
                { status: 404 }
            );
        }

        // Check if already joined
        const existing = await prisma.userChallenge.findUnique({
            where: {
                userId_challengeId: {
                    userId: user.id,
                    challengeId,
                },
            },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'Already joined this challenge' },
                { status: 400 }
            );
        }

        // Join challenge
        const userChallenge = await prisma.userChallenge.create({
            data: {
                userId: user.id,
                challengeId,
                status: 'JOINED',
                progress: 0,
                startDate: new Date(),
            },
        });

        return NextResponse.json(userChallenge, { status: 201 });
    } catch (error) {
        console.error('Error joining challenge:', error);
        return NextResponse.json(
            { error: 'Failed to join challenge' },
            { status: 500 }
        );
    }
}

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            // If no user/auth, maybe just return empty or 401. 
            // But front-end might call this to check status often.
            // Let's return NOT_JOINED specific status.
            return NextResponse.json({ status: 'NOT_JOINED' });
        }

        const challengeId = parseInt(params.id);

        // Get internal user ID
        const user = await prisma.user.findUnique({
            where: { clerkId },
        });

        if (!user) {
            return NextResponse.json({ status: 'NOT_JOINED' });
        }

        const userChallenge = await prisma.userChallenge.findUnique({
            where: {
                userId_challengeId: {
                    userId: user.id,
                    challengeId,
                },
            },
            include: {
                logs: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!userChallenge) {
            return NextResponse.json({ status: 'NOT_JOINED' });
        }

        return NextResponse.json(userChallenge);
    } catch (error) {
        console.error('Error fetching challenge status:', error);
        return NextResponse.json(
            { error: 'Failed to fetch status' },
            { status: 500 }
        );
    }
}
