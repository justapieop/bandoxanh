'use client';

import { SignIn } from '@clerk/nextjs';
import { LeafIcon } from '@/components/Icons';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-green-light via-white to-gray-50 dark:from-brand-gray-dark dark:via-black dark:to-brand-gray-darker flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div
            onClick={() => router.push('/')}
            className="flex items-center justify-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <LeafIcon className="w-10 h-10 text-brand-green" />
            <span className="text-3xl font-bold text-brand-green">BandoXanh</span>
          </div>
          <p className="text-brand-gray-DEFAULT dark:text-gray-400 mt-2">
            Cùng nhau bảo vệ Trái đất
          </p>
        </div>

        {/* Clerk SignIn Component with Custom Styling */}
        <div className="bg-white dark:bg-brand-gray-dark rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
          <SignIn
            appearance={{
              elements: {
                // Form styling
                formButtonPrimary: 'bg-brand-green hover:bg-brand-green-dark text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105 w-full',
                card: 'bg-transparent shadow-none',
                cardBox: 'shadow-none',

                // Input styling
                formFieldInput: 'bg-gray-50 dark:bg-brand-gray-darker border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20',
                formFieldLabel: 'text-gray-700 dark:text-gray-300 font-medium',

                // Link styling
                formResendCodeLink: 'text-brand-green hover:text-brand-green-dark font-semibold',
                footerActionLink: 'text-brand-green hover:text-brand-green-dark font-semibold',

                // Tab styling
                tabButton: 'text-gray-600 dark:text-gray-400 hover:text-brand-green data-[active]:text-brand-green data-[active]:border-brand-green border-b-2 border-transparent',

                // Social button styling
                socialButtonsBlockButton: 'border border-gray-300 dark:border-gray-600 hover:border-brand-green dark:hover:border-brand-green hover:bg-gray-50 dark:hover:bg-brand-gray-darker rounded-lg py-3',

                // Divider styling
                dividerRow: 'text-gray-400 dark:text-gray-600',

                // Modal/Content
                modalContent: 'bg-white dark:bg-brand-gray-dark',

                // Success messages
                successMessage: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',

                // Error messages
                alert: 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg',

                // Heading
                headerTitle: 'text-2xl font-bold text-gray-900 dark:text-white',
                headerSubtitle: 'text-gray-600 dark:text-gray-400',
              },
              layout: {
                socialButtonsPlacement: 'bottom',
                logoPlacement: 'none',
              },
            }}
            forceRedirectUrl="/"
          />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 dark:text-gray-400">
          <p>
            Chưa có tài khoản?{' '}
            <button
              onClick={() => router.push('/sign-up')}
              className="text-brand-green hover:text-brand-green-dark font-semibold transition-colors"
            >
              Đăng ký ngay
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
