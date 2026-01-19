'use client';

import { usePathname } from 'next/navigation';
import { BottomNav } from './BottomNav';

export function ConditionalBottomNav() {
  const pathname = usePathname();

  // Hide BottomNav on admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return <BottomNav />;
}
