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

## Rodando via Docker Compose (recomendado)

```bash
docker compose up --build -d
```

Acesso:
- App: `http://localhost:8090`
- App na rede local: `http://SEU_IP_LOCAL:8090`
- PostgreSQL: `localhost:5435`

Para acompanhar logs:

```bash
docker compose logs -f
```

Para parar:

```bash
docker compose down
```

> Se quiser limpar também o volume do banco: `docker compose down -v`

## Deploy em um único container (sem compose)

```bash
docker build -t emplacadora-mav .
docker run --rm -p 8090:8090 -p 5435:5435 emplacadora-mav
```

Ao iniciar, o container:
1. sobe o PostgreSQL interno na porta `5435`;
2. cria banco/usuário padrão (se ainda não existirem);
3. aplica seed de usuário admin inicial;
4. sobe o frontend em `8090` com bind em `0.0.0.0`.

## Variáveis de ambiente

Use como base o `.env.example`.
