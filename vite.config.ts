
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";
import path from "path";
import { componentTagger } from "lovable-tagger";

import { buildAllSchemas } from "./src/content/schema";
import { SEO } from "./src/content/site";

/**
 * Domínio canônico do site — canonical, Open Graph, JSON-LD e sitemap saem
 * todos daqui. O padrão é o domínio da MAV sem `www`, que é como ele aparece no
 * painel da Hostinger. Se a hospedagem redirecionar para `www`, sobrescreva com
 * `VITE_SITE_URL` no build: o canonical precisa apontar para o endereço que o
 * visitante realmente acessa, senão o Google indexa uma URL que só redireciona.
 */
const SITE_URL = (process.env.VITE_SITE_URL || "https://mavemplacamento.com.br")
  .replace(/\/+$/, "");

/** Escapa para uso dentro de um atributo HTML (`content="..."`). */
const attr = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Resolve os placeholders do index.html e injeta os dados estruturados, tudo a
 * partir de `src/content/site.ts`. Fazer isso no build evita manter título,
 * descrição e JSON-LD escritos à mão numa segunda cópia, que sairia do ar
 * assim que o conteúdo mudasse.
 */
const seoHtmlPlugin = (): Plugin => ({
  name: "mav-seo-html",
  transformIndexHtml: {
    order: "pre",
    handler(html) {
      const jsonLd = buildAllSchemas()
        .map(
          (schema) =>
            `    <script type="application/ld+json">${JSON.stringify(schema)}</script>`
        )
        .join("\n");

      const tokens: Record<string, string> = {
        "%SITE_URL%": SITE_URL,
        "%SEO_TITLE%": attr(SEO.title),
        "%SEO_DESCRIPTION%": attr(SEO.description),
        "%SEO_OG_TITLE%": attr(SEO.ogTitle),
        "%SEO_OG_DESCRIPTION%": attr(SEO.ogDescription),
        "%SEO_OG_IMAGE%": SEO.ogImage,
        "%SEO_OG_IMAGE_ALT%": attr(SEO.ogImageAlt),
      };

      const resolved = Object.entries(tokens).reduce(
        (acc, [token, value]) => acc.split(token).join(value),
        html
      );

      return resolved.replace("</head>", `${jsonLd}\n  </head>`);
    },
  },
});

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8090,
  },
  define: {
    // Mantém app, JSON-LD e sitemap apontando para o mesmo domínio.
    "import.meta.env.VITE_SITE_URL": JSON.stringify(SITE_URL),
  },
  plugins: [
    react(),
    svgr(),
    seoHtmlPlugin(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ["lucide-react"],
  },
}));
