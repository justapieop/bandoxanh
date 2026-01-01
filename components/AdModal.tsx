'use client';

import React, { useState, useEffect } from 'react';
import { XIcon } from './Icons';

interface AdConfig {
    id: string;
    imageUrl: string;
    linkUrl: string;
    title: string;
    description?: string;
    alt: string;
}

// Configuration: Add your ads here
const ADS: AdConfig[] = [
    {
        id: 'shopee-affiliate-1',
        title: 'Siêu Sale Shopee',
        description: 'Săn sale cực sốc giảm đến 50%',
        imageUrl: 'https://placehold.co/600x800?text=Shopee+Sale', // Placeholder, user should replace
        linkUrl: 'https://s.shopee.vn/LgdOPjwDO',
        alt: 'Shopee Sale',
    },
    // Add more ads here
];



export default function AdModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeAd, setActiveAd] = useState<AdConfig | null>(null);

    useEffect(() => {
        const fetchAndShowAd = async () => {
            try {
                // Fetch ads from API
                const res = await fetch('/api/ads');
                if (res.ok) {
                    const ads = await res.json();
                    if (ads && ads.length > 0) {
                        const validAds = ads.filter((ad: any) => !ad.position || ad.position === 'ALL' || ad.position === 'POPUP');

                        if (validAds.length > 0) {
                            const randomAd = validAds[Math.floor(Math.random() * validAds.length)];
                            setActiveAd({
                                id: randomAd.id,
                                title: randomAd.title,
                                description: randomAd.description || '',
                                imageUrl: randomAd.imageUrl,
                                linkUrl: randomAd.linkUrl,
                                alt: randomAd.title
                            });
                            setShowModal();
                            return;
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to fetch ads:', error);
            }

            // Fallback to static ads
            if (ADS.length > 0) {
                const randomAd = ADS[Math.floor(Math.random() * ADS.length)];
                setActiveAd(randomAd);
                setShowModal();
            }
        };

        fetchAndShowAd();
    }, []);

    const setShowModal = () => {
        // Delay slightly for better UX (1.5s)
        const timer = setTimeout(() => {
            setIsOpen(true);
        }, 1500);
        return () => clearTimeout(timer);
    };


    const handleClose = () => {
        setIsOpen(false);
    };

    const handleAdClick = () => {
        handleClose();
        // Navigate to ad link
        if (activeAd) {
            window.open(activeAd.linkUrl, '_blank');
        }
    };

    if (!isOpen || !activeAd) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4 animate-fade-in" onClick={handleClose}>
            <div
                className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg md:max-w-2xl overflow-hidden shadow-2xl relative transform transition-all animate-bounce-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full z-10 transition-colors"
                >
                    <XIcon className="w-5 h-5" />
                </button>

                {/* Ad Content */}
                <div className="cursor-pointer group" onClick={handleAdClick}>
                    {/* Image */}
                    <div className="relative aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <img
                            src={activeAd.imageUrl}
                            alt={activeAd.alt}
                            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                                // Fallback if image fails
                                e.currentTarget.src = 'https://placehold.co/600x800?text=Quảng+Cáo';
                            }}
                        />
                    </div>

                    {/* Text/CTA Area */}
                    <div className="p-4 bg-white dark:bg-gray-800 text-center">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                            {activeAd.title}
                        </h3>
                        {activeAd.description && (
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                                {activeAd.description}
                            </p>
                        )}
                        <button
                            className="w-full bg-brand-green hover:bg-green-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors"
                        >
                            Xem ngay
                        </button>
                    </div>
                </div>

                {/* Subtle 'Sponsored' label */}
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/40 text-white text-[10px] rounded uppercase font-medium tracking-wider backdrop-blur-sm">
                    Được tài trợ
                </div>
            </div>
        </div>
    );
}
