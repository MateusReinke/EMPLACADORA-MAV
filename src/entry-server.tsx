/**
 * Entrada de renderização no servidor, usada só no build.
 *
 * `vite build --ssr` compila este arquivo para `dist-ssr/`, e
 * `scripts/prerender.mjs` importa o resultado para gerar o HTML estático da
 * landing page, o JSON-LD e o sitemap. Nada aqui roda em produção.
 */
import { renderToString } from "react-dom/server";

import LandingPage from "./site/LandingPage";
import { buildAllSchemas } from "./content/schema";
import { SEO, SITE_URL } from "./content/site";

export const render = () => renderToString(<LandingPage />);

export const schemas = () => buildAllSchemas();

export const seo = () => SEO;

export const siteUrl = () => SITE_URL.replace(/\/$/, "");

/** Rotas públicas que entram no sitemap.xml. */
export const publicRoutes = () => [
  { path: "/", changefreq: "weekly", priority: "1.0" },
];
