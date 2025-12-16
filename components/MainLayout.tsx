'use client';

import React from 'react';
import Header from '@/components/Header';
import PageTransition from '@/components/PageTransition';
import { useSidebar } from '@/hooks/useSidebar';
import { useTheme } from '@/hooks/useTheme';

interface MainLayoutProps {
    children: React.ReactNode;
    className?: string;
    mainClassName?: string;
    isFullScreen?: boolean;
}

export default function MainLayout({
    children,
    className = "bg-white dark:bg-black min-h-screen font-sans text-brand-gray-dark dark:text-gray-200",
    mainClassName = "min-h-screen",
    isFullScreen = false,
}: MainLayoutProps) {
    const { isCollapsed: isSidebarCollapsed, setCollapsed: setIsSidebarCollapsed } = useSidebar();
    const { theme, toggleTheme } = useTheme();

    return (
        <div className={`${className} ${isFullScreen ? 'overflow-hidden' : ''}`}>
            <Header
                theme={theme}
                toggleTheme={toggleTheme}
                isCollapsed={isSidebarCollapsed}
                setCollapsed={setIsSidebarCollapsed}
            />
            {/* Content wrapper with proper spacing for sidebar (desktop) and bottom nav (mobile) */}
            <div
                className={`transition-all duration-300 pb-24 pl-0 md:pb-0 md:pl-24 ${isFullScreen ? 'h-screen pb-0' : ''}`}
            >
                <main className={`${mainClassName} ${isFullScreen ? 'h-full w-full relative' : ''}`}>
                    <PageTransition>
                        {children}
                    </PageTransition>
                </main>
            </div>
        </div>
    );
}
