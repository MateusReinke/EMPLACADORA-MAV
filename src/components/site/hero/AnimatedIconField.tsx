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
 * As posições são uma lista fixa, não `Math.random()`: o mesmo componente é
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

const SPOTS: Spot[] = [
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
];

export const AnimatedIconField = ({
  className = "",
  tone = "white",
}: {
  className?: string;
  tone?: "white" | "ink";
}) => (
  <div
    aria-hidden="true"
    className={`mav-icon-field pointer-events-none absolute inset-0 overflow-hidden ${
      tone === "white" ? "text-white" : "text-site-ink"
    } ${className}`}
  >
    {SPOTS.map((spot, index) => {
      const Icon = spot.icon;

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
              "--o": spot.opacity,
              opacity: spot.opacity,
            } as React.CSSProperties
          }
        >
          <Icon width={spot.size} height={spot.size} strokeWidth={1.5} />
        </span>
      );
    })}
  </div>
);
