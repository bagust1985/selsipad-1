'use client';

import { usePathname } from 'next/navigation';
import { EVMWalletProvider } from '@/lib/wallet/EVMWalletProvider';
import { AdminShell } from '@/components/admin/AdminShell';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // Login page at /admin gets full-screen layout without shell
  const isLoginPage = pathname === '/admin';

  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <EVMWalletProvider>
        {isLoginPage ? children : <AdminShell>{children}</AdminShell>}
      </EVMWalletProvider>
    </div>
  );
}
