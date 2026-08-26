import { ArrowRight, MapPin, Phone } from "lucide-react";

import { BUSINESS, PLATE_PRICES, fullAddress } from "@/content/site";
import { Eyebrow, Stars } from "../brand";
import { useGoogleReviews } from "../useGoogleReviews";
import { AnimatedIconField } from "./AnimatedIconField";
import { PriceTile } from "./PriceTile";
import { PromoCountdown } from "./PromoCountdown";

/**
 * OPÇÃO D — dobra em formato de cartaz.
 *
 * Tudo centralizado, os dois preços lado a lado no meio da tela. É a leitura
 * mais direta possível: título, preço, botão. Sem slide, sem etapa intermediária.
 */
export const HeroPoster = () => {
  const reviews = useGoogleReviews();

  return (
    <section id="topo" className="relative overflow-hidden bg-site-promo">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.13]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, #fff 0 2px, transparent 2px 26px)",
        }}
      />
      <AnimatedIconField />

      <div className="relative mx-auto max-w-5xl px-5 py-14 text-center sm:px-6 lg:py-16">
        <Eyebrow tone="white">Promoção especial</Eyebrow>

        <h1 className="mx-auto mt-5 max-w-3xl font-display text-[2.1rem] font-extrabold leading-[1.07] tracking-[-0.02em] text-white sm:text-5xl lg:text-[3.35rem]">
          Placa Mercosul em {BUSINESS.address.city} com preço fechado
        </h1>

        <p className="mx-auto mt-4 max-w-xl font-body text-base leading-relaxed text-white/75 sm:text-lg">
          Sem "consulte-nos". O valor está aqui embaixo — você chama no WhatsApp já
          sabendo quanto vai pagar.
        </p>

        <div className="mt-6 flex justify-center">
          <PromoCountdown />
        </div>

        <div className="mx-auto mt-9 grid max-w-2xl gap-5 sm:grid-cols-2">
          {PLATE_PRICES.map((item) => (
            <PriceTile key={item.id} item={item} featured={item.highlight} />
          ))}
        </div>

        <a
          href="#servicos"
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/25 px-6 py-3.5 font-display text-base font-bold text-white transition-colors hover:bg-white/10"
        >
          Ver todos os serviços
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
        </a>

        <div className="mt-8 flex flex-col items-center justify-center gap-2 font-body text-sm text-white/70 sm:flex-row sm:gap-x-6">
          {reviews?.rating && (
            <span className="flex items-center gap-2">
              <Stars className="h-4 w-4" />
              <strong className="font-display font-bold text-white">
                {reviews.rating.toFixed(1).replace(".", ",")}
              </strong>
              {reviews.total ? `em ${reviews.total} avaliações` : "no Google"}
            </span>
          )}
          <span className="flex items-center gap-2 text-center">
            <MapPin className="h-4 w-4 shrink-0 text-gold" strokeWidth={2.5} />
            {fullAddress}
          </span>
          <a
            href={`tel:${BUSINESS.phoneE164}`}
            className="flex items-center gap-2 font-semibold text-white transition-colors hover:text-gold"
          >
            <Phone className="h-4 w-4 shrink-0 text-gold" strokeWidth={2.5} />
            {BUSINESS.phoneDisplay}
          </a>
        </div>
      </div>
    </section>
  );
};
