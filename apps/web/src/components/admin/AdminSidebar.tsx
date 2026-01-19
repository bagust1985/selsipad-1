'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  FileCheck,
  Rocket,
  TrendingUp,
  MessageSquare,
  ScrollText,
  Users,
  Settings,
  Shield,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: any;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'KYC Reviews', href: '/admin/kyc', icon: FileCheck },
  { name: 'Presales', href: '/admin/presales/review', icon: Rocket },
  { name: 'Fairlaunch', href: '/admin/fairlaunch/review', icon: TrendingUp },
  { name: 'Badges', href: '/admin/badges', icon: Shield },
  { name: 'AMA', href: '/admin/ama', icon: MessageSquare },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Audit Log', href: '/admin/audit-log', icon: ScrollText },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 min-h-screen p-6">
      {/* Logo/Title */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-purple-500" />
          <div>
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            <p className="text-xs text-gray-500">SELSIPAD v3</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-gray-800">
        <p className="text-xs text-gray-600 text-center">Admin Dashboard v1.0</p>
      </div>
    </aside>
  );
}
