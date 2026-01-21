'use client';

import { SignedIn, SignedOut, useUser, useClerk } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LeafIcon, UserCircleIcon, CreditCardIcon } from './Icons';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

interface UserButtonProps {
  isCollapsed?: boolean;
  showActionsInline?: boolean;
  popupDirection?: 'right' | 'up';
}

export default function UserButtonComponent({ isCollapsed = false, showActionsInline = false, popupDirection }: UserButtonProps) {
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const plan = (clerkUser?.publicMetadata?.plan as string) || 'FREE';
  const isPro = plan === 'PRO';

  useEffect(() => {
    if (clerkUser?.id) {
      // Fetch user from database to get their ID
      const fetchUser = async () => {
        try {
          const response = await fetch(`/api/users/${clerkUser.id}`);
          if (response.ok) {
            const data = await response.json();
            setCurrentUserId(data.id);
          }
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      };
      fetchUser();
    }
  }, [clerkUser?.id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleProfileClick = () => {
    if (currentUserId) {
      router.push(`/profile/${currentUserId}`);
      setIsDropdownOpen(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setIsDropdownOpen(false);
    router.push('/');
  };

  return (
    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
      <SignedOut>
        {!isCollapsed && (
          <>
            <Link
              href="/sign-in"
              className="px-4 py-2 text-brand-green font-semibold hover:text-brand-green-dark transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              href="/sign-up"
              className="px-4 py-2 bg-brand-green text-white rounded-lg font-semibold hover:bg-brand-green-dark transition-colors"
            >
              Đăng ký
            </Link>
          </>
        )}
        {isCollapsed && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="p-1 rounded-full hover:ring-2 hover:ring-brand-green/30 transition-all"
              title="Đăng nhập"
            >
              <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </button>

            {/* Dropdown Menu for Collapsed Sidebar - Opens Upward */}
            {isDropdownOpen && (
              <div className="absolute right-full bottom-full md:left-full ml-2 md:bottom-0 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-[60]">
                <Link
                  href="/sign-in"
                  className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/sign-up"
                  className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        )}
      </SignedOut>

      <SignedIn>
        {showActionsInline ? (
          // Mobile inline view - show user info and actions directly
          <div className="w-full space-y-2">
            {/* User Info */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {clerkUser?.imageUrl ? (
                <Image
                  src={clerkUser.imageUrl}
                  alt={clerkUser.fullName || 'User'}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-brand-green flex items-center justify-center">
                  <UserCircleIcon className="w-6 h-6 text-white" />
                </div>
              )}
              {clerkUser && (
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {clerkUser.fullName || clerkUser.username || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {clerkUser.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-1">
              {currentUserId && (
                <button
                  onClick={handleProfileClick}
                  className="w-full text-left px-6 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-white flex items-center gap-3"
                >
                  <UserCircleIcon className="w-5 h-5" />
                  Xem hồ sơ
                </button>
              )}
              <Link
                href="/settings"
                className="w-full text-left px-6 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-white flex items-center gap-3"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Cài đặt
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-6 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-red-600 dark:text-red-400 flex items-center gap-3"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Đăng xuất
              </button>
            </div>
          </div>
        ) : (
          // Desktop dropdown view
          <div className="relative w-full" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
            >
              {clerkUser?.imageUrl ? (
                <Image
                  src={clerkUser.imageUrl}
                  alt={clerkUser.fullName || 'User'}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-brand-green flex items-center justify-center">
                  <UserCircleIcon className="w-6 h-6 text-white" />
                </div>
              )}
              {!isCollapsed && clerkUser && (
                <div className="flex-1 text-left overflow-hidden">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {clerkUser.fullName || clerkUser.username || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {clerkUser.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              )}
            </button>
            {isDropdownOpen && (
              <div className={`absolute ${(popupDirection || (isCollapsed ? 'right' : 'up')) === 'right' ? 'left-full ml-2 bottom-0 py-2' : 'right-0 bottom-full mb-2 py-2'} w-56 bg-white dark:bg-brand-gray-dark rounded-lg shadow-lg z-50 border border-gray-200 dark:border-gray-700`}>
                {/* User Info */}
                {clerkUser && !isCollapsed && (
                  <div className="px-4 py-3 border-b dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      {clerkUser.imageUrl ? (
                        <Image
                          src={clerkUser.imageUrl}
                          alt={clerkUser.fullName || 'User'}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-brand-green flex items-center justify-center">
                          <UserCircleIcon className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {clerkUser.fullName || clerkUser.username || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {clerkUser.primaryEmailAddress?.emailAddress}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Menu Items */}
                <div className="py-1">
                  {currentUserId && (
                    <button
                      onClick={handleProfileClick}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-white flex items-center gap-2"
                    >
                      <UserCircleIcon className="w-4 h-4" />
                      Xem hồ sơ
                    </button>
                  )}
                  <Link
                    href="/settings"
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-white flex items-center gap-2"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Cài đặt
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-red-600 dark:text-red-400 flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        )
        }
      </SignedIn >
    </div >
  );
}
