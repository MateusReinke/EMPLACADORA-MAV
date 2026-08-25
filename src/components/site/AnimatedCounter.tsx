import { useEffect, useRef, useState } from "react";

/**
 * Contador que anima de 0 até `value` quando entra na viewport.
 *
 * Renderiza o valor final no primeiro passo (servidor e clientes sem
 * IntersectionObserver), então o número correto está sempre no HTML — a
 * animação é um enfeite opcional, não a fonte do conteúdo.
 */
export const AnimatedCounter = ({
  value,
  suffix = "",
  durationMs = 1400,
  className = "",
}: {
  value: number;
  suffix?: string;
  durationMs?: number;
  className?: string;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const reducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reducedMotion) return;

    let frame = 0;
    let start: number | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();

        const step = (timestamp: number) => {
          if (start === null) start = timestamp;
          const progress = Math.min((timestamp - start) / durationMs, 1);
          // easeOutCubic: rápido no início, assenta no final.
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(value * eased));
          if (progress < 1) frame = requestAnimationFrame(step);
        };

        setDisplay(0);
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.4 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [value, durationMs]);

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString("pt-BR")}
      {suffix}
    </span>
  );
};
