# EMPLACADORA-MAV

Aplicação React/Vite para gestão de emplacadora, com backend Express +
PostgreSQL. O app web sobe na porta `8090` e o banco pode rodar de dois jeitos:

| Modo | Quando usar | Como ativar |
|---|---|---|
| **Embutido** (padrão) | Demonstração, desenvolvimento, avaliação | Nada a fazer — o PostgreSQL sobe dentro do container |
| **Externo** | Produção: banco gerenciado, com backup e escala | Definir `DATABASE_URL` (ou `POSTGRES_HOST`) |

No modo externo o PostgreSQL embutido **não é iniciado**: a aplicação conecta
direto no banco informado, e o container carrega só o app.

## Primeiro acesso

O usuário admin inicial é criado no primeiro boot a partir das variáveis
`DEFAULT_ADMIN_EMAIL` e `DEFAULT_ADMIN_PASSWORD`, com a senha já em bcrypt.

- Em produção (`NODE_ENV=production`) **não existe senha padrão**: o servidor
  recusa iniciar se `DEFAULT_ADMIN_PASSWORD`, `POSTGRES_PASSWORD` ou
  `INTEGRATION_API_KEY` não vierem do ambiente.
- Depois do primeiro boot, o bootstrap nunca sobrescreve a senha do admin —
  trocar a senha pela aplicação é definitivo e sobrevive a restarts.
- Em desenvolvimento, sem variáveis definidas, o servidor cai em valores de
  conveniência e avisa no log. Não use esse modo em ambiente exposto.

## Rodando localmente (sem Docker)

```bash
cp .env.example .env   # defina os segredos
npm install
npm run dev -- --host 0.0.0.0 --port 8090
```

## Deploy — modo embutido (banco no mesmo container)

```bash
cp .env.example .env   # defina os segredos
docker compose up -d
```

O PostgreSQL roda dentro do container e escuta apenas em `127.0.0.1`, sem ser
publicado no host. Para acesso externo ao banco, defina
`POSTGRES_LISTEN=0.0.0.0` e publique a porta `5435` — nunca com senha padrão.

Ao iniciar, o container sobe o PostgreSQL interno, cria banco e usuário se não
existirem, aplica o schema e sobe a API/web em `8090`.

Os dados vivem no volume `pgdata`. Ele **não** é gerenciado por nenhuma rotina de
backup — para produção com dados reais, prefira o modo externo.

## Deploy — modo externo (banco gerenciado)

Basta apontar `DATABASE_URL` para o banco:

```bash
DATABASE_URL=postgres://usuario:senha@host:5432/emplacadora
```

O `start.sh` detecta e pula a inicialização do PostgreSQL local. A aplicação
cria o schema sozinha na primeira conexão, então o banco pode estar vazio — só
precisa existir, com um usuário que possa criar tabelas.

`POSTGRES_PASSWORD` deixa de ser necessária (a senha vai dentro da URL). Como
alternativa a `DATABASE_URL`, dá para usar `POSTGRES_HOST`/`PORT`/`DB`/`USER`/
`PASSWORD` separados — apontar `POSTGRES_HOST` para fora já ativa o modo externo.

TLS via `POSTGRES_SSL`: `require` (padrão no modo externo, cifra sem validar a
cadeia — o que a maioria dos provedores gerenciados usa), `verify-full` (valida
contra a CA do sistema ou a de `POSTGRES_SSL_CA`) ou `disable`.

## Variáveis de ambiente

Use o `.env.example` como base — ele separa configuração, segredos e banco.

Configuração (com fallback no `docker-compose.yml`):
`NODE_ENV`, `APP_PORT`, `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`,
`POSTGRES_USER`, `POSTGRES_SSL`, `DEFAULT_ADMIN_EMAIL`, `DEFAULT_ADMIN_NAME`,
`SEED_DEMO_DATA`.

Segredos (**obrigatórios**, sem fallback — o deploy falha se faltarem):
- `DEFAULT_ADMIN_PASSWORD`
- `INTEGRATION_API_KEY`
- `POSTGRES_PASSWORD` — apenas quando não há `DATABASE_URL`

## Dados iniciais

Um banco novo nasce apenas com o **vocabulário estrutural**: status de pedido,
tipos de placa, tipos de veículo e categorias de serviço. Tipos de serviço,
preços e itens de estoque são cadastrados pelo cliente nas telas de
administração — um deploy real não nasce com preços fictícios.

Esses catálogos são inseridos com `ON CONFLICT DO NOTHING`: o boot preenche um
banco vazio, mas **nunca reverte** o que o operador ajustou depois.

Para popular uma base de demonstração:

```bash
# no boot
SEED_DEMO_DATA=true

# ou depois, com o sistema no ar
psql -h 127.0.0.1 -p 5435 -U emplacadora -d emplacadora -f deploy/seed_emplacadora.sql
```

O script é idempotente: rodar duas vezes não duplica registros nem sobrescreve
preços e regras já ajustados.

## Autenticação e autorização

- Senhas são guardadas apenas como hash bcrypt (coluna `password_hash`). No
  primeiro boot após a atualização, senhas em texto puro existentes são
  convertidas automaticamente e o campo legado é apagado.
- A sessão vive na tabela `sessions`, com validade de 7 dias, e sobrevive a
  restarts do container. O cookie é `httpOnly`, `sameSite=lax` e `secure` em
  produção.
- `/api/query` exige sessão autenticada e aplica política por perfil no
  servidor: administradores enxergam tudo; vendedores, apenas os clientes,
  pedidos e veículos que criaram; clientes finais, apenas os próprios
  registros. Catálogos e estoque são somente leitura para não-administradores,
  e `role`/`active` só mudam por conta de administrador.
- `update` e `delete` exigem ao menos um filtro, para que nenhuma requisição
  atinja uma tabela inteira.
- Senhas nunca são devolvidas pela API, em nenhuma rota.

## Verificação rápida de saúde

Após subir o container:

```bash
curl -s http://localhost:8090/api/health
```

A resposta deve ser `{"ok":true,"database":"embedded"}` (ou `"external"`).

Quando o banco está inacessível a rota responde **503**, não 200 — é o que o
`HEALTHCHECK` do Docker usa para marcar como *unhealthy* um container que subiu
sem banco, em vez de tratá-lo como saudável.

O diagnóstico detalhado (existência do admin, contagem de usuários) fica em
`/api/integrations/health`, que exige `x-api-key`.


## Estrutura de APIs para Integrações

Além das rotas internas da aplicação, o backend agora expõe uma estrutura dedicada para integrações externas em `/api/integrations`.

### Segurança
- Header obrigatório: `x-api-key`
- Chave configurada por ambiente: `INTEGRATION_API_KEY`

### Endpoints disponíveis
- `GET /api/integrations` - catálogo da API
- `GET /api/integrations/health` - saúde da API + diagnóstico de admin
- `GET /api/integrations/orders` - listagem de pedidos (`limit`, `offset`, `status_id`, `updated_since`)
- `GET /api/integrations/orders/:id` - detalhe de pedido
- `POST /api/integrations/orders/:id/status` - atualização de status
- `GET /api/integrations/clients` - listagem de clientes
- `GET /api/integrations/vehicles` - listagem de veículos
- `GET /api/integrations/service-types` - tipos de serviço
- `GET /api/integrations/order-statuses` - status de pedido
- `POST /api/integrations/webhooks/test` - endpoint de teste de webhook

### Exemplo rápido
```bash
curl -s http://localhost:8090/api/integrations/health   -H "x-api-key: dev-integration-key"
```


## Troubleshooting de deploy

Se abrir `http://SEU_IP:8090` e aparecer `ERR_CONNECTION_REFUSED`:

1. Verifique se o container está de pé:
   ```bash
   docker ps
   ```
2. Verifique logs:
   ```bash
   docker logs -f emplacadora-mav
   ```
3. Valide a porta publicada:
   ```bash
   docker port emplacadora-mav
   ```
4. Teste local no host:
   ```bash
   curl -s http://127.0.0.1:8090/api/health
   ```

O startup agora tenta subir o PostgreSQL local, mas inicia a API mesmo se o banco local falhar, para facilitar diagnóstico via logs e `/api/health`.