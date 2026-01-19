import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  href?: string;
  description?: string;
}

export function StatCard({ title, value, icon: Icon, trend, href, description }: StatCardProps) {
  const CardContent = (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-purple-600/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-purple-600/10 rounded-lg">
          <Icon className="w-6 h-6 text-purple-400" />
        </div>
        {trend && (
          <div
            className={`text-sm font-medium ${
              trend.isPositive ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {trend.isPositive ? '+' : '-'}
            {trend.value}%
          </div>
        )}
      </div>

      <div>
        <p className="text-gray-400 text-sm mb-1">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
        {description && <p className="text-gray-500 text-xs mt-2">{description}</p>}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {CardContent}
      </Link>
    );
  }

  return CardContent;
}
