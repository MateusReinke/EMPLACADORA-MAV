import { useCallback, useEffect, useState } from "react";

export type SiteTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "mav-site-theme";

/**
 * Tema do site público (claro/escuro).
 *
 * O tema já é aplicado antes da primeira pintura pelo script inline do
 * index.html — ler a preferência aqui, no `useEffect`, deixaria a página piscar
 * em claro antes de virar escura. Este hook só sincroniza o estado do React com
 * o que o script já decidiu e cuida da troca manual.
 *
 * Nada disso alcança o painel interno: o atributo é `data-site-theme` e apenas
 * as variáveis `--site-*` reagem a ele.
 */
export const useSiteTheme = () => {
  const [theme, setTheme] = useState<SiteTheme>("light");

  useEffect(() => {
    const current = document.documentElement.dataset.siteTheme;
    setTheme(current === "dark" ? "dark" : "light");
  }, []);

  // Acompanha o sistema operacional enquanto o visitante não escolher à mão.
  useEffect(() => {
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!media) return;

    const onChange = (event: MediaQueryListEvent) => {
      let stored: string | null = null;
      try {
        stored = localStorage.getItem(THEME_STORAGE_KEY);
      } catch {
        /* localStorage bloqueado: segue a preferência do sistema */
      }
      if (stored === "light" || stored === "dark") return;

      const next: SiteTheme = event.matches ? "dark" : "light";
      document.documentElement.dataset.siteTheme = next;
      setTheme(next);
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: SiteTheme = current === "dark" ? "light" : "dark";
      document.documentElement.dataset.siteTheme = next;
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        /* modo privativo: o tema vale só para esta sessão */
      }
      return next;
    });
  }, []);

  return { theme, toggleTheme };
};
