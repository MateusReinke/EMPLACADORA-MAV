import { BUSINESS, NAV_ITEMS, SERVICES, fullAddress } from "@/content/site";

const currentYear = new Date().getFullYear();

export const SiteFooter = () => (
  <footer className="border-t border-white/10 bg-mav-navy">
    <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6">
      <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <img
            src="/mav-logo-horizontal-branco.svg"
            alt="Logotipo da MAV Emplacamento"
            className="h-14 w-auto"
            width="178"
            height="78"
            loading="lazy"
          />
          <p className="mt-5 max-w-xs font-body text-sm leading-relaxed text-white/60">
            Despachante especializado em Placa Mercosul: primeira via, segunda via,
            veículo 0km, transferência e licenciamento em {BUSINESS.serviceArea}.
          </p>
          <address className="mt-5 not-italic font-body text-sm leading-relaxed text-white/60">
            {fullAddress}
            <br />
            <a
              href={`tel:${BUSINESS.phoneE164}`}
              className="font-display font-bold text-white transition-colors hover:text-gold"
            >
              {BUSINESS.phoneDisplay}
            </a>
          </address>
        </div>

        <nav aria-label="Serviços">
          <h2 className="font-display text-xs font-bold uppercase tracking-[0.16em] text-white/40">
            Serviços
          </h2>
          <ul className="mt-4 space-y-2.5">
            {SERVICES.map((service) => (
              <li key={service.id}>
                <a
                  href="#servicos"
                  className="font-body text-sm text-white/70 transition-colors hover:text-white"
                >
                  {service.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Institucional">
          <h2 className="font-display text-xs font-bold uppercase tracking-[0.16em] text-white/40">
            Navegue
          </h2>
          <ul className="mt-4 space-y-2.5">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="font-body text-sm text-white/70 transition-colors hover:text-white"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={BUSINESS.social.instagram}
                target="_blank"
                rel="noreferrer"
                className="font-body text-sm text-white/70 transition-colors hover:text-white"
              >
                Instagram
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-body text-xs text-white/45">
          © {currentYear} {BUSINESS.name}. Todos os direitos reservados.
        </p>

        {/*
          Área restrita da equipe. Fica discreta no rodapé de propósito: o CTA do
          cliente é o WhatsApp, e o login interno não pode competir com ele.
        */}
        <p className="font-body text-xs text-white/35">
          Área restrita:{" "}
          <a
            href="/login?perfil=colaborador"
            className="underline underline-offset-2 transition-colors hover:text-white/70"
          >
            Colaborador
          </a>
          {" · "}
          <a
            href="/login?perfil=gestao"
            className="underline underline-offset-2 transition-colors hover:text-white/70"
          >
            Vendedor/Admin
          </a>
        </p>
      </div>
    </div>
  </footer>
);
