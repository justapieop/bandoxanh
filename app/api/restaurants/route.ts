import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const restaurants = await prisma.vegetarianRestaurant.findMany({
            orderBy: [
                { isSponsored: 'desc' },
                { createdAt: 'desc' },
            ],
        });
        return NextResponse.json(restaurants);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch restaurants' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const restaurant = await prisma.vegetarianRestaurant.create({
            data: {
                name: body.name,
                address: body.address,
                latitude: body.latitude,
                longitude: body.longitude,
                hours: body.hours,
                menu: body.menu,
                priceRange: body.priceRange,
                image: body.image,
                isSponsored: body.isSponsored || false,
            },
        });
        return NextResponse.json(restaurant, { status: 201 });
    } catch (error) {
        console.error('Error creating restaurant:', error);
        return NextResponse.json(
            { error: 'Failed to create restaurant' },
            { status: 500 }
        );
    }
}
