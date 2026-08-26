import { ArrowRight, Tag } from "lucide-react";

import { PLATE_PRICES, priceLabel, whatsappLink } from "@/content/site";
import { MercosulMotoPlate, MercosulPlate, WhatsAppIcon } from "../brand";
import {
  BigPrice,
  DiscountBadge,
  SavingsLine,
  StruckPrice,
} from "./offerParts";
import { useOfferRotation } from "./offerHooks";

/**
 * OPÇÃO B — etiqueta de preço girando sobre a placa.
 *
 * A headline de valor continua sendo a primeira leitura (é ela que sustenta o
 * SEO e a confiança); o preço entra logo ao lado como prova de que é acessível.
 * A etiqueta alterna carro e moto sozinha.
 */
export const RotatingPriceTag = () => {
  const { index, pauseProps } = useOfferRotation(PLATE_PRICES.length, 4500);
  const item = PLATE_PRICES[index];

  return (
    <div
      {...pauseProps}
      className="pointer-events-auto w-[190px] -rotate-6 rounded-2xl border-[3px] border-gold bg-site-card p-4 text-center shadow-[0_26px_48px_-18px_rgba(0,0,0,0.6)]"
      aria-live="polite"
    >
      <p className="font-display text-[0.65rem] font-extrabold uppercase tracking-[0.16em] text-site-accent">
        Placa de {item.label}
      </p>

      {item.priceFrom ? (
        <p className="mt-1.5 font-body text-xs">
          de <StruckPrice value={item.priceFrom} />
        </p>
      ) : (
        <p className="mt-1.5 font-body text-xs text-site-ink/45">à vista</p>
      )}

      <div className="mt-0.5">
        <BigPrice value={item.price} size="md" />
      </div>

      <p className="mt-1 font-display text-[0.65rem] font-bold uppercase tracking-[0.14em] text-site-ink/55">
        {item.unit}
      </p>

      <div className="mt-2.5 flex justify-center">
        <DiscountBadge item={item} />
      </div>

      {/* Pontinhos indicando que alterna, para não parecer conteúdo estático */}
      <div className="mt-3 flex justify-center gap-1.5">
        {PLATE_PRICES.map((price, priceIndex) => (
          <span
            key={price.id}
            className={`h-1.5 rounded-full transition-all ${
              priceIndex === index ? "w-4 bg-site-accent" : "w-1.5 bg-site-ink/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

/** Linha de preço abaixo dos CTAs do hero, na opção B. */
export const HeroPriceLine = () => (
  <p className="mt-4 font-body text-sm text-site-ink/70">
    <Tag className="mr-1.5 inline h-4 w-4 -translate-y-0.5 text-site-accent" strokeWidth={2.5} />
    Placa Mercosul a partir de{" "}
    <strong className="font-display font-bold text-site-ink">R$ 90</strong> · carro{" "}
    <strong className="font-display font-bold text-site-ink">R$ 140</strong> o par{" "}
    <a href="#precos" className="font-display font-bold text-site-accent underline underline-offset-2">
      ver preços
    </a>
  </p>
);

/**
 * OPÇÃO C — o painel direito do hero vira um cartão de oferta.
 *
 * A placa continua no topo, mas o peso visual passa para o preço e o botão. O
 * cartão alterna carro e moto junto com a faixa de oferta do topo da página.
 */
export const HeroOfferCard = () => {
  const { index, go, pauseProps } = useOfferRotation(PLATE_PRICES.length, 5000);
  const item = PLATE_PRICES[index];

  return (
    <div
      {...pauseProps}
      className="mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-site-line bg-site-card shadow-[0_36px_70px_-32px_rgba(10,31,68,0.65)]"
    >
      {/* Cabeçalho com a placa correspondente ao tipo selecionado */}
      <div className="relative overflow-hidden bg-site-contrast px-6 py-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(115deg, #fff 0 2px, transparent 2px 26px)",
          }}
        />
        <div className="relative flex justify-center">
          {item.id === "moto" ? (
            <MercosulMotoPlate className="w-[130px] rotate-[3deg] drop-shadow-[0_18px_28px_rgba(0,0,0,0.5)]" />
          ) : (
            <MercosulPlate
              className="w-full rotate-[-2deg] drop-shadow-[0_18px_28px_rgba(0,0,0,0.5)]"
              title="Par de placas Mercosul para carro emitido pela MAV Emplacamento"
            />
          )}
        </div>
      </div>

      {/* Seletor carro / moto */}
      <div className="flex gap-1.5 border-b border-site-line p-2" role="tablist">
        {PLATE_PRICES.map((price, priceIndex) => (
          <button
            key={price.id}
            type="button"
            role="tab"
            aria-selected={priceIndex === index}
            onClick={() => go(priceIndex)}
            className={`flex-1 rounded-lg py-2 font-display text-sm font-bold transition-colors ${
              priceIndex === index
                ? "bg-site-accent-soft text-site-accent"
                : "text-site-ink/50 hover:bg-site-alt"
            }`}
          >
            {price.label}
          </button>
        ))}
      </div>

      <div className="p-6" aria-live="polite">
        <div className="flex items-center justify-between gap-3">
          <p className="font-display text-[0.7rem] font-bold uppercase tracking-[0.16em] text-site-ink/50">
            {item.unit}
          </p>
          <DiscountBadge item={item} />
        </div>

        {item.priceFrom && (
          <p className="mt-3 font-body text-sm">
            de <StruckPrice value={item.priceFrom} />
          </p>
        )}

        <div className="mt-1">
          <BigPrice value={item.price} size="lg" />
        </div>

        <div className="mt-2">
          <SavingsLine item={item} />
        </div>

        <a
          href={whatsappLink(item.whatsappMessage)}
          target="_blank"
          rel="noreferrer"
          className="mt-5 flex items-center justify-center gap-2.5 rounded-xl bg-whats px-5 py-4 font-display text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-whats-dark"
        >
          <WhatsAppIcon className="h-5 w-5" />
          Pedir por R$ {priceLabel(item.price)}
        </a>

        <a
          href="#precos"
          className="mt-3 flex items-center justify-center gap-1.5 font-display text-sm font-bold text-site-accent"
        >
          Ver todos os preços
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
        </a>
      </div>
    </div>
  );
};
