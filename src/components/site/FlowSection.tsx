import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

import { FLOW_SUMMARY, SERVICES, whatsappLink } from "@/content/site";
import { Eyebrow, WhatsAppIcon } from "./brand";
import { SERVICE_ICONS } from "./icons";

/**
 * "Como funciona" — mantém o seletor de fluxo de atendimento que já existia
 * (lista de serviços à esquerda, etapas do serviço escolhido à direita), agora
 * com a identidade da marca e a linguagem virada para o cliente final, não para
 * o operador interno.
 */
export const FlowSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = SERVICES[activeIndex];
  const ActiveIcon = SERVICE_ICONS[active.icon];

  return (
    <section id="como-funciona" className="bg-site-bg py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="max-w-2xl" data-reveal>
          <Eyebrow>Como funciona</Eyebrow>
          <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-[-0.015em] text-site-ink sm:text-4xl">
            Três etapas, do WhatsApp à placa instalada
          </h2>
          <p className="mt-3 font-body text-site-ink/70">
            O mesmo caminho para qualquer serviço. Você acompanha cada etapa e só
            paga taxa depois que a documentação está conferida.
          </p>
        </div>

        {/* Resumo em três etapas, com o trilho ligando os números */}
        <ol className="relative mt-10 grid gap-8 md:grid-cols-3 md:gap-6">
          <span
            aria-hidden="true"
            className="absolute left-0 right-0 top-6 hidden h-0.5 bg-gradient-to-r from-mav-blue via-mav-blue/40 to-transparent md:block"
          />
          {FLOW_SUMMARY.map((step, index) => (
            <li key={step.title} className="relative md:pr-6" data-reveal>
              <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-mav-blue font-display text-lg font-extrabold text-white ring-8 ring-site-bg">
                {index + 1}
              </span>
              <h3 className="mt-4 font-display text-lg font-extrabold text-site-ink">
                {step.title}
              </h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-site-ink/70">
                {step.description}
              </p>
            </li>
          ))}
        </ol>

        {/* Seletor de fluxo por serviço */}
        <div className="mt-14 overflow-hidden rounded-3xl border border-site-line bg-site-alt" data-reveal>
          <div className="border-b border-site-line bg-site-card px-5 py-4 sm:px-7">
            <p className="font-display text-sm font-bold uppercase tracking-[0.14em] text-site-ink/60">
              Fluxo de atendimento por serviço
            </p>
          </div>

          <div className="grid lg:grid-cols-[0.4fr_0.6fr]">
            {/* Lista de serviços: chips roláveis no mobile, lista vertical no desktop */}
            <div
              className="flex gap-2 overflow-x-auto border-b border-site-line p-4 lg:flex-col lg:overflow-visible lg:border-b-0 lg:border-r lg:p-5"
              role="tablist"
              aria-label="Escolha o serviço para ver o fluxo"
            >
              {SERVICES.map((service, index) => {
                const Icon = SERVICE_ICONS[service.icon];
                const isActive = index === activeIndex;

                return (
                  <button
                    key={service.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveIndex(index)}
                    className={`flex min-w-[220px] items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200 lg:min-w-0 lg:w-full ${
                      isActive
                        ? "border-mav-blue bg-site-card shadow-mav-card"
                        : "border-transparent bg-site-card/60 hover:border-site-line hover:bg-site-card"
                    }`}
                  >
                    <span
                      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                        isActive ? "bg-mav-blue text-white" : "bg-site-ink/10 text-site-ink"
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px]" strokeWidth={2.25} />
                    </span>
                    <span className="min-w-0">
                      <span
                        className={`block truncate font-display text-sm font-bold ${
                          isActive ? "text-site-accent" : "text-site-ink"
                        }`}
                      >
                        {service.title}
                      </span>
                      <span className="block truncate font-body text-xs text-site-ink/50">
                        {service.eyebrow}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Painel do serviço selecionado */}
            <div key={active.id} className="animate-answer-in bg-site-card p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-site-badge text-white">
                  <ActiveIcon className="h-5 w-5" strokeWidth={2.25} />
                </span>
                <div>
                  <p className="font-display text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-site-accent">
                    {active.eyebrow}
                  </p>
                  <h3 className="font-display text-xl font-extrabold leading-tight text-site-ink">
                    {active.title}
                  </h3>
                </div>
              </div>

              <ol className="mt-7 space-y-0">
                {active.steps.map((step, index) => (
                  <li key={step} className="relative flex gap-4 pb-6 last:pb-0">
                    {index < active.steps.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="absolute left-[15px] top-9 h-[calc(100%-1.5rem)] w-0.5 bg-site-line"
                      />
                    )}
                    <span className="relative z-[1] inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-mav-blue bg-site-card font-display text-sm font-extrabold text-site-accent">
                      {index + 1}
                    </span>
                    <p className="pt-1 font-body text-sm leading-relaxed text-site-ink/75">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>

              <ul className="mt-6 flex flex-wrap gap-2 border-t border-site-line pt-5">
                {active.includes.map((item) => (
                  <li
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-site-accent-soft px-2.5 py-1.5 font-body text-xs font-medium text-site-ink/75"
                  >
                    <Check className="h-3 w-3 text-site-accent" strokeWidth={3.5} />
                    {item}
                  </li>
                ))}
              </ul>

              <a
                href={whatsappLink(active.whatsappMessage)}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2.5 rounded-xl bg-whats px-5 py-3.5 font-display text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-whats-dark"
              >
                <WhatsAppIcon className="h-[18px] w-[18px]" />
                Começar {active.title.toLowerCase()}
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
