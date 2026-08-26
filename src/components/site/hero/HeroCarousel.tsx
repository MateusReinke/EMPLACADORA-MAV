import { ArrowRight, Check, ChevronLeft, ChevronRight, MapPin, Phone } from "lucide-react";

import {
  BUSINESS,
  PLATE_PRICES,
  SERVICES,
  fullAddress,
  whatsappLink,
} from "@/content/site";
import {
  Eyebrow,
  MercosulMotoPlate,
  MercosulPlate,
  Stars,
  WhatsAppIcon,
} from "../brand";
import { useGoogleReviews } from "../useGoogleReviews";
import {
  BigPrice,
  DiscountBadge,
  SavingsLine,
  StruckPrice,
} from "./offerParts";
import { useOfferRotation, useSwipe } from "./offerHooks";

const carro = PLATE_PRICES.find((item) => item.id === "carro")!;
const moto = PLATE_PRICES.find((item) => item.id === "moto")!;
const zeroKm = SERVICES.find((service) => service.id === "zero-km")!;

/**
 * OPÇÃO A — a dobra inicial vira um carrossel de ofertas.
 *
 * O preço é a primeira coisa que a pessoa vê. Três slides giram sozinhos:
 * carro, moto e 0km. Todos os slides ficam no DOM (só mudam de opacidade),
 * então o texto continua indexável e a pré-renderização entrega tudo.
 */
export const HeroCarousel = () => {
  const reviews = useGoogleReviews();
  const { index, go, next, prev, pauseProps } = useOfferRotation(3, 6500);
  const swipe = useSwipe(next, prev);

  const slides = [
    { key: "carro", label: "Placa de carro" },
    { key: "moto", label: "Placa de moto" },
    { key: "0km", label: "Emplacamento 0km" },
  ];

  return (
    <section
      id="topo"
      className="relative isolate overflow-hidden"
      aria-roledescription="carrossel"
      aria-label="Ofertas da MAV Emplacamento"
      {...pauseProps}
      {...swipe}
    >
      <div className="relative min-h-[640px] sm:min-h-[600px] lg:min-h-[560px]">
        {/* ---------------------------------------------------------- slide 1 */}
        <Slide active={index === 0} tone="promo">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <Eyebrow tone="white">Promoção especial</Eyebrow>

              <h1 className="mt-4 font-display text-[2rem] font-extrabold leading-[1.06] tracking-[-0.02em] text-white sm:text-5xl lg:text-[3.25rem]">
                Placa Mercosul de carro por{" "}
                <span className="whitespace-nowrap text-gold">R$ 140</span> o par
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="font-body text-base text-white/70">
                  de <StruckPrice value={carro.priceFrom!} tone="white" />
                </span>
                <DiscountBadge item={carro} />
              </div>

              <div className="mt-1 flex items-end gap-3">
                <BigPrice value={carro.price} tone="white" size="lg" />
                <span className="mb-3 font-display text-sm font-bold uppercase tracking-[0.16em] text-white/75">
                  o par
                </span>
              </div>

              <div className="mt-2">
                <SavingsLine item={carro} tone="white" />
              </div>

              <CtaRow
                message={carro.whatsappMessage}
                label="Quero minha placa por R$ 140"
              />
              <TrustRow reviews={reviews} />
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <MercosulPlate
                className="w-full rotate-[-3deg] drop-shadow-[0_30px_44px_rgba(0,0,0,0.5)]"
                title="Par de placas Mercosul para carro emitido pela MAV Emplacamento"
              />
              <div className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-start">
                {carro.description.length > 0 &&
                  ["Padrão Mercosul oficial", "Instalação com lacre"].map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white/12 px-3 py-1.5 font-body text-xs font-medium text-white/85"
                    >
                      <Check className="h-3 w-3" strokeWidth={3.5} />
                      {item}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </Slide>

        {/* ---------------------------------------------------------- slide 2 */}
        <Slide active={index === 1} tone="navy">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <Eyebrow tone="white">Para motociclistas</Eyebrow>

              <h2 className="mt-4 font-display text-[2rem] font-extrabold leading-[1.06] tracking-[-0.02em] text-white sm:text-5xl lg:text-[3.25rem]">
                Placa Mercosul de moto por{" "}
                <span className="whitespace-nowrap text-gold">R$ 90</span>
              </h2>

              <p className="mt-5 max-w-md font-body text-base leading-relaxed text-white/70">
                Mesma placa oficial, mesmo cuidado do atendimento de carro. Você
                manda os documentos pelo WhatsApp e a gente resolve.
              </p>

              <div className="mt-5 flex items-end gap-3">
                <BigPrice value={moto.price} tone="white" size="lg" />
                <span className="mb-3 font-display text-sm font-bold uppercase tracking-[0.16em] text-white/75">
                  placa única
                </span>
              </div>

              <CtaRow
                message={moto.whatsappMessage}
                label="Quero minha placa de moto"
              />
              <TrustRow reviews={reviews} />
            </div>

            <div className="mx-auto w-full max-w-[230px]">
              <MercosulMotoPlate className="w-full rotate-[3deg] drop-shadow-[0_30px_44px_rgba(0,0,0,0.5)]" />
            </div>
          </div>
        </Slide>

        {/* ---------------------------------------------------------- slide 3 */}
        <Slide active={index === 2} tone="deep">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <Eyebrow tone="white">Veículo novo</Eyebrow>

              <h2 className="mt-4 font-display text-[2rem] font-extrabold leading-[1.06] tracking-[-0.02em] text-white sm:text-5xl lg:text-[3.25rem]">
                Comprou 0km? Sai da loja com a placa instalada
              </h2>

              <p className="mt-5 max-w-md font-body text-base leading-relaxed text-white/70">
                {zeroKm.description}
              </p>

              <ul className="mt-6 grid gap-2.5 sm:max-w-md">
                {zeroKm.includes.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2.5 font-body text-sm text-white/85"
                  >
                    <span className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-mav-blue">
                      <Check className="h-3 w-3 text-white" strokeWidth={3.5} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <CtaRow
                message={zeroKm.whatsappMessage}
                label="Emplacar meu 0km"
              />
              <TrustRow reviews={reviews} />
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <MercosulPlate
                className="w-full rotate-[-3deg] drop-shadow-[0_30px_44px_rgba(0,0,0,0.5)]"
                title="Placa Mercosul instalada em veículo 0km pela MAV Emplacamento"
              />
            </div>
          </div>
        </Slide>
      </div>

      {/* --------------------------------------------------------- controles */}
      <div className="pointer-events-none absolute inset-x-0 bottom-5 z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 sm:px-6">
          <div className="pointer-events-auto flex items-center gap-2" role="tablist">
            {slides.map((slide, slideIndex) => (
              <button
                key={slide.key}
                type="button"
                role="tab"
                aria-selected={index === slideIndex}
                aria-label={slide.label}
                onClick={() => go(slideIndex)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  index === slideIndex ? "w-9 bg-gold" : "w-2.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>

          <div className="pointer-events-auto hidden items-center gap-2 sm:flex">
            <CarouselArrow onClick={prev} label="Oferta anterior">
              <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
            </CarouselArrow>
            <CarouselArrow onClick={next} label="Próxima oferta">
              <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
            </CarouselArrow>
          </div>
        </div>
      </div>
    </section>
  );
};

const Slide = ({
  active,
  tone,
  children,
}: {
  active: boolean;
  tone: "promo" | "navy" | "deep";
  children: React.ReactNode;
}) => {
  const backgrounds = {
    promo: "bg-site-promo",
    navy: "bg-site-contrast",
    deep: "bg-site-contrast-deep",
  };

  return (
    <div
      // `inset-0` empilha os slides; o primeiro fica no fluxo para a seção ter
      // altura própria mesmo antes do JS.
      // `invisible` no slide inativo tira os links dele da ordem de tabulação
      // e da árvore de acessibilidade — só `opacity-0` deixaria botões
      // invisíveis ainda focáveis por teclado.
      className={`inset-0 transition-opacity duration-500 ${backgrounds[tone]} ${
        active ? "relative z-[1] opacity-100" : "absolute invisible opacity-0"
      }`}
      aria-hidden={!active}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.13]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, #fff 0 2px, transparent 2px 26px)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-12 sm:px-6 lg:py-16">
        {children}
      </div>
    </div>
  );
};

const CarouselArrow = ({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition-colors hover:bg-white/20"
  >
    {children}
  </button>
);

const CtaRow = ({ message, label }: { message: string; label: string }) => (
  <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
    <a
      href={whatsappLink(message)}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-whats px-6 py-4 font-display text-base font-bold text-white shadow-[0_18px_36px_-18px_rgba(0,0,0,0.9)] transition-all hover:-translate-y-0.5 hover:bg-whats-dark"
    >
      <WhatsAppIcon className="h-[22px] w-[22px]" />
      {label}
    </a>
    <a
      href="#precos"
      className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/25 px-6 py-4 font-display text-base font-bold text-white transition-colors hover:bg-white/10"
    >
      Ver todos os preços
      <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
    </a>
  </div>
);

const TrustRow = ({ reviews }: { reviews: { rating: number | null; total: number | null } | null }) => (
  <div className="mt-6 flex flex-col gap-2 font-body text-sm text-white/65 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
    {reviews?.rating ? (
      <span className="flex items-center gap-2">
        <Stars className="h-4 w-4" />
        <strong className="font-display font-bold text-white">
          {reviews.rating.toFixed(1).replace(".", ",")}
        </strong>
        {reviews.total ? `em ${reviews.total} avaliações no Google` : "no Google"}
      </span>
    ) : null}
    <span className="flex items-center gap-2">
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
);
