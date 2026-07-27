FROM node:20-bookworm

RUN apt-get update \
  && apt-get install -y --no-install-recommends postgresql postgresql-contrib \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install --include=dev

COPY . .
RUN npm run build

COPY deploy/start.sh /usr/local/bin/start.sh
COPY deploy/init.sql /docker-entrypoint-initdb.d/init.sql
RUN chmod +x /usr/local/bin/start.sh

# Apenas configuração não sensível. POSTGRES_PASSWORD, DEFAULT_ADMIN_PASSWORD e
# INTEGRATION_API_KEY precisam vir do ambiente de deploy: com NODE_ENV=production
# o servidor recusa subir sem elas, em vez de usar um valor conhecido.
ENV NODE_ENV=production
ENV APP_PORT=8090
ENV POSTGRES_PORT=5435
ENV POSTGRES_DB=emplacadora
ENV POSTGRES_USER=emplacadora
ENV DEFAULT_ADMIN_EMAIL=admin@emplacadora.com
ENV DEFAULT_ADMIN_NAME="Administrador Padrão"

EXPOSE 8090 5435

# /api/health responde 503 quando o banco não está acessível, então um container
# no ar sem banco é marcado como unhealthy em vez de saudável.
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.APP_PORT||8090)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["/usr/local/bin/start.sh"]
