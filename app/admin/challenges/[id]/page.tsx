'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ChallengeFormPage({
    params,
}: {
    params: { id: string };
}) {
    const router = useRouter();
    const isNew = params.id === 'new';
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        instructions: '',
        image: '',
        duration: 30,
        points: 100,
        level: 1,
    });

    useEffect(() => {
        if (!isNew) {
            fetchChallenge();
        }
    }, []);

    async function fetchChallenge() {
        try {
            const res = await fetch(`/api/challenges/${params.id}`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setFormData({
                title: data.title,
                description: data.description,
                instructions: data.instructions,
                image: data.image,
                duration: data.duration,
                points: data.points,
                level: data.level,
            });
        } catch (err) {
            setError('Không thể tải thông tin thử thách');
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const url = isNew ? '/api/challenges' : `/api/challenges/${params.id}`;
            const method = isNew ? 'POST' : 'PUT';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('Failed to save');

            router.push('/admin/challenges');
            router.refresh();
        } catch (err) {
            setError('Có lỗi xảy ra khi lưu thử thách');
        } finally {
            setSaving(false);
        }
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });
            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();
            setFormData((prev) => ({ ...prev, image: data.url }));
        } catch (err) {
            alert('Upload ảnh thất bại');
        }
    }

    if (loading) return <LoadingSpinner />;

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">
                {isNew ? 'Tạo thử thách mới' : 'Chỉnh sửa thử thách'}
            </h1>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-sm">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tiêu đề
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        placeholder="VD: Thử thách 30 ngày giảm nhựa"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mô tả ngắn
                    </label>
                    <textarea
                        required
                        rows={3}
                        value={formData.description}
                        onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        placeholder="Mô tả về mục tiêu của thử thách..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cách thức thực hiện (Chi tiết)
                    </label>
                    <textarea
                        required
                        rows={5}
                        value={formData.instructions}
                        onChange={(e) =>
                            setFormData({ ...formData, instructions: e.target.value })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        placeholder="Hướng dẫn chi tiết cách tham gia và gửi bằng chứng..."
                    />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Thời gian (ngày)
                        </label>
                        <input
                            type="number"
                            min={1}
                            required
                            value={formData.duration}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    duration: parseInt(e.target.value),
                                })
                            }
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Điểm thưởng
                        </label>
                        <input
                            type="number"
                            min={0}
                            required
                            value={formData.points}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    points: parseInt(e.target.value),
                                })
                            }
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cấp độ (1-5)
                        </label>
                        <input
                            type="number"
                            min={1}
                            max={5}
                            required
                            value={formData.level}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    level: parseInt(e.target.value),
                                })
                            }
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hình ảnh minh họa
                    </label>
                    <div className="mt-1 flex items-center gap-4">
                        <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                            {formData.image ? (
                                <Image
                                    src={formData.image}
                                    alt="Preview"
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    No image
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-green-50 file:text-green-700
                  hover:file:bg-green-100"
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                PNG, JPG, GIF up to 5MB
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                        {saving ? 'Đang lưu...' : 'Lưu thử thách'}
                    </button>
                </div>
            </form>
        </div>
    );
}
