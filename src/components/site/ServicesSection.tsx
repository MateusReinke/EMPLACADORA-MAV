import { Check } from "lucide-react";

import { SERVICES, whatsappLink } from "@/content/site";
import { Eyebrow, MercosulPlate, SlashMark, WhatsAppIcon } from "./brand";
import { SERVICE_ICONS } from "./icons";

export const ServicesSection = () => {
  const featured = SERVICES.find((service) => service.featured) ?? SERVICES[0];
  const rest = SERVICES.filter((service) => service.id !== featured.id);
  const FeaturedIcon = SERVICE_ICONS[featured.icon];

  return (
    <section id="servicos" className="bg-site-alt py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="max-w-2xl" data-reveal>
          <Eyebrow>Serviços</Eyebrow>
          <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-[-0.015em] text-site-ink sm:text-4xl">
            Tudo o que a MAV resolve pelo seu veículo
          </h2>
          <p className="mt-3 font-body text-site-ink/70">
            Escolha o serviço e fale direto com quem vai executar. Cada atendimento
            começa com a conferência dos documentos — antes de qualquer pagamento.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* Card em destaque: o carro-chefe da MAV ocupa quatro células */}
          <article
            className="group relative flex flex-col overflow-hidden rounded-2xl bg-site-contrast p-7 text-white shadow-mav-plate md:col-span-2 lg:row-span-2 lg:p-9"
            data-reveal
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-mav-blue/25 blur-3xl"
            />

            <div className="relative flex items-center gap-4">
              <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-mav-blue text-white">
                <FeaturedIcon className="h-6 w-6" strokeWidth={2.25} />
              </span>
              <SlashMark tone="white" className="h-3.5 w-10 opacity-60" />
            </div>

            <p className="relative mt-6 font-display text-xs font-bold uppercase tracking-[0.18em] text-mav-blue-soft/80">
              {featured.eyebrow}
            </p>
            <h3 className="relative mt-2 font-display text-2xl font-extrabold leading-tight sm:text-3xl">
              {featured.title}
            </h3>
            <p className="relative mt-3 max-w-md font-body leading-relaxed text-white/75">
              {featured.description}
            </p>

            <ul className="relative mt-6 grid gap-2.5 sm:max-w-md">
              {featured.includes.map((item) => (
                <li key={item} className="flex items-start gap-2.5 font-body text-sm text-white/85">
                  <span className="mt-0.5 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-mav-blue">
                    <Check className="h-3 w-3 text-white" strokeWidth={3.5} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            {/* As etapas ocupam a altura extra do card e adiantam o "como funciona" */}
            <ol className="relative mt-7 space-y-3 border-t border-white/10 pt-6 sm:max-w-md">
              {featured.steps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/25 font-display text-[0.7rem] font-extrabold text-white/80">
                    {index + 1}
                  </span>
                  <p className="font-body text-[0.8125rem] leading-relaxed text-white/65">
                    {step}
                  </p>
                </li>
              ))}
            </ol>

            <div className="relative mt-7 lg:mt-auto lg:pt-8">
              <a
                href={whatsappLink(featured.whatsappMessage)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 rounded-xl bg-whats px-5 py-3.5 font-display text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-whats-dark"
              >
                <WhatsAppIcon className="h-[18px] w-[18px]" />
                Pedir minha primeira via
              </a>
            </div>

            {/* A placa reaparece como assinatura visual, recortada pela borda */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-6 -right-8 hidden w-80 rotate-[-8deg] opacity-30 lg:block"
            >
              <MercosulPlate className="w-full" framed={false} title="" />
            </div>
          </article>

          {rest.map((service) => {
            const Icon = SERVICE_ICONS[service.icon];

            return (
              <article
                key={service.id}
                className="group flex flex-col rounded-2xl border border-site-line bg-site-card p-6 shadow-mav-card transition-all duration-200 hover:-translate-y-1 hover:border-mav-blue/40 hover:shadow-mav-card-hover"
                data-reveal
              >
                <div className="flex items-center gap-4">
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-site-badge text-white transition-colors duration-200 group-hover:bg-mav-blue">
                    <Icon className="h-[22px] w-[22px]" strokeWidth={2.25} />
                  </span>
                  {/* Filete que sangra até a borda do card */}
                  <span aria-hidden="true" className="-mr-6 h-px flex-1 bg-site-line" />
                </div>

                <p className="mt-5 font-display text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-site-accent">
                  {service.eyebrow}
                </p>
                <h3 className="mt-1.5 font-display text-lg font-extrabold leading-snug text-site-ink">
                  {service.title}
                </h3>
                <p className="mt-2.5 font-body text-sm leading-relaxed text-site-ink/70">
                  {service.description}
                </p>

                <ul className="mt-4 grid gap-2">
                  {service.includes.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 font-body text-[0.8125rem] text-site-ink/65"
                    >
                      <span className="mt-[3px] inline-flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full bg-site-accent-soft">
                        <Check className="h-2.5 w-2.5 text-site-accent" strokeWidth={3.5} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>

                <a
                  href={whatsappLink(service.whatsappMessage)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-2 self-start border-b-2 border-transparent pb-0.5 font-display text-sm font-bold text-whats-dark transition-colors hover:border-whats-dark"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  Falar sobre {service.title.toLowerCase()}
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
