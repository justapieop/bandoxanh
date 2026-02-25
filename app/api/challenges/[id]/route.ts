import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idParam } = await params;
        const id = parseInt(idParam);
        if (isNaN(id)) {
            return NextResponse.json(
                { error: 'Invalid challenge ID' },
                { status: 400 }
            );
        }

        const challenge = await prisma.challenge.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { users: true },
                },
            },
        });

        if (!challenge) {
            return NextResponse.json(
                { error: 'Challenge not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(challenge);
    } catch (error) {
        console.error('Error fetching challenge:', error);
        return NextResponse.json(
            { error: 'Failed to fetch challenge' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idParam } = await params;
        const id = parseInt(idParam);
        const body = await request.json();

        // TODO: Add Admin check here

        const challenge = await prisma.challenge.update({
            where: { id },
            data: {
                title: body.title,
                description: body.description,
                instructions: body.instructions,
                image: body.image,
                duration: body.duration,
                points: body.points,
                level: body.level,
            },
        });

        return NextResponse.json(challenge);
    } catch (error) {
        console.error('Error updating challenge:', error);
        return NextResponse.json(
            { error: 'Failed to update challenge' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idParam } = await params;
        const id = parseInt(idParam);

        // TODO: Add Admin check here

        await prisma.challenge.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting challenge:', error);
        return NextResponse.json(
            { error: 'Failed to delete challenge' },
            { status: 500 }
        );
    }
}
