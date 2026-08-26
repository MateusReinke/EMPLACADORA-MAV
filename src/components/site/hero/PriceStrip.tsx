import { PLATE_PRICES } from "@/content/site";
import { AnimatedIconField } from "./AnimatedIconField";
import { PriceTile } from "./PriceTile";
import { PromoCountdown } from "./PromoCountdown";

/**
 * OPÇÃO F — régua de preços logo abaixo do hero original.
 *
 * O hero de marca continua como está (manchete, placa, prova social) e os dois
 * preços entram numa faixa larga colada nele. No desktop os valores já aparecem
 * na primeira tela; no mobile ficam a um dedo de rolagem, logo depois do CTA.
 */
export const PriceStrip = () => (
  <section id="precos-destaque" className="relative overflow-hidden bg-site-promo py-10 sm:py-12">
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-[0.13]"
      style={{
        backgroundImage:
          "repeating-linear-gradient(115deg, #fff 0 2px, transparent 2px 26px)",
      }}
    />
    <AnimatedIconField />

    <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-5 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
      <div>
        <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-gold">
          Promoção especial
        </p>
        <h2 className="mt-2 font-display text-2xl font-extrabold leading-tight tracking-[-0.015em] text-white sm:text-3xl">
          Placa Mercosul com preço fechado
        </h2>
        <p className="mt-2 max-w-sm font-body text-sm leading-relaxed text-white/70">
          Sem "consulte-nos": os dois valores estão aqui. Confirme no WhatsApp o
          que está incluído no seu caso.
        </p>

        <div className="mt-5">
          <PromoCountdown />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {PLATE_PRICES.map((item) => (
          <PriceTile key={item.id} item={item} featured={item.highlight} />
        ))}
      </div>
    </div>
  </section>
);
