import { useEffect } from "react";

/**
 * Revela os elementos marcados com `data-reveal` conforme entram na viewport.
 *
 * O estado inicial escondido é aplicado por CSS apenas quando
 * `html[data-anim="on"]` — atributo que o script inline do index.html só define
 * quando há JS e o usuário não pediu menos movimento. Assim a página
 * pré-renderizada aparece completa antes do JS carregar, em vez de ficar em
 * branco esperando o observer.
 */
export const useReveal = () => {
  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]")
    );
    if (!elements.length) return;

    const show = (element: HTMLElement) => element.classList.add("is-revealed");

    if (typeof IntersectionObserver === "undefined") {
      elements.forEach(show);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          show(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
    );

    elements.forEach((element) => observer.observe(element));

    // Rede de segurança: se algo impedir o observer de disparar, o conteúdo
    // não pode ficar invisível para sempre.
    const fallback = window.setTimeout(() => elements.forEach(show), 1500);

    return () => {
      window.clearTimeout(fallback);
      observer.disconnect();
    };
  }, []);
};

/** Mantém o fundo claro da marca enquanto o site público estiver montado. */
export const usePublicTheme = () => {
  useEffect(() => {
    const root = document.documentElement;
    const previous = document.body.style.backgroundColor;

    root.dataset.site = "public";
    document.body.style.backgroundColor = "#F5F7FA";
    // O HTML pré-renderizado usa este atributo para pintar o fundo antes do JS;
    // depois da montagem quem manda é o `data-site`.
    delete root.dataset.prerendered;

    return () => {
      delete root.dataset.site;
      document.body.style.backgroundColor = previous;
    };
  }, []);
};
