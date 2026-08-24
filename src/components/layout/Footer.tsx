import Link from "next/link";
import { InstagramLogo, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/ui/Container";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-wol-graphite pt-24 pb-12">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-20">
          
          {/* Brand Info (takes 2 columns on desktop) */}
          <div className="flex flex-col space-y-6 md:col-span-2 justify-center">
            <h2 className="font-display text-5xl md:text-6xl tracking-widest text-wol-white">
              WORDS OF LIGHT
            </h2>
          </div>

          {/* Links */}
          <div className="flex flex-col space-y-6">
            <h3 className="font-bold uppercase tracking-widest text-wol-white text-sm">
              Navegação
            </h3>
            <div className="flex flex-col space-y-4">
              <Link href="/produtos" className="text-wol-gray/80 hover:text-wol-pink transition-colors text-sm font-medium w-fit">Coleção Completa</Link>
              <Link href="/sobre" className="text-wol-gray/80 hover:text-wol-pink transition-colors text-sm font-medium w-fit">Nossa História</Link>
              <Link href="/contato" className="text-wol-gray/80 hover:text-wol-pink transition-colors text-sm font-medium w-fit">Fale Conosco</Link>
            </div>
          </div>

          {/* Socials */}
          <div className="flex flex-col space-y-6">
            <h3 className="font-bold uppercase tracking-widest text-wol-white text-sm">
              Social
            </h3>
            <a 
              href="https://www.instagram.com/wear.wol" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-wol-gray/80 hover:text-wol-pink transition-colors w-fit"
            >
              <InstagramLogo size={24} />
              <span className="text-sm font-medium">@wear.wol</span>
            </a>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-wol-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-medium text-wol-gray/50">
          <p className="uppercase tracking-wider">© {currentYear} WOL. Todos os direitos reservados.</p>
          <div className="flex items-center space-x-6">
            <Link href="/privacidade" className="hover:text-wol-white transition-colors uppercase tracking-wider">Privacidade</Link>
            <Link href="/termos" className="hover:text-wol-white transition-colors uppercase tracking-wider">Termos de Uso</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
