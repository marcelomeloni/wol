import { Container } from '@/components/ui/Container';
import Image from 'next/image';

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-wol-white pt-12 pb-24">
      <Container>
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-6 mb-20 mt-10">
          <div className="w-12 h-[1px] bg-wol-pink" />
          <h1 className="font-display text-5xl md:text-7xl text-wol-graphite tracking-tight uppercase">
            Nossa <span className="text-wol-pink drop-shadow-[2px_2px_0_#303039] md:drop-shadow-[3px_3px_0_#303039]">Essência</span>
          </h1>
          <p className="max-w-2xl text-wol-graphite/70 text-sm md:text-base leading-relaxed tracking-wide font-medium">
            Words of Light não é apenas uma marca de roupas. É um movimento. 
            Criamos streetwear para garotas que amam a Jesus e não abrem mão da sua autenticidade.
          </p>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center mb-24">
          <div className="space-y-8">
            <h2 className="text-2xl font-bold uppercase tracking-widest text-wol-graphite">
              Vista a <span className="text-wol-pink drop-shadow-[2px_2px_0_#303039]">Luz</span>
            </h2>
            <div className="space-y-6 text-sm text-wol-graphite/70 leading-relaxed">
              <p>
                Tudo começou com um desejo simples: vestir a nossa fé de uma forma real, crua e urbana. 
                Cansamos das modelagens padrões e das mensagens clichês. Queríamos algo que conversasse 
                com a cultura atual, mas que carregasse a verdade eterna.
              </p>
              <p>
                Foi assim que nasceu a <strong className="text-wol-graphite">WOL</strong>. Nossas camisetas oversized 
                não são apenas grandes no tamanho, são grandes no propósito. Cada estampa autoral é desenhada 
                milimetricamente para ser uma faísca de luz em lugares escuros.
              </p>
              <p>
                Trabalhamos com algodão premium, golas caneladas grossas e um caimento que abraça o corpo 
                com conforto e atitude. Não vendemos tecido, entregamos ferramentas para você espalhar a mensagem.
              </p>
            </div>
            
            <div className="pt-8 border-t border-wol-graphite/10 mt-8">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-wol-graphite/50 mb-6">
                Nossos Pilares
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="border border-wol-graphite/10 p-5 flex flex-col gap-3 hover:border-wol-pink/30 hover:bg-wol-pink/5 transition-all group">
                  <span className="text-wol-pink drop-shadow-[1px_1px_0_#303039] text-lg group-hover:scale-110 transition-transform origin-left">✦</span>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-wol-graphite leading-relaxed">Modelagem<br/>Oversized</span>
                </div>

                <div className="border border-wol-graphite/10 p-5 flex flex-col gap-3 hover:border-wol-pink/30 hover:bg-wol-pink/5 transition-all group">
                  <span className="text-wol-pink drop-shadow-[1px_1px_0_#303039] text-lg group-hover:scale-110 transition-transform origin-left">✦</span>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-wol-graphite leading-relaxed">Fé<br/>Inegociável</span>
                </div>

                <div className="border border-wol-graphite/10 p-5 flex flex-col gap-3 hover:border-wol-pink/30 hover:bg-wol-pink/5 transition-all group">
                  <span className="text-wol-pink drop-shadow-[1px_1px_0_#303039] text-lg group-hover:scale-110 transition-transform origin-left">✦</span>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-wol-graphite leading-relaxed">Design<br/>Streetwear</span>
                </div>

                <div className="border border-wol-graphite/10 p-5 flex flex-col gap-3 hover:border-wol-pink/30 hover:bg-wol-pink/5 transition-all group">
                  <span className="text-wol-pink drop-shadow-[1px_1px_0_#303039] text-lg group-hover:scale-110 transition-transform origin-left">✦</span>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-wol-graphite leading-relaxed">Qualidade<br/>Premium</span>
                </div>

              </div>
            </div>
          </div>

          {/* Image Placeholder */}
          <div className="relative h-[500px] md:h-[650px] w-full bg-[#f9f9f9] overflow-hidden">
            <Image 
              src="/sobreimage.png" 
              alt="WOL Essence" 
              fill 
              className="object-cover opacity-90 transition-transform duration-[3s] hover:scale-105" 
            />
            <div className="absolute inset-0 bg-wol-graphite/20 mix-blend-multiply" />
            <div className="absolute inset-0 flex items-end justify-center pb-12 pointer-events-none">
              <span className="font-display text-7xl md:text-[8rem] text-wol-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] tracking-widest leading-none">WOL</span>
            </div>
          </div>
        </div>

      </Container>
    </div>
  );
}
