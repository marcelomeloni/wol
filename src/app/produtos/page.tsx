import { Container } from '@/components/ui/Container';
import { ProductCard } from '@/components/ui/ProductCard';
import { getProducts } from '@/lib/products';

export const revalidate = 60;

export default async function ProdutosPage() {
  let products: Awaited<ReturnType<typeof getProducts>> = [];
  try {
    products = await getProducts();
  } catch {
    products = [];
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] pt-24 md:pt-32 pb-24">
      <Container>
        <div className="flex flex-col items-center text-center space-y-6 mb-20">
          <div className="w-16 h-px bg-wol-pink" />
          <h1 className="font-display text-5xl md:text-7xl text-wol-graphite">
            TODOS OS{' '}
            <span className="relative inline-block px-2">
              <span className="relative z-10 text-wol-graphite">DROPS</span>
              <span className="absolute bottom-1 md:bottom-2 left-0 w-full h-3 md:h-4 bg-wol-pink/60 -z-0 -rotate-1 transform -skew-x-12"></span>
            </span>
          </h1>
        </div>

        {products.length === 0 ? (
          <p className="text-center text-sm text-wol-graphite/60 uppercase tracking-widest">
            Nenhum produto disponível no momento.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
