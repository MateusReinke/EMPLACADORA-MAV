/**
 * Dados estruturados (JSON-LD) gerados a partir de `site.ts`.
 *
 * Blocos opcionais — `geo`, `openingHoursSpecification`, `aggregateRating` —
 * só entram no JSON quando existe dado real cadastrado. Publicar avaliação ou
 * horário inventado viola as diretrizes de dados estruturados do Google e pode
 * custar a elegibilidade dos rich results do negócio.
 */

import { BUSINESS, FAQS, PLATE_PRICES, SEO, SERVICES, SITE_URL } from "./site";

const absolute = (path: string) => `${SITE_URL.replace(/\/$/, "")}${path}`;

export const buildLocalBusinessSchema = () => {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "AutomotiveBusiness",
    "@id": `${SITE_URL}#business`,
    name: BUSINESS.name,
    alternateName: `${BUSINESS.name} — ${BUSINESS.tagline}`,
    description: SEO.description,
    url: SITE_URL,
    telephone: BUSINESS.phoneE164,
    ...(BUSINESS.email ? { email: BUSINESS.email } : {}),
    image: absolute(SEO.ogImage),
    logo: absolute("/mav-emplacamento-logo.svg"),
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.address.street,
      addressLocality: BUSINESS.address.city,
      addressRegion: BUSINESS.address.state,
      addressCountry: BUSINESS.address.country,
      ...(BUSINESS.address.postalCode
        ? { postalCode: BUSINESS.address.postalCode }
        : {}),
    },
    areaServed: {
      "@type": "City",
      name: BUSINESS.address.city,
    },
    sameAs: [BUSINESS.social.instagram],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Serviços de emplacamento e documentação veicular",
      itemListElement: [
        // Placas: têm preço público, então a oferta carrega o valor.
        ...PLATE_PRICES.map((item) => ({
          "@type": "Offer",
          name: `Placa Mercosul — ${item.label}`,
          price: item.price.toFixed(2),
          priceCurrency: "BRL",
          availability: "https://schema.org/InStock",
          itemOffered: {
            "@type": "Product",
            name: `Placa Mercosul para ${item.label.toLowerCase()}`,
            description: item.description,
          },
        })),
        // Serviços: o valor depende de taxas e do caso, então vai sem preço.
        ...SERVICES.map((service) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: service.title,
            description: service.description,
          },
        })),
      ],
    },
  };

  if (BUSINESS.geo) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: BUSINESS.geo.latitude,
      longitude: BUSINESS.geo.longitude,
    };
  }

  if (BUSINESS.openingHours) {
    schema.openingHoursSpecification = BUSINESS.openingHours.map((slot) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: slot.days,
      opens: slot.opens,
      closes: slot.closes,
    }));
  }

  if (BUSINESS.aggregateRating) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: BUSINESS.aggregateRating.ratingValue,
      reviewCount: BUSINESS.aggregateRating.reviewCount,
    };
  }

  return schema;
};

export const buildFaqSchema = () => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
});

export const buildWebSiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}#website`,
  url: SITE_URL,
  name: BUSINESS.name,
  inLanguage: "pt-BR",
  publisher: { "@id": `${SITE_URL}#business` },
});

export const buildAllSchemas = () => [
  buildLocalBusinessSchema(),
  buildWebSiteSchema(),
  buildFaqSchema(),
];
