'use client';

import React, { useState, useMemo } from 'react';
// import { DIY_IDEAS } from '@/lib/diyData'; // Removing static import
import { Search, Sparkles, X, Clock, Wrench, Play, ChevronRight, Filter, Lightbulb, Recycle } from 'lucide-react';

type DifficultyLevel = 'Dễ' | 'Trung bình' | 'Khó';

const difficultyColors: Record<DifficultyLevel, { bg: string; text: string; dot: string }> = {
    'Dễ': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', dot: 'bg-green-400' },
    'Trung bình': { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', dot: 'bg-yellow-400' },
    'Khó': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500' },
};

export default function ExploreDIY() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedIdea, setSelectedIdea] = useState<any | null>(null);
    const [diyIdeas, setDiyIdeas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        fetch('/api/diy/ideas')
            .then(res => res.json())
            .then(data => {
                setDiyIdeas(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    // Get unique categories
    const categories = useMemo(() => {
        const cats = diyIdeas.map(idea => idea.category);
        return [...new Set(cats)];
    }, [diyIdeas]);

    const filteredIdeas = useMemo(() => {
        return diyIdeas.filter((idea) => {
            const query = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm ||
                idea.title.toLowerCase().includes(query) ||
                idea.category.toLowerCase().includes(query) ||
                idea.description.toLowerCase().includes(query);

            const matchesCategory = !selectedCategory || idea.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [searchTerm, selectedCategory, diyIdeas]);


    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-white dark:bg-gray-900">
                {/* Decorative elements */}

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
                    <div className="text-center max-w-3xl mx-auto">
                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500">
                                Ý Tưởng Tái Chế
                            </span>
                            <span className="ml-3">♻️</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 sm:mb-10 leading-relaxed px-2">
                            Biến đồ cũ thành đồ mới với những ý tưởng
                            <span className="text-purple-600 dark:text-purple-400 font-medium"> sáng tạo và dễ thực hiện</span>
                        </p>

                        {/* Search Box */}
                        <div className="max-w-xl mx-auto px-2 sm:px-0">
                            <div className="relative group">
                                <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Tìm ý tưởng..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 sm:pl-14 pr-10 sm:pr-12 py-3 sm:py-4 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl sm:rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 dark:focus:border-purple-500 shadow-lg shadow-gray-100/50 dark:shadow-none transition-all text-base sm:text-lg"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Filter Categories */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Danh mục:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all touch-manipulation ${!selectedCategory
                                ? 'bg-purple-500 text-white shadow-md'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            Tất cả
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                                className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all touch-manipulation ${selectedCategory === cat
                                    ? 'bg-purple-500 text-white shadow-md'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results count */}
                <div className="flex items-center justify-between mb-6">
                    <p className="text-gray-500 dark:text-gray-400">
                        <span className="font-semibold text-gray-900 dark:text-white">{filteredIdeas.length}</span> ý tưởng
                        {(searchTerm || selectedCategory) && ' được tìm thấy'}
                    </p>
                    {(searchTerm || selectedCategory) && (
                        <button
                            onClick={() => { setSearchTerm(''); setSelectedCategory(null); }}
                            className="text-sm text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                        >
                            <X className="w-4 h-4" />
                            Xóa bộ lọc
                        </button>
                    )}
                </div>

                {/* Ideas Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-pulse h-96">
                                <div className="h-48 bg-gray-200 dark:bg-gray-700" />
                                <div className="p-5 space-y-4">
                                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredIdeas.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredIdeas.map((idea, index) => {
                            const difficulty = idea.difficulty as DifficultyLevel;
                            const colors = difficultyColors[difficulty] || difficultyColors['Trung bình'];

                            return (
                                <div
                                    key={idea.id}
                                    onClick={() => setSelectedIdea(idea)}
                                    className="group bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer transform hover:-translate-y-1 animate-fade-in"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {/* Image */}
                                    <div className="relative aspect-[4/3] overflow-hidden">
                                        <img
                                            src={idea.image}
                                            alt={idea.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        {/* Category Badge */}
                                        <div className="absolute top-4 left-4">
                                            <span className="px-3 py-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full text-xs font-bold text-purple-600 dark:text-purple-400 shadow-lg">
                                                {idea.category}
                                            </span>
                                        </div>

                                        {/* Video indicator */}
                                        {idea.videoUrl && (
                                            <div className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full shadow-lg">
                                                <Play className="w-4 h-4 text-red-500 fill-red-500" />
                                            </div>
                                        )}

                                        {/* CTA on hover */}
                                        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-full text-sm font-semibold text-purple-600 dark:text-purple-400 shadow-lg">
                                                <Lightbulb className="w-4 h-4" />
                                                Xem hướng dẫn
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mb-2">
                                            {idea.title}
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                                            {idea.description}
                                        </p>

                                        {/* Meta */}
                                        <div className="flex items-center justify-between">
                                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${colors.bg} ${colors.text}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                                                {idea.difficulty}
                                            </span>
                                            <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
                            <Lightbulb className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Không tìm thấy ý tưởng
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            {searchTerm
                                ? `Không có kết quả cho "${searchTerm}"`
                                : 'Thử tìm kiếm với từ khóa khác'}
                        </p>
                        <button
                            onClick={() => { setSearchTerm(''); setSelectedCategory(null); }}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-xl transition-colors"
                        >
                            Xem tất cả ý tưởng
                        </button>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedIdea && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
                    onClick={() => setSelectedIdea(null)}
                >
                    <div
                        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Image */}
                        <div className="relative h-64 md:h-80 w-full">
                            <img
                                src={selectedIdea.image}
                                alt={selectedIdea.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                            {/* Close button */}
                            <button
                                onClick={() => setSelectedIdea(null)}
                                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            {/* Title overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                <span className="inline-block px-3 py-1 bg-purple-500 text-white text-xs font-bold uppercase tracking-wider rounded-full mb-3">
                                    {selectedIdea.category}
                                </span>
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                    {selectedIdea.title}
                                </h2>
                                <div className="flex items-center gap-4">
                                    <span className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full ${difficultyColors[selectedIdea.difficulty as DifficultyLevel]?.bg || 'bg-gray-100'} ${difficultyColors[selectedIdea.difficulty as DifficultyLevel]?.text || 'text-gray-700'}`}>
                                        {selectedIdea.difficulty}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto max-h-[50vh]">
                            <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg leading-relaxed">
                                {selectedIdea.description}
                            </p>

                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Materials */}
                                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <Wrench className="w-5 h-5 text-purple-500" />
                                        Nguyên liệu
                                    </h3>
                                    <ul className="space-y-3">
                                        {selectedIdea.materials?.map((item: string, index: number) => (
                                            <li key={index} className="flex items-start text-gray-700 dark:text-gray-300">
                                                <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Steps */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-orange-500" />
                                        Các bước thực hiện
                                    </h3>
                                    <ol className="space-y-4">
                                        {selectedIdea.steps?.map((step: string, index: number) => (
                                            <li key={index} className="flex items-start">
                                                <span className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                                                    {index + 1}
                                                </span>
                                                <span className="text-gray-700 dark:text-gray-300 pt-0.5">{step}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            </div>

                            {/* Video */}
                            {selectedIdea.videoUrl && (
                                <div className="mt-8">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <Play className="w-5 h-5 text-red-500" />
                                        Video hướng dẫn
                                    </h3>
                                    <div className="relative pt-[56.25%] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900">
                                        <iframe
                                            src={selectedIdea.videoUrl}
                                            className="absolute top-0 left-0 w-full h-full"
                                            title={selectedIdea.title}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                            <button
                                onClick={() => setSelectedIdea(null)}
                                className="w-full py-3 px-6 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-xl transition-colors"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
