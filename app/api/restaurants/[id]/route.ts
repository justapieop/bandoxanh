
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        const body = await request.json();

        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const restaurant = await prisma.vegetarianRestaurant.update({
            where: { id },
            data: {
                name: body.name,
                address: body.address,
                latitude: body.latitude,
                longitude: body.longitude,
                hours: body.hours,
                menu: body.menu,
                priceRange: body.priceRange,
                image: body.image,
                isSponsored: body.isSponsored,
            },
        });

        return NextResponse.json(restaurant);
    } catch (error) {
        console.error('Error updating restaurant:', error);
        return NextResponse.json(
            { error: 'Failed to update restaurant' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);

        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        await prisma.vegetarianRestaurant.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Restaurant deleted successfully' });
    } catch (error) {
        console.error('Error deleting restaurant:', error);
        return NextResponse.json(
            { error: 'Failed to delete restaurant' },
            { status: 500 }
        );
    }
}
