import type { Metadata } from 'next';
import { League_Spartan } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { cn } from '@/lib/utils';

const leagueSpartan = League_Spartan({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-league-spartan',
});

export const metadata: Metadata = {
  title: 'WOL | Words of Light',
  description: 'Streetwear com propósito. Vista a luz.',
};

import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={cn(leagueSpartan.variable, 'h-full antialiased')}>
      <body className="flex flex-col min-h-full bg-wol-graphite text-wol-white font-sans">
        <AuthProvider>
          <FavoritesProvider>
            <CartProvider>
              <Navbar />
              <main className="flex-1 pt-16 md:pt-20">
                {children}
              </main>
              <Footer />
              <ToastProvider />
            </CartProvider>
          </FavoritesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
