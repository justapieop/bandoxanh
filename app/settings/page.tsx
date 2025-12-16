'use client';

import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { UserCircle, Save, Camera, LogOut, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserData {
    id: number;
    email: string;
    name: string;
    avatar: string | null;
    bio: string | null;
    isAdmin: boolean;
}

export default function SettingsPage() {
    const { user, isLoaded, isSignedIn } = useUser();
    const { signOut } = useClerk();
    const router = useRouter();

    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
    });

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push('/sign-in');
        }
    }, [isLoaded, isSignedIn, router]);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!isSignedIn) return;

            try {
                const response = await fetch('/api/users/me');
                if (response.ok) {
                    const data = await response.json();
                    setUserData(data);
                    setFormData({
                        name: data.name || '',
                        bio: data.bio || '',
                    });
                } else {
                    toast.error('Không thể tải thông tin người dùng');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                toast.error('Đã xảy ra lỗi khi tải thông tin');
            } finally {
                setLoading(false);
            }
        };

        if (isSignedIn) {
            fetchUserData();
        }
    }, [isSignedIn]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const response = await fetch('/api/users/me', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast.success('Cập nhật thông tin thành công!');
                // Refresh data to ensure sync
                const updatedData = await response.json();
                setUserData(updatedData);
            } else {
                toast.error('Cập nhật thất bại');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Đã xảy ra lỗi khi lưu');
        } finally {
            setSaving(false);
        }
    };

    if (!isLoaded || loading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Cài đặt tài khoản</h1>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    {/* Profile Header / Banner could go here */}

                    <div className="p-6 md:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Avatar Section */}
                            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 mb-8">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-brand-green/10 shadow-sm">
                                        {user?.imageUrl ? (
                                            <Image
                                                src={user.imageUrl}
                                                alt="Profile"
                                                width={96}
                                                height={96}
                                                className="object-cover w-full h-full"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-brand-green/10 flex items-center justify-center">
                                                <UserCircle className="w-12 h-12 text-brand-green" />
                                            </div>
                                        )}
                                    </div>
                                    {/* Clerk manages avatar, so we link there or just show info */}
                                    {/* <button type="button" className="absolute bottom-0 right-0 p-1.5 bg-brand-green text-white rounded-full shadow-md hover:bg-brand-green-dark transition-colors" title="Change Avatar">
                    <Camera className="w-4 h-4" />
                  </button> */}
                                </div>

                                <div className="flex-1 text-center sm:text-left">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {userData?.name || user?.fullName || 'Người dùng'}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{userData?.email}</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">
                                        ID: {userData?.id} • {userData?.isAdmin ? 'Admin' : 'Thành viên'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Full Name */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Họ và tên
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-green/50 transition-all dark:text-white"
                                        placeholder="Nhập họ tên của bạn"
                                    />
                                </div>

                                {/* Email (Read-only) */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={userData?.email || ''}
                                        disabled
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-gray-400 mt-1 pl-1">Email được quản lý bởi tài khoản đăng nhập.</p>
                                </div>

                                {/* Bio */}
                                <div>
                                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Giới thiệu bản thân
                                    </label>
                                    <textarea
                                        id="bio"
                                        name="bio"
                                        rows={4}
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-green/50 transition-all dark:text-white resize-none"
                                        placeholder="Chia sẻ đôi điều về bạn..."
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 mt-6">
                                <button
                                    type="button"
                                    onClick={() => signOut(() => router.push('/'))}
                                    className="px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Đăng xuất
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2 bg-brand-green text-white rounded-xl shadow-lg shadow-brand-green/30 hover:bg-brand-green-dark hover:scale-105 active:scale-95 transition-all flex items-center gap-2 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Đang lưu...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Lưu thay đổi
                                        </>
                                    )}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>

                {/* App Settings Section (Future) */}
                {/* <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Cài đặt ứng dụng</h2>
          <div className="space-y-4">
             Theme toggle, Notifications, etc. 
          </div>
        </div> */}

            </div>
        </MainLayout>
    );
}
