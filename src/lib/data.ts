import type { Product, NavLink } from '@/types';

export const navLinks: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Produtos', href: '/produtos' },
  { label: 'Sobre', href: '/sobre' },
  { label: 'Contato', href: '/contato' },
];

export const products: Product[] = [
  {
    id: '6bcd73a1-ca66-44c4-8de9-4bc3e6ef4284',
    slug: 'every-good',
    name: 'Every Good',
    price: 139.90,
    description: 'Camiseta oversized premium com estampa exclusiva Every Good. DisponÃ­vel em preto e branco.',
    variants: [
      {
        color: 'preto',
        colorLabel: 'Preto',
        frontImage: '/camisas/every good/preto/frente.jpg',
        backImage: '/camisas/every good/preto/verso.jpg',
      }, {
        color: 'branco',
        colorLabel: 'Branco',
        frontImage: '/camisas/every good/branco/frente.jpg',
        backImage: '/camisas/every good/branco/verso.jpg',
      },
    ],
    isNew: true,
  },
  {
    id: '91d0fbf9-3845-44fb-8dc6-cbd04dfecfca',
    slug: 'god-is-with-you',
    name: 'God Is With You',
    price: 139.90,
    description: 'Camiseta oversized premium com estampa exclusiva God Is With You. Mensagem de fÃ© e propÃ³sito.',
    variants: [
      {
        color: 'preto',
        colorLabel: 'Preto',
        frontImage: '/camisas/god is with you/preto/frente.jpg',
        backImage: '/camisas/god is with you/preto/verso.jpg',
      }, {
        color: 'branco',
        colorLabel: 'Branco',
        frontImage: '/camisas/god is with you/branco/frente.jpg',
        backImage: '/camisas/god is with you/branco/verso.jpg',
      },
    ],
  },
  {
    id: 'feb76983-6f6f-4cb7-a86c-c2ebca21a533',
    slug: 'bloom-with-grace',
    name: 'Bloom With Grace',
    price: 139.90,
    description: 'Camiseta streetwear Bloom With Grace, estampa floral abstrata. Design minimalista.',
    variants: [
      {
        color: 'preto',
        colorLabel: 'Preto',
        frontImage: '/camisas/bloom with grace/preto/frente.jpg',
        backImage: '/camisas/bloom with grace/preto/verso.jpg',
      }, {
        color: 'branco',
        colorLabel: 'Branco',
        frontImage: '/camisas/bloom with grace/branco/frente.jpg',
        backImage: '/camisas/bloom with grace/branco/verso.jpg',
      },
    ],
  },
  {
    id: '803b0240-0e83-4d3c-892b-95e3f54dc06f',
    slug: 'jesus-loves-you',
    name: 'Jesus Loves You',
    price: 139.90,
    description: 'Camiseta oversized Jesus Loves You. EstÃ©tica streetwear com mensagem clara.',
    variants: [
      {
        color: 'preto',
        colorLabel: 'Preto',
        frontImage: '/camisas/jesus loves you/preto/frente.jpg',
        backImage: '/camisas/jesus loves you/preto/verso.jpg',
      }, {
        color: 'branco',
        colorLabel: 'Branco',
        frontImage: '/camisas/jesus loves you/branco/frente.jpg',
        backImage: '/camisas/jesus loves you/branco/verso.jpg',
      },
    ],
  },
  {
    id: '257b26cd-2219-4e0b-9052-520fa1805caf',
    slug: 'love',
    name: 'Love',
    price: 139.90,
    description: 'Camiseta Love essencial. Corte premium urbano e caimento perfeito.',
    variants: [
      {
        color: 'preto',
        colorLabel: 'Preto',
        frontImage: '/camisas/love/preto/frente.jpg',
        backImage: '/camisas/love/preto/verso.jpg',
      }, {
        color: 'branco',
        colorLabel: 'Branco',
        frontImage: '/camisas/love/branco/frente.jpg',
        backImage: '/camisas/love/branco/verso.jpg',
      },
    ],
  },
  {
    id: 'dd81873b-4cc5-4290-b1d4-61bde30ccb36',
    slug: 'love-never-fail',
    name: 'Love Never Fail',
    price: 139.90,
    description: 'Camiseta Love Never Fail. Streetwear com propÃ³sito e impacto visual.',
    variants: [
      {
        color: 'preto',
        colorLabel: 'Preto',
        frontImage: '/camisas/love never fail/preto/frente.jpg',
        backImage: '/camisas/love never fail/preto/verso.jpg',
      }, {
        color: 'branco',
        colorLabel: 'Branco',
        frontImage: '/camisas/love never fail/branco/frente.jpg',
        backImage: '/camisas/love never fail/branco/verso.jpg',
      },
    ],
  }
];


