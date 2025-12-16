
import { prisma } from './prisma';

export async function checkAndIncrementAIUsage(clerkId: string) {
    const user = await prisma.user.findUnique({
        where: { clerkId },
    });

    if (!user) {
        throw new Error('User not found');
    }

    // Safely check for plan, defaulting to FREE if not present or schema issue
    const isPro = (user as any).plan === 'PRO';

    const now = new Date();
    // Safely check for lastUsageReset
    const lastReset = (user as any).lastUsageReset ? new Date((user as any).lastUsageReset) : new Date(0);
    const isNewDay = now.toDateString() !== lastReset.toDateString();

    let currentUsage = (user as any).aiUsageCount || 0;

    if (isNewDay) {
        currentUsage = 0;
    }

    const limit = isPro ? 100 : 2;

    // Bypass limit in development for easier testing
    if (process.env.NODE_ENV === 'development') {
        // In dev, we can log this but still allow it, or enforce it. 
        // For now, let's enforce but log.
        console.log(`[AI Usage Dev] User: ${user.email}, Usage: ${currentUsage}/${limit}, Pro: ${isPro}`);
    }

    if (currentUsage >= limit && process.env.NODE_ENV !== 'development') {
        return {
            allowed: false,
            limit,
            usage: currentUsage,
            plan: (user as any).plan || 'FREE'
        };
    }

    // Increment
    try {
        await prisma.user.update({
            where: { clerkId },
            data: {
                aiUsageCount: isNewDay ? 1 : { increment: 1 },
                lastUsageReset: isNewDay ? now : undefined,
            },
        });
    } catch (e) {
        console.error("Failed to update AI usage stats:", e);
        // We still allow the request to proceed even if tracking fails, to not block the user
    }


    return {
        allowed: true,
        limit,
        usage: currentUsage + 1,
        plan: (user as any).plan || 'FREE'
    };
}

// In-memory cache for guest usage (resets when server restarts)
// In production, you would use Redis or a similar solution
const guestUsageCache: Map<string, { count: number; date: string }> = new Map();

export async function checkAndIncrementGuestUsage(ip: string) {
    const GUEST_LIMIT = 2; // 2 free trials per day for guests
    const today = new Date().toDateString();

    const cached = guestUsageCache.get(ip);

    // Reset if it's a new day
    if (!cached || cached.date !== today) {
        guestUsageCache.set(ip, { count: 1, date: today });
        console.log(`[Guest AI Usage] IP: ${ip.substring(0, 10)}..., Usage: 1/${GUEST_LIMIT}`);
        return {
            allowed: true,
            limit: GUEST_LIMIT,
            usage: 1,
            plan: 'GUEST'
        };
    }

    // Check if limit reached
    if (cached.count >= GUEST_LIMIT) {
        console.log(`[Guest AI Usage] IP: ${ip.substring(0, 10)}..., Limit reached: ${cached.count}/${GUEST_LIMIT}`);
        return {
            allowed: false,
            limit: GUEST_LIMIT,
            usage: cached.count,
            plan: 'GUEST'
        };
    }

    // Increment
    cached.count += 1;
    guestUsageCache.set(ip, cached);
    console.log(`[Guest AI Usage] IP: ${ip.substring(0, 10)}..., Usage: ${cached.count}/${GUEST_LIMIT}`);

    return {
        allowed: true,
        limit: GUEST_LIMIT,
        usage: cached.count,
        plan: 'GUEST'
    };
}
