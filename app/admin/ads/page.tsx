'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ImageUpload from '@/components/ImageUpload';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Ad {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    imageUrlHorizontal?: string;
    linkUrl: string;
    position: 'ALL' | 'POPUP' | 'FOOTER';
    isActive: boolean;
}

export default function AdsAdminPage() {
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState<{
        title: string;
        description: string;
        imageUrl: string;
        imageUrlHorizontal: string;
        linkUrl: string;
        position: 'ALL' | 'POPUP' | 'FOOTER';
        isActive: boolean;
    }>({
        title: '',
        description: '',
        imageUrl: '',
        imageUrlHorizontal: '',
        linkUrl: '',
        position: 'ALL',
        isActive: true,
    });

    // Editing state
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        fetchAds();
    }, []);

    async function fetchAds() {
        try {
            const res = await fetch('/api/admin/ads');
            const data = await res.json();
            setAds(data);
        } catch (error) {
            console.error('Error fetching ads:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        try {
            const url = editingId
                ? `/api/admin/ads/${editingId}`
                : '/api/admin/ads';

            const method = editingId ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                await fetchAds();
                resetForm();
            } else {
                alert('Failed to save ad');
            }
        } catch (error) {
            console.error('Error saving ad:', error);
            alert('Error saving ad');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Bạn có chắc muốn xóa quảng cáo này?')) return;

        try {
            const res = await fetch(`/api/admin/ads/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setAds(ads.filter(a => a.id !== id));
            } else {
                alert('Failed to delete ad');
            }
        } catch (error) {
            console.error('Error deleting ad:', error);
        }
    }

    function handleEdit(ad: Ad) {
        setFormData({
            title: ad.title,
            description: ad.description || '',
            imageUrl: ad.imageUrl,
            imageUrlHorizontal: ad.imageUrlHorizontal || '',
            linkUrl: ad.linkUrl,
            position: ad.position || 'ALL',
            isActive: ad.isActive,
        });
        setEditingId(ad.id);
        setCreating(true);
    }

    function resetForm() {
        setFormData({
            title: '',
            description: '',
            imageUrl: '',
            imageUrlHorizontal: '',
            linkUrl: '',
            position: 'ALL',
            isActive: true,
        });
        setEditingId(null);
        setCreating(false);
    }

    if (loading) return <div className="p-8 flex justify-center"><LoadingSpinner /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Quản lý Quảng cáo
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Quản lý các banner quảng cáo và liên kết hiển thị trên popup
                    </p>
                </div>
                <div className="flex gap-3">
                    {!creating && (
                        <button
                            onClick={() => setCreating(true)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                        >
                            + Thêm quảng cáo
                        </button>
                    )}
                    <Link
                        href="/admin"
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                    >
                        ← Quay lại
                    </Link>
                </div>
            </div>

            {creating ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold mb-4 dark:text-white">
                        {editingId ? 'Chỉnh sửa quảng cáo' : 'Tạo quảng cáo mới'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Tiêu đề</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Ví dụ: Siêu Sale Shopee"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Mô tả (Tùy chọn)</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Mô tả ngắn gọn..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Hình ảnh Dọc (Popup)</label>
                            <ImageUpload
                                currentUrl={formData.imageUrl}
                                onUploadSuccess={(url) => setFormData({ ...formData, imageUrl: url })}
                                label="Tải lên banner dọc (Tỷ lệ 4:5)"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Hình ảnh Ngang (Footer)</label>
                            <ImageUpload
                                currentUrl={formData.imageUrlHorizontal || ''}
                                onUploadSuccess={(url) => setFormData({ ...formData, imageUrlHorizontal: url })}
                                label="Tải lên banner ngang (Tỷ lệ 4:1 hoặc 5:1)"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Liên kết đích</label>
                            <input
                                type="url"
                                required
                                value={formData.linkUrl}
                                onChange={e => setFormData({ ...formData, linkUrl: e.target.value })}
                                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="https://shopee.vn/..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Vị trí hiển thị</label>
                            <select
                                value={formData.position}
                                onChange={e => setFormData({ ...formData, position: e.target.value as 'ALL' | 'POPUP' | 'FOOTER' })}
                                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="ALL">Tất cả (Popup + Footer)</option>
                                <option value="POPUP">Chỉ Popup</option>
                                <option value="FOOTER">Chỉ Footer</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <label htmlFor="isActive" className="text-sm font-medium dark:text-gray-300">Kích hoạt hiển thị</label>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={saving || (!formData.imageUrl && !formData.imageUrlHorizontal)}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
                            >
                                {saving ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Tạo mới')}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ads.map(ad => (
                        <div key={ad.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="aspect-[4/3] relative bg-gray-100 dark:bg-gray-700">
                                <img
                                    src={ad.imageUrl}
                                    alt={ad.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className={`absolute top-2 right-2 px-2 py-1 text-xs rounded-full font-medium ${ad.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {ad.isActive ? 'Đang chạy' : 'Tạm dừng'}
                                </div>
                                <div className="absolute top-2 left-2 px-2 py-1 text-xs rounded-full font-medium bg-blue-100 text-blue-700">
                                    {ad.position === 'ALL' ? 'Tất cả' : ad.position === 'POPUP' ? 'Popup' : 'Footer'}
                                </div>
                            </div>

                            <div className="p-4">
                                <h3 className="font-bold text-lg mb-1 dark:text-white truncate">{ad.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 truncate">
                                    {ad.description || 'Không có mô tả'}
                                </p>
                                <a
                                    href={ad.linkUrl}
                                    target="_blank"
                                    className="text-xs text-blue-500 hover:underline block mb-4 truncate"
                                >
                                    {ad.linkUrl}
                                </a>

                                <div className="flex gap-2 justify-end pt-2 border-t border-gray-100 dark:border-gray-700">
                                    <button
                                        onClick={() => handleEdit(ad)}
                                        className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        onClick={() => handleDelete(ad.id)}
                                        className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {ads.length === 0 && (
                        <div className="col-span-full p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-gray-400">Chưa có quảng cáo nào. Bấm "Thêm quảng cáo" để tạo mới.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
