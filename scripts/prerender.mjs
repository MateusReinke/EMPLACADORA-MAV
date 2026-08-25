/**
 * Pré-renderização da home pública.
 *
 * O projeto é uma SPA: sem este passo, o HTML servido ao Googlebot é um `<div>`
 * vazio e todo o texto de venda depende de JavaScript para existir. Aqui o
 * mesmo componente React da landing é renderizado para string no build e
 * gravado dentro do `#root`, então o conteúdo principal já chega no HTML
 * inicial — indexável e visível antes do bundle carregar.
 *
 * Saídas em `dist/`:
 *   index.html      → home pré-renderizada (servida em "/" e "/home")
 *   app-shell.html  → shell vazio original, servido nas rotas do painel
 *   sitemap.xml     → gerado a partir das rotas públicas
 *   robots.txt      → recebe a linha `Sitemap:` com o domínio canônico
 *
 * Roda depois de `vite build` e `vite build --ssr` (ver package.json).
 */
import { readFile, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const distDir = path.join(root, "dist");

const { render, siteUrl, publicRoutes } = await import(
  path.join(root, "dist-ssr", "entry-server.js")
);

const SITE_URL = siteUrl();

const shellPath = path.join(distDir, "index.html");
const shell = await readFile(shellPath, "utf8");

// Guarda o shell intocado: as rotas do painel continuam sendo servidas por ele.
await copyFile(shellPath, path.join(distDir, "app-shell.html"));

const appHtml = render();

if (!shell.includes('<div id="root"></div>')) {
  throw new Error(
    'prerender: `<div id="root"></div>` não encontrado no dist/index.html. ' +
      "O index.html mudou de forma? Ajuste este script antes de publicar."
  );
}

const prerendered = shell
  // `data-prerendered` diz ao main.tsx para limpar o container antes de montar
  // o app, e ao CSS para pintar o fundo claro da marca antes do JS.
  .replace("<html", "<html data-prerendered")
  .replace(
    '<div id="root"></div>',
    `<div id="root" data-prerendered="true">${appHtml}</div>`
  );

await writeFile(shellPath, prerendered, "utf8");

// ---------------------------------------------------------------------------
// sitemap.xml + robots.txt
// ---------------------------------------------------------------------------

const lastmod = new Date().toISOString().slice(0, 10);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicRoutes()
  .map(
    (route) => `  <url>
    <loc>${SITE_URL}${route.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

await writeFile(path.join(distDir, "sitemap.xml"), sitemap, "utf8");

const robotsPath = path.join(distDir, "robots.txt");
const robots = await readFile(robotsPath, "utf8");
const robotsWithSitemap = `${robots.replace(/\n*Sitemap:.*$/gm, "").trimEnd()}\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
await writeFile(robotsPath, robotsWithSitemap, "utf8");

console.log(
  `[prerender] home pré-renderizada (${(appHtml.length / 1024).toFixed(1)} kB de HTML), ` +
    `sitemap e robots.txt gerados para ${SITE_URL}`
);
