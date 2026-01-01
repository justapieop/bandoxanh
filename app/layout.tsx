import { Roboto } from 'next/font/google';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Script from 'next/script';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import SnowfallWrapper from '@/components/SnowfallWrapper';
import AdModal from '@/components/AdModal';
import AdFooter from '@/components/AdFooter';
import './globals.css';

const roboto = Roboto({
  weight: ['400', '500', '700', '900'],
  subsets: ['vietnamese', 'latin'],
  display: 'swap',
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: {
    default: 'BandoXanh - Nền tảng Tái chế & Bảo vệ Môi trường',
    template: '%s | BandoXanh'
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://bandoxanh.org'),
  description: 'BandoXanh - Nền tảng cộng đồng tái chế và bảo vệ môi trường tại Việt Nam. Tìm điểm thu gom rác thải, nhận diện phân loại rác, chia sẻ kinh nghiệm bảo vệ môi trường.',
  keywords: ['tái chế', 'môi trường', 'bảo vệ môi trường', 'phân loại rác', 'thu gom rác', 'cộng đồng xanh', 'Việt Nam', 'recycling', 'environment'],
  authors: [{ name: 'BandoXanh Team' }],
  creator: 'BandoXanh',
  publisher: 'BandoXanh',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://bandoxanh.org',
    siteName: 'BandoXanh',
    title: 'BandoXanh - Nền tảng Tái chế & Bảo vệ Môi trường',
    description: 'Nền tảng cộng đồng tái chế và bảo vệ môi trường tại Việt Nam. Tìm điểm thu gom, nhận diện phân loại rác, chia sẻ kinh nghiệm xanh.',
    images: [
      {
        url: '/og-image.jpg',
        width: 851,
        height: 315,
        alt: 'BandoXanh - Nền tảng Tái chế',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BandoXanh - Nền tảng Tái chế & Bảo vệ Môi trường',
    description: 'Nền tảng cộng đồng tái chế và bảo vệ môi trường tại Việt Nam',
    images: ['/og-image.jpg'],
    creator: '@bandoxanh',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BandoXanh',
    url: 'https://bandoxanh.org',
    description: 'Nền tảng cộng đồng tái chế và bảo vệ môi trường tại Việt Nam',
    inLanguage: 'vi',
    publisher: {
      '@type': 'Organization',
      name: 'BandoXanh',
      logo: {
        '@type': 'ImageObject',
        url: 'https://bandoxanh.org/logo.png',
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://bandoxanh.org/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <ClerkProvider>
      <html lang="vi" suppressHydrationWarning>
        <head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="theme-color" content="#22c55e" />
          <meta name="google-adsense-account" content="ca-pub-3515314127366034" />
          <Script
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3515314127366034"
            crossOrigin="anonymous"
            strategy="lazyOnload"
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </head>
        <body className={roboto.className}>
          {/* Google Analytics */}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-KTE37D7M2N"
            strategy="lazyOnload"
          />
          <Script id="google-analytics" strategy="lazyOnload">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-KTE37D7M2N');
            `}
          </Script>

          <AdModal />
          <AdFooter />
          <SnowfallWrapper />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#fff',
                color: '#1f2937',
                padding: '16px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          {children}
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
