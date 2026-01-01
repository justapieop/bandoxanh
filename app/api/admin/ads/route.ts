import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/lib/admin';

export async function GET(request: NextRequest) {
    const adminCheck = await checkAdmin(request);
    if (adminCheck) return adminCheck;

    try {
        const ads = await prisma.ad.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(ads);
    } catch (error) {
        console.error('Error fetching ads:', error);
        return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const adminCheck = await checkAdmin(request);
    if (adminCheck) return adminCheck;

    try {
        const body = await request.json();
        const { title, description, imageUrl, imageUrlHorizontal, linkUrl, position } = body;

        if (!title || (!imageUrl && !imageUrlHorizontal) || !linkUrl) {
            return NextResponse.json(
                { error: 'Missing required fields (title, link, and at least one image)' },
                { status: 400 }
            );
        }

        const ad = await prisma.ad.create({
            data: {
                title,
                description,
                imageUrl: imageUrl || '',
                imageUrlHorizontal,
                linkUrl,
                position: position || 'ALL',
                isActive: true,
            },
        });

        return NextResponse.json(ad, { status: 201 });
    } catch (error) {
        console.error('Error creating ad:', error);
        return NextResponse.json({ error: 'Failed to create ad' }, { status: 500 });
    }
}
