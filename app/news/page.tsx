'use client';

import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

import { useSidebar } from '@/hooks/useSidebar';
import { useTheme } from '@/hooks/useTheme';
import { NewsPageComponent } from '@/components/NewsPageContent';


export default function News() {
  const router = useRouter();
  const { isCollapsed: isSidebarCollapsed, setCollapsed: setIsSidebarCollapsed } = useSidebar();
  const { theme, toggleTheme } = useTheme();

  const navigateTo = (path: string, options?: any) => {
    window.scrollTo(0, 0);
    if (options?.articleId) {
      router.push(`/news/${options.articleId}`);
    } else {
      router.push(path);
    }
  };

  return (
    <div className="bg-brand-gray-light dark:bg-black min-h-screen font-sans text-brand-gray-dark dark:text-gray-200">
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        isCollapsed={isSidebarCollapsed}
        setCollapsed={setIsSidebarCollapsed}
      />
      <div className="min-h-screen flex flex-col justify-between md:pt-0 transition-all duration-300 md:pl-20">
        <main className="container mx-auto px-4 sm:px-6 py-8">
          <NewsPageComponent navigateTo={navigateTo} />
        </main>

      </div>
    </div>
  );
}
