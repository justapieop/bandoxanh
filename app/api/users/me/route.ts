import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();

    console.log('Auth userId:', userId);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        avatar: true,
      },
    });

    console.log('Found user:', user);

    // If user doesn't exist in database, try to find by email or create them
    if (!user) {
      const clerkUser = await currentUser();

      if (!clerkUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const email = clerkUser.emailAddresses[0]?.emailAddress || '';
      const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User';
      const avatar = clerkUser.imageUrl || '';

      // Try to find existing user by email and update clerkId
      const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true, isAdmin: true },
      });

      if (existingUser) {
        // Update existing user with new clerkId
        user = await prisma.user.update({
          where: { email },
          data: {
            clerkId: userId,
            name,
            avatar,
          },
          select: {
            id: true,
            email: true,
            name: true,
            isAdmin: true,
            avatar: true,
          },
        });
        console.log('Updated existing user with new clerkId:', user);
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            clerkId: userId,
            email,
            name,
            avatar,
            isAdmin: false,
          },
          select: {
            id: true,
            email: true,
            name: true,
            isAdmin: true,
            avatar: true,
          },
        });
        console.log('Created new user:', user);
      }
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, bio } = body;

    console.log('Updating user:', userId, { name, bio });

    const updatedUser = await prisma.user.update({
      where: { clerkId: userId },
      data: {
        name,
        bio,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
