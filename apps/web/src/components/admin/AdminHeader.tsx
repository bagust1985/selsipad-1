'use client';

import { LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AdminHeaderProps {
  adminWallet?: string;
}

export function AdminHeader({ adminWallet }: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    // Implement logout logic
    router.push('/');
  };

  // Shorten wallet address for display
  const displayWallet = adminWallet
    ? `${adminWallet.slice(0, 6)}...${adminWallet.slice(-4)}`
    : 'Admin';

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Admin Dashboard</h2>
          <p className="text-sm text-gray-500">Manage SELSIPAD platform</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Admin Info */}
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-800 rounded-lg">
            <User className="w-5 h-5 text-purple-400" />
            <div className="text-sm">
              <p className="text-gray-400">Logged in as</p>
              <p className="text-white font-mono font-medium">{displayWallet}</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
