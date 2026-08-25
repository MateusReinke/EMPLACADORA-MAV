import { Quote } from "lucide-react";

import { STATS, TESTIMONIALS } from "@/content/site";
import { AnimatedCounter } from "./AnimatedCounter";
import { Eyebrow, Stars } from "./brand";

/** Marcador de pendência — deixa explícito o que ainda depende de dado real. */
const Pending = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-block rounded border border-dashed border-gold bg-gold/10 px-2 py-1 font-display text-xs font-bold uppercase tracking-wide text-mav-navy/70">
    {children}
  </span>
);

export const ProofSection = () => (
  <section id="depoimentos" className="bg-white py-16 sm:py-20">
    <div className="mx-auto max-w-6xl px-5 sm:px-6">
      {/* Números da casa — animam só quando houver valor real cadastrado */}
      <div
        className="grid gap-6 border-y border-mav-line py-8 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-mav-line"
        data-reveal
      >
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center sm:px-6">
            {stat.value === null ? (
              <Pending>[inserir número real]</Pending>
            ) : (
              <p className="font-display text-4xl font-extrabold tracking-tight text-mav-blue sm:text-5xl">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </p>
            )}
            <p className="mt-2 font-body text-sm font-medium uppercase tracking-wider text-mav-navy/55">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-14 max-w-2xl" data-reveal>
        <Eyebrow>Prova social</Eyebrow>
        <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-[-0.015em] text-mav-navy sm:text-4xl">
          Quem já emplacou com a MAV
        </h2>
        <p className="mt-3 font-body text-mav-navy/70">
          Depoimentos reais de clientes atendidos na unidade da Chácara Santo Antônio.
        </p>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {TESTIMONIALS.map((testimonial, index) => (
          <figure
            key={index}
            className="relative border-l-4 border-mav-blue bg-mav-surface p-6"
            data-reveal
          >
            <Quote
              className="absolute right-5 top-5 h-8 w-8 text-mav-navy/10"
              strokeWidth={2.5}
              aria-hidden="true"
            />
            <Stars className="h-4 w-4" />

            <blockquote className="mt-4 font-body text-[0.95rem] leading-relaxed text-mav-navy/80">
              {testimonial.quote ?? <Pending>[inserir depoimento real]</Pending>}
            </blockquote>

            <figcaption className="mt-5 border-t border-mav-line pt-4">
              <p className="font-display text-sm font-bold text-mav-navy">
                {testimonial.author ?? <Pending>[inserir nome do cliente]</Pending>}
              </p>
              {testimonial.service && (
                <p className="mt-0.5 font-body text-xs uppercase tracking-wider text-mav-navy/50">
                  {testimonial.service}
                </p>
              )}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  </section>
);
