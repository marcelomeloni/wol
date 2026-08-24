import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/ui/ProductCard';
import { products } from '@/lib/data';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-wol-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop')] opacity-[0.03] bg-cover bg-center" />
        
        <Container className="relative z-10 flex flex-col items-center justify-center text-center space-y-8">
          <div className="w-16 h-px bg-wol-pink" />
          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] tracking-tight text-wol-graphite">
            WORDS OF LIGHT
          </h1>
          <p className="text-wol-graphite/70 text-base md:text-lg max-w-2xl mx-auto uppercase tracking-widest font-bold">
            Oversized t-shirts • Made for girls who love Jesus • Estampas Autorais
          </p>
          <div className="pt-4">
            <Button href="/produtos" variant="primary" size="lg">
              VER COLEÇÃO COMPLETA
            </Button>
          </div>
        </Container>
      </section>



      {/* Featured Products Section (Vitrine) */}
      <section className="bg-[#f9f9f9] py-16 md:py-24">
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {products.slice(0, 3).map((product) => (
              <ProductCard key={product.id} product={product} showColorSelector={false} />
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Button href="/produtos" variant="secondary">
              VER TODOS OS PRODUTOS
            </Button>
          </div>
        </Container>
      </section>

      {/* Brand Essence Section ('NOSSA ESSÊNCIA') */}
      <section className="bg-wol-white py-16 md:py-24">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image Placeholder */}
            <div className="order-2 lg:order-1 h-[450px] md:h-[550px] bg-[#f9f9f9] relative flex items-center justify-center overflow-hidden">
              <Image 
                src="/homeimage.png"
                alt="WOL Lifestyle"
                fill
                priority
                className="object-cover transition-transform duration-[1.5s] hover:scale-105"
              />
              <div className="relative z-10 w-32 h-32 md:w-48 md:h-48 rounded-full flex items-center justify-center bg-wol-graphite shadow-2xl">
                <span className="font-display text-3xl md:text-5xl text-wol-white pt-2 md:pt-3">WOL</span>
              </div>
            </div>

            {/* Text Content */}
            <div className="order-1 lg:order-2 flex flex-col space-y-8">
              <div className="w-12 h-px bg-wol-pink" />
              <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-wol-graphite">
                VISTA A LUZ
              </h2>
              <div className="space-y-6 text-wol-graphite/80 text-lg leading-relaxed">
                <p>
                  A Words of Light nasce da fusão entre a estética urbana minimalista e a busca por um{' '}
                  <span className="relative inline-block px-1">
                    <span className="relative z-10 font-bold text-wol-graphite">propósito maior</span>
                    <span className="absolute bottom-1 left-0 w-full h-3 bg-wol-pink/60 -z-0 rotate-1 transform skew-x-12"></span>
                  </span>. 
                  Mais do que streetwear, somos uma mensagem de fé traduzida em design.
                </p>
                <p>
                  Criamos <strong className="text-wol-graphite font-bold underline decoration-wol-pink decoration-4 underline-offset-4">oversized t-shirts</strong> com estampas 100% autorais, pensadas e desenvolvidas especialmente para <span className="font-bold text-wol-graphite">garotas que amam a Jesus</span> e não abrem mão de conforto, autenticidade e qualidade premium.
                </p>
              </div>
              <div className="pt-4">
                <Button href="/sobre" variant="secondary">
                  CONHEÇA NOSSA HISTÓRIA
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Newsletter Section */}
      <section className="bg-[#f9f9f9] border-t border-wol-graphite/5 py-20">
        <Container>
          <div className="max-w-xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-wol-graphite">
                FIQUE POR DENTRO
              </h2>
              <p className="text-wol-graphite/70">
                Receba novidades e drops exclusivos.
              </p>
            </div>
            
            <form action="#" className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                required
                className="flex-1 bg-wol-white border border-wol-graphite/20 text-wol-graphite focus:border-wol-graphite focus:ring-1 focus:ring-wol-graphite px-4 py-3 rounded-sm outline-none transition-colors placeholder:text-wol-graphite/40"
              />
              <Button type="submit" className="whitespace-nowrap rounded-sm" variant="primary">
                INSCREVER
              </Button>
            </form>
          </div>
        </Container>
      </section>
    </div>
  );
}
