import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../src/styles/globals.css';
import { BottomNav } from '@/components/layout';
import { ToastProvider } from '@/components/ui';
import { MultiChainWalletProvider } from '@/lib/wallet/MultiChainWalletProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SELSIPAD Web',
  description: 'SELSIPAD - Multi-chain Launchpad Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <MultiChainWalletProvider>
          <ToastProvider>
            {children}
            <BottomNav />
          </ToastProvider>
        </MultiChainWalletProvider>
      </body>
    </html>
  );
}
