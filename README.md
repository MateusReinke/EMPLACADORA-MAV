# EMPLACADORA-MAV

Aplicação React/Vite para gestão de emplacadora, preparada para rodar com:
- **App Web na porta `8090`**
- **PostgreSQL na porta `5435`**
- **Deploy no mesmo container** (app + banco no mesmo runtime)

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

## Deploy em um único container

```bash
docker build -t emplacadora-mav .
docker run --rm -p 8090:8090 --env-file .env emplacadora-mav
```

O PostgreSQL roda dentro do container e não é publicado no host — a aplicação
fala com ele por `127.0.0.1`. Publique a porta `5435` apenas se precisar de
acesso externo ao banco.

Ao iniciar, o container:
1. sobe o PostgreSQL interno na porta `5435`;
2. cria banco/usuário padrão (se ainda não existirem);
3. aplica seed de usuário admin inicial;
4. sobe o servidor web/API em `8090` (frontend + rotas `/api/*`).

O backend também garante no startup que:
- a tabela `users` existe;
- o usuário admin padrão existe/está ativo com as credenciais definidas em ambiente.

## Variáveis de ambiente

Use como base o `.env.example` (já com valores padrão para importação no Coolify/Compose).

```bash
cp .env.example .env
```

Configuração (com fallback no `docker-compose.yml`):
- `NODE_ENV`
- `APP_PORT`
- `POSTGRES_PORT`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `DEFAULT_ADMIN_EMAIL`
- `DEFAULT_ADMIN_NAME`

Segredos (**obrigatórios**, sem fallback — o deploy falha se faltarem):
- `POSTGRES_PASSWORD`
- `DEFAULT_ADMIN_PASSWORD`
- `INTEGRATION_API_KEY`

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

A resposta deve ser `{"ok":true}`. O diagnóstico detalhado (existência do
admin, contagem de usuários) fica em `/api/integrations/health`, que exige
`x-api-key`.


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