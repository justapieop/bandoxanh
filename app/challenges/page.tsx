'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Challenge {
    id: number;
    title: string;
    description: string;
    image: string;
    duration: number;
    points: number;
    level: number;
    _count: {
        users: number;
    };
}

export default function ChallengesPage() {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchChallenges();
    }, []);

    async function fetchChallenges() {
        try {
            const res = await fetch('/api/challenges');
            if (res.ok) {
                const data = await res.json();
                setChallenges(data);
            }
        } catch (error) {
            console.error('Failed to fetch challenges:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Hero Section */}
            <div className="bg-green-600 text-white py-12 px-4 mb-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl font-bold mb-4">Thử thách Sống Xanh</h1>
                    <p className="text-xl opacity-90">
                        Tham gia thử thách, xây dựng thói quen tốt và nhận huy hiệu độc quyền!
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {challenges.map((challenge) => (
                        <Link
                            href={`/challenges/${challenge.id}`}
                            key={challenge.id}
                            className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="relative h-56 w-full">
                                <Image
                                    src={challenge.image}
                                    alt={challenge.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-green-700 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                                    {challenge.duration} Ngày
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">
                                        Cấp độ {challenge.level}
                                    </span>
                                    <span className="text-gray-500 text-xs">
                                        👥 {challenge._count?.users || 0} người tham gia
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                                    {challenge.title}
                                </h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {challenge.description}
                                </p>

                                <div className="flex items-center justify-between mt-4 text-green-600 font-medium">
                                    <span>+{challenge.points} Điểm</span>
                                    <span className="group-hover:translate-x-1 transition-transform">
                                        Chi tiết &rarr;
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {challenges.length === 0 && (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🌱</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có thử thách nào</h3>
                        <p className="text-gray-500">Hãy quay lại sau nhé!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
