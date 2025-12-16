'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface PageTransitionProps {
    children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(false);
    const [displayChildren, setDisplayChildren] = useState(children);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        // When pathname changes, show loading state briefly
        setIsLoading(true);

        // Start transition
        startTransition(() => {
            setDisplayChildren(children);
        });

        // Hide loading after a short delay
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 150);

        return () => clearTimeout(timer);
    }, [pathname, children]);

    return (
        <div className="relative h-full w-full">
            {/* Loading overlay */}
            {(isLoading || isPending) && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm animate-fade-in pointer-events-none">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">Đang tải...</span>
                    </div>
                </div>
            )}

            {/* Content with fade transition */}
            <div
                className={`h-full w-full transition-opacity duration-300 ${isLoading || isPending ? 'opacity-50' : 'opacity-100'}`}
            >
                {displayChildren}
            </div>
        </div>
    );
}
