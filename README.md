# EMPLACADORA-MAV

Aplicação React/Vite para gestão de emplacadora, preparada para rodar com:
- **App Web na porta `8090`**
- **PostgreSQL na porta `5435`**
- **Deploy no mesmo container** (app + banco no mesmo runtime)

## Credenciais padrão

Para primeiro acesso:
- **Email:** `admin@emplacadora.com`
- **Senha:** `123456`
- **Perfil:** `admin`

## Rodando localmente (sem Docker)

```bash
npm install
npm run dev -- --host 0.0.0.0 --port 8090
```

## Deploy em um único container

```bash
docker build -t emplacadora-mav .
docker run --rm -p 8090:8090 -p 5435:5435 emplacadora-mav
```

Ao iniciar, o container:
1. sobe o PostgreSQL interno na porta `5435`;
2. cria banco/usuário padrão (se ainda não existirem);
3. aplica seed de usuário admin inicial;
4. sobe o servidor web/API em `8090` (frontend + rotas `/api/*`).

O backend também garante no startup que:
- a tabela `users` existe;
- o usuário admin padrão existe/está ativo com as credenciais definidas em ambiente.

## Variáveis de ambiente

Use como base o `.env.example`.


## Verificação rápida de saúde

Após subir o container, valide banco + admin com:

```bash
curl -s http://localhost:8090/api/health
```

A resposta deve conter `ok: true` e `auth.adminExists: true`.


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
