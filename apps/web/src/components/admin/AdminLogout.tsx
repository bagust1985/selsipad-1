'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export function AdminLogout() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Clear admin cookie
      await fetch('/api/auth/admin-logout', {
        method: 'POST',
      });

      // Redirect to admin login
      router.push('/admin');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Logout
    </button>
  );
}
