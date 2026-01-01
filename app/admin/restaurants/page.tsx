'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon, PencilIcon, TrashIcon, ArrowLeftIcon, XIcon, SaveIcon } from '@/components/Icons';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

interface VegetarianRestaurant {
    id: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    hours: string;
    menu: string;
    priceRange: string;
    image: string;
    isSponsored: boolean;
}

export default function AdminRestaurantsPage() {
    const router = useRouter();
    const [restaurants, setRestaurants] = useState<VegetarianRestaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRestaurant, setEditingRestaurant] = useState<VegetarianRestaurant | null>(null);

    // Form states
    const [formData, setFormData] = useState<Partial<VegetarianRestaurant>>({
        name: '',
        address: '',
        latitude: 10.762622,
        longitude: 106.660172,
        hours: '',
        menu: '',
        priceRange: '',
        image: '',
        isSponsored: false
    });

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            const res = await fetch('/api/restaurants');
            if (res.ok) {
                const data = await res.json();
                setRestaurants(data);
            } else {
                toast.error('Không thể tải danh sách nhà hàng');
            }
        } catch (error) {
            console.error(error);
            toast.error('Lỗi kết nối');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (restaurant?: VegetarianRestaurant) => {
        if (restaurant) {
            setEditingRestaurant(restaurant);
            setFormData({ ...restaurant });
        } else {
            setEditingRestaurant(null);
            setFormData({
                name: '',
                address: '',
                latitude: 10.762622,
                longitude: 106.660172,
                hours: '',
                menu: '',
                priceRange: '',
                image: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingRestaurant(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const method = editingRestaurant ? 'PUT' : 'POST';
            const url = editingRestaurant
                ? `/api/restaurants/${editingRestaurant.id}`
                : '/api/restaurants';

            // Ensure lat/lng are numbers
            const payload = {
                ...formData,
                latitude: Number(formData.latitude),
                longitude: Number(formData.longitude)
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                toast.success(editingRestaurant ? 'Cập nhật thành công' : 'Đã thêm nhà hàng mới');
                fetchRestaurants();
                handleCloseModal();
            } else {
                toast.error('Lỗi khi lưu dữ liệu');
            }
        } catch (error) {
            console.error(error);
            toast.error('Lỗi kết nối');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa nhà hàng này không?')) return;

        try {
            const res = await fetch(`/api/restaurants/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                toast.success('Đã xóa nhà hàng');
                fetchRestaurants();
            } else {
                toast.error('Không thể xóa nhà hàng');
            }
        } catch (error) {
            console.error(error);
            toast.error('Lỗi kết nối');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/admin')}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        >
                            <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Quản lý Nhà hàng Chay</h1>
                            <p className="text-gray-500">Thêm, sửa, xóa các địa điểm nhà hàng</p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>Thêm nhà hàng</span>
                    </button>
                </div>

                {/* List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {restaurants.map(restaurant => (
                        <div key={restaurant.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="relative h-48">
                                <img
                                    src={restaurant.image || '/placeholder-restaurant.jpg'}
                                    alt={restaurant.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <button
                                        onClick={() => handleOpenModal(restaurant)}
                                        className="p-2 bg-white/90 rounded-full hover:bg-white text-blue-600 shadow-sm"
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(restaurant.id)}
                                        className="p-2 bg-white/90 rounded-full hover:bg-white text-red-600 shadow-sm"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-lg text-gray-900 mb-1">{restaurant.name}</h3>
                                <p className="text-gray-500 text-sm line-clamp-2 mb-3">📍 {restaurant.address}</p>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                                        🕒 {restaurant.hours}
                                    </span>
                                    <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                                        💲 {restaurant.priceRange}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingRestaurant ? 'Chỉnh sửa nhà hàng' : 'Thêm nhà hàng mới'}
                                </h2>
                                <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                                    <XIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên nhà hàng</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Vĩ độ (Latitude)</label>
                                        <input
                                            type="number"
                                            step="any"
                                            required
                                            value={formData.latitude}
                                            onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Kinh độ (Longitude)</label>
                                        <input
                                            type="number"
                                            step="any"
                                            required
                                            value={formData.longitude}
                                            onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Giờ mở cửa</label>
                                        <input
                                            type="text"
                                            placeholder="7:00 - 22:00"
                                            required
                                            value={formData.hours}
                                            onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Khoảng giá</label>
                                        <input
                                            type="text"
                                            placeholder="30.000đ - 100.000đ"
                                            required
                                            value={formData.priceRange}
                                            onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Link ảnh</label>
                                        <input
                                            type="url"
                                            required
                                            value={formData.image}
                                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Link thực đơn (Menu)</label>
                                        <input
                                            type="text"
                                            value={formData.menu}
                                            onChange={(e) => setFormData({ ...formData, menu: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        />
                                    </div>

                                    <div className="col-span-2 flex items-center gap-2 pt-2">
                                        <input
                                            type="checkbox"
                                            id="isSponsored"
                                            checked={formData.isSponsored || false}
                                            onChange={(e) => setFormData({ ...formData, isSponsored: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="isSponsored" className="text-sm font-medium text-gray-700 select-none cursor-pointer">
                                            Nhà tài trợ (Hiển thị lên đầu danh sách)
                                        </label>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium flex items-center gap-2"
                                    >
                                        <SaveIcon className="w-4 h-4" />
                                        <span>{editingRestaurant ? 'Cập nhật' : 'Thêm mới'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
