'use client';

import React, { useState, useEffect } from 'react';
import { XIcon } from './Icons';

interface AdConfig {
    id: string;
    imageUrlHorizontal?: string;
    linkUrl: string;
    title: string;
    alt: string;
}

export default function AdFooter() {
    const [isVisible, setIsVisible] = useState(false);
    const [activeAd, setActiveAd] = useState<AdConfig | null>(null);
    const [isClosed, setIsClosed] = useState(false);

    useEffect(() => {
        const fetchAd = async () => {
            try {
                const res = await fetch('/api/ads');
                if (res.ok) {
                    const ads = await res.json();
                    if (ads && ads.length > 0) {
                        // Filter ads that match position
                        const validAds = ads.filter((ad: any) =>
                            (!ad.position || ad.position === 'ALL' || ad.position === 'FOOTER')
                        );

                        if (validAds.length > 0) {
                            const randomAd = validAds[Math.floor(Math.random() * validAds.length)];
                            // Use horizontal image if available, otherwise fallback to vertical (main) image
                            const displayImage = randomAd.imageUrlHorizontal || randomAd.imageUrl;

                            if (displayImage) {
                                setActiveAd({
                                    id: randomAd.id,
                                    imageUrlHorizontal: displayImage,
                                    linkUrl: randomAd.linkUrl,
                                    title: randomAd.title,
                                    alt: randomAd.title
                                });
                                setIsVisible(true);
                                return;
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to fetch footer ads:', error);
            }

            // Fallback: Default Shopee Ad
            setActiveAd({
                id: 'default-footer',
                imageUrlHorizontal: 'https://placehold.co/1200x200?text=Shopee+Super+Sale', // Valid placeholder
                linkUrl: 'https://s.shopee.vn/LgdOPjwDO',
                title: 'Shopee Sale',
                alt: 'Shopee Sale'
            });
            setIsVisible(true);
        };

        // Delay showing to avoid layout shift immediately on load
        const timer = setTimeout(() => {
            fetchAd();
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    if (!isVisible || !activeAd || isClosed) return null;

    return (
        <div className="hidden md:block fixed bottom-0 left-0 right-0 z-40 p-2 animate-slide-up pointer-events-none">
            <div className="max-w-4xl mx-auto relative group pointer-events-auto">
                <button
                    onClick={() => setIsClosed(true)}
                    className="absolute -top-3 -right-3 bg-gray-800 text-white rounded-full p-1 shadow-lg hover:bg-gray-700 transition-colors z-50 border border-white"
                >
                    <XIcon className="w-4 h-4" />
                </button>

                <a
                    href={activeAd.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full overflow-hidden rounded-xl shadow-2xl border-2 border-white/20 hover:scale-[1.01] transition-transform"
                >
                    <img
                        src={activeAd.imageUrlHorizontal}
                        alt={activeAd.alt}
                        className="w-full h-auto md:max-h-[120px] object-cover sm:object-contain bg-gray-900"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            setIsClosed(true);
                        }}
                    />
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/50 text-white text-[9px] rounded uppercase font-medium backdrop-blur-sm">
                        Quảng cáo
                    </div>
                </a>
            </div>
        </div>
    );
}
