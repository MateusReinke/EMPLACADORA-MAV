# EMPLACADORA-MAV

Aplicação com frontend React + API Node + PostgreSQL no mesmo deploy.

## Deploy inicial (admin único)

Após o primeiro deploy, existirá apenas **1 usuário ADMIN**:
- `admin@emplacadora.com`
- senha inicial: `123456`

Somente o ADMIN cria/edita/remove usuários e configura regras financeiras/comissão.

## Arquitetura

`docker compose up --build -d` sobe:
- API + Frontend em `8090`
- PostgreSQL em `5435`
- bootstrap de schema e seeds via `deploy/init.sql`

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

## Estrutura funcional já provisionada

- Clientes
- Funcionários (tabela `users` com campos de acordo/comissão)
- Veículos
- Serviços
- Pedidos
- Estoque
- Status de pedidos
- Regras de comissão por funcionário e por serviço (`funcionario_comissao_servico`)

### Regras implementadas no backend

- Pedido exige cliente, veículo, funcionário responsável e valor total.
- Comissão é calculada no momento da criação do pedido e armazenada no banco.
- Se serviço estiver vinculado ao estoque:
  - valida saldo antes de criar pedido;
  - dá baixa automática no estoque na criação.
- Em cancelamento, há devolução automática do estoque e comissão marcada como cancelada.
- Somente ADMIN pode marcar comissão como paga.

## Observação

A aplicação não usa `localStorage` para dados de negócio; os dados persistem no PostgreSQL.
