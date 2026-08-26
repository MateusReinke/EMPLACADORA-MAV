import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Rotação automática dos slides/ofertas.
 *
 * Respeita `prefers-reduced-motion` (não gira sozinho) e para enquanto o
 * ponteiro estiver sobre o bloco ou o foco dentro dele — carrossel que troca
 * embaixo do dedo da pessoa é o jeito mais rápido de perder a venda.
 */
export const useOfferRotation = (count: number, intervalMs = 6000) => {
  /*
   * TEMPORÁRIO: `?slide=N` congela a rotação num estado específico, só para
   * conseguir mostrar cada variação da proposta. Sai junto com o seletor.
   *
   * Resolvido no inicializador do estado, e não num efeito: trocar de slide
   * depois da montagem provoca um flash do slide 1 antes do escolhido.
   */
  const pinned = (() => {
    if (typeof window === "undefined") return null;
    const value = new URLSearchParams(window.location.search).get("slide");
    const parsed = Number(value);
    return value !== null && Number.isInteger(parsed)
      ? ((parsed % count) + count) % count
      : null;
  })();

  const [index, setIndex] = useState(pinned ?? 0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (pinned !== null) return;
    if (paused || count < 2) return;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % count),
      intervalMs
    );

    return () => window.clearInterval(timer);
  }, [count, intervalMs, paused, pinned]);

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count]
  );

  /** Handlers para pausar a rotação em hover e foco. */
  const pauseProps = {
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => setPaused(false),
    onFocusCapture: () => setPaused(true),
    onBlurCapture: () => setPaused(false),
  };

  return { index, go, next: () => go(index + 1), prev: () => go(index - 1), pauseProps };
};

/** Swipe horizontal no mobile — o gesto que todo mundo já espera de carrossel. */
export const useSwipe = (onNext: () => void, onPrev: () => void) => {
  const startX = useRef<number | null>(null);

  return {
    onTouchStart: (event: React.TouchEvent) => {
      startX.current = event.touches[0].clientX;
    },
    onTouchEnd: (event: React.TouchEvent) => {
      if (startX.current === null) return;
      const delta = event.changedTouches[0].clientX - startX.current;
      startX.current = null;
      if (Math.abs(delta) < 45) return;
      if (delta < 0) onNext();
      else onPrev();
    },
  };
};

