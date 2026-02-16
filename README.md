# EMPLACADORA-MAV

Aplicação com frontend React + API Node + PostgreSQL no mesmo deploy.

## Arquitetura de deploy

No `docker compose up --build -d`, sobe tudo junto:
- API/Frontend em `8090`
- PostgreSQL em `5435`
- Schema e seeds automáticos no bootstrap (`deploy/init.sql`)

## Credenciais padrão

- **admin**: `admin@emplacadora.com` / `123456`
- **seller demo**: `vendedor@emplacadora.com` / `123456`
- **client demo**: `cliente@emplacadora.com` / `123456`

## Subir com Docker Compose

```bash
docker compose up --build -d
```

Acesso:
- App/API: `http://localhost:8090`
- Rede local: `http://SEU_IP_LOCAL:8090`
- PostgreSQL: `localhost:5435`

Logs:

```bash
docker compose logs -f
```

Parar:

```bash
docker compose down
```

## Banco estruturado no deploy

O bootstrap cria (se necessário):
- `users`
- `clients`
- `vehicles`
- `service_categories`
- `service_types`
- `order_statuses`
- `orders`
- `inventory_movements`
- `dashboard_layouts`
- view `inventory_status`

Além de seeds iniciais de status/categorias/tipos de placa e usuário admin.

## Observação sobre integração

A integração agora é via backend HTTP (`/api/*`) em PostgreSQL.
Não usa localStorage como fonte de dados da aplicação.
