'use client';

import React, { useState, useMemo } from 'react';
import { Search, Leaf, ChefHat, Clock, Heart, Sparkles, Filter, X, UtensilsCrossed } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface MenuItem {
    id: string;
    name: string;
    description: string;
    recipe: string;
    tags: string[];
    image?: string | null;
    cookTime?: string;
    ingredients?: string[];
}

// Skeleton component for loading state
function MenuSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-pulse">
                    <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700" />
                    <div className="p-6 space-y-4">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4" />
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                        </div>
                        <div className="flex gap-2">
                            <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// Enhanced Recipe Card
function DishCard({ item, onClick }: { item: MenuItem; onClick: () => void }) {
    const imageSrc = item.image || 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=800&auto=format&fit=crop';

    return (
        <div
            onClick={onClick}
            className="group bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full transform hover:-translate-y-1 cursor-pointer"
        >
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                    src={imageSrc}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Floating Badge */}
                <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <Heart className="w-4 h-4 text-red-500" />
                </div>

                {/* CTA on hover */}
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-full text-sm font-semibold text-green-600 dark:text-green-400 shadow-lg">
                        <ChefHat className="w-4 h-4" />
                        Xem công thức
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 flex flex-col">
                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors mb-2">
                    {item.name}
                </h3>

                {/* Description */}
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2 flex-1">
                    {item.description}
                </p>

                {/* Tags & Time */}
                <div className="flex flex-wrap items-center gap-2">
                    {item.tags?.slice(0, 3).map((tag, i) => (
                        <span
                            key={i}
                            className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-100 dark:border-green-800"
                        >
                            <Leaf className="w-3 h-3" />
                            {tag}
                        </span>
                    ))}
                    {item.cookTime && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 border border-orange-100 dark:border-orange-800">
                            <Clock className="w-3 h-3" />
                            {item.cookTime}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function VegetarianMenuPage() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);

    React.useEffect(() => {
        fetch('/api/vegetarian-dishes')
            .then(res => res.json())
            .then(data => {
                setMenuItems(data);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, []);

    // Get unique tags
    const allTags = useMemo(() => {
        const tags = menuItems.flatMap(item => item.tags || []);
        return [...new Set(tags)].slice(0, 8);
    }, [menuItems]);

    // Filter items
    const filteredItems = useMemo(() => {
        return menuItems.filter(item => {
            const matchesSearch = !searchQuery ||
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesTag = !selectedTag ||
                item.tags?.includes(selectedTag);

            return matchesSearch && matchesTag;
        });
    }, [menuItems, searchQuery, selectedTag]);

    return (
        <>
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-white dark:bg-gray-900">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-72 h-72 bg-green-100/50 dark:bg-green-900/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-100/50 dark:bg-emerald-900/20 rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
                    <div className="text-center max-w-3xl mx-auto">

                        {/* Title */}
                        <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500">
                                Thực Đơn Xanh
                            </span>
                            <span className="ml-3">🥬</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed">
                            Khám phá bộ sưu tập công thức món ăn thuần chay
                            <br className="hidden md:block" />
                            <span className="text-green-600 dark:text-green-400 font-medium">truyền thống Việt Nam</span> được tuyển chọn kỹ lưỡng
                        </p>

                        {/* Search Box */}
                        <div className="max-w-xl mx-auto px-2 sm:px-0">
                            <div className="relative group">
                                <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm món ăn..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 sm:pl-14 pr-10 sm:pr-12 py-3 sm:py-4 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl sm:rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-green-400 dark:focus:border-green-500 shadow-lg shadow-gray-100/50 dark:shadow-none transition-all text-base sm:text-lg"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                    >
                                        <X className="w-4 h-4 text-gray-400" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                {/* Filter Tags */}
                {allTags.length > 0 && (
                    <div className="mb-6 sm:mb-8">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                            <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Lọc theo:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedTag(null)}
                                className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all touch-manipulation ${!selectedTag
                                    ? 'bg-green-500 text-white shadow-md'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                Tất cả
                            </button>
                            {allTags.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                                    className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all touch-manipulation ${selectedTag === tag
                                        ? 'bg-green-500 text-white shadow-md'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Results count */}
                {!isLoading && (
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-gray-500 dark:text-gray-400">
                            <span className="font-semibold text-gray-900 dark:text-white">{filteredItems.length}</span> món ăn
                            {(searchQuery || selectedTag) && ' được tìm thấy'}
                        </p>
                        {(searchQuery || selectedTag) && (
                            <button
                                onClick={() => { setSearchQuery(''); setSelectedTag(null); }}
                                className="text-sm text-green-600 dark:text-green-400 hover:underline flex items-center gap-1"
                            >
                                <X className="w-4 h-4" />
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>
                )}

                {/* Content */}
                {isLoading ? (
                    <MenuSkeleton />
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
                            <UtensilsCrossed className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Không tìm thấy món ăn
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            {searchQuery
                                ? `Không có kết quả cho "${searchQuery}"`
                                : 'Thử tìm kiếm với từ khóa khác'}
                        </p>
                        <button
                            onClick={() => { setSearchQuery(''); setSelectedTag(null); }}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors"
                        >
                            Xem tất cả món ăn
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map((item, index) => (
                            <div
                                key={`dish-${item.id}`}
                                className="animate-fade-in"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <DishCard
                                    item={item}
                                    onClick={() => setSelectedDish(item)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Dish Detail Modal */}
            {selectedDish && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
                    onClick={() => setSelectedDish(null)}
                >
                    <div
                        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Image */}
                        <div className="relative h-64 md:h-80 w-full flex-shrink-0">
                            <Image
                                src={selectedDish.image || 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=800&auto=format&fit=crop'}
                                alt={selectedDish.name}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                            <button
                                onClick={() => setSelectedDish(null)}
                                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white transition-colors z-10"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                <h2 className="text-3xl font-bold text-white mb-2">
                                    {selectedDish.name}
                                </h2>
                                <div className="flex flex-wrap gap-2 text-white/90">
                                    {selectedDish.cookTime && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm">
                                            <Clock className="w-4 h-4" />
                                            {selectedDish.cookTime}
                                        </span>
                                    )}
                                    {selectedDish.tags?.map(tag => (
                                        <span key={tag} className="inline-flex items-center px-3 py-1 bg-green-500/80 backdrop-blur-md rounded-full text-sm">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto flex-1">
                            <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 leading-relaxed">
                                {selectedDish.description}
                            </p>

                            <div className="grid md:grid-cols-2 gap-8 mb-8">
                                {/* Ingredients */}
                                <div className="bg-green-50 dark:bg-green-900/10 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <UtensilsCrossed className="w-5 h-5 text-green-500" />
                                        Nguyên liệu
                                    </h3>
                                    <ul className="space-y-3">
                                        {selectedDish.ingredients?.map((ing, idx) => (
                                            <li key={idx} className="flex items-start text-gray-700 dark:text-gray-300">
                                                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                                                {ing}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Instructions */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-orange-500" />
                                        Cách làm
                                    </h3>
                                    <div className="space-y-4">
                                        {selectedDish.recipe?.split(/\r?\n/).filter(line => line.trim()).map((step, idx) => {
                                            const stepContent = step.replace(/^\d+\.\s*/, '');
                                            return (
                                                <div key={idx} className="flex gap-3">
                                                    <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                                                        {idx + 1}
                                                    </span>
                                                    <p className="text-gray-700 dark:text-gray-300">{stepContent}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl flex items-center gap-4">
                                <div className="p-3 bg-white dark:bg-gray-700 rounded-full shadow-sm">
                                    <ChefHat className="w-6 h-6 text-green-500" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">Mẹo nhỏ</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Điều chỉnh gia vị phù hợp với khẩu vị của gia đình bạn nhé!</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
                            <button
                                onClick={() => setSelectedDish(null)}
                                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-green-500/20"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
