/**
 * Elementos visuais da identidade MAV reaproveitados em todo o site público.
 *
 * Tudo aqui é SVG inline e determinístico: renderiza igual no servidor
 * (pré-renderização de SEO) e no cliente, sem depender de `window`.
 */

export const WhatsAppIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M19.11 17.12c-.25-.13-1.48-.73-1.71-.82-.23-.09-.4-.13-.57.13-.17.26-.65.82-.8.99-.15.17-.29.2-.54.07-.25-.13-1.05-.39-2.01-1.24-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.01-.39.11-.52.11-.11.25-.29.37-.43.12-.14.16-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.57-1.37-.78-1.88-.21-.5-.43-.43-.57-.43h-.49c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.43 1.03 2.6c.13.17 1.77 2.69 4.29 3.77.6.26 1.07.42 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.48-.61 1.69-1.2.21-.59.21-1.09.15-1.2-.06-.11-.23-.17-.48-.3z" />
    <path d="M16 3C8.83 3 3 8.83 3 16c0 2.29.6 4.53 1.74 6.5L3 29l6.67-1.7A12.95 12.95 0 0 0 16 29c7.17 0 13-5.83 13-13S23.17 3 16 3zm0 23.66c-1.95 0-3.86-.53-5.52-1.52l-.4-.24-3.96 1.01 1.06-3.86-.26-.4A10.58 10.58 0 0 1 5.33 16C5.33 10.3 10.3 5.33 16 5.33S26.67 10.3 26.67 16 21.7 26.66 16 26.66z" />
  </svg>
);

/**
 * A barra inclinada do logotipo MAV (o "//" depois do V), usada como divisor
 * de seção e acento gráfico. É o que dá assinatura à marca sem virar enfeite.
 */
export const SlashMark = ({
  className = "",
  tone = "blue",
}: {
  className?: string;
  tone?: "blue" | "white" | "navy";
}) => {
  const fill =
    tone === "white" ? "#FFFFFF" : tone === "navy" ? "#0A1F44" : "#0B57E0";

  return (
    <svg
      viewBox="0 0 44 16"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <polygon points="10,0 20,0 10,16 0,16" fill={fill} />
      <polygon points="24,0 34,0 24,16 14,16" fill={fill} opacity="0.62" />
      <polygon points="38,0 44,0 34,16 28,16" fill={fill} opacity="0.28" />
    </svg>
  );
};

/**
 * Badge circular sólido com ícone branco — o padrão de ícone do material
 * impresso da MAV. Nunca usamos o ícone de contorno solto.
 */
export const IconBadge = ({
  children,
  tone = "navy",
  size = "md",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "navy" | "blue" | "white";
  size?: "sm" | "md" | "lg";
  className?: string;
}) => {
  const tones = {
    navy: "bg-site-badge text-white ring-site-badge/10",
    blue: "bg-mav-blue text-white ring-mav-blue/15",
    white: "bg-white text-mav-navy ring-white/25",
  };
  const sizes = {
    sm: "h-10 w-10",
    md: "h-14 w-14",
    lg: "h-16 w-16",
  };

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full ring-8 ${tones[tone]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
};

/** Rótulo pequeno acima dos títulos, com a moldura que lembra uma placa. */
export const Eyebrow = ({
  children,
  tone = "blue",
}: {
  children: React.ReactNode;
  tone?: "blue" | "white";
}) => (
  <span
    className={`inline-flex items-center gap-2 rounded-md border px-3 py-1 font-display text-[0.6875rem] font-bold uppercase tracking-[0.16em] ${
      tone === "white"
        ? "border-white/25 bg-white/10 text-white"
        : "border-mav-blue/25 bg-site-accent-soft text-site-accent"
    }`}
  >
    {children}
  </span>
);

/**
 * Placa Mercosul desenhada em SVG — nítida em qualquer tamanho e sem custo de
 * download. É o produto que a MAV vende, então aparece como elemento recorrente
 * ao longo da página.
 */

export const MercosulPlate = ({
  // MAV2O26 respeita o padrão Mercosul (LLL N L NN) e ainda assina a marca:
  // o "O" da quinta posição é letra, não zero — é o que a norma pede ali.
  code = "MAV2O26",
  className = "",
  framed = true,
  title = "Placa Mercosul padrão brasileiro emitida pela MAV Emplacamento",
}: {
  code?: string;
  className?: string;
  framed?: boolean;
  title?: string;
}) => (
  <svg
    viewBox="0 0 420 156"
    className={className}
    role="img"
    aria-label={title}
    preserveAspectRatio="xMidYMid meet"
  >
    <title>{title}</title>
    <defs>
      <linearGradient id="mav-plate-frame" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3A4454" />
        <stop offset="45%" stopColor="#171D28" />
        <stop offset="100%" stopColor="#0B0F17" />
      </linearGradient>
      <linearGradient id="mav-plate-face" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="55%" stopColor="#F4F6F9" />
        <stop offset="100%" stopColor="#E3E8EF" />
      </linearGradient>
      <linearGradient id="mav-plate-band" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1450B4" />
        <stop offset="100%" stopColor="#0A3A8C" />
      </linearGradient>
      <linearGradient id="mav-plate-gloss" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
        <stop offset="42%" stopColor="#FFFFFF" stopOpacity="0" />
      </linearGradient>
    </defs>

    {framed && (
      <>
        <rect x="0" y="0" width="420" height="156" rx="16" fill="url(#mav-plate-frame)" />
        <rect
          x="6"
          y="6"
          width="408"
          height="144"
          rx="12"
          fill="none"
          stroke="#4B5565"
          strokeWidth="1"
          opacity="0.55"
        />
      </>
    )}

    {/* Corpo da placa */}
    <g transform={framed ? "translate(14 14)" : "translate(0 0)"}>
      <rect width="392" height="128" rx="9" fill="url(#mav-plate-face)" />
      <rect
        x="0.75"
        y="0.75"
        width="390.5"
        height="126.5"
        rx="8.5"
        fill="none"
        stroke="#0E1524"
        strokeWidth="1.5"
      />

      {/* Faixa azul superior: Mercosul · BRASIL · bandeira */}
      <path
        d="M0 9a9 9 0 0 1 9-9h374a9 9 0 0 1 9 9v22H0z"
        fill="url(#mav-plate-band)"
      />

      {/* Estrelas do Mercosul */}
      <g fill="#FFFFFF">
        <circle cx="20" cy="12" r="1.5" />
        <circle cx="26" cy="9.5" r="1.5" />
        <circle cx="32" cy="9.5" r="1.5" />
        <circle cx="38" cy="12" r="1.5" />
      </g>
      <text
        x="29"
        y="24"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="6.5"
        fontFamily="Archivo, Arial, sans-serif"
        fontWeight="700"
        letterSpacing="0.6"
      >
        MERCOSUL
      </text>

      <text
        x="196"
        y="22.5"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="15"
        fontFamily="Archivo, Arial, sans-serif"
        fontWeight="800"
        letterSpacing="2.5"
      >
        BRASIL
      </text>

      {/* Bandeira do Brasil */}
      <g transform="translate(343 7)">
        <rect width="34" height="17" rx="1.5" fill="#159A48" />
        <polygon points="17,2.4 32,8.5 17,14.6 2,8.5" fill="#FFD100" />
        <circle cx="17" cy="8.5" r="4.4" fill="#0B3B8C" />
      </g>

      {/* Coluna esquerda: QR Code e sigla do país */}
      <g transform="translate(12 40)">
        <rect width="30" height="30" rx="2" fill="#FFFFFF" stroke="#0E1524" strokeWidth="0.8" />
        <g fill="#0E1524">
          <rect x="3" y="3" width="8" height="8" />
          <rect x="19" y="3" width="8" height="8" />
          <rect x="3" y="19" width="8" height="8" />
          <rect x="5" y="5" width="4" height="4" fill="#FFFFFF" />
          <rect x="21" y="5" width="4" height="4" fill="#FFFFFF" />
          <rect x="5" y="21" width="4" height="4" fill="#FFFFFF" />
          <rect x="14" y="4" width="2" height="2" />
          <rect x="14" y="8" width="2" height="2" />
          <rect x="14" y="12" width="2" height="2" />
          <rect x="18" y="14" width="2" height="2" />
          <rect x="22" y="14" width="2" height="2" />
          <rect x="14" y="18" width="2" height="2" />
          <rect x="18" y="20" width="2" height="2" />
          <rect x="22" y="22" width="2" height="2" />
          <rect x="18" y="26" width="2" height="2" />
          <rect x="24" y="18" width="2" height="2" />
          <rect x="26" y="24" width="2" height="2" />
        </g>
      </g>
      <text
        x="27"
        y="112"
        textAnchor="middle"
        fill="#0E1524"
        fontSize="20"
        fontFamily="Archivo, Arial, sans-serif"
        fontWeight="800"
      >
        BR
      </text>

      {/* Caracteres da placa, com leve relevo */}
      <text
        x="223"
        y="102"
        textAnchor="middle"
        fill="#9AA3B0"
        fontSize="60"
        fontFamily="Archivo, Arial Narrow, Arial, sans-serif"
        fontWeight="800"
        letterSpacing="2"
      >
        {code}
      </text>
      <text
        x="222"
        y="100.5"
        textAnchor="middle"
        fill="#111722"
        fontSize="60"
        fontFamily="Archivo, Arial Narrow, Arial, sans-serif"
        fontWeight="800"
        letterSpacing="2"
      >
        {code}
      </text>

      {/* Brilho diagonal discreto */}
      <path d="M0 9a9 9 0 0 1 9-9h150L60 128H9a9 9 0 0 1-9-9z" fill="url(#mav-plate-gloss)" />
    </g>
  </svg>
);

/** Cinco estrelas douradas — só usado onde há avaliação real ou marcador claro. */
export const Stars = ({ className = "h-4 w-4" }: { className?: string }) => (
  <span className="inline-flex items-center gap-0.5" aria-hidden="true">
    {[0, 1, 2, 3, 4].map((i) => (
      <svg key={i} viewBox="0 0 20 20" fill="#FDB813" className={className}>
        <path d="M10 1.6l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.21l-4.94 2.6.94-5.5-4-3.9 5.53-.8z" />
      </svg>
    ))}
  </span>
);
