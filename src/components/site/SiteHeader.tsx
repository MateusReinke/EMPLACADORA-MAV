import { useEffect, useState } from "react";
import { MapPin, Menu, Phone, X } from "lucide-react";

import { BUSINESS, NAV_ITEMS, fullAddress, whatsappLink } from "@/content/site";
import { WhatsAppIcon } from "./brand";
import { ThemeToggle } from "./ThemeToggle";

const HEADER_WHATSAPP_MESSAGE =
  "Olá! Vim pelo site da MAV e quero falar sobre emplacamento.";

export const SiteHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Um menu aberto em mobile não pode sobreviver ao giro para desktop.
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header className="sticky top-0 z-40">
      {/* Barra de contato: telefone e endereço como texto real, bom para SEO local */}
      <div className="hidden bg-site-contrast text-white lg:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-2 text-[0.8125rem]">
          <p className="flex items-center gap-2 text-white/80">
            <MapPin className="h-3.5 w-3.5 text-site-accent" strokeWidth={2.5} />
            <span>{fullAddress}</span>
          </p>
          <a
            href={`tel:${BUSINESS.phoneE164}`}
            className="flex items-center gap-2 font-semibold text-white transition-colors hover:text-gold"
          >
            <Phone className="h-3.5 w-3.5" strokeWidth={2.5} />
            {BUSINESS.phoneDisplay}
          </a>
        </div>
      </div>

      <div
        className={`border-b bg-site-bg transition-shadow duration-200 ${
          scrolled ? "border-site-line shadow-[0_10px_30px_-24px_rgba(10,31,68,0.6)]" : "border-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-6">
          <a href="#topo" className="flex items-center gap-3" aria-label={`${BUSINESS.name} — página inicial`}>
            {/* Duas artes, alternadas por CSS: a versão navy some no fundo escuro */}
            <img
              src="/mav-logo-horizontal.svg"
              alt="Logotipo da MAV Emplacamento"
              className="h-10 w-auto sm:h-11 [html[data-site-theme='dark']_&]:hidden"
              width="178"
              height="78"
            />
            <img
              src="/mav-logo-horizontal-branco.svg"
              alt=""
              aria-hidden="true"
              className="hidden h-10 w-auto sm:h-11 [html[data-site-theme='dark']_&]:block"
              width="178"
              height="78"
            />
          </a>

          <nav className="hidden items-center gap-1 xl:flex" aria-label="Navegação principal">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 font-display text-sm font-semibold text-site-ink/75 transition-colors hover:bg-site-accent-soft hover:text-site-accent"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <a
              href={whatsappLink(HEADER_WHATSAPP_MESSAGE)}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-2 rounded-lg bg-whats px-4 py-2.5 font-display text-sm font-bold text-white shadow-[0_10px_24px_-12px_rgba(37,211,102,0.9)] transition-all hover:-translate-y-0.5 hover:bg-whats-dark sm:inline-flex"
            >
              <WhatsAppIcon className="h-[18px] w-[18px]" />
              Falar no WhatsApp
            </a>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-site-line text-site-ink transition-colors hover:bg-site-alt xl:hidden"
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              aria-controls="menu-mobile"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div id="menu-mobile" className="border-t border-site-line bg-site-bg px-5 pb-5 pt-2 xl:hidden">
            <nav className="flex flex-col" aria-label="Navegação principal (mobile)">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="border-b border-site-line/70 py-3 font-display text-base font-semibold text-site-ink last:border-0"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <a
              href={`tel:${BUSINESS.phoneE164}`}
              className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-site-line py-3 font-display font-bold text-site-ink"
            >
              <Phone className="h-4 w-4 text-site-accent" strokeWidth={2.5} />
              {BUSINESS.phoneDisplay}
            </a>
          </div>
        )}
      </div>
    </header>
  );
};
