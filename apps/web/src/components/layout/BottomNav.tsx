'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Rocket, Plus, MessageCircle, User } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
}

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      href: '/',
      icon: Home,
    },
    {
      id: 'explore',
      label: 'Explore',
      href: '/explore',
      icon: Rocket,
    },
    {
      id: 'create',
      label: 'Create',
      href: '/create',
      icon: Plus,
    },
    {
      id: 'feed',
      label: 'Feed',
      href: '/feed',
      icon: MessageCircle,
    },
    {
      id: 'profile',
      label: 'Profile',
      href: '/profile',
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full md:hidden safe-bottom">
      <div className="bg-black/80 backdrop-blur-xl border-t border-[#39AEC4]/20 px-6 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.4)] flex items-center justify-between relative overflow-hidden">
        {/* Glass Reflection Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

        {navItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.id}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center relative group py-1"
            >
              <div
                className={cn(
                  'p-1.5 rounded-xl transition-all duration-300',
                  isActive
                    ? 'text-[#39AEC4] bg-[#39AEC4]/10 shadow-[0_0_10px_rgba(57,174,196,0.2)]'
                    : 'text-gray-500 group-hover:text-gray-300'
                )}
              >
                <item.icon
                  className={cn(
                    'w-6 h-6 transition-transform duration-300',
                    isActive ? 'scale-110' : 'group-hover:scale-105'
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>

              <span
                className={cn(
                  'text-[10px] font-medium tracking-wide transition-colors duration-300 mt-1',
                  isActive ? 'text-[#39AEC4]' : 'text-gray-500 group-hover:text-gray-400'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
