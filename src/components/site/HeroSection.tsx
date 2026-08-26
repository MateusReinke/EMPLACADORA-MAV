import { ArrowRight, Check, MapPin, Phone, Sparkles } from "lucide-react";

import {
  BUSINESS,
  PLATE_PRICES,
  PRICE_DISCLAIMER,
  fullAddress,
  whatsappLink,
} from "@/content/site";
import { Eyebrow, MercosulPlate, SlashMark, Stars, WhatsAppIcon } from "./brand";
import { AnimatedIconField } from "./hero/AnimatedIconField";
import { PriceTile } from "./hero/PriceTile";
import { useGoogleReviews } from "./useGoogleReviews";

const HERO_WHATSAPP_MESSAGE =
  "Olá! Vim pelo site da MAV e quero emplacar meu veículo. Pode me ajudar?";

const HIGHLIGHTS = [
  "Padrão Mercosul oficial",
  "Emissão e instalação da placa",
  "Orçamento fechado no WhatsApp",
];

/**
 * Dobra inicial: manchete de valor à esquerda, quadro de preços à direita.
 *
 * A manchete continua sendo a primeira leitura — é ela que sustenta o SEO e a
 * confiança de quem vai entregar documento de veículo a um despachante. O
 * quadro ao lado mostra os dois preços de uma vez, sem carrossel: quem chegou
 * pesquisando "quanto custa" não espera slide nenhum para descobrir.
 *
 * Sem `data-reveal` de propósito: é o elemento de LCP e precisa pintar
 * imediatamente, antes de qualquer JavaScript.
 */
export const HeroSection = () => {
  const reviews = useGoogleReviews();

  return (
    <section id="topo" className="relative overflow-hidden bg-site-alt">
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 lg:py-16">
        {/* Teto de largura: mantém a manchete longe da borda do vinco diagonal */}
        <div className="lg:max-w-lg">
          <Eyebrow>{BUSINESS.tagline}</Eyebrow>

          <h1 className="mt-5 font-display text-[2.05rem] font-extrabold leading-[1.08] tracking-[-0.02em] text-site-ink sm:text-5xl lg:text-[3.1rem]">
            Sua Placa Mercosul pronta com{" "}
            <span className="relative whitespace-nowrap text-site-accent">
              agilidade
              <svg
                viewBox="0 0 200 10"
                preserveAspectRatio="none"
                aria-hidden="true"
                className="absolute -bottom-1 left-0 h-2 w-full text-mav-blue/30"
              >
                <path
                  d="M0 7 Q 50 1, 100 5 T 200 3"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
            e segurança
          </h1>

          <p className="mt-5 max-w-md font-body text-base leading-relaxed text-site-ink/70">
            Primeira via, segunda via, 0km, transferência e licenciamento em{" "}
            {BUSINESS.address.city}. A MAV cuida da burocracia — você só busca o
            veículo com a placa instalada.
          </p>

          <ul className="mt-6 grid gap-2.5">
            {HIGHLIGHTS.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2.5 font-body text-sm text-site-ink/75"
              >
                <span className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-site-accent-soft">
                  <Check className="h-3 w-3 text-site-accent" strokeWidth={3.5} />
                </span>
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={whatsappLink(HERO_WHATSAPP_MESSAGE)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-whats px-6 py-4 font-display text-base font-bold text-white shadow-[0_18px_36px_-18px_rgba(37,211,102,0.95)] transition-all hover:-translate-y-0.5 hover:bg-whats-dark"
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

          <div className="mt-6 flex flex-col gap-2 font-body text-sm text-site-ink/65 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
            {reviews?.rating && (
              <a href="#avaliacoes" className="flex items-center gap-2">
                <Stars className="h-4 w-4" />
                <strong className="font-display font-bold text-site-ink">
                  {reviews.rating.toFixed(1).replace(".", ",")}
                </strong>
                {reviews.total ? `em ${reviews.total} avaliações` : "no Google"}
              </a>
            )}
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

        {/* Lado do produto: placa em destaque e, logo abaixo, os preços */}
        <div className="relative">
          {/*
            Vinco diagonal navy — o recorte que abre a página.

            Preso à coluna (offsets em px a partir dela), e não a uma
            porcentagem da viewport: ancorado na tela, a borda inclinada
            passeava conforme a largura do navegador e ora cortava os chips do
            lado direito, ora invadia a manchete do lado esquerdo. Sangra para
            fora da tela e é o `overflow-hidden` da seção que apara.
          */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-64 -top-64 left-[-5rem] right-[-100vw] hidden bg-site-contrast lg:block"
            style={{ clipPath: "polygon(64px 0, 100% 0, 100% 100%, 0 100%)" }}
          />

          <div className="relative overflow-hidden rounded-3xl bg-site-contrast px-5 py-8 shadow-mav-plate sm:px-7 lg:rounded-none lg:bg-transparent lg:px-0 lg:py-0 lg:shadow-none">
            <AnimatedIconField />

            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <SlashMark tone="white" className="h-4 w-12 opacity-70" />

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
              </div>

              <MercosulPlate
                className="mt-5 w-full rotate-[-2.5deg] drop-shadow-[0_26px_38px_rgba(0,0,0,0.45)]"
                title="Par de placas Mercosul emitido pela MAV Emplacamento"
              />

              <div className="mt-6 flex flex-wrap items-center gap-2">
                {["1ª via", "2ª via", "0km", "Transferência"].map((chip) => (
                  <span
                    key={chip}
                    className="rounded-lg border border-white/15 bg-white/[0.07] px-3 py-1.5 font-display text-xs font-bold uppercase tracking-wider text-white/85"
                  >
                    {chip}
                  </span>
                ))}
              </div>

              {/*
                Os preços moram só aqui. A seção de preços que existia no meio
                da página saiu: repetir os mesmos dois valores duas vezes não
                acrescentava nada e criava um segundo lugar para desatualizar.
              */}
              <div id="precos" className="mt-8 border-t border-white/10 pt-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-display text-sm font-bold uppercase tracking-[0.16em] text-white/60">
                    Quanto custa a placa
                  </p>
                  <p className="flex items-center gap-1.5 rounded-lg border border-gold/40 bg-gold/10 px-3 py-1.5 font-display text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-gold">
                    <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
                    Aproveite a promoção
                  </p>
                </div>

                <div className="mt-5 grid gap-4">
                  {PLATE_PRICES.map((item) => (
                    <PriceTile
                      key={item.id}
                      item={item}
                      featured={item.highlight}
                      surface="glass"
                      compact={!item.highlight}
                    />
                  ))}
                </div>

                <p className="mt-5 font-body text-xs leading-relaxed text-white/50">
                  {PRICE_DISCLAIMER}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
