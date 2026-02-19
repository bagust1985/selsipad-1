// import NextImage from 'next/image';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-8 mt-auto hidden md:block">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
          {/* Logo Removed */}
        </div>

        <div className="flex items-center gap-8 text-sm text-gray-500">
          <Link href="/docs" className="hover:text-white transition-colors">
            Docs
          </Link>
          <Link href="/security" className="hover:text-white transition-colors">
            Security
          </Link>
          <Link
            href="https://twitter.com"
            target="_blank"
            className="hover:text-white transition-colors"
          >
            Twitter
          </Link>
          <Link href="https://t.me" target="_blank" className="hover:text-white transition-colors">
            Telegram
          </Link>
        </div>

        <div className="text-xs text-gray-600">© 2024 Selsila Ecosystem. All rights reserved.</div>
      </div>
      <div className="container mx-auto px-4 mt-8 pb-4 border-t border-white/5 pt-4">
        <p className="text-[10px] text-gray-600 text-center leading-relaxed">
          Disclaimer: Selsila does not endorse, recommend, or guarantee any project listed on this
          platform. All investments carry inherent risks. Users are solely responsible for
          conducting their own research (DYOR) and seeking independent financial advice before
          making any investment decisions. Selsila shall not be held liable for any losses incurred.
        </p>
      </div>
    </footer>
  );
}
