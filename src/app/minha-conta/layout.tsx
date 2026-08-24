'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { User, Package, MapPin, SignOut, Heart } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { name: 'Meus Pedidos', href: '/minha-conta/pedidos', icon: Package },
  { name: 'Meus Dados', href: '/minha-conta/dados', icon: User },
  { name: 'Favoritos', href: '/minha-conta/favoritos', icon: Heart },
  { name: 'Endereços', href: '/minha-conta/enderecos', icon: MapPin },
  { name: 'Sair', href: '/login', icon: SignOut },
];

export default function MinhaContaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#f9f9f9] py-12">
      <Container>
        <div className="mb-12">
          <h1 className="font-display text-4xl text-wol-graphite uppercase">Minha Conta</h1>
          <p className="text-wol-graphite/60 text-sm tracking-wide mt-2">
            Gerencie seus pedidos, dados pessoais e endereços.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          {/* Sidebar Menu */}
          <aside className="w-full lg:w-64 shrink-0">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                // Exata correspondência para o painel principal, ou correspondência de prefixo para subpáginas
                const isActive = item.href === '/minha-conta' 
                  ? pathname === item.href 
                  : pathname.startsWith(item.href);

                if (item.name === 'Sair') {
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => logout()}
                      className="flex w-full items-center gap-3 px-4 py-4 text-xs font-bold uppercase tracking-widest transition-colors border-l-2 border-transparent text-wol-graphite/60 hover:bg-wol-white hover:text-wol-graphite text-left"
                    >
                      <Icon size={20} />
                      {item.name}
                    </button>
                  );
                }

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-4 text-xs font-bold uppercase tracking-widest transition-colors border-l-2",
                      isActive
                        ? "border-wol-graphite bg-wol-white text-wol-graphite shadow-sm"
                        : "border-transparent text-wol-graphite/60 hover:bg-wol-white hover:text-wol-graphite"
                    )}
                  >
                    <Icon size={20} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 bg-wol-white p-8 md:p-12 shadow-sm border border-wol-graphite/5">
            {children}
          </main>
        </div>
      </Container>
    </div>
  );
}
