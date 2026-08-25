import { whatsappLink } from "@/content/site";
import { WhatsAppIcon } from "./brand";

const FAB_MESSAGE = "Olá! Vim pelo site da MAV e quero falar sobre emplacamento.";

/** Botão fixo de WhatsApp — o atalho de conversão presente em toda a página. */
export const WhatsAppFab = () => (
  <a
    href={whatsappLink(FAB_MESSAGE)}
    target="_blank"
    rel="noreferrer"
    aria-label="Falar com a MAV Emplacamento no WhatsApp"
    className="group fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center gap-2 overflow-hidden rounded-full bg-whats text-white shadow-[0_14px_30px_-8px_rgba(37,211,102,0.7)] transition-all duration-300 hover:bg-whats-dark sm:bottom-6 sm:right-6 sm:hover:w-[196px] sm:hover:rounded-2xl sm:hover:pl-4 sm:hover:pr-5"
  >
    <WhatsAppIcon className="h-7 w-7 shrink-0 sm:group-hover:h-6 sm:group-hover:w-6" />
    <span className="hidden whitespace-nowrap font-display text-sm font-bold sm:group-hover:inline">
      Falar no WhatsApp
    </span>
  </a>
);
