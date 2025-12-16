'use client';

import { useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Theme } from '@/types';
import { AdminIcon, InformationCircleIcon } from './Icons';
import { Map, Sparkles, Salad, Recycle, Users } from 'lucide-react';
import UserButton from './UserButton';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import Image from "next/image";
import logo from "@/public/logo.png";

interface HeaderProps {
  isCollapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  theme: Theme;
  toggleTheme: () => void;
}

interface NavItemsProps {
  currentPath: string;
  navigateTo: (path: string) => void;
  onLinkClick?: () => void;
  isCollapsed?: boolean;
  isAdmin?: boolean;
}

// Left side nav items
const leftNavItems = [
  { path: '/', label: 'Bản đồ', icon: Map },
  { path: '/scan', label: 'AI', icon: Sparkles },
];

// Right side nav items
const rightNavItems = [
  { path: '/vegetarian', label: 'Thực đơn', icon: Salad },
  { path: '/diy', label: 'Tái chế', icon: Recycle },
];

const NavItems: React.FC<NavItemsProps> = ({ currentPath, navigateTo, onLinkClick, isCollapsed = false, isAdmin = false }) => {
  const navGroups = [
    {
      title: "",
      items: [
        { path: '/', label: 'Bản đồ Xanh', icon: Map },
        { path: '/scan', label: 'Công cụ AI', icon: Sparkles },
        { path: '/vegetarian', label: 'Thực đơn xanh', icon: Salad },
        { path: '/diy', label: 'Đồ tái chế', icon: Recycle },
        { path: '/community', label: 'Cộng đồng', icon: Users },
      ]
    },
  ];


  // Add Admin group if user is admin
  if (isAdmin) {
    navGroups.push({
      title: "QUẢN TRỊ",
      items: [{ path: '/admin', label: 'Admin Dashboard', icon: AdminIcon }]
    });
  }

  return (
    <div className="space-y-6">
      {navGroups.map((group, groupIndex) => (
        <div key={groupIndex}>
          {!isCollapsed && group.title && (
            <h3 className="px-6 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              {group.title}
            </h3>
          )}
          <div className="">
            {group.items.map(item => {
              const isActive = currentPath === item.path;
              const Icon = item.icon;
              return (
                <div key={item.path} className={`relative group sidebar-nav-item ${isActive ? 'active' : ''}`}>
                  <Link
                    href={item.path}
                    prefetch={true}
                    onClick={onLinkClick}
                    aria-label={item.label}
                    className={`w-full flex items-center justify-center py-5 text-sm font-medium transition-all duration-200 ${isCollapsed ? 'px-4' : 'px-6 mx-2 w-[calc(100%-16px)]'
                      } ${isActive
                        ? 'text-brand-green'
                        : 'text-white/70 hover:text-white hover:scale-110'
                      }`}
                  >
                    <Icon className={`flex-shrink-0 transition-transform duration-200 ${isCollapsed ? 'h-7 w-7' : 'h-5 w-5'}`} />
                    {!isCollapsed && <span className="ml-3 whitespace-nowrap">{item.label}</span>}
                  </Link>
                  {isCollapsed && (
                    <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-gray-900/95 backdrop-blur-sm text-white text-sm font-medium px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-[9999] shadow-xl">
                      <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-gray-900/95 rotate-45 rounded-sm"></div>
                      <span className="relative">{item.label}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};


const Header: React.FC<HeaderProps> = ({ isCollapsed, setCollapsed, theme, toggleTheme }) => {
  const router = useRouter();
  const pathname = usePathname() || '/';
  const [isPending, startTransition] = useTransition();
  const { isAdmin, loading } = useIsAdmin();

  console.log('Admin status:', { isAdmin, loading });

  const navigateTo = (path: string) => {
    startTransition(() => {
      window.scrollTo(0, 0);
      router.push(path);
    });
  };

  return (
    <>
      {/* --- Sidebar for Desktop (Always Collapsed - Icon Only) --- */}
      <aside className="bg-gradient-to-b from-brand-green to-brand-green-dark h-screen fixed left-0 top-0 flex-col z-30 hidden md:flex transition-all duration-300 w-24 overflow-visible pl-2.5">
        {/* Header with Logo */}
        <div className="flex justify-center items-center h-24 pr-2 overflow-hidden">
          <div
            className="flex items-center cursor-pointer p-2 rounded-2xl bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-105"
            onClick={() => navigateTo('/')}
          >
            <Image src={logo} alt="BandoXanh" width={64} height={64} className="rounded-xl drop-shadow-lg" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-grow py-2 overflow-visible">
          <NavItems currentPath={pathname} navigateTo={navigateTo} isCollapsed={true} isAdmin={isAdmin} />
        </nav>

        {/* Footer with UserButton only */}
        <div className="p-3 border-t border-white/10">
          <UserButton isCollapsed={true} />
        </div>
      </aside>

      {/* --- Bottom Navigation Bar for Mobile (App-style with Logo in center) --- */}
      <nav className="fixed bottom-[10px] left-0 right-0 z-[9990] md:hidden safe-area-bottom">
        {/* Background with curved notch for logo */}
        <div className="relative">
          <div className="absolute bottom-[10px] left-0 right-0 mx-auto rounded-full bg-white dark:bg-gray-900 w-[95%] h-[80px] z-[-1] shadow-lg shadow-brand-green/30"></div>          {/* Navigation items */}
          <div className="flex items-center justify-around px-2 pt-2">
            {/* Left items: AI and Menu */}
            <Link
              href="/scan"
              prefetch={true}
              className={`flex flex-col items-center justify-center py-3 px-3 transition-all duration-200 ${pathname === '/scan'
                ? 'text-brand-green'
                : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
                }`}
            >
              <Sparkles className="h-6 w-6" />
            </Link>

            <Link
              href="/vegetarian"
              prefetch={true}
              className={`flex flex-col items-center justify-center py-3 px-3 transition-all duration-200 ${pathname === '/vegetarian'
                ? 'text-brand-green'
                : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
                }`}
            >
              <Salad className="h-6 w-6" />
            </Link>

            {/* Center Logo Button (raised) */}
            <div className="relative px-2">
              <Link
                href="/"
                prefetch={true}
                className="w-[100px] h-[100px] rounded-full bg-gradient-to-br from-brand-green to-brand-green-dark shadow-lg shadow-brand-green/30 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Image src={logo} alt="BandoXanh" width={80} height={80} className="rounded-full" />
              </Link>
            </div>

            {/* Right items: DIY and Account */}
            <Link
              href="/diy"
              prefetch={true}
              className={`flex flex-col items-center justify-center py-3 px-3 transition-all duration-200 ${pathname === '/diy'
                ? 'text-brand-green'
                : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
                }`}
            >
              <Recycle className="h-6 w-6" />
            </Link>

            <div className="flex flex-col items-center justify-center py-3 px-3">
              <div className="flex items-center justify-center">
                <UserButton isCollapsed={true} popupDirection="up" />
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
