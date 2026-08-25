import { Moon, Sun } from "lucide-react";

import { useSiteTheme } from "./useTheme";

/**
 * Alterna claro/escuro. Renderiza os dois ícones e esconde um por CSS
 * (`data-site-theme`), então o botão já sai correto no HTML pré-renderizado,
 * antes do React assumir — sem piscar o ícone errado.
 */
export const ThemeToggle = ({ className = "" }: { className?: string }) => {
  const { theme, toggleTheme } = useSiteTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      title={isDark ? "Tema claro" : "Tema escuro"}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-lg border border-site-line text-site-ink transition-colors hover:bg-site-alt ${className}`}
    >
      <Sun className="hidden h-[18px] w-[18px] [html[data-site-theme='dark']_&]:block" strokeWidth={2.25} />
      <Moon className="h-[18px] w-[18px] [html[data-site-theme='dark']_&]:hidden" strokeWidth={2.25} />
    </button>
  );
};
