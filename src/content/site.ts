/**
 * Conteúdo do site público da MAV Emplacamento.
 *
 * Este arquivo é a ÚNICA fonte de verdade do conteúdo institucional: as seções
 * da landing page, o JSON-LD (LocalBusiness + FAQPage) e o sitemap.xml são
 * gerados a partir daqui. Alterar um texto aqui atualiza página e SEO juntos.
 *
 * Campos com valor `null` são dados que a MAV ainda não forneceu. Eles são
 * deliberadamente nulos em vez de preenchidos com estimativas: o JSON-LD omite
 * o bloco correspondente e a página mostra um marcador visível de pendência.
 * Nunca substitua um `null` por um valor inventado — avaliação, número de
 * clientes e horário falsos quebram a confiança e violam as diretrizes de
 * dados estruturados do Google.
 */

/**
 * Domínio canônico. Sobrescreva com `VITE_SITE_URL` no build.
 *
 * A leitura cobre os dois contextos em que este módulo é carregado: o bundle do
 * navegador (`import.meta.env`, preenchido pelo `define` do vite.config) e o
 * Node do build, quando o vite.config e o script de pré-renderização importam
 * este arquivo direto (`process.env`).
 */
const resolvedSiteUrl =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SITE_URL) ||
  (typeof process !== "undefined" && process.env?.VITE_SITE_URL) ||
  "https://mavemplacamento.com.br";

export const SITE_URL = resolvedSiteUrl.replace(/\/+$/, "");

export const BUSINESS = {
  name: "MAV Emplacamento",
  tagline: "Referência em Placa Mercosul",
  phoneDisplay: "(11) 93929-0373",
  phoneE164: "+5511939290373",
  whatsappNumber: "5511939290373",
  email: "contato@mavemplacamento.com.br" as string | null,
  address: {
    street: "Rua Bela Vista, 888",
    district: "Chácara Santo Antônio",
    city: "São Paulo",
    state: "SP",
    country: "BR",
    postalCode: "04709-000" as string | null,
  },
  /** Região atendida — usada na copy e nas meta tags de SEO local. */
  serviceArea: "São Paulo e região",
  /** Coordenadas da unidade — alimentam o `geo` do JSON-LD (mapa no Google). */
  geo: { latitude: -23.630477, longitude: -46.695692 } as
    | { latitude: number; longitude: number }
    | null,
  openingHours: [
    { days: ["Mo", "Tu", "We", "Th", "Fr"], opens: "09:00", closes: "17:00" },
  ] as { days: string[]; opens: string; closes: string }[] | null,
  /** [inserir avaliação real] Só preencha com dados verificáveis do Google Meu Negócio. */
  aggregateRating: null as { ratingValue: number; reviewCount: number } | null,
  social: {
    instagram: "https://www.instagram.com/mavemplacamento",
  },
} as const;

export const WHATSAPP_BASE = `https://wa.me/${BUSINESS.whatsappNumber}`;

/** Monta o link do WhatsApp com mensagem pré-preenchida por contexto. */
export const whatsappLink = (message?: string) =>
  message ? `${WHATSAPP_BASE}?text=${encodeURIComponent(message)}` : WHATSAPP_BASE;

export const fullAddress = `${BUSINESS.address.street} — ${BUSINESS.address.district}, ${BUSINESS.address.city} - ${BUSINESS.address.state}`;

/**
 * Versão com CEP, para o bloco de contato. A do herói fica sem: ali o endereço
 * divide a linha com telefone e nota, e o CEP só serviria para quebrá-la.
 */
export const fullAddressWithZip = BUSINESS.address.postalCode
  ? `${fullAddress}, ${BUSINESS.address.postalCode}`
  : fullAddress;

export type ServiceId =
  | "primeira-via"
  | "zero-km"
  | "segunda-via"
  | "frotas";

export interface Service {
  id: ServiceId;
  /** Rótulo curto acima do título (categoria). */
  eyebrow: string;
  title: string;
  /** Frase de venda, voltada ao cliente final. */
  description: string;
  /** O que está incluso — 3 itens curtos. */
  includes: string[];
  /** Etapas do atendimento, na linguagem do cliente. */
  steps: string[];
  /** Mensagem pré-preenchida no WhatsApp. */
  whatsappMessage: string;
  /** Ícone do lucide-react, resolvido no componente. */
  icon: "plate" | "zeroKm" | "duplicate" | "fleet";
  featured?: boolean;
}

/**
 * A MAV é estampadora de placa Mercosul: o que ela faz é produzir e instalar a
 * placa. Serviço de despachante — transferência de propriedade, licenciamento
 * anual e afins — não entra aqui, e as etapas de cada serviço falam só do que
 * acontece dentro da loja.
 */
export const SERVICES: Service[] = [
  {
    id: "primeira-via",
    eyebrow: "Placa Mercosul",
    title: "Primeira Via de Placa",
    description:
      "A primeira placa Mercosul do seu veículo, estampada no padrão oficial e instalada na hora.",
    includes: [
      "Estampagem no padrão oficial Mercosul",
      "Carro, moto e demais categorias",
      "Instalação na loja, sem deixar o veículo",
    ],
    steps: [
      "Você manda os dados do veículo pelo WhatsApp e a gente confirma o que é preciso",
      "Estampamos a placa no padrão Mercosul e avisamos assim que fica pronta",
      "Você agenda um horário e vem retirar — ou instalar na hora, ali mesmo",
    ],
    whatsappMessage:
      "Olá! Quero fazer a primeira via da placa Mercosul do meu veículo. Pode me ajudar?",
    icon: "plate",
    featured: true,
  },
  {
    id: "zero-km",
    eyebrow: "Veículo novo",
    title: "Placa para Veículo 0km",
    description:
      "Comprou um carro ou uma moto zero? A gente estampa e instala a placa Mercosul do seu veículo novo.",
    includes: [
      "Placa nova no padrão oficial",
      "Carro e moto",
      "Instalação feita na hora",
    ],
    steps: [
      "Você chama no WhatsApp com os dados do veículo novo",
      "Estampamos a placa e avisamos quando estiver pronta",
      "Você vem na loja e sai com a placa instalada",
    ],
    whatsappMessage:
      "Olá! Comprei um veículo 0km e preciso da placa Mercosul. Pode me passar as informações?",
    icon: "zeroKm",
  },
  {
    id: "segunda-via",
    eyebrow: "Reposição",
    title: "Segunda Via de Placa",
    description:
      "Placa perdida, furtada, amassada ou ilegível? Estampamos a placa de reposição no padrão exigido por lei.",
    includes: [
      "Perda, furto, dano ou placa ilegível",
      "Placa avulsa ou o par completo",
      "Instalação na hora, se você preferir",
    ],
    steps: [
      "Você conta o que aconteceu com a placa e manda os dados pelo WhatsApp",
      "Estampamos a placa de reposição no padrão Mercosul",
      "Você agenda o horário e retira — ou já sai com ela instalada",
    ],
    whatsappMessage:
      "Olá! Preciso da segunda via da placa do meu veículo. Pode me ajudar?",
    icon: "duplicate",
  },
  {
    id: "frotas",
    eyebrow: "Empresas e PJ",
    title: "Placas para Frotas",
    description:
      "Sua empresa tem vários veículos? Atendimento dedicado para frota, com as placas estampadas por lote.",
    includes: [
      "Atendimento dedicado para pessoa jurídica",
      "Estampagem por lote, com prioridade",
      "Combinação de horário para a instalação",
    ],
    steps: [
      "Você passa a relação dos veículos pelo WhatsApp",
      "Estampamos as placas por lote, na ordem que a empresa precisar",
      "Combinamos o horário e a instalação de cada veículo",
    ],
    whatsappMessage:
      "Olá! Represento uma empresa e preciso de placas para a nossa frota. Pode me passar as condições?",
    icon: "fleet",
  },
];

export interface Pillar {
  title: string;
  description: string;
  icon: "shield" | "lock" | "medal" | "clock";
}

/** Os quatro pilares do material de marca oficial. */
export const PILLARS: Pillar[] = [
  {
    title: "Agilidade",
    description: "Processos rápidos e sem burocracia, com retorno no mesmo dia pelo WhatsApp.",
    icon: "shield",
  },
  {
    title: "Segurança",
    description: "Serviço confiável e totalmente seguro, com cada etapa conferida antes de avançar.",
    icon: "lock",
  },
  {
    title: "Qualidade",
    description: "Padrão Mercosul oficial e materiais de alta qualidade em todas as placas.",
    icon: "medal",
  },
  {
    title: "Atendimento Rápido",
    description: "Equipe preparada para te atender bem e explicar tudo em português claro.",
    icon: "clock",
  },
];

/* -------------------------------------------------------------------------
 * Tabela de preços da placa Mercosul
 * ---------------------------------------------------------------------- */

export interface PlatePrice {
  id: "carro" | "moto";
  label: string;
  /** O que o valor cobre, em uma linha. */
  unit: string;
  /** Quantas placas o valor cobre — carro leva par, moto leva uma. */
  units: number;
  price: number;
  /** Preço "de" riscado. `null` quando não há promoção. */
  priceFrom: number | null;
  description: string;
  highlight?: boolean;
  whatsappMessage: string;
}

export const PLATE_PRICES: PlatePrice[] = [
  {
    id: "carro",
    label: "Carro",
    unit: "o par",
    units: 2,
    price: 140,
    priceFrom: 179,
    description: "Par de placas Mercosul para carro, no padrão oficial.",
    highlight: true,
    whatsappMessage:
      "Olá! Vi no site a promoção da placa Mercosul para carro por R$ 140,00 o par. Quero fazer o pedido.",
  },
  {
    id: "moto",
    label: "Moto",
    unit: "placa única",
    units: 1,
    price: 90,
    priceFrom: null,
    description: "Placa Mercosul para motocicleta, no padrão oficial.",
    whatsappMessage:
      "Olá! Vi no site a placa Mercosul para moto por R$ 90,00. Quero fazer o pedido.",
  },
];

/**
 * Ressalva exibida abaixo da tabela. Deliberadamente neutra: o valor anunciado
 * é o da placa, e não sabemos o que a MAV inclui ou cobra à parte em taxas
 * oficiais — afirmar isso aqui seria inventar política comercial.
 */
/** Atalhos para as duas linhas da tabela — usados no FAQ e nas meta tags. */
const carPrice = PLATE_PRICES.find((item) => item.id === "carro")!;
const motoPrice = PLATE_PRICES.find((item) => item.id === "moto")!;

export const PRICE_DISCLAIMER =
  "Valor referente à placa Mercosul. Confirme pelo WhatsApp o que está incluído no seu caso e as taxas oficiais aplicáveis.";

/** Números derivados da oferta: economia, desconto e valor por placa. */
export const offerInsights = (item: PlatePrice) => {
  const save = item.priceFrom ? item.priceFrom - item.price : 0;

  return {
    save,
    percentOff: item.priceFrom ? Math.round((save / item.priceFrom) * 100) : 0,
    perPlate: item.price / item.units,
  };
};

export const priceLabel = (value: number) =>
  value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export interface Faq {
  question: string;
  answer: string;
}

export const FAQS: Faq[] = [
  {
    question: "Preciso deixar o veículo na loja?",
    answer:
      "Não. A instalação é feita na hora, com você esperando: em poucos minutos o veículo sai com a placa nova. Se preferir só retirar a placa e instalar depois, também pode.",
  },
  {
    question: "Quanto custa a placa Mercosul?",
    answer: `Carro sai por R$ ${carPrice.price},00 o par e moto por R$ ${motoPrice.price},00. ${PRICE_DISCLAIMER}`,
  },
  {
    question: "Quanto tempo leva para a placa ficar pronta?",
    answer:
      "Depende do tipo de placa e do movimento do dia. Assim que confirmamos o pedido pelo WhatsApp, informamos o prazo do seu caso e avisamos no mesmo canal quando a placa fica pronta para retirada.",
  },
  {
    question: "Quais documentos eu preciso apresentar?",
    answer:
      "Varia conforme o caso. Em geral, o documento do veículo e um documento seu com foto — e, em caso de furto ou roubo da placa, o boletim de ocorrência. Mande os dados pelo WhatsApp que a gente confirma a lista exata antes de você sair de casa.",
  },
  {
    question: "Vocês fazem transferência ou licenciamento?",
    answer:
      "Não. A MAV é estampadora de placa Mercosul: o que fazemos é produzir e instalar a placa do seu veículo, para carro, moto e demais categorias. Serviços de despachante, como transferência de propriedade e licenciamento anual, não fazem parte do nosso atendimento.",
  },
  {
    question: "Vocês atendem empresas com frota?",
    answer:
      "Sim. Temos atendimento dedicado para pessoa jurídica: a empresa passa a relação dos veículos, estampamos as placas por lote e combinamos o horário da instalação.",
  },
  {
    question: "Quais regiões vocês atendem?",
    answer: `Atendemos ${BUSINESS.serviceArea} a partir da nossa loja na ${BUSINESS.address.street}, ${BUSINESS.address.district} — zona sul de ${BUSINESS.address.city}. Fale com a gente pelo WhatsApp para combinar o melhor horário.`,
  },
];

/* -------------------------------------------------------------------------
 * Avaliações do Google
 * ---------------------------------------------------------------------- */

/**
 * Endpoint que devolve as avaliações do Google já normalizadas. Duas
 * implementações equivalentes acompanham o projeto:
 *   - `server.js`                  → deploy em Node/VPS;
 *   - `deploy/hostinger/api/`      → hospedagem compartilhada (PHP).
 *
 * A chave da API fica sempre no servidor. Se o endpoint não estiver
 * configurado, a seção de avaliações não é renderizada — melhor uma seção a
 * menos do que uma seção com depoimento inventado.
 */
export const REVIEWS_ENDPOINT =
  (typeof import.meta !== "undefined" &&
    import.meta.env?.VITE_REVIEWS_ENDPOINT) ||
  "/api/google-reviews";

export interface GoogleReview {
  author: string;
  photo: string | null;
  authorUrl: string | null;
  rating: number;
  relativeTime: string;
  text: string;
}

export interface GoogleReviewsPayload {
  rating: number | null;
  total: number | null;
  url: string | null;
  reviews: GoogleReview[];
}

/**
 * Passos genéricos exibidos no resumo de "Como funciona" — é o fluxo real da
 * loja: tudo combinado pelo WhatsApp e uma única ida até a MAV, no horário que
 * o cliente escolher. Em nenhum momento o veículo fica na loja.
 */
export const FLOW_SUMMARY = [
  {
    title: "Você chama no WhatsApp",
    description:
      "Manda os dados do veículo e a gente confirma o que é preciso e o valor fechado, antes de qualquer pagamento.",
  },
  {
    title: "A gente estampa a placa",
    description:
      "Produzimos no padrão Mercosul oficial e avisamos pelo WhatsApp assim que a sua placa fica pronta.",
  },
  {
    title: "Você agenda e vem buscar",
    description:
      "Escolhe o horário que der para você e vem à loja. Instalamos na hora — ou você leva a placa, se preferir.",
  },
];

export const NAV_ITEMS = [
  { label: "Serviços", href: "#servicos" },
  { label: "Preços", href: "#precos" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "FAQ", href: "#faq" },
  { label: "Contato", href: "#contato" },
];

/**
 * Meta tags. O `index.html` consome estes valores por placeholders (`%SEO_*%`)
 * resolvidos no build — assim título e descrição não existem em dois lugares
 * que podem divergir. Os preços vêm de PLATE_PRICES pelo mesmo motivo.
 */
export const SEO = {
  title: `MAV Emplacamento | Estampagem de Placa Mercosul em ${BUSINESS.address.city}`,
  description: `Estampadora de placa Mercosul em ${BUSINESS.address.city}: carro R$ ${carPrice.price} o par e moto R$ ${motoPrice.price}. Primeira via, segunda via e veículo 0km, com instalação na hora. Fale no WhatsApp.`,
  ogTitle: "MAV Emplacamento — Referência em Placa Mercosul",
  ogDescription: `Placa Mercosul a partir de R$ ${motoPrice.price}, com instalação na hora e sem deixar o veículo. Primeira via, segunda via e 0km em ${BUSINESS.address.district}, ${BUSINESS.address.city}. WhatsApp ${BUSINESS.phoneDisplay}.`,
  ogImage: "/og-mav-emplacamento.jpg",
  ogImageAlt:
    "Placa Mercosul estampada pela MAV Emplacamento, estampadora de placas em São Paulo",
};
