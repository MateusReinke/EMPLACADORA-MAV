
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";
import path from "path";
import { componentTagger } from "lovable-tagger";

import { buildAllSchemas } from "./src/content/schema";

/**
 * Domínio canônico do site. Enquanto a MAV não migrar para domínio próprio,
 * defina `VITE_SITE_URL` no build para apontar ao endereço realmente publicado
 * — canonical, Open Graph, JSON-LD e sitemap saem todos daqui.
 */
const SITE_URL = (process.env.VITE_SITE_URL || "https://www.mavemplacamento.com.br")
  .replace(/\/+$/, "");

/**
 * Resolve `%SITE_URL%` no index.html e injeta os dados estruturados gerados a
 * partir de `src/content/site.ts`. Fazer isso no build evita manter uma cópia
 * do JSON-LD escrita à mão, que sairia do ar assim que o conteúdo mudasse.
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

      return html
        .replace(/%SITE_URL%/g, SITE_URL)
        .replace("</head>", `${jsonLd}\n  </head>`);
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
