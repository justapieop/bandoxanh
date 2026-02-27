import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { ADMIN_EMAILS } from '@/lib/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { email: true, isAdmin: true },
  });

  // Check both isAdmin field and legacy email list
  if (!user || (!user.isAdmin && !ADMIN_EMAILS.includes(user.email))) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage content and monitor platform activity
            </p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
          >
            ← Trang chủ
          </Link>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}
