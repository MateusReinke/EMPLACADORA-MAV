import { Plus } from "lucide-react";

import { FAQS, whatsappLink } from "@/content/site";
import { Eyebrow, WhatsAppIcon } from "./brand";

const FAQ_WHATSAPP_MESSAGE =
  "Olá! Tenho uma dúvida sobre emplacamento que não estava no site.";

/**
 * Perguntas frequentes em `<details>` nativo: a resposta já vem no HTML (bom
 * para indexação e para o schema FAQPage) e o bloco funciona mesmo sem JS.
 */
export const FaqSection = () => (
  <section id="faq" className="bg-mav-surface py-16 sm:py-24">
    <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
      <div data-reveal>
        <Eyebrow>Dúvidas frequentes</Eyebrow>
        <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-[-0.015em] text-mav-navy sm:text-4xl">
          O que todo mundo pergunta antes de emplacar
        </h2>
        <p className="mt-3 font-body text-mav-navy/70">
          Se a sua dúvida não estiver aqui, é só chamar no WhatsApp — a gente
          responde sem enrolação.
        </p>

        <a
          href={whatsappLink(FAQ_WHATSAPP_MESSAGE)}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2.5 rounded-xl bg-whats px-5 py-3.5 font-display text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-whats-dark"
        >
          <WhatsAppIcon className="h-[18px] w-[18px]" />
          Tirar minha dúvida
        </a>
      </div>

      <div className="divide-y divide-mav-line overflow-hidden rounded-2xl border border-mav-line bg-white">
        {FAQS.map((faq, index) => (
          // A primeira já nasce aberta: mostra o padrão de interação e entrega
          // a resposta mais buscada sem exigir um clique.
          <details key={faq.question} className="group" open={index === 0} data-reveal>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 font-display text-base font-bold text-mav-navy transition-colors hover:text-mav-blue sm:px-6 [&::-webkit-details-marker]:hidden">
              <h3 className="font-display text-base font-bold">{faq.question}</h3>
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mav-blue-soft text-mav-blue transition-transform duration-200 group-open:rotate-45">
                <Plus className="h-4 w-4" strokeWidth={3} />
              </span>
            </summary>
            <p className="animate-answer-in px-5 pb-5 font-body text-[0.9375rem] leading-relaxed text-mav-navy/70 sm:px-6">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </div>
  </section>
);
