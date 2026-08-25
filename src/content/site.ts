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
  "https://www.mavemplacamento.com.br";

export const SITE_URL = resolvedSiteUrl.replace(/\/+$/, "");

export const BUSINESS = {
  name: "MAV Emplacamento",
  tagline: "Referência em Placa Mercosul",
  phoneDisplay: "(11) 93929-0373",
  phoneE164: "+5511939290373",
  whatsappNumber: "5511939290373",
  email: null as string | null, // [inserir e-mail comercial real]
  address: {
    street: "Rua Bela Vista, 888",
    district: "Chácara Santo Antônio",
    city: "São Paulo",
    state: "SP",
    country: "BR",
    postalCode: null as string | null, // [inserir CEP real]
  },
  /** Região atendida — usada na copy e nas meta tags de SEO local. */
  serviceArea: "São Paulo e região",
  /** [inserir coordenadas reais] `{ latitude: number; longitude: number }` */
  geo: null as { latitude: number; longitude: number } | null,
  /** [inserir horário real] ex.: [{ days: ["Mo","Tu","We","Th","Fr"], opens: "09:00", closes: "18:00" }] */
  openingHours: null as { days: string[]; opens: string; closes: string }[] | null,
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

export type ServiceId =
  | "primeira-via"
  | "zero-km"
  | "segunda-via"
  | "transferencia"
  | "licenciamento"
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
  icon: "plate" | "zeroKm" | "duplicate" | "transfer" | "license" | "fleet";
  featured?: boolean;
}

export const SERVICES: Service[] = [
  {
    id: "primeira-via",
    eyebrow: "Placa Mercosul",
    title: "Primeira Via de Placa",
    description:
      "Emitimos a primeira placa do seu veículo no padrão Mercosul, com toda a agilidade e segurança — do documento à instalação.",
    includes: [
      "Conferência completa dos documentos",
      "Emissão no padrão oficial Mercosul",
      "Instalação com lacre na hora",
    ],
    steps: [
      "Você envia os documentos pelo WhatsApp e conferimos tudo antes de qualquer pagamento",
      "Fazemos o cadastro e emitimos o protocolo junto ao órgão competente",
      "Produzimos a placa e instalamos com lacre no seu veículo",
    ],
    whatsappMessage:
      "Olá! Quero fazer a primeira via da placa Mercosul do meu veículo. Pode me ajudar?",
    icon: "plate",
    featured: true,
  },
  {
    id: "zero-km",
    eyebrow: "Veículo novo",
    title: "Emplacamento de Veículo 0KM",
    description:
      "Comprou um carro novo? Cuidamos de todo o processo para você sair da concessionária com o veículo de placa nova e regularizado.",
    includes: [
      "Processo completo a partir da nota fiscal",
      "Acompanhamento até a liberação",
      "Placa e documento em mãos",
    ],
    steps: [
      "Recebemos a nota fiscal do veículo e seus dados pessoais",
      "Abrimos o processo e acompanhamos cada etapa até a aprovação",
      "Emitimos a placa Mercosul e finalizamos a instalação",
    ],
    whatsappMessage:
      "Olá! Comprei um veículo 0km e quero emplacar com a MAV. Pode me passar as informações?",
    icon: "zeroKm",
  },
  {
    id: "segunda-via",
    eyebrow: "Reposição",
    title: "Segunda Via de Placa",
    description:
      "Placa perdida, danificada, furtada ou que precisa ser substituída? Fazemos a segunda via com rapidez e no padrão exigido por lei.",
    includes: [
      "Atendimento para perda, furto ou dano",
      "Orientação sobre boletim de ocorrência",
      "Nova placa no padrão Mercosul",
    ],
    steps: [
      "Você nos conta o que aconteceu com a placa e envia o CRLV",
      "Orientamos a documentação necessária e abrimos a solicitação",
      "Produzimos e instalamos a placa de reposição",
    ],
    whatsappMessage:
      "Olá! Preciso da segunda via da placa do meu veículo. Pode me ajudar?",
    icon: "duplicate",
  },
  {
    id: "transferencia",
    eyebrow: "Compra e venda",
    title: "Transferência de Propriedade",
    description:
      "Comprou ou vendeu um veículo? Organizamos cada etapa da transferência para o documento sair no nome certo, sem pendências.",
    includes: [
      "Levantamento de débitos e restrições",
      "Emissão das guias e apoio na vistoria",
      "Documento novo em nome do comprador",
    ],
    steps: [
      "Conferimos débitos, multas e restrições do veículo",
      "Emitimos as guias e orientamos a vistoria obrigatória",
      "Concluímos a transferência e entregamos o documento atualizado",
    ],
    whatsappMessage:
      "Olá! Quero fazer a transferência de propriedade de um veículo. Pode me orientar?",
    icon: "transfer",
  },
  {
    id: "licenciamento",
    eyebrow: "Regularização",
    title: "Licenciamento Anual",
    description:
      "Mantenha seu veículo em dia e evite multa e apreensão. Cuidamos do licenciamento anual do começo ao fim.",
    includes: [
      "Consulta de pendências e débitos",
      "Orientação sobre os pagamentos",
      "Confirmação da liberação do CRLV",
    ],
    steps: [
      "Consultamos a situação do veículo pelo Renavam",
      "Orientamos o pagamento das taxas e débitos pendentes",
      "Confirmamos a liberação e enviamos o CRLV digital",
    ],
    whatsappMessage:
      "Olá! Quero fazer o licenciamento anual do meu veículo. Pode me ajudar?",
    icon: "license",
  },
  {
    id: "frotas",
    eyebrow: "Empresas e PJ",
    title: "Atendimento para Frotas",
    description:
      "Sua empresa tem vários veículos? Atendimento dedicado para frotas, com prioridade e acompanhamento centralizado por lote.",
    includes: [
      "Atendimento dedicado para pessoa jurídica",
      "Execução por lote, com prioridade",
      "Relatório de status por veículo",
    ],
    steps: [
      "Mapeamos a frota e o que cada veículo precisa",
      "Montamos o plano de execução por prioridade",
      "Executamos por lote e entregamos o relatório de conclusão",
    ],
    whatsappMessage:
      "Olá! Represento uma empresa e preciso de atendimento para a nossa frota. Pode me passar as condições?",
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

export interface Faq {
  question: string;
  answer: string;
}

export const FAQS: Faq[] = [
  {
    question: "Quanto tempo leva um processo de emplacamento?",
    answer:
      "O prazo varia conforme o tipo de serviço e a situação da documentação. Depois da triagem inicial — que fazemos no mesmo dia — informamos cada etapa com uma estimativa de conclusão, para você não ficar no escuro.",
  },
  {
    question: "Quanto custa emplacar um veículo?",
    answer:
      "O valor depende do serviço, da categoria do veículo e das taxas oficiais vigentes do Detran. Envie os dados do seu veículo pelo WhatsApp e passamos um orçamento fechado, sem compromisso e sem surpresa no final.",
  },
  {
    question: "Quais documentos eu preciso apresentar?",
    answer:
      "Para primeiro emplacamento de veículo 0km: nota fiscal do veículo, documento de identidade com foto, CPF e comprovante de endereço. Para segunda via de placa: o CRLV e, em caso de furto ou roubo, o boletim de ocorrência. Confirmamos a lista exata pelo WhatsApp antes de você sair de casa.",
  },
  {
    question: "Vocês atendem empresas com frota?",
    answer:
      "Sim. Temos atendimento dedicado para pessoa jurídica, com execução por lote, prioridade no processo e acompanhamento do andamento veículo a veículo.",
  },
  {
    question: "Consigo acompanhar meu pedido?",
    answer:
      "Sim. Você acompanha o status do processo etapa por etapa e recebe as atualizações direto no WhatsApp, sem precisar ligar para saber como está.",
  },
  {
    question: "Quais regiões vocês atendem?",
    answer: `Atendemos ${BUSINESS.serviceArea} a partir da nossa unidade na ${BUSINESS.address.street}, ${BUSINESS.address.district} — zona sul de ${BUSINESS.address.city}. Fale com a gente pelo WhatsApp para confirmar o atendimento na sua região.`,
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
export const PRICE_DISCLAIMER =
  "Valor referente à placa Mercosul. Confirme pelo WhatsApp o que está incluído no seu caso e as taxas oficiais aplicáveis.";

export const priceLabel = (value: number) =>
  value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

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

/** Passos genéricos exibidos no resumo de "Como funciona". */
export const FLOW_SUMMARY = [
  {
    title: "Validação dos documentos",
    description:
      "Você manda uma foto dos documentos pelo WhatsApp e a gente confere tudo antes de você pagar qualquer taxa.",
  },
  {
    title: "Cadastro e protocolo",
    description:
      "Abrimos o processo no órgão competente, emitimos as guias e acompanhamos a aprovação para você.",
  },
  {
    title: "Emissão e instalação",
    description:
      "Produzimos a placa no padrão Mercosul e fazemos a instalação com lacre. Você sai com o veículo regularizado.",
  },
];

export const NAV_ITEMS = [
  { label: "Serviços", href: "#servicos" },
  { label: "Preços", href: "#precos" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "FAQ", href: "#faq" },
  { label: "Contato", href: "#contato" },
];

const carPrice = PLATE_PRICES.find((item) => item.id === "carro")!;
const motoPrice = PLATE_PRICES.find((item) => item.id === "moto")!;

/**
 * Meta tags. O `index.html` consome estes valores por placeholders (`%SEO_*%`)
 * resolvidos no build — assim título e descrição não existem em dois lugares
 * que podem divergir. Os preços vêm de PLATE_PRICES pelo mesmo motivo.
 */
export const SEO = {
  title: `MAV Emplacamento | Placa Mercosul, 1ª e 2ª Via em ${BUSINESS.address.city}`,
  description: `Placa Mercosul em ${BUSINESS.address.city}: carro R$ ${carPrice.price} o par e moto R$ ${motoPrice.price}. Primeira e segunda via, 0km, transferência e licenciamento. Fale no WhatsApp.`,
  ogTitle: "MAV Emplacamento — Referência em Placa Mercosul",
  ogDescription: `Placa Mercosul a partir de R$ ${motoPrice.price}. Primeira via, segunda via, 0km, transferência e licenciamento em ${BUSINESS.address.district}, ${BUSINESS.address.city}. WhatsApp ${BUSINESS.phoneDisplay}.`,
  ogImage: "/og-mav-emplacamento.jpg",
  ogImageAlt:
    "Placa Mercosul emplacada pela MAV Emplacamento, referência em emplacamento em São Paulo",
};
