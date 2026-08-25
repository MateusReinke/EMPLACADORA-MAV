# Site público — MAV Emplacamento

Guia rápido para manter a landing page (`/`) sem precisar mexer em componente.

## Onde fica cada coisa

| Arquivo | O que controla |
| --- | --- |
| `src/content/site.ts` | **Todo o conteúdo**: dados do negócio, serviços, pilares, FAQ, depoimentos, números. Fonte única — a página, o JSON-LD e o sitemap saem daqui. |
| `src/content/schema.ts` | Geração do JSON-LD (`AutomotiveBusiness`, `WebSite`, `FAQPage`) a partir do arquivo acima. |
| `src/site/LandingPage.tsx` | Montagem das seções. |
| `src/components/site/` | Componentes de cada seção. |
| `index.html` | Estrutura do `<head>`. Título, descrição e Open Graph vêm de `SEO` em `site.ts` por placeholders `%SEO_*%` resolvidos no build — não edite os textos aqui. |
| `scripts/generate_og_image.py` | Gera `public/og-mav-emplacamento.jpg` (preview de link no WhatsApp/Instagram). |
| `deploy/hostinger/` | `.htaccess` e proxy PHP das avaliações, para hospedagem compartilhada. |

## Pendências de conteúdo real

Estes campos estão como `null` em `src/content/site.ts` **de propósito**. Enquanto
estiverem nulos, a página mostra um marcador amarelo tracejado e o JSON-LD omite o
bloco correspondente — em vez de publicar um dado inventado, que violaria as
diretrizes de dados estruturados do Google e derrubaria a confiança do visitante.

| Campo | O que preencher |
| --- | --- |
| `BUSINESS.openingHours` | Horário real de atendimento. Ex.: `[{ days: ["Mo","Tu","We","Th","Fr"], opens: "09:00", closes: "18:00" }]` |
| `BUSINESS.geo` | Latitude/longitude reais (pegue no Google Maps: clique com o botão direito no ponto → coordenadas). |
| `BUSINESS.address.postalCode` | CEP da unidade. |
| `BUSINESS.email` | E-mail comercial, se houver. |

Depoimentos e nota de avaliação **não** são mais preenchidos à mão: vêm ao vivo
do Google. Configure a chave e o Place ID conforme `docs/DEPLOY_HOSTINGER.md` e a
seção de avaliações aparece sozinha — sem chave, ela simplesmente não é
renderizada.

`BUSINESS.aggregateRating` continua existindo, mas deixe em `null`: o Google não
aceita que você marque no seu próprio JSON-LD as avaliações coletadas na ficha do
Google. As avaliações aparecem na página; o `aggregateRating` do schema fica para
avaliações coletadas pelo próprio site, se um dia houver.

Também vale substituir os visuais por fotografia real quando a MAV enviar: fotos da
loja, da equipe e de placas instaladas. Hoje o site usa a placa Mercosul desenhada em
SVG — nítida em qualquer tela e sem custo de download.

## Preços

`PLATE_PRICES`, em `src/content/site.ts`, controla a seção de preços, as
mensagens do WhatsApp com o valor citado, a meta description e as ofertas do
JSON-LD. Mudou o preço, muda só ali:

```ts
{ id: "carro", price: 140, priceFrom: 179, ... }  // priceFrom: null tira o "de/por"
```

## Domínio

O canonical, o Open Graph, o JSON-LD e o sitemap usam `VITE_SITE_URL`.
Enquanto não houver domínio próprio, aponte para o endereço realmente publicado:

```bash
VITE_SITE_URL=https://seu-endereco-atual.com npm run build
```

**Recomendação:** migrar para domínio próprio (ex.: `mavemplacamento.com.br`).
Um domínio da marca concentra a autoridade de SEO local, aparece melhor no
compartilhamento por WhatsApp e passa mais confiança do que um subdomínio de
plataforma. Depois de migrar, cadastre o site no Google Search Console e no
Google Meu Negócio com o mesmo endereço e telefone que estão na página.

## Build

```bash
npm run build     # vite build + bundle SSR + pré-renderização
```

O passo de pré-renderização (`scripts/prerender.mjs`) gera:

- `dist/index.html` — home com o HTML já renderizado (o texto existe antes do JS);
- `dist/app-shell.html` — shell vazio usado pelas rotas do painel;
- `dist/sitemap.xml` e a linha `Sitemap:` no `robots.txt`.

Isso existe porque o projeto é uma SPA: sem esse passo, o Googlebot recebe um
`<div>` vazio e todo o texto de venda depende de JavaScript para existir.

## Área restrita

Os logins de colaborador e vendedor/admin ficam discretos no rodapé, em
`/login?perfil=colaborador` e `/login?perfil=gestao`. Não devem competir com o CTA
de WhatsApp: quem chega pelo Google é cliente, não operador.
