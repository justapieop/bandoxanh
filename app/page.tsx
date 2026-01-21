'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import MainLayout from '@/components/MainLayout';
import MapLoading from '@/components/MapLoading';

const MapMain = dynamic(() => import('@/components/MapMain'), {
  ssr: false,
  loading: () => <MapLoading />
});

export default function HomePage() {
  return (
    <MainLayout
      className="bg-white dark:bg-black min-h-screen font-sans text-brand-gray-dark dark:text-gray-200 selection:bg-brand-green selection:text-white overflow-hidden"
      isFullScreen={true}
    >
      <div className="h-full w-full overflow-hidden">
        <MapMain />
      </div>
    </MainLayout>
  );
}