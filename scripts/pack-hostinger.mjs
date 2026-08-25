/**
 * Monta o pacote de upload para hospedagem compartilhada (Hostinger).
 *
 * Roda depois do build normal e acrescenta ao `dist/` os arquivos que só fazem
 * sentido em Apache + PHP: o `.htaccess` (fallback da SPA, cache, HTTPS) e o
 * proxy das avaliações do Google. No deploy em Node esses arquivos não entram —
 * lá quem faz o mesmo papel é o server.js.
 *
 * Uso: npm run build:hostinger
 */
import { cp, access, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(root, "dist");
const sourceDir = path.join(root, "deploy", "hostinger");

const exists = (target) =>
  access(target).then(
    () => true,
    () => false
  );

if (!(await exists(distDir))) {
  console.error("[hostinger] dist/ não existe. Rode `npm run build` antes.");
  process.exit(1);
}

await cp(path.join(sourceDir, ".htaccess"), path.join(distDir, ".htaccess"));
await cp(path.join(sourceDir, "api"), path.join(distDir, "api"), { recursive: true });

const files = await readdir(distDir);

console.log(`
[hostinger] pacote pronto em dist/

  ${files.filter((f) => !f.startsWith(".")).slice(0, 8).join("  ")}${files.length > 8 ? "  …" : ""}
  .htaccess          fallback da SPA, HTTPS e cache
  api/               proxy das avaliações do Google

Próximos passos:
  1. envie TODO o conteúdo de dist/ para public_html (inclusive o .htaccess,
     que fica oculto no gerenciador de arquivos — ative "mostrar ocultos");
  2. crie public_html/api/config.php a partir de config.example.php;
  3. abra https://seudominio.com.br/api/google-reviews.php para conferir.

Detalhes em docs/DEPLOY_HOSTINGER.md
`);
