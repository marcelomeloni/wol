"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bag, List, X, InstagramLogo, User } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Produtos", href: "/produtos" },
  { name: "Sobre", href: "/sobre" },
  { name: "Contato", href: "/contato" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isCartOpen, toggleCart, items, totalItems, totalPrice, updateQuantity, removeItem } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsMobileMenuOpen((prev) => !prev);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  return (
    <>
      <nav
        className="fixed left-0 right-0 top-0 z-40 h-16 w-full bg-wol-white border-b border-wol-graphite/10 transition-all duration-300 md:h-20"
      >
        <Container className="flex h-full items-center justify-between">
          {/* LEFT: Logo */}
          <Link href="/" className="font-display text-3xl md:text-4xl tracking-widest text-wol-graphite">
            WOL
          </Link>

          {/* CENTER: Desktop Links */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-bold uppercase tracking-wider transition-all",
                    isActive
                      ? "text-wol-graphite border-b-[3px] border-wol-graphite pb-1"
                      : "text-wol-graphite/60 hover:text-wol-graphite"
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-4">
            <Link
              href={isAuthenticated ? "/minha-conta/pedidos" : "/login"}
              className="text-wol-graphite transition-opacity hover:opacity-50 hidden sm:block"
            >
              <User size={24} />
            </Link>
            <button onClick={toggleCart} className="text-wol-graphite transition-opacity hover:opacity-50 relative">
              <Bag size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-2 bg-wol-graphite text-wol-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            <button
              className="block text-wol-graphite transition-opacity hover:opacity-50 md:hidden"
              onClick={toggleMenu}
            >
              <List size={28} />
            </button>
          </div>
        </Container>
      </nav>

      {/* MOBILE OVERLAY */}
      <div
        className={cn(
          "fixed inset-0 z-50 flex flex-col bg-wol-white transition-transform duration-300 ease-in-out md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 border-b border-wol-graphite/10 bg-wol-white">
          <Link href="/" className="font-display text-3xl md:text-4xl tracking-widest text-wol-graphite" onClick={toggleMenu}>
            WOL
          </Link>
          <button className="text-wol-graphite hover:opacity-50" onClick={toggleMenu}>
            <X size={28} />
          </button>
        </div>
        
        <div className="flex flex-col gap-6 p-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={toggleMenu}
              className="text-xl font-display uppercase tracking-widest text-wol-graphite hover:opacity-50"
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={toggleMenu}
            className="flex items-center gap-2 text-xl font-display uppercase tracking-widest text-wol-graphite hover:opacity-50 mt-8"
          >
            <User size={24} />
            Minha Conta
          </Link>
        </div>
      </div>

      {/* CART DRAWER */}
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-wol-graphite/40 backdrop-blur-sm z-50 transition-opacity duration-300",
          isCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )} 
        onClick={toggleCart}
      />
      {/* Drawer */}
      <div 
        className={cn(
          "fixed top-0 right-0 bottom-0 w-[90%] max-w-md bg-wol-white z-50 shadow-2xl flex flex-col transition-transform duration-500 ease-in-out",
          isCartOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-wol-graphite/10 bg-wol-white">
          <h2 className="font-sans font-bold uppercase tracking-widest text-lg text-wol-graphite">Seu Carrinho</h2>
          <button onClick={toggleCart} className="text-wol-graphite hover:opacity-50 transition-opacity">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-[#f9f9f9]">
            <Bag size={64} className="text-wol-graphite/20 mb-4" />
            <h3 className="font-sans font-bold uppercase tracking-widest text-wol-graphite">Seu carrinho está vazio</h3>
            <p className="text-wol-graphite/60 text-sm">Descubra as novas oversized t-shirts e expresse a sua luz.</p>
            <Link href="/produtos" onClick={toggleCart} className="mt-8 bg-wol-graphite text-wol-white font-bold uppercase text-sm tracking-widest px-8 py-4 hover:bg-wol-black transition-colors w-full">
              Explorar Coleção
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 bg-[#f9f9f9] space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 bg-wol-white p-3 border border-wol-graphite/5 shadow-sm">
                  <div className="w-20 h-24 bg-[#f1f1f1] relative shrink-0">
                    <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col flex-1 justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-wol-graphite uppercase text-sm leading-tight pr-2">{item.name}</h4>
                        <button onClick={() => removeItem(item.id)} className="text-wol-graphite/40 hover:text-wol-pink transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                      <p className="text-xs text-wol-graphite/60 mt-1 capitalize">{item.color} | Tam {item.size}</p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center border border-wol-graphite/20">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 text-wol-graphite/60 hover:text-wol-graphite">-</button>
                        <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 text-wol-graphite/60 hover:text-wol-graphite">+</button>
                      </div>
                      <span className="font-bold text-sm text-wol-graphite">{formatPrice(item.price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Footer */}
            <div className="p-6 border-t border-wol-graphite/10 bg-wol-white">
              <div className="flex justify-between items-center mb-6">
                <span className="font-bold uppercase tracking-widest text-wol-graphite text-sm">Subtotal</span>
                <span className="font-bold text-lg text-wol-graphite">{formatPrice(totalPrice)}</span>
              </div>
              <Link 
                href="/checkout"
                onClick={toggleCart}
                className="w-full bg-wol-graphite text-wol-white font-bold uppercase tracking-widest py-4 hover:bg-wol-black transition-colors text-center block"
              >
                Finalizar Compra
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
