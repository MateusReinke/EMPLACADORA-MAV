import { ExternalLink } from "lucide-react";

import { Eyebrow } from "./brand";
import { AnimatedIconField } from "./hero/AnimatedIconField";
import { useGoogleReviews } from "./useGoogleReviews";

/** Estrelas parciais a partir de uma nota real (ex.: 4,6 → 4 cheias + 60%). */
const RatingStars = ({ value, className = "h-4 w-4" }: { value: number; className?: string }) => (
  <span className="inline-flex items-center gap-0.5" aria-hidden="true">
    {[0, 1, 2, 3, 4].map((index) => {
      const fill = Math.min(Math.max(value - index, 0), 1);
      return (
        // `color` precisa estar no <svg>: o currentColor do <stop> herda daqui,
        // não do <path> que referencia o gradiente.
        <svg key={index} viewBox="0 0 20 20" className={`${className} text-site-ink/20`}>
          <defs>
            <linearGradient id={`star-${index}-${Math.round(fill * 100)}`}>
              <stop offset={`${fill * 100}%`} stopColor="#FDB813" />
              <stop offset={`${fill * 100}%`} stopColor="currentColor" />
            </linearGradient>
          </defs>
          <path
            d="M10 1.6l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.21l-4.94 2.6.94-5.5-4-3.9 5.53-.8z"
            fill={`url(#star-${index}-${Math.round(fill * 100)})`}
          />
        </svg>
      );
    })}
  </span>
);

const GoogleMark = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
    <path fill="#4285F4" d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.55-5.17 3.55-8.87z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.96-1.08 7.95-2.91l-3.88-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-4v3.09A12 12 0 0 0 12 24z" />
    <path fill="#FBBC05" d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62h-4a12 12 0 0 0 0 10.76l4-3.09z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.62l4 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
  </svg>
);

/**
 * Avaliações reais do Google, buscadas em tempo de execução.
 *
 * Substitui a antiga seção de "prova social" com depoimentos de exemplo: em vez
 * de texto de mentira esperando ser trocado, o que aparece aqui ou é avaliação
 * verdadeira de cliente ou não aparece.
 *
 * A seção some por completo quando o endpoint não está configurado, falha ou
 * devolve zero avaliações — um bloco vazio dizendo "sem avaliações" só chamaria
 * atenção para a ausência.
 *
 * A chave da API do Google fica no servidor (ver server.js ou
 * deploy/hostinger/api/google-reviews.php); o navegador só enxerga o resultado
 * normalizado.
 */
export const ReviewsSection = () => {
  const data = useGoogleReviews();

  if (!data) return null;

  return (
    <section id="avaliacoes" className="relative overflow-hidden py-16 sm:py-20">
      <AnimatedIconField tone="ink" variant="fleet" />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>Avaliações</Eyebrow>
            <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-[-0.015em] text-site-ink sm:text-4xl">
              O que os clientes dizem no Google
            </h2>
          </div>

          {data.rating !== null && (
            <div className="flex items-center gap-4 rounded-2xl border border-site-line bg-site-card px-5 py-4">
              <p className="font-display text-4xl font-extrabold leading-none text-site-ink">
                {data.rating.toFixed(1).replace(".", ",")}
              </p>
              <div>
                <RatingStars value={data.rating} />
                <p className="mt-1 flex items-center gap-1.5 font-body text-xs text-site-ink/55">
                  <GoogleMark />
                  {data.total !== null
                    ? `${data.total} avaliações no Google`
                    : "Avaliações no Google"}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {data.reviews.map((review, index) => (
            <figure
              key={`${review.author}-${index}`}
              className="flex flex-col rounded-2xl border border-site-line bg-site-card p-6"
            >
              <div className="flex items-center gap-3">
                {review.photo ? (
                  <img
                    src={review.photo}
                    alt=""
                    loading="lazy"
                    width="40"
                    height="40"
                    className="h-10 w-10 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-site-accent-soft font-display text-sm font-bold text-site-accent">
                    {review.author.slice(0, 1).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-bold text-site-ink">
                    {review.author}
                  </p>
                  <p className="font-body text-xs text-site-ink/50">
                    {review.relativeTime}
                  </p>
                </div>
              </div>

              <RatingStars value={review.rating} className="mt-4 h-4 w-4" />

              <blockquote className="mt-3 font-body text-[0.9375rem] leading-relaxed text-site-ink/75">
                {review.text}
              </blockquote>
            </figure>
          ))}
        </div>

        {/* Atribuição exigida pelos termos da Places API */}
        {data.url && (
          <a
            href={data.url}
            target="_blank"
            rel="noreferrer"
            className="mt-7 inline-flex items-center gap-2 font-display text-sm font-bold text-site-accent transition-opacity hover:opacity-75"
          >
            <GoogleMark />
            Ver todas as avaliações no Google
            <ExternalLink className="h-3.5 w-3.5" strokeWidth={2.5} />
          </a>
        )}
      </div>
    </section>
  );
};
