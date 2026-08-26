import { ArrowRight, MapPin, Phone } from "lucide-react";

import { BUSINESS, fullAddress, whatsappLink } from "@/content/site";
import { Eyebrow, MercosulPlate, SlashMark, Stars, WhatsAppIcon } from "./brand";
import { HeroOfferCard, HeroPriceLine, RotatingPriceTag } from "./hero/heroOffers";
import { useGoogleReviews } from "./useGoogleReviews";

const HERO_WHATSAPP_MESSAGE =
  "Olá! Vim pelo site da MAV e quero emplacar meu veículo. Pode me ajudar?";

/**
 * Dobra inicial. Sem `data-reveal` de propósito: é o elemento de LCP e precisa
 * pintar imediatamente, antes de qualquer JavaScript.
 */
/**
 * `offer` escolhe como o preço aparece na dobra:
 *   "none" → hero original, sem preço;
 *   "tag"  → etiqueta de preço girando sobre a placa (opção B);
 *   "card" → painel direito vira cartão de oferta (opção C).
 */
export const HeroSection = ({
  offer = "none",
}: {
  offer?: "none" | "tag" | "card";
}) => {
  const reviews = useGoogleReviews();

  return (
  <section id="topo" className="relative overflow-hidden bg-site-alt">
    {/* Vinco diagonal navy que ancora o painel da placa, no lugar do gradiente genérico */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] bg-site-contrast lg:block"
      style={{ clipPath: "polygon(18% 0, 100% 0, 100% 100%, 0 100%)" }}
    />

    <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 sm:px-6 lg:grid-cols-[1.04fr_0.96fr] lg:gap-14 lg:py-20">
      <div className="max-w-xl">
        <Eyebrow>{BUSINESS.tagline}</Eyebrow>

        <h1 className="mt-5 font-display text-[2.15rem] font-extrabold leading-[1.08] tracking-[-0.02em] text-site-ink sm:text-5xl lg:text-[3.4rem]">
          Sua Placa Mercosul pronta com{" "}
          <span className="relative whitespace-nowrap text-site-accent">
            agilidade
            <svg
              viewBox="0 0 200 10"
              preserveAspectRatio="none"
              aria-hidden="true"
              className="absolute -bottom-1 left-0 h-2 w-full text-mav-blue/30"
            >
              <path d="M0 7 Q 50 1, 100 5 T 200 3" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
            </svg>
          </span>{" "}
          e segurança
        </h1>

        <p className="mt-5 font-body text-base leading-relaxed text-site-ink/70 sm:text-lg">
          Primeira via, segunda via, veículo 0km, transferência e licenciamento em{" "}
          {BUSINESS.address.city}. A MAV cuida da burocracia de ponta a ponta — você
          só busca o veículo com a placa instalada.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href={whatsappLink(HERO_WHATSAPP_MESSAGE)}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-whats px-6 py-4 font-display text-base font-bold text-white shadow-[0_18px_36px_-18px_rgba(37,211,102,0.95)] transition-all hover:-translate-y-0.5 hover:bg-whats-dark hover:shadow-[0_22px_44px_-18px_rgba(37,211,102,1)]"
          >
            <WhatsAppIcon className="h-[22px] w-[22px]" />
            Falar no WhatsApp agora
          </a>
          <a
            href="#servicos"
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-site-ink/15 bg-site-card px-6 py-4 font-display text-base font-bold text-site-ink transition-all hover:border-mav-blue hover:text-site-accent"
          >
            Ver serviços
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </a>
        </div>

        {offer === "tag" && <HeroPriceLine />}

        {/*
          Selo de confiança. Sem avaliação do Google carregada, mostra o que é
          verdade sobre o serviço; com avaliação, mostra a nota real e leva à
          seção de avaliações. Em nenhum caso inventa número.
        */}
        <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-site-line bg-site-card px-4 py-3">
          {reviews?.rating ? (
            <>
              <Stars className="h-[18px] w-[18px]" />
              <a href="#avaliacoes" className="font-body text-sm text-site-ink/75">
                <strong className="font-display font-bold text-site-ink">
                  {reviews.rating.toFixed(1).replace(".", ",")}
                </strong>{" "}
                {reviews.total
                  ? `em ${reviews.total} avaliações no Google`
                  : "de avaliação no Google"}
              </a>
            </>
          ) : (
            <p className="font-body text-sm text-site-ink/75">
              <strong className="font-display font-bold text-site-ink">
                Padrão Mercosul oficial
              </strong>{" "}
              · instalação com lacre incluída
            </p>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-2 font-body text-sm text-site-ink/65 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-site-accent" strokeWidth={2.5} />
            {fullAddress}
          </span>
          <a
            href={`tel:${BUSINESS.phoneE164}`}
            className="flex items-center gap-2 font-semibold text-site-ink transition-colors hover:text-site-accent"
          >
            <Phone className="h-4 w-4 shrink-0 text-site-accent" strokeWidth={2.5} />
            {BUSINESS.phoneDisplay}
          </a>
        </div>
      </div>

      {/* Painel da placa (ou cartão de oferta, na opção C) */}
      <div className="relative">
        {offer === "card" ? (
          <HeroOfferCard />
        ) : (
        <div className="relative overflow-hidden rounded-3xl bg-site-contrast px-6 py-10 shadow-mav-plate sm:px-10 lg:bg-transparent lg:shadow-none">
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-mav-blue/25 blur-3xl lg:bg-mav-blue/30"
          />
          {/*
            O selo fica no fluxo, não posicionado por cima: absoluto ele
            colidia com os chips de serviço quando eles quebravam de linha.
          */}
          <div className="relative flex items-start justify-between gap-4">
            <SlashMark tone="white" className="h-4 w-12 opacity-70" />

            {offer === "tag" ? (
              <RotatingPriceTag />
            ) : (
              <div className="-rotate-3 rounded-xl border-2 border-gold/70 bg-site-card px-3.5 py-2 text-center shadow-mav-card">
                <p className="font-display text-[0.6rem] font-bold uppercase tracking-[0.18em] text-site-accent">
                  Padrão
                </p>
                <p className="font-display text-base font-extrabold leading-none text-site-ink">
                  Mercosul
                </p>
                <p className="mt-1 font-body text-[0.6rem] text-site-ink/60">
                  É padrão, é segurança
                </p>
              </div>
            )}
          </div>

          <div className="relative mt-6 [transform:rotate(-2.5deg)]">
            <MercosulPlate
              className="w-full drop-shadow-[0_26px_38px_rgba(0,0,0,0.45)]"
              title="Placa Mercosul emplacada pela MAV Emplacamento em veículo 0km"
            />
          </div>

          <div className="relative mt-8 flex flex-wrap items-center gap-3">
            <span className="rounded-lg border border-white/15 bg-white/[0.07] px-3 py-2 font-display text-xs font-bold uppercase tracking-wider text-white/85">
              1ª via
            </span>
            <span className="rounded-lg border border-white/15 bg-white/[0.07] px-3 py-2 font-display text-xs font-bold uppercase tracking-wider text-white/85">
              2ª via
            </span>
            <span className="rounded-lg border border-white/15 bg-white/[0.07] px-3 py-2 font-display text-xs font-bold uppercase tracking-wider text-white/85">
              0km
            </span>
            <span className="rounded-lg border border-white/15 bg-white/[0.07] px-3 py-2 font-display text-xs font-bold uppercase tracking-wider text-white/85">
              Transferência
            </span>
          </div>
        </div>
        )}
      </div>
    </div>
  </section>
);
};
