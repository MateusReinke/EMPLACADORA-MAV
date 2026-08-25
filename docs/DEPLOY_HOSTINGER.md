# Publicar na Hostinger

Antes de escolher o caminho, um ponto que muda tudo:

> **Este repositório tem duas coisas dentro dele.** O *site público* (a landing
> page) é HTML/CSS/JS estático e roda em qualquer lugar. O *painel interno*
> (login de colaborador, vendedor e admin, pedidos, estoque) precisa de
> **Node.js + PostgreSQL** rodando o `server.js`. Hospedagem compartilhada da
> Hostinger tem PHP e MySQL, **não** tem Node nem Postgres — nela o painel não
> funciona, só o site.

Escolha conforme o que você precisa no ar:

| | Cenário A — só o site | Cenário B — site + painel |
| --- | --- | --- |
| Plano Hostinger | Hospedagem compartilhada | VPS |
| Site público | ✅ | ✅ |
| Painel interno | ❌ | ✅ |
| Avaliações do Google | ✅ (via PHP) | ✅ (via Node) |
| Custo | menor | maior |
| Trabalho de manutenção | quase zero | precisa administrar o servidor |

Se hoje o painel não está em uso, comece pelo **Cenário A** — é mais barato e
mais simples. Dá para migrar para o B depois sem refazer o site.

---

## Cenário A — hospedagem compartilhada (só o site público)

### 1. Gerar o pacote

Na sua máquina, dentro do projeto:

```bash
npm install
VITE_SITE_URL=https://mavemplacamento.com.br npm run build:hostinger
```

Troque a URL pelo domínio real. Ela entra no canonical, no Open Graph, no
JSON-LD e no sitemap — se ficar errada, o Google indexa o endereço errado.

O comando gera a pasta `dist/` já com tudo:

```
dist/
├── index.html          ← home pré-renderizada (o texto já vem no HTML)
├── app-shell.html      ← shell das rotas do painel
├── .htaccess           ← rotas, HTTPS, cache e compressão
├── robots.txt
├── sitemap.xml
├── og-mav-emplacamento.jpg
├── mav-logo-horizontal.svg
├── assets/             ← JS e CSS com hash no nome
└── api/
    ├── google-reviews.php
    └── config.example.php
```

### 2. Enviar para o servidor

No hPanel: **Arquivos → Gerenciador de Arquivos → public_html**.

Envie **todo o conteúdo de dist/** (o conteúdo, não a pasta) para `public_html`.

> ⚠️ O `.htaccess` começa com ponto e fica **oculto** por padrão. No gerenciador
> de arquivos, ative "Mostrar arquivos ocultos" antes de enviar e confirme que
> ele chegou. Sem ele, o site abre mas as rotas e o cache não funcionam.

Um jeito mais confiável: compacte `dist/` em `.zip` (incluindo ocultos), envie o
zip e extraia pelo gerenciador.

### 3. Domínio e HTTPS

1. **Domínios → Meus domínios**: aponte `mavemplacamento.com.br` para a
   hospedagem (se comprou na Hostinger, já vem apontado).
2. **Segurança → SSL**: instale o certificado gratuito e ative "Forçar HTTPS".
   O `.htaccess` também redireciona, mas ter os dois não atrapalha.

### 4. Avaliações do Google

Sem este passo o site funciona normalmente — a seção de avaliações apenas não
aparece.

1. **Pegue o Place ID** da MAV em
   <https://developers.google.com/maps/documentation/places/web-service/place-id>
   (busque "MAV Emplacamento"; o ID começa com `ChIJ`).
2. **Crie a chave de API** em <https://console.cloud.google.com>: novo projeto →
   ative a **Places API (New)** → Credenciais → Criar chave de API.
   Em restrições, limite a chave à Places API. **Não** restrinja por referrer
   HTTP: quem chama o Google é o servidor, não o navegador.
3. No servidor, crie `public_html/api/config.php` copiando
   `config.example.php` e preencha `api_key` e `place_id`.
4. Teste abrindo `https://seudominio.com.br/api/google-reviews.php`.
   Deve voltar um JSON com as avaliações. Recarregue a home: a seção aparece.

O resultado fica em cache por 6 horas, então o site faz cerca de 4 chamadas por
dia à API — bem dentro da cota gratuita.

### 5. Depois de publicar

- Cadastre o site no [Google Search Console](https://search.google.com/search-console)
  e envie `https://seudominio.com.br/sitemap.xml`.
- Confira o preview do link colando a URL numa conversa do WhatsApp.
- Valide os dados estruturados em <https://search.google.com/test/rich-results>.

### Atualizar o site depois

Repita os passos 1 e 2. Os arquivos em `assets/` têm hash no nome, então o
navegador do visitante pega a versão nova sozinho — não precisa pedir para
ninguém limpar cache.

---

## Cenário B — VPS (site + painel)

O projeto já vem com `Dockerfile` e `deploy/start.sh`, que sobem a aplicação e o
PostgreSQL juntos.

### 1. Criar a VPS

hPanel → **VPS → Criar**. Escolha um plano com pelo menos 2 GB de RAM e o
template **Ubuntu 22.04 com Docker**.

### 2. Subir a aplicação

```bash
ssh root@SEU_IP

git clone https://github.com/MateusReinke/EMPLACADORA-MAV.git
cd EMPLACADORA-MAV

docker build -t mav .

docker run -d --name mav --restart unless-stopped \
  -p 80:8090 \
  -e VITE_SITE_URL="https://mavemplacamento.com.br" \
  -e POSTGRES_PASSWORD="<senha forte>" \
  -e DEFAULT_ADMIN_PASSWORD="<senha forte>" \
  -e INTEGRATION_API_KEY="<chave aleatória>" \
  -e GOOGLE_PLACES_API_KEY="<chave do Google>" \
  -e GOOGLE_PLACE_ID="<place id>" \
  mav
```

Em produção o `server.js` **recusa subir** sem `POSTGRES_PASSWORD`,
`DEFAULT_ADMIN_PASSWORD` e `INTEGRATION_API_KEY` — é proposital, para nenhum
deploy ir ao ar com senha padrão conhecida.

> `VITE_SITE_URL` é lida **no build**. Como o `docker build` roda o build, ela
> precisa estar presente ali também: use
> `docker build --build-arg VITE_SITE_URL=... -t mav .` se preferir, ou rebuild
> depois de definir a variável.

### 3. HTTPS

Coloque um Nginx ou Caddy na frente com Let's Encrypt. Com Caddy é um arquivo:

```
mavemplacamento.com.br {
    reverse_proxy localhost:8090
}
```

### 4. Banco de dados

O container sobe um PostgreSQL embutido, bom para começar. Para produção séria,
use um banco gerenciado e passe `DATABASE_URL` — o `server.js` detecta sozinho e
não inicia o Postgres local.

---

## Variáveis de ambiente

| Variável | Onde | Para quê |
| --- | --- | --- |
| `VITE_SITE_URL` | build | Domínio canônico (canonical, OG, JSON-LD, sitemap) |
| `GOOGLE_PLACES_API_KEY` | servidor | Avaliações do Google |
| `GOOGLE_PLACE_ID` | servidor | Qual estabelecimento buscar |
| `GOOGLE_REVIEWS_TTL_MS` | servidor | Cache das avaliações (padrão 6 h) |
| `POSTGRES_PASSWORD` | servidor (B) | Banco — obrigatória em produção |
| `DEFAULT_ADMIN_PASSWORD` | servidor (B) | Admin inicial — obrigatória em produção |
| `INTEGRATION_API_KEY` | servidor (B) | API de integrações — obrigatória em produção |

---

## Problemas comuns

**O site abre mas as âncoras do menu não funcionam / dá 404 ao recarregar**
O `.htaccess` não subiu. Ative arquivos ocultos no gerenciador e reenvie.

**As avaliações não aparecem**
Abra `/api/google-reviews.php` direto no navegador. Se vier vazio (204), o
`config.php` não existe ou está sem os valores. Se vier erro, confira se a
**Places API (New)** está ativada no projeto do Google Cloud.

**O preview do link no WhatsApp mostra a imagem errada**
O WhatsApp guarda o preview em cache por bastante tempo. Confirme que
`VITE_SITE_URL` estava correta no build (a `og:image` precisa ser uma URL
absoluta e acessível) e teste com um parâmetro novo: `?v=2`.

**Publiquei mas o Google não indexa**
Indexação leva dias ou semanas. Acelere enviando o sitemap pelo Search Console
e pedindo indexação da home. Confirme também que o `robots.txt` publicado libera
o Googlebot.
