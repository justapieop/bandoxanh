'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import LoadingSpinner from '@/components/LoadingSpinner';



interface Stats {
  stations: number;
  events: number;
  news: number;
  posts: number;
  users: number;
  reactions: number;
  follows: number;
  comments: number;
  dishes: number;
  restaurants: number;
  donations: number;
  bikes: number;
  diy: number;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const [stats, setStats] = useState<Stats>({
    stations: 0,
    events: 0,
    news: 0,
    posts: 0,
    users: 0,
    reactions: 0,
    follows: 0,
    comments: 0,
    dishes: 0,
    restaurants: 0,
    donations: 0,
    bikes: 0,
    diy: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin (you can customize this logic)
    if (isLoaded && !user) {
      router.push('/');
      return;
    }

    async function fetchStats() {
      try {
        const [
          stationsRes, eventsRes, newsRes, postsRes,
          dishesRes, restaurantsRes, donationsRes, bikesRes,
          diyRes
        ] = await Promise.all([
          fetch('/api/stations'),
          fetch('/api/events'),
          fetch('/api/news'),
          fetch('/api/posts'),
          fetch('/api/vegetarian-dishes'),
          fetch('/api/restaurants'),
          fetch('/api/donations'),
          fetch('/api/bikes'),
          fetch('/api/admin/diy'),
        ]);

        const [
          stations, events, news, posts,
          dishes, restaurants, donations, bikes,
          diy
        ] = await Promise.all([
          stationsRes.json(),
          eventsRes.json(),
          newsRes.json(),
          postsRes.json(),
          dishesRes.json(),
          restaurantsRes.json(),
          donationsRes.json(),
          bikesRes.json(),
          diyRes.json(),
        ]);

        // Calculate additional stats from posts data
        let totalReactions = 0;
        let totalComments = 0;

        if (Array.isArray(posts)) {
          posts.forEach((post: any) => {
            totalReactions += post.likesCount || 0;
            totalComments += post.comments?.length || 0;
          });
        }

        setStats({
          stations: Array.isArray(stations) ? stations.length : 0,
          events: Array.isArray(events) ? events.length : 0,
          news: Array.isArray(news) ? news.length : 0,
          posts: Array.isArray(posts) ? posts.length : 0,
          users: 0, // Would need a users API endpoint
          reactions: totalReactions,
          follows: 0, // Would need a follows API endpoint
          comments: totalComments,
          dishes: Array.isArray(dishes) ? dishes.length : 0,
          restaurants: Array.isArray(restaurants) ? restaurants.length : 0,
          donations: Array.isArray(donations) ? donations.length : 0,
          bikes: Array.isArray(bikes) ? bikes.length : 0,
          diy: Array.isArray(diy) ? diy.length : 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [isLoaded, user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-brand-gray-light dark:bg-black">
        <div className="text-center flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-brand-gray-dark dark:text-gray-300 font-medium animate-pulse">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                🎛️ Bảng điều khiển Admin
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Chào mừng {user?.firstName || 'Admin'}! Quản lý nội dung BandoXanh
              </p>
            </div>
            <Link
              href="/admin/help"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-600 transition-all flex items-center gap-2"
            >
              <span className="text-xl">❓</span>
              <span>Hướng dẫn</span>
            </Link>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-green-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">📍</span>
              <span className="text-3xl font-bold text-green-600">{stats.stations}</span>
            </div>
            <div className="text-gray-700 font-medium">Điểm thu gom</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">📅</span>
              <span className="text-3xl font-bold text-blue-600">{stats.events}</span>
            </div>
            <div className="text-gray-700 font-medium">Sự kiện</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">📰</span>
              <span className="text-3xl font-bold text-purple-600">{stats.news}</span>
            </div>
            <div className="text-gray-700 font-medium">Tin tức</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-orange-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">💬</span>
              <span className="text-3xl font-bold text-orange-600">{stats.posts}</span>
            </div>
            <div className="text-gray-700 font-medium">Bài đăng</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-teal-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">💭</span>
              <span className="text-3xl font-bold text-teal-600">{stats.comments}</span>
            </div>
            <div className="text-gray-700 font-medium">Bình luận</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-red-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">❤️</span>
              <span className="text-3xl font-bold text-red-600">{stats.reactions}</span>
            </div>
            <div className="text-gray-700 font-medium">Reactions</div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            📋 Quản lý nội dung
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Existing Cards */}
            <Link
              href="/admin/stations"
              className="group flex flex-col p-5 bg-green-50 rounded-xl border-2 border-green-100 hover:border-green-300 transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-4xl">📍</span>
                <span className="text-2xl text-green-600 group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <div>
                <div className="font-bold text-gray-900 text-lg">Điểm thu gom</div>
                <div className="text-sm text-gray-600">Quản lý điểm thu gom rác thải</div>
              </div>
            </Link>

            <Link
              href="/admin/events"
              className="group flex flex-col p-5 bg-blue-50 rounded-xl border-2 border-blue-100 hover:border-blue-300 transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-4xl">📅</span>
                <span className="text-2xl text-blue-600 group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <div>
                <div className="font-bold text-gray-900 text-lg">Sự kiện</div>
                <div className="text-sm text-gray-600">Quản lý sự kiện tái chế</div>
              </div>
            </Link>

            <Link
              href="/admin/news"
              className="group flex flex-col p-5 bg-purple-50 rounded-xl border-2 border-purple-100 hover:border-purple-300 transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-4xl">📰</span>
                <span className="text-2xl text-purple-600 group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <div>
                <div className="font-bold text-gray-900 text-lg">Tin tức</div>
                <div className="text-sm text-gray-600">Quản lý tin tức môi trường</div>
              </div>
            </Link>

            <Link
              href="/admin/posts"
              className="group flex flex-col p-5 bg-orange-50 rounded-xl border-2 border-orange-100 hover:border-orange-300 transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-4xl">💬</span>
                <span className="text-2xl text-orange-600 group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <div>
                <div className="font-bold text-gray-900 text-lg">Bài đăng</div>
                <div className="text-sm text-gray-600">Quản lý bài đăng cộng đồng</div>
              </div>
            </Link>

            {/* New Modules */}

            <Link
              href="/admin/vegetarian-dishes"
              className="group flex flex-col p-5 bg-lime-50 rounded-xl border-2 border-lime-100 hover:border-lime-300 transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-4xl">🥗</span>
                <span className="bg-lime-200 text-lime-800 text-xs font-bold px-2 py-1 rounded-full">{stats.dishes} món</span>
              </div>
              <div>
                <div className="font-bold text-gray-900 text-lg">Thực đơn chay</div>
                <div className="text-sm text-gray-600">Quản lý món ăn & công thức</div>
              </div>
            </Link>

            <Link
              href="/admin/restaurants"
              className="group flex flex-col p-5 bg-emerald-50 rounded-xl border-2 border-emerald-100 hover:border-emerald-300 transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-4xl">🍽️</span>
                <span className="bg-emerald-200 text-emerald-800 text-xs font-bold px-2 py-1 rounded-full">{stats.restaurants} nhà hàng</span>
              </div>
              <div>
                <div className="font-bold text-gray-900 text-lg">Nhà hàng chay</div>
                <div className="text-sm text-gray-600">Quản lý địa điểm ăn uống</div>
              </div>
            </Link>

            <Link
              href="/admin/donations"
              className="group flex flex-col p-5 bg-pink-50 rounded-xl border-2 border-pink-100 hover:border-pink-300 transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-4xl">🎁</span>
                <span className="bg-pink-200 text-pink-800 text-xs font-bold px-2 py-1 rounded-full">{stats.donations} điểm</span>
              </div>
              <div>
                <div className="font-bold text-gray-900 text-lg">Điểm quyên góp</div>
                <div className="text-sm text-gray-600">Quản lý điểm từ thiện</div>
              </div>
            </Link>

            <Link
              href="/admin/bikes"
              className="group flex flex-col p-5 bg-amber-50 rounded-xl border-2 border-amber-100 hover:border-amber-300 transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-4xl">🚲</span>
                <span className="bg-amber-200 text-amber-800 text-xs font-bold px-2 py-1 rounded-full">{stats.bikes} trạm</span>
              </div>
              <div>
                <div className="font-bold text-gray-900 text-lg">Thuê xe đạp</div>
                <div className="text-sm text-gray-600">Quản lý trạm xe công cộng</div>
              </div>
            </Link>

            <Link
              href="/admin/diy"
              className="group flex flex-col p-5 bg-yellow-50 rounded-xl border-2 border-yellow-100 hover:border-yellow-300 transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-4xl">🛠️</span>
                <span className="bg-yellow-200 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">{stats.diy} ý tưởng</span>
              </div>
              <div>
                <div className="font-bold text-gray-900 text-lg">Ý tưởng DIY</div>
                <div className="text-sm text-gray-600">Quản lý các ý tưởng tái chế</div>
              </div>
            </Link>

            <Link
              href="/admin/ads"
              className="group flex flex-col p-5 bg-fuchsia-50 rounded-xl border-2 border-fuchsia-100 hover:border-fuchsia-300 transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-4xl">📢</span>
                <span className="text-2xl text-fuchsia-600 group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <div>
                <div className="font-bold text-gray-900 text-lg">Quảng cáo</div>
                <div className="text-sm text-gray-600">Quản lý banner & popup</div>
              </div>
            </Link>

            <Link
              href="/admin/users"
              className="group flex flex-col p-5 bg-indigo-50 rounded-xl border-2 border-indigo-100 hover:border-indigo-300 transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-4xl">👥</span>
                <span className="text-2xl text-indigo-600 group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <div>
                <div className="font-bold text-gray-900 text-lg">Người dùng</div>
                <div className="text-sm text-gray-600">Quản lý admin & người dùng</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
