'use client';

import React from 'react';
import Header from '@/components/Header';

import { useSidebar } from '@/hooks/useSidebar';
import { useTheme } from '@/hooks/useTheme';

interface LayoutProps {
  children: React.ReactNode;
}

export function RootLayoutContent({ children }: LayoutProps) {
  const { isCollapsed: isSidebarCollapsed, setCollapsed: setIsSidebarCollapsed } = useSidebar();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="bg-brand-gray-light dark:bg-black min-h-screen font-sans text-brand-gray-dark dark:text-gray-200">
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        isCollapsed={isSidebarCollapsed}
        setCollapsed={setIsSidebarCollapsed}
      />
      <div className="min-h-screen md:pt-0 transition-all duration-300 md:pl-20">
        {children}
      </div>
    </div>
  );
}
