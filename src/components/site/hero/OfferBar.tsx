import { ArrowRight } from "lucide-react";

import { PLATE_PRICES, priceLabel, whatsappLink } from "@/content/site";
import { WhatsAppIcon } from "../brand";
import { useOfferRotation } from "./offerHooks";

const MESSAGES = [
  ...PLATE_PRICES.map((item) => ({
    key: item.id,
    text: (
      <>
        Placa Mercosul de{" "}
        <strong className="font-display font-extrabold">{item.label.toLowerCase()}</strong>{" "}
        {item.priceFrom ? (
          <>
            de <span className="line-through opacity-70">R$ {priceLabel(item.priceFrom)}</span> por{" "}
          </>
        ) : (
          "por "
        )}
        <strong className="font-display text-base font-extrabold text-gold">
          R$ {priceLabel(item.price)}
        </strong>{" "}
        {item.unit}
      </>
    ),
    message: item.whatsappMessage,
  })),
  {
    key: "resposta",
    text: (
      <>
        Mande os documentos pelo WhatsApp e{" "}
        <strong className="font-display font-extrabold">receba o orçamento fechado</strong>, sem
        compromisso
      </>
    ),
    message: "Olá! Quero um orçamento para emplacar meu veículo.",
  },
];

/**
 * OPÇÃO C — faixa de oferta acima do cabeçalho.
 *
 * Primeira coisa na tela, antes até do logotipo. Alterna entre as ofertas e um
 * convite ao orçamento. A faixa inteira é clicável e leva ao WhatsApp com a
 * mensagem correspondente ao que está sendo exibido.
 */
export const OfferBar = () => {
  const { index, pauseProps } = useOfferRotation(MESSAGES.length, 5000);
  const current = MESSAGES[index];

  return (
    <div className="relative overflow-hidden bg-site-promo" {...pauseProps}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, #fff 0 2px, transparent 2px 22px)",
        }}
      />

      <a
        href={whatsappLink(current.message)}
        target="_blank"
        rel="noreferrer"
        className="relative mx-auto flex max-w-6xl items-center justify-center gap-3 px-5 py-2.5 text-center font-body text-sm text-white transition-colors hover:bg-white/10 sm:px-6"
      >
        <WhatsAppIcon className="hidden h-4 w-4 shrink-0 sm:block" />
        <span aria-live="polite" className="leading-snug">
          {current.text}
        </span>
        <ArrowRight className="hidden h-4 w-4 shrink-0 sm:block" strokeWidth={2.5} />
      </a>
    </div>
  );
};
