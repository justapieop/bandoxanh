'use client';

import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

import { ArrowLeftIcon } from '@/components/Icons';
import { useState, useEffect } from 'react';
import { Theme, NewsArticle } from '@/types';
import { useSidebar } from '@/hooks/useSidebar';
import { useTheme } from '@/hooks/useTheme';
import LoadingSpinner from '@/components/LoadingSpinner';

interface NewsDetailPageProps {
  articleId: number;
  navigateTo: (path: string, options?: any) => void;
}

const NewsDetailPageComponent: React.FC<NewsDetailPageProps> = ({ articleId, navigateTo }) => {
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/news');
        if (res.ok) {
          const articles = await res.json();
          const found = articles.find((a: NewsArticle) => a.id === articleId);
          setArticle(found || null);
        }
      } catch (error) {
        console.error('Error fetching article:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-500">Không tìm thấy bài viết</h2>
        <p className="mt-4">Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <button
          onClick={() => navigateTo('/news')}
          className="mt-6 inline-flex items-center gap-2 bg-brand-green text-white font-semibold py-2 px-4 rounded-lg hover:bg-brand-green-dark transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Quay lại trang Tin tức
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-brand-gray-dark border border-gray-200 dark:border-gray-700 p-6 sm:p-10 rounded-xl">
      <button
        onClick={() => navigateTo('/news')}
        className="inline-flex items-center gap-2 text-brand-green dark:text-brand-green-light font-semibold hover:text-brand-green-dark dark:hover:text-white transition-colors mb-8"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        Quay lại trang Tin tức
      </button>

      <article>
        <span className="px-2.5 py-1 bg-brand-green-light text-brand-green-dark text-xs font-semibold rounded-full">{article.category}</span>
        <h1 className="text-3xl md:text-5xl font-bold text-brand-gray-dark dark:text-gray-100 my-4 leading-tight">{article.title}</h1>
        <p className="text-sm text-brand-gray-DEFAULT dark:text-gray-400 mb-6">{article.date}</p>

        <img src={article.imageUrl} alt={article.title} className="w-full h-auto max-h-[500px] object-cover rounded-lg mb-8" loading="lazy" />

        <div className="prose lg:prose-lg max-w-none text-brand-gray-dark dark:text-gray-300 leading-relaxed dark:prose-invert prose-p:mb-4">
          {article.content.split('\n').map((paragraph, index) => (
            paragraph.trim() && <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>
    </div>
  );
};

export default async function NewsDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  return <NewsDetailPage id={id} />;
}

function NewsDetailPage({ id }: { id: string }) {
  'use client';
  const router = useRouter();
  const { isCollapsed: isSidebarCollapsed, setCollapsed: setIsSidebarCollapsed } = useSidebar();
  const { theme, toggleTheme } = useTheme();

  const navigateTo = (path: string, options?: any) => {
    window.scrollTo(0, 0);
    router.push(path);
  };

  const articleId = parseInt(id, 10);

  return (
    <div className="bg-brand-gray-light dark:bg-black min-h-screen font-sans text-brand-gray-dark dark:text-gray-200">
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        isCollapsed={isSidebarCollapsed}
        setCollapsed={setIsSidebarCollapsed}
      />
      <div className="md:pt-0 transition-all duration-300 md:pl-20">
        <main className="container mx-auto px-4 sm:px-6 py-10">
          <NewsDetailPageComponent articleId={articleId} navigateTo={navigateTo} />
        </main>

      </div>
    </div>
  );
}
