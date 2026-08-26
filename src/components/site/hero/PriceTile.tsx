import { Bike, Car } from "lucide-react";

import { whatsappLink, type PlatePrice } from "@/content/site";
import { WhatsAppIcon } from "../brand";
import { BigPrice, DiscountBadge, SavingsLine, StruckPrice } from "./offerParts";

const ICONS = { carro: Car, moto: Bike } as const;

/**
 * Bloco de preço usado nas três propostas sem slide. Os dois valores ficam
 * visíveis ao mesmo tempo; o de carro entra como `featured` porque é o serviço
 * com desconto e o de maior volume.
 */
export const PriceTile = ({
  item,
  featured = false,
  surface = "card",
  compact = false,
}: {
  item: PlatePrice;
  featured?: boolean;
  /** "card" = fundo claro do tema; "glass" = translúcido sobre faixa colorida */
  surface?: "card" | "glass";
  /** Linha horizontal, para o segundo preço quando a coluna é estreita. */
  compact?: boolean;
}) => {
  const Icon = ICONS[item.id];
  const glass = surface === "glass";

  if (compact) {
    return (
      <article
        className={`flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl p-4 ${
          glass
            ? "border border-white/15 bg-white/[0.08]"
            : "border border-site-line bg-site-card"
        }`}
      >
        <span
          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
            glass ? "bg-white/15 text-white" : "bg-site-badge text-white"
          }`}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={2.25} />
        </span>

        <span className="min-w-0 flex-1">
          <span
            className={`block font-display text-base font-extrabold ${
              glass ? "text-white" : "text-site-ink"
            }`}
          >
            {item.label}
          </span>
          <span
            className={`block font-display text-[0.6rem] font-bold uppercase tracking-[0.16em] ${
              glass ? "text-white/55" : "text-site-ink/45"
            }`}
          >
            {item.unit}
          </span>
        </span>

        <BigPrice value={item.price} tone={glass ? "white" : "ink"} size="md" />

        <a
          href={whatsappLink(item.whatsappMessage)}
          target="_blank"
          rel="noreferrer"
          aria-label={`Pedir placa de ${item.label.toLowerCase()} no WhatsApp`}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-whats px-4 py-3 font-display text-sm font-bold text-white transition-colors hover:bg-whats-dark"
        >
          <WhatsAppIcon className="h-[18px] w-[18px]" />
          Pedir
        </a>
      </article>
    );
  }

  return (
    <article
      className={`relative flex flex-col rounded-2xl p-5 transition-transform duration-200 hover:-translate-y-1 sm:p-6 ${
        glass
          ? "border border-white/15 bg-white/[0.08] backdrop-blur-sm"
          : "bg-site-card shadow-[0_28px_56px_-30px_rgba(10,31,68,0.7)]"
      } ${featured ? "border-2 border-gold" : glass ? "" : "border border-site-line"}`}
    >
      {featured && (
        <span className="absolute -top-3 left-5 rounded-md bg-gold px-2.5 py-1 font-display text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-mav-navy">
          Mais pedido
        </span>
      )}

      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2.5">
          <span
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${
              glass ? "bg-white/15 text-white" : "bg-site-badge text-white"
            }`}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={2.25} />
          </span>
          <span
            className={`font-display text-lg font-extrabold ${
              glass ? "text-white" : "text-site-ink"
            }`}
          >
            {item.label}
          </span>
        </span>
        <DiscountBadge item={item} />
      </div>

      <p
        className={`mt-3 font-display text-[0.65rem] font-bold uppercase tracking-[0.16em] ${
          glass ? "text-white/55" : "text-site-ink/45"
        }`}
      >
        {item.unit}
      </p>

      {item.priceFrom && (
        <p className={`mt-2 font-body text-sm ${glass ? "text-white/60" : "text-site-ink/45"}`}>
          de <StruckPrice value={item.priceFrom} tone={glass ? "white" : "ink"} />
        </p>
      )}

      <div className={item.priceFrom ? "mt-0.5" : "mt-2"}>
        <BigPrice value={item.price} tone={glass ? "white" : "ink"} size={featured ? "lg" : "md"} />
      </div>

      <div className="mt-2">
        <SavingsLine item={item} tone={glass ? "white" : "ink"} />
      </div>

      <a
        href={whatsappLink(item.whatsappMessage)}
        target="_blank"
        rel="noreferrer"
        className="mt-5 flex items-center justify-center gap-2.5 rounded-xl bg-whats px-4 py-3.5 font-display text-sm font-bold text-white transition-colors hover:bg-whats-dark sm:mt-auto sm:pt-3.5"
      >
        <WhatsAppIcon className="h-[18px] w-[18px]" />
        Pedir placa de {item.label.toLowerCase()}
      </a>
    </article>
  );
};
