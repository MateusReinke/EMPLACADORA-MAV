import { Check } from "lucide-react";

import {
  PLATE_PRICES,
  PRICE_DISCLAIMER,
  priceLabel,
  whatsappLink,
  type PlatePrice,
} from "@/content/site";
import { Eyebrow, WhatsAppIcon } from "./brand";

/** Valor formatado com R$ pequeno, inteiro grande e centavos sobrescritos. */
const Price = ({ value, large }: { value: number; large?: boolean }) => {
  const [reais, cents] = priceLabel(value).split(",");

  return (
    <span className="inline-flex items-start font-display font-extrabold leading-none text-site-ink">
      <span className={large ? "mr-1 mt-2 text-xl" : "mr-1 mt-1 text-base"}>R$</span>
      <span className={large ? "text-6xl sm:text-7xl" : "text-5xl"}>{reais}</span>
      <span className={large ? "mt-1.5 text-2xl" : "mt-1 text-xl"}>,{cents}</span>
    </span>
  );
};

const PriceCard = ({ item }: { item: PlatePrice }) => (
  <article
    className={`relative flex flex-col rounded-2xl bg-site-card p-6 sm:p-7 ${
      item.highlight
        ? "border-2 border-gold shadow-[0_28px_60px_-30px_rgba(0,0,0,0.6)]"
        : "border border-site-line"
    }`}
    data-reveal
  >
    {item.highlight && (
      <span className="absolute -top-3 left-6 rounded-md bg-gold px-2.5 py-1 font-display text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-mav-navy">
        Promoção
      </span>
    )}

    <div className="flex items-baseline justify-between gap-3">
      <h3 className="font-display text-xl font-extrabold text-site-ink">{item.label}</h3>
      <span className="font-display text-[0.7rem] font-bold uppercase tracking-[0.14em] text-site-accent">
        {item.unit}
      </span>
    </div>

    <p className="mt-2 font-body text-sm leading-relaxed text-site-ink/65">
      {item.description}
    </p>

    <div className="mt-5">
      {item.priceFrom && (
        <p className="font-body text-sm text-site-ink/45">
          de{" "}
          <span className="relative">
            R$ {priceLabel(item.priceFrom)}
            {/* Risco desenhado, não line-through: cruza o valor na diagonal */}
            <svg
              viewBox="0 0 100 20"
              preserveAspectRatio="none"
              aria-hidden="true"
              className="absolute inset-0 h-full w-full text-red-500"
            >
              <line x1="2" y1="17" x2="98" y2="3" stroke="currentColor" strokeWidth="2" />
            </svg>
          </span>
        </p>
      )}
      {item.priceFrom && (
        <p className="mt-1 font-body text-sm text-site-ink/60">por</p>
      )}
      <div className="mt-1">
        <Price value={item.price} large={item.highlight} />
      </div>
    </div>

    <a
      href={whatsappLink(item.whatsappMessage)}
      target="_blank"
      rel="noreferrer"
      className="mt-6 inline-flex items-center justify-center gap-2.5 rounded-xl bg-whats px-5 py-3.5 font-display text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-whats-dark sm:mt-auto sm:pt-3.5"
    >
      <WhatsAppIcon className="h-[18px] w-[18px]" />
      Pedir placa de {item.label.toLowerCase()}
    </a>
  </article>
);

export const PricingSection = () => (
  <section id="precos" className="relative overflow-hidden bg-site-promo py-16 sm:py-20">
    {/* Faixas diagonais: o mesmo recurso gráfico do material promocional da MAV */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-[0.14]"
      style={{
        backgroundImage:
          "repeating-linear-gradient(115deg, #fff 0 2px, transparent 2px 26px)",
      }}
    />
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-site-promo-deep"
      style={{ clipPath: "polygon(28% 0, 100% 0, 100% 100%, 0 100%)" }}
    />

    <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
      <div data-reveal>
        <Eyebrow tone="white">Promoção especial</Eyebrow>
        <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-[-0.015em] text-white sm:text-4xl">
          Compre sua Placa Mercosul com preço fechado
        </h2>
        <p className="mt-4 max-w-md font-body leading-relaxed text-white/75">
          Sem "consulte-nos": o valor da placa está aqui. Você fala com a gente pelo
          WhatsApp já sabendo quanto vai pagar.
        </p>

        <ul className="mt-6 space-y-2.5">
          {[
            "Padrão Mercosul oficial",
            "Material de alta qualidade",
            "Instalação com lacre",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2.5 font-body text-sm text-white/85">
              <span className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-white/20">
                <Check className="h-3 w-3 text-white" strokeWidth={3.5} />
              </span>
              {item}
            </li>
          ))}
        </ul>

        <p className="mt-7 max-w-md border-l-2 border-white/25 pl-3 font-body text-xs leading-relaxed text-white/60">
          {PRICE_DISCLAIMER}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {PLATE_PRICES.map((item) => (
          <PriceCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  </section>
);
