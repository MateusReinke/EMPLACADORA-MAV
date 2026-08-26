import { useEffect, useState } from "react";

/**
 * "atual" é a dobra que já está aprovada e no ar; as letras são as propostas
 * em avaliação.
 */
export type HeroVariant = "atual" | "a" | "b" | "c" | "d" | "e" | "f";

const KNOWN: HeroVariant[] = ["atual", "a", "b", "c", "d", "e", "f"];

/**
 * TEMPORÁRIO — seletor de variante da dobra inicial, para comparar as propostas
 * antes de escolher uma.
 *
 * Lê `?hero=` da URL e cai em "atual" para qualquer outro valor. O padrão é a
 * home já aprovada de propósito: enquanto a escolha não é feita, quem abrir o
 * site (ou publicar esta branch sem querer) vê exatamente o que via antes.
 *
 * Depois da escolha, esta função e as variantes descartadas saem do projeto —
 * manter sete dobras vivas em produção é código morto esperando divergir.
 */
export const useHeroVariant = (): HeroVariant => {
  const [variant, setVariant] = useState<HeroVariant>("atual");

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("hero");
    setVariant(KNOWN.includes(value as HeroVariant) ? (value as HeroVariant) : "atual");
  }, []);

  return variant;
};
