FROM node:20-bookworm

RUN apt-get update \
  && apt-get install -y --no-install-recommends postgresql postgresql-contrib \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

COPY deploy/start.sh /usr/local/bin/start.sh
COPY deploy/init.sql /docker-entrypoint-initdb.d/init.sql
RUN chmod +x /usr/local/bin/start.sh

ENV APP_PORT=8090
ENV POSTGRES_PORT=5435
ENV POSTGRES_DB=emplacadora
ENV POSTGRES_USER=emplacadora
ENV POSTGRES_PASSWORD=emplacadora123
ENV DEFAULT_ADMIN_EMAIL=admin@emplacadora.com
ENV DEFAULT_ADMIN_PASSWORD=123456
ENV DEFAULT_ADMIN_NAME="Administrador Padrão"
ENV INTEGRATION_API_KEY=dev-integration-key

EXPOSE 8090 5435

CMD ["/usr/local/bin/start.sh"]
