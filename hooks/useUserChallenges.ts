import { useState, useEffect } from 'react';

interface Challenge {
    id: number;
    title: string;
    image: string;
    duration: number;
    level: number;
}

export interface UserChallenge {
    id: number;
    status: string;
    progress: number;
    startDate: string;
    completedAt?: string;
    challenge: Challenge;
}

export function useUserChallenges(userId: string | number) {
    const [challenges, setChallenges] = useState<UserChallenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) return;

        async function fetchChallenges() {
            try {
                const res = await fetch(`/api/users/${userId}/challenges`);
                if (!res.ok) throw new Error('Failed to fetch challenges');
                const data = await res.json();
                setChallenges(data);
            } catch (err) {
                setError('Error loading challenges');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchChallenges();
    }, [userId]);

    return { challenges, loading, error };
}
