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
