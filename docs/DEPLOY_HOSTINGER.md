# Publicar o site na Hostinger

Situação: o plano é **Business Web Hosting** (hospedagem compartilhada), o
domínio é **mavemplacamento.com.br** e hoje existe um WordPress instalado que
vai ser substituído — não há site em produção para preservar.

> **O que roda e o que não roda aqui.** Este repositório tem duas coisas: o
> *site público* (a landing page), que é HTML/CSS/JS estático e roda em qualquer
> lugar; e o *painel interno* (login de colaborador, vendedor e admin, pedidos,
> estoque), que precisa de **Node.js + PostgreSQL**. Hospedagem compartilhada
> tem PHP e MySQL, não tem Node nem Postgres. Então: o site vai ao ar agora, o
> painel continua fora até existir uma VPS. As rotas `/login`, `/admin/*`,
> `/seller/*` e `/client/*` vão abrir a interface, mas nenhuma chamada de API
> vai responder — por isso elas estão bloqueadas no `robots.txt`.

---

## Parte 1 — Limpar o WordPress

Você confirmou que nada está no ar, então é remoção mesmo, não migração.

1. **hPanel → WordPress → Painel de controle**: anote se existe algum conteúdo
   que valha guardar (textos, imagens). Se houver, baixe antes.
2. **hPanel → Arquivos → Backups**: crie um backup manual. Custa um clique e é a
   sua rede de segurança se alguém lembrar de algo depois.
3. **hPanel → Arquivos → Gerenciador de Arquivos → `public_html`**: selecione
   tudo e apague. Ative "Mostrar arquivos ocultos" antes — o `.htaccess` do
   WordPress fica escondido e, se ele sobrar, briga com o nosso.
4. **hPanel → Bancos de dados → MySQL**: apague o banco do WordPress. Sem ele, os
   16 GB de disco e boa parte dos 150 mil inodes são liberados.
5. Abra `https://mavemplacamento.com.br`. Deve dar erro 403 ou uma página vazia
   — sinal de que `public_html` está limpo.

Com o WordPress fora, as 69 vulnerabilidades e os 23 plugins desatualizados
deixam de existir. O site novo não tem plugin, banco nem área de administração
exposta: são arquivos estáticos e um único `.php` de 100 linhas.

---

## Parte 2 — Configurar domínio, SSL e PHP

1. **Domínios**: confirme que `mavemplacamento.com.br` aponta para esta
   hospedagem. Repare em **qual versão é a principal**, com ou sem `www` — você
   vai precisar disso no passo seguinte.
2. **Segurança → SSL**: instale o certificado gratuito e ative "Forçar HTTPS".
3. **Avançado → Versão do PHP**: mantenha 8.2 (é o que já está) e confirme que a
   extensão **cURL** está ativa — é o que o proxy das avaliações usa.

### A questão do `www`

O build embute o endereço do site no canonical, no Open Graph, no JSON-LD e no
sitemap. Ele precisa ser **o endereço que o visitante realmente acessa**, senão o
Google indexa uma URL que só redireciona.

O padrão do projeto é `https://mavemplacamento.com.br` (sem `www`), que é como
o domínio aparece no seu painel. Se a Hostinger estiver redirecionando para
`www`, use `https://www.mavemplacamento.com.br` nos passos seguintes.

---

## Parte 3 — Publicar

Duas formas. A automática é melhor para o dia a dia; a manual serve para a
primeira vez e para emergência.

### Opção A — automática, pelo GitHub (recomendada)

O repositório já tem o workflow `.github/workflows/deploy-hostinger.yml`. Ele
gera o site e envia por FTP. **Não dispara sozinho em push** — publicar é sempre
uma decisão sua, num botão.

**Configuração, uma vez só:**

1. **hPanel → Arquivos → Contas FTP**: crie uma conta FTP. Anote host, usuário e
   senha.
2. No GitHub: **Settings → Secrets and variables → Actions**.
   Em **Secrets**, crie:
   | Nome | Valor |
   | --- | --- |
   | `FTP_SERVER` | o host FTP do hPanel (ex.: `ftp.mavemplacamento.com.br`) |
   | `FTP_USERNAME` | usuário FTP |
   | `FTP_PASSWORD` | senha do usuário FTP |

   Em **Variables**, crie:
   | Nome | Valor |
   | --- | --- |
   | `SITE_URL` | `https://mavemplacamento.com.br` (ou com `www`, conforme a Parte 2) |

**Para publicar:** aba **Actions** → **Publicar site (Hostinger)** → **Run
workflow** → digite `publicar` → Run.

O workflow instala as dependências, gera o site, **confere** que o HTML
pré-renderizado, o `.htaccess` e o `sitemap.xml` saíram certos (build quebrado
não sobe) e envia para `public_html`. Ele preserva o `api/config.php` do
servidor: sem essa exclusão, cada publicação apagaria sua chave do Google.

### Opção B — manual

Na sua máquina, com Node 20+:

```bash
npm install
VITE_SITE_URL=https://mavemplacamento.com.br npm run build:hostinger
```

Isso gera a pasta `dist/`:

```
dist/
├── index.html          ← home já renderizada (o texto existe antes do JS)
├── app-shell.html      ← shell vazio para as rotas do painel
├── .htaccess           ← rotas, HTTPS, cache e compressão
├── robots.txt
├── sitemap.xml
├── og-mav-emplacamento.jpg
├── assets/             ← JS e CSS com hash no nome
└── api/
    ├── google-reviews.php
    └── config.example.php
```

Compacte **o conteúdo** de `dist/` (não a pasta) em um `.zip`, envie para
`public_html` pelo Gerenciador de Arquivos e extraia ali.

> ⚠️ O `.htaccess` começa com ponto e fica oculto. Ative "Mostrar arquivos
> ocultos" e confirme que ele chegou. Sem ele o site abre, mas as rotas e o
> cache não funcionam.

---

## Parte 4 — Avaliações do Google

Opcional. Sem isso o site funciona normalmente — a seção de avaliações apenas
não aparece, e o selo do topo mostra "Padrão Mercosul oficial" no lugar da nota.

1. **Place ID**: pegue em
   <https://developers.google.com/maps/documentation/places/web-service/place-id>,
   buscando "MAV Emplacamento". Começa com `ChIJ`.
2. **Chave de API**: <https://console.cloud.google.com> → novo projeto → ative a
   **Places API (New)** → Credenciais → Criar chave de API. Nas restrições,
   limite a chave à Places API. **Não** restrinja por referrer HTTP: quem chama o
   Google é o servidor, não o navegador.
3. No servidor, crie `public_html/api/config.php` copiando o
   `config.example.php` que já está lá, e preencha `api_key` e `place_id`.
4. Teste abrindo `https://mavemplacamento.com.br/api/google-reviews.php`. Deve
   voltar um JSON. Recarregue a home: a seção aparece.

O resultado fica em cache por 6 horas, então são cerca de 4 chamadas por dia à
API — bem dentro da cota gratuita. O arquivo `config.php` está bloqueado para
acesso pela web no `.htaccess` e nunca é versionado no Git.

---

## Parte 5 — Depois de publicar

1. **Limpe o cache**: hPanel → **Limpar cache** (LiteSpeed) e, se o **CDN**
   estiver ativo, purgue também. Sem isso você pode continuar vendo o WordPress
   antigo por horas.
2. **Confira no celular e no computador**: home, botões de WhatsApp (devem abrir
   com a mensagem pronta), mapa, tema claro/escuro.
3. **Google Search Console** (<https://search.google.com/search-console>):
   cadastre a propriedade e envie `https://mavemplacamento.com.br/sitemap.xml`.
   Peça indexação da home.
4. **Preview do link**: cole o endereço numa conversa do WhatsApp e veja se a
   imagem de compartilhamento aparece.
5. **Rich results**: valide em <https://search.google.com/test/rich-results>.
6. **Google Meu Negócio**: confirme que o endereço e o telefone da ficha são
   idênticos aos da página. Divergência entre os dois derruba SEO local.

---

## Como o site é gerado (para quem for dar manutenção)

O projeto é uma SPA em React. Publicado do jeito ingênuo, o Googlebot receberia
um `<div>` vazio e todo o texto de venda dependeria de JavaScript para existir.
Por isso `npm run build` tem três etapas:

1. `vite build` — gera os bundles do navegador;
2. `vite build --ssr` — compila a landing para rodar no Node;
3. `scripts/prerender.mjs` — renderiza a home para HTML e grava dentro do
   `index.html`, junto com o `sitemap.xml` e a linha `Sitemap:` do `robots.txt`.

O resultado é que o texto principal está no HTML inicial: indexável, e visível
antes de o bundle carregar. `npm run build:hostinger` faz isso e ainda copia o
`.htaccess` e o proxy PHP para dentro do `dist/`.

Para mudar conteúdo — preços, serviços, FAQ, dados do negócio — o arquivo é
`src/content/site.ts`. Ver `docs/SITE_PUBLICO.md`.

---

## Quando o painel interno for entrar no ar

Vai precisar de VPS (o repositório já tem `Dockerfile` e `deploy/start.sh`). O
site público pode continuar na hospedagem compartilhada e o painel ficar num
subdomínio apontando para a VPS — por exemplo `painel.mavemplacamento.com.br`.
Nesse arranjo, os links de "Área restrita" no rodapé passam a apontar para o
subdomínio.

Antes de expor o painel, um ponto de segurança: a tela de login exibe as
credenciais padrão de administrador em texto aberto. Isso precisa sair.

---

## Problemas comuns

**Continuo vendo o WordPress / o site antigo**
Cache. Limpe o cache do LiteSpeed e purgue o CDN no hPanel, depois teste numa
janela anônima.

**As âncoras do menu não funcionam ou dá 404 ao recarregar uma seção**
O `.htaccess` não subiu. Ative arquivos ocultos no Gerenciador de Arquivos e
reenvie.

**As avaliações não aparecem**
Abra `/api/google-reviews.php` direto. Resposta vazia (204) = `config.php` não
existe ou está sem valores. Erro = confira se a **Places API (New)** está ativada
no projeto do Google Cloud e se o cURL está habilitado no PHP.

**O preview do link no WhatsApp mostra a imagem errada**
O WhatsApp guarda preview em cache por bastante tempo. Confirme que o
`VITE_SITE_URL` do build está correto (a `og:image` precisa ser URL absoluta e
acessível) e teste com um parâmetro novo no fim da URL, tipo `?v=2`.

**A publicação pelo GitHub falhou no envio por FTP**
Confira host, usuário e senha nos secrets. A Hostinger às vezes exige o host no
formato `ftp.seudominio.com.br` em vez do IP.
