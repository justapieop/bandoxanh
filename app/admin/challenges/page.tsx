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
    level: number;
    _count: {
        users: number;
    };
}

export default function AdminChallengesPage() {
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

    async function handleDelete(id: number) {
        if (!confirm('Bạn có chắc muốn xóa thử thách này?')) return;

        try {
            const res = await fetch(`/api/challenges/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setChallenges(challenges.filter((c) => c.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete challenge:', error);
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Quản lý Thử thách</h1>
                <Link
                    href="/admin/challenges/new"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                    + Tạo thử thách mới
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {challenges.map((challenge) => (
                    <div
                        key={challenge.id}
                        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 flex flex-col"
                    >
                        <div className="relative h-48 w-full">
                            <Image
                                src={challenge.image}
                                alt={challenge.title}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                                {challenge.duration} ngày
                            </div>
                        </div>

                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                                {challenge.title}
                            </h3>
                            <p className="text-gray-500 text-sm mb-4 line-clamp-3 flex-1">
                                {challenge.description}
                            </p>

                            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                <span>Cấp độ: {challenge.level}</span>
                                <span>👥 {challenge._count?.users || 0} tham gia</span>
                            </div>

                            <div className="flex gap-2 mt-auto">
                                <Link
                                    href={`/admin/challenges/${challenge.id}`}
                                    className="flex-1 text-center py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    Chỉnh sửa
                                </Link>
                                <button
                                    onClick={() => handleDelete(challenge.id)}
                                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {challenges.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-gray-500">Chưa có thử thách nào.</p>
                </div>
            )}
        </div>
    );
}
