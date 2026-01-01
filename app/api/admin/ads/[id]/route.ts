import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/lib/admin';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const adminCheck = await checkAdmin(request);
    if (adminCheck) return adminCheck;

    try {
        const { id } = await params;
        const body = await request.json();
        const { title, description, imageUrl, imageUrlHorizontal, linkUrl, position, isActive } = body;

        const ad = await prisma.ad.update({
            where: { id },
            data: {
                title,
                description,
                imageUrl,
                imageUrlHorizontal,
                linkUrl,
                position,
                isActive,
            },
        });

        return NextResponse.json(ad);
    } catch (error) {
        console.error('Error updating ad:', error);
        return NextResponse.json({ error: 'Failed to update ad' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const adminCheck = await checkAdmin(request);
    if (adminCheck) return adminCheck;

    try {
        const { id } = await params;
        await prisma.ad.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting ad:', error);
        return NextResponse.json({ error: 'Failed to delete ad' }, { status: 500 });
    }
}
