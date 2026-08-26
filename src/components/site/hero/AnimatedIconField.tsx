import {
  Bike,
  Car,
  FileText,
  KeyRound,
  ScanLine,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from "lucide-react";

/**
 * Fundo de ícones da marca, com deriva e pulsação lentas.
 *
 * As posições são listas fixas, não `Math.random()`: o mesmo componente é
 * renderizado no build (pré-renderização) e no navegador, e posições aleatórias
 * fariam o fundo "saltar" quando o React assume a página.
 *
 * A opacidade é baixa de propósito — é textura, não ilustração. Quem chega
 * procurando preço não pode disputar atenção com o papel de parede.
 */
type Spot = {
  icon: LucideIcon;
  /** posição em % do container */
  x: number;
  y: number;
  size: number;
  rotate: number;
  /** duração da deriva e atraso, para os ícones não pulsarem em bloco */
  duration: number;
  delay: number;
  opacity: number;
};

/**
 * Três arranjos diferentes. Repetir o mesmo desenho em toda seção transformaria
 * a textura em padrão reconhecível — e aí ela para de ser fundo e vira enfeite.
 */
const ARRANGEMENTS: Record<"plates" | "fleet" | "docs", Spot[]> = {
  plates: [
    { icon: Car, x: 6, y: 18, size: 46, rotate: -8, duration: 19, delay: 0, opacity: 0.1 },
    { icon: ScanLine, x: 22, y: 72, size: 34, rotate: 6, duration: 22, delay: 2.5, opacity: 0.08 },
    { icon: ShieldCheck, x: 38, y: 12, size: 30, rotate: 10, duration: 17, delay: 1.2, opacity: 0.07 },
    { icon: Bike, x: 52, y: 80, size: 42, rotate: -5, duration: 21, delay: 3.4, opacity: 0.09 },
    { icon: FileText, x: 68, y: 22, size: 28, rotate: 8, duration: 18, delay: 0.8, opacity: 0.07 },
    { icon: KeyRound, x: 80, y: 66, size: 32, rotate: -12, duration: 20, delay: 4.1, opacity: 0.08 },
    { icon: Truck, x: 92, y: 30, size: 38, rotate: 5, duration: 23, delay: 1.9, opacity: 0.07 },
    { icon: ScanLine, x: 14, y: 46, size: 26, rotate: -4, duration: 16, delay: 5.2, opacity: 0.06 },
    { icon: Car, x: 62, y: 52, size: 30, rotate: 12, duration: 24, delay: 2.1, opacity: 0.06 },
    { icon: ShieldCheck, x: 86, y: 8, size: 24, rotate: -9, duration: 19, delay: 6, opacity: 0.06 },
  ],
  fleet: [
    { icon: Truck, x: 9, y: 62, size: 52, rotate: 6, duration: 23, delay: 1.4, opacity: 0.09 },
    { icon: Car, x: 26, y: 20, size: 38, rotate: -10, duration: 18, delay: 3.1, opacity: 0.08 },
    { icon: Bike, x: 41, y: 74, size: 34, rotate: 8, duration: 21, delay: 0.5, opacity: 0.08 },
    { icon: Car, x: 58, y: 30, size: 44, rotate: 4, duration: 25, delay: 4.6, opacity: 0.07 },
    { icon: KeyRound, x: 72, y: 78, size: 28, rotate: -6, duration: 17, delay: 2.2, opacity: 0.07 },
    { icon: Truck, x: 88, y: 24, size: 36, rotate: -9, duration: 22, delay: 5.4, opacity: 0.07 },
    { icon: Bike, x: 95, y: 62, size: 30, rotate: 11, duration: 19, delay: 1.1, opacity: 0.06 },
    { icon: ShieldCheck, x: 18, y: 88, size: 26, rotate: -3, duration: 20, delay: 6.2, opacity: 0.06 },
  ],
  docs: [
    { icon: FileText, x: 12, y: 26, size: 40, rotate: 7, duration: 20, delay: 2.8, opacity: 0.08 },
    { icon: ScanLine, x: 30, y: 68, size: 36, rotate: -8, duration: 24, delay: 0.9, opacity: 0.08 },
    { icon: Car, x: 47, y: 16, size: 42, rotate: 5, duration: 18, delay: 4.2, opacity: 0.07 },
    { icon: KeyRound, x: 63, y: 70, size: 30, rotate: -11, duration: 22, delay: 1.7, opacity: 0.08 },
    { icon: Bike, x: 78, y: 32, size: 38, rotate: 9, duration: 19, delay: 5.8, opacity: 0.07 },
    { icon: FileText, x: 90, y: 76, size: 26, rotate: -5, duration: 23, delay: 3.3, opacity: 0.06 },
    { icon: Truck, x: 36, y: 44, size: 28, rotate: 10, duration: 21, delay: 6.5, opacity: 0.06 },
  ],
};

export const AnimatedIconField = ({
  className = "",
  tone = "white",
  variant = "plates",
}: {
  className?: string;
  tone?: "white" | "ink";
  variant?: keyof typeof ARRANGEMENTS;
}) => {
  /*
   * Ícone escuro sobre fundo claro pesa mais na vista do que claro sobre
   * escuro, na mesma opacidade. Sem esse fator, as seções claras ficariam
   * visivelmente mais sujas que as faixas navy.
   */
  const weight = tone === "ink" ? 0.55 : 1;

  return (
  <div
    aria-hidden="true"
    className={`mav-icon-field pointer-events-none absolute inset-0 overflow-hidden ${
      tone === "white" ? "text-white" : "text-site-ink"
    } ${className}`}
  >
    {ARRANGEMENTS[variant].map((spot, index) => {
      const Icon = spot.icon;
      const opacity = spot.opacity * weight;

      return (
        <span
          key={index}
          className="absolute"
          style={
            {
              left: `${spot.x}%`,
              top: `${spot.y}%`,
              "--r": `${spot.rotate}deg`,
              "--d": `${spot.duration}s`,
              "--pd": `${spot.duration * 0.55}s`,
              "--delay": `${spot.delay}s`,
              "--o": opacity,
              opacity,
            } as React.CSSProperties
          }
        >
          <Icon width={spot.size} height={spot.size} strokeWidth={1.5} />
        </span>
      );
    })}
    </div>
  );
};
