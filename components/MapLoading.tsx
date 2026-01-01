'use client';
import React, { useState, useEffect } from 'react';
import { ENV_QUOTES } from '@/constants';
import { Leaf, Recycle, Globe, Wind } from 'lucide-react';

const MapLoading = () => {
    // Default to the first item for server-side rendering/initial hydration to prevent layout shift or empty state
    const [quote, setQuote] = useState(ENV_QUOTES[0] || "Đang tải...");
    const [iconResult, setIconResult] = useState<React.ReactNode>(
        <Leaf className="w-12 h-12 text-green-500 animate-bounce" />
    );

    useEffect(() => {
        // Random quote on client side
        const randomQuote = ENV_QUOTES[Math.floor(Math.random() * ENV_QUOTES.length)];
        setQuote(randomQuote);

        // Random icon on client side
        const icons = [
            <Leaf key="leaf" className="w-12 h-12 text-green-500 animate-bounce" />,
            <Recycle key="recycle" className="w-12 h-12 text-green-600 animate-spin-slow" />,
            <Globe key="globe" className="w-12 h-12 text-blue-500 animate-pulse" />,
            <Wind key="wind" className="w-12 h-12 text-teal-500 animate-ping-slow" />
        ];
        setIconResult(icons[Math.floor(Math.random() * icons.length)]);
    }, []);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-6 z-50">
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-green-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <div className="relative z-10 bg-white dark:bg-gray-800 p-6 rounded-full shadow-xl border border-green-100 dark:border-green-900">
                    {iconResult}
                </div>
            </div>

            <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 animate-fade-in text-center">
                Đang tải bản đồ xanh...
            </h3>

            <div className="max-w-md text-center">
                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 italic font-medium animate-slide-up">
                    "{quote}"
                </p>
            </div>

            <div className="mt-8 flex gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce delay-0"></div>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce delay-150"></div>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce delay-300"></div>
            </div>

            {/* Skeleton for map UI hint */}
            <div className="absolute inset-x-4 bottom-4 h-24 bg-white/50 dark:bg-gray-800/50 rounded-xl blur-sm -z-10"></div>
        </div>
    );
};

export default MapLoading;
