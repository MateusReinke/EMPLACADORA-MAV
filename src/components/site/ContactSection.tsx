import { Clock, Instagram, Mail, MapPin, Phone } from "lucide-react";

import { BUSINESS, fullAddress, fullAddressWithZip, whatsappLink } from "@/content/site";
import { Eyebrow, IconBadge, WhatsAppIcon } from "./brand";
import { AnimatedIconField } from "./hero/AnimatedIconField";

const CONTACT_WHATSAPP_MESSAGE =
  "Olá! Quero falar com a MAV Emplacamento sobre um serviço.";

/*
 * Com coordenadas cadastradas o pino cai no ponto exato; sem elas, o Google
 * geocodifica o endereço e o pino fica aproximado. O rótulo entre parênteses é
 * o que a API de embed aceita para nomear o marcador.
 */
const MAP_QUERY = encodeURIComponent(
  BUSINESS.geo
    ? `${BUSINESS.geo.latitude},${BUSINESS.geo.longitude}(${BUSINESS.name})`
    : `${BUSINESS.address.street}, ${BUSINESS.address.district}, ${BUSINESS.address.city} - ${BUSINESS.address.state}`
);

const DAY_LABELS: Record<string, string> = {
  Mo: "Seg",
  Tu: "Ter",
  We: "Qua",
  Th: "Qui",
  Fr: "Sex",
  Sa: "Sáb",
  Su: "Dom",
};

const WEEK_ORDER = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

/**
 * "Seg a Sex" em vez de "Seg, Ter, Qua, Qui, Sex" quando os dias são
 * consecutivos — é como as pessoas leem horário de funcionamento.
 */
const formatDays = (days: string[]) => {
  const indexes = days.map((day) => WEEK_ORDER.indexOf(day)).sort((a, b) => a - b);
  const consecutive = indexes.every(
    (value, position) => position === 0 || value === indexes[position - 1] + 1
  );

  if (consecutive && indexes.length > 2) {
    return `${DAY_LABELS[WEEK_ORDER[indexes[0]]]} a ${DAY_LABELS[WEEK_ORDER[indexes[indexes.length - 1]]]}`;
  }

  return indexes.map((index) => DAY_LABELS[WEEK_ORDER[index]]).join(", ");
};

/** Horário cadastrado; enquanto não houver, exibe pendência explícita. */
const OpeningHours = () => {
  if (!BUSINESS.openingHours) {
    return (
      <span className="inline-block rounded border border-dashed border-gold bg-gold/10 px-2 py-1 font-display text-xs font-bold uppercase tracking-wide text-white/80">
        [inserir horário de atendimento real]
      </span>
    );
  }

  return (
    <>
      {BUSINESS.openingHours.map((slot) => (
        <span key={slot.days.join()} className="block">
          {formatDays(slot.days)} · {slot.opens} às {slot.closes}
        </span>
      ))}
    </>
  );
};

export const ContactSection = () => (
  <section id="contato" className="mav-hex relative overflow-hidden bg-site-contrast-deep py-16 sm:py-20">
    <AnimatedIconField variant="docs" />

    <div className="relative mx-auto grid max-w-6xl gap-10 px-5 sm:px-6 lg:grid-cols-2 lg:gap-14">
      <div data-reveal>
        <Eyebrow tone="white">Contato</Eyebrow>
        <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-[-0.015em] text-white sm:text-4xl">
          Venha até a loja ou resolva pelo WhatsApp
        </h2>
        <p className="mt-3 max-w-md font-body leading-relaxed text-white/65">
          Estamos na {BUSINESS.address.district}, zona sul de {BUSINESS.address.city}.
          O pedido inteiro é combinado pelo WhatsApp — você vem à loja uma vez só,
          no horário que agendar, para retirar a placa ou instalar na hora.
        </p>

        <a
          href={whatsappLink(CONTACT_WHATSAPP_MESSAGE)}
          target="_blank"
          rel="noreferrer"
          className="mt-7 inline-flex items-center gap-2.5 rounded-xl bg-whats px-6 py-4 font-display text-base font-bold text-white shadow-[0_18px_36px_-18px_rgba(37,211,102,0.95)] transition-all hover:-translate-y-0.5 hover:bg-whats-dark"
        >
          <WhatsAppIcon className="h-[22px] w-[22px]" />
          Falar no WhatsApp agora
        </a>

        <dl className="mt-9 space-y-6">
          <div className="flex gap-4">
            <IconBadge tone="blue" size="sm" className="ring-0">
              <MapPin className="h-[18px] w-[18px]" strokeWidth={2.5} />
            </IconBadge>
            <div>
              <dt className="font-display text-xs font-bold uppercase tracking-[0.14em] text-white/45">
                Endereço
              </dt>
              <dd className="mt-1 font-body text-[0.9375rem] text-white/85">
                <address className="not-italic">{fullAddressWithZip}</address>
              </dd>
            </div>
          </div>

          <div className="flex gap-4">
            <IconBadge tone="blue" size="sm" className="ring-0">
              <Phone className="h-[18px] w-[18px]" strokeWidth={2.5} />
            </IconBadge>
            <div>
              <dt className="font-display text-xs font-bold uppercase tracking-[0.14em] text-white/45">
                Telefone e WhatsApp
              </dt>
              <dd className="mt-1 font-body text-[0.9375rem] text-white/85">
                <a
                  href={`tel:${BUSINESS.phoneE164}`}
                  className="font-display font-bold transition-colors hover:text-gold"
                >
                  {BUSINESS.phoneDisplay}
                </a>
              </dd>
            </div>
          </div>

          {BUSINESS.email && (
            <div className="flex gap-4">
              <IconBadge tone="blue" size="sm" className="ring-0">
                <Mail className="h-[18px] w-[18px]" strokeWidth={2.5} />
              </IconBadge>
              <div className="min-w-0">
                <dt className="font-display text-xs font-bold uppercase tracking-[0.14em] text-white/45">
                  E-mail
                </dt>
                <dd className="mt-1 font-body text-[0.9375rem] text-white/85">
                  <a
                    href={`mailto:${BUSINESS.email}`}
                    className="break-all font-display font-bold transition-colors hover:text-gold"
                  >
                    {BUSINESS.email}
                  </a>
                </dd>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <IconBadge tone="blue" size="sm" className="ring-0">
              <Clock className="h-[18px] w-[18px]" strokeWidth={2.5} />
            </IconBadge>
            <div>
              <dt className="font-display text-xs font-bold uppercase tracking-[0.14em] text-white/45">
                Horário de atendimento
              </dt>
              <dd className="mt-1 font-body text-[0.9375rem] text-white/85">
                <OpeningHours />
              </dd>
            </div>
          </div>

          <div className="flex gap-4">
            <IconBadge tone="blue" size="sm" className="ring-0">
              <Instagram className="h-[18px] w-[18px]" strokeWidth={2.5} />
            </IconBadge>
            <div>
              <dt className="font-display text-xs font-bold uppercase tracking-[0.14em] text-white/45">
                Redes sociais
              </dt>
              <dd className="mt-1 font-body text-[0.9375rem] text-white/85">
                <a
                  href={BUSINESS.social.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="font-display font-bold transition-colors hover:text-gold"
                >
                  @mavemplacamento
                </a>
              </dd>
            </div>
          </div>
        </dl>
      </div>

      <div data-reveal>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-2">
          <iframe
            title={`Mapa com a localização da ${BUSINESS.name} na ${fullAddress}`}
            src={`https://www.google.com/maps?q=${MAP_QUERY}&hl=pt-BR&z=17&output=embed`}
            className="h-[340px] w-full rounded-xl border-0 sm:h-[440px] lg:h-[520px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
        <p className="mt-3 font-body text-xs text-white/45">
          Estacionamento e acesso podem variar pelo horário — se tiver dúvida,
          chame no WhatsApp antes de sair.
        </p>
      </div>
    </div>
  </section>
);
