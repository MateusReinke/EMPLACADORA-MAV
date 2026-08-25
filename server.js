import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const { Pool } = pg;

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * Segredos nunca caem em um default silencioso em produção: um deploy que
 * esquece de definir a variável precisa falhar alto, não subir com a senha
 * conhecida publicamente.
 */
const requireSecret = (name, devFallback) => {
  const value = process.env[name];
  if (value) return value;

  if (IS_PRODUCTION) {
    console.error(`[server] ${name} é obrigatório em produção e não foi definido. Encerrando.`);
    process.exit(1);
  }

  console.warn(`[server] ${name} não definido; usando valor de desenvolvimento. NÃO use isso em produção.`);
  return devFallback;
};

const PORT = Number(process.env.APP_PORT || 8090);

const DATABASE_URL = process.env.DATABASE_URL || '';
const DB_HOST = process.env.POSTGRES_HOST || '127.0.0.1';
const DB_PORT = Number(process.env.POSTGRES_PORT || 5435);
const DB_NAME = process.env.POSTGRES_DB || 'emplacadora';
const DB_USER = process.env.POSTGRES_USER || 'emplacadora';

const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost', '::1', '']);

/**
 * Dois modos de banco:
 *  - `embedded`: o PostgreSQL sobe dentro do próprio container (padrão, bom
 *    para demonstração e desenvolvimento);
 *  - `external`: a aplicação aponta para um banco gerenciado, informado por
 *    DATABASE_URL ou por POSTGRES_HOST apontando para fora.
 * O deploy/start.sh lê esta mesma decisão para não iniciar um Postgres local
 * que ninguém usaria.
 */
const DB_MODE = DATABASE_URL || !LOCAL_HOSTS.has(DB_HOST) ? 'external' : 'embedded';

// Com DATABASE_URL a senha vem dentro da própria URL.
const DB_PASSWORD = DATABASE_URL ? '' : requireSecret('POSTGRES_PASSWORD', 'emplacadora123');

/**
 * `require` cifra a conexão sem validar a cadeia — é o que a maioria dos
 * provedores gerenciados (Neon, Supabase, RDS) precisa, pois usam certificados
 * próprios. `verify-full` valida contra a CA do sistema ou a informada em
 * POSTGRES_SSL_CA.
 */
const buildSslConfig = () => {
  const mode = (process.env.POSTGRES_SSL || (DB_MODE === 'external' ? 'require' : 'disable')).toLowerCase();

  if (mode === 'disable' || mode === 'false' || mode === 'off') return false;

  const ca = process.env.POSTGRES_SSL_CA;
  if (mode === 'verify-full') {
    return ca ? { rejectUnauthorized: true, ca } : { rejectUnauthorized: true };
  }

  return { rejectUnauthorized: false };
};

const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || 'admin@emplacadora.com';
const DEFAULT_ADMIN_PASSWORD = requireSecret('DEFAULT_ADMIN_PASSWORD', '123456');
const DEFAULT_ADMIN_NAME = process.env.DEFAULT_ADMIN_NAME || 'Administrador Padrão';
const INTEGRATION_API_KEY = requireSecret('INTEGRATION_API_KEY', 'dev-integration-key');
const SEED_DEMO_DATA = /^(1|true|yes)$/i.test(process.env.SEED_DEMO_DATA || '');
const API_VERSION = 'v1';
const BCRYPT_ROUNDS = 10;
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// CSP fica desligada: o bundle do Vite depende de estilos inline do shadcn/Radix.
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

const pool = new Pool(
  DATABASE_URL
    ? { connectionString: DATABASE_URL, ssl: buildSslConfig() }
    : {
        host: DB_HOST,
        port: DB_PORT,
        database: DB_NAME,
        user: DB_USER,
        password: DB_PASSWORD,
        ssl: buildSslConfig(),
      }
);

// Um erro em conexão ociosa do pool emite 'error'; sem listener, derruba o processo.
pool.on('error', (error) => {
  console.error('[server] erro em conexão ociosa do pool:', error);
});

console.log(
  `[server] banco em modo ${DB_MODE}` +
    (DB_MODE === 'external' ? ` (${DATABASE_URL ? 'DATABASE_URL' : `${DB_HOST}:${DB_PORT}`})` : '')
);

const ALLOWED_TABLES = new Set([
  'users',
  'clients',
  'vehicles',
  'orders',
  'service_categories',
  'service_types',
  'service_inventory_rules',
  'order_statuses',
  'plate_types',
  'inventory_items',
  'inventory_movements',
  'dashboard_layouts',
  'inventory_status',
]);

const isSafeIdent = (s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s);

const buildWhere = (filters = [], startIndex = 1, alias = '') => {
  const clauses = [];
  const values = [];
  const prefix = alias ? `${alias}.` : '';
  let i = startIndex;

  for (const f of filters) {
    if (!f || !isSafeIdent(f.column)) continue;

    if (f.op === 'eq') {
      clauses.push(`${prefix}${f.column} = $${i++}`);
      values.push(f.value);
    } else if (f.op === 'in' && Array.isArray(f.value) && f.value.length > 0) {
      clauses.push(`${prefix}${f.column} = ANY($${i++})`);
      values.push(f.value);
    } else if (f.op === 'gte') {
      clauses.push(`${prefix}${f.column} >= $${i++}`);
      values.push(f.value);
    } else if (f.op === 'lte') {
      clauses.push(`${prefix}${f.column} <= $${i++}`);
      values.push(f.value);
    }
  }

  return {
    sql: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
    values,
    nextIndex: i,
  };
};

/*
 * ---------------------------------------------------------------------------
 * Autorização do /api/query
 *
 * O frontend fala com um clone da API do Supabase (src/lib/dbClient.ts), mas o
 * Supabase depende de RLS no banco para autorizar. Como este backend não tem
 * RLS, a política vive aqui: `queryPolicy` decide se a operação é permitida e
 * `scopeFor` devolve as cláusulas que restringem as linhas visíveis. Ambas são
 * aplicadas no servidor — os `filters` que vêm do cliente nunca são a única
 * defesa.
 * ---------------------------------------------------------------------------
 */

// Catálogos: leitura para qualquer autenticado, escrita apenas admin.
const REFERENCE_TABLES = new Set([
  'service_categories',
  'service_types',
  'service_inventory_rules',
  'order_statuses',
  'plate_types',
]);

// Estoque: invisível para clientes finais.
const INVENTORY_TABLES = new Set(['inventory_items', 'inventory_movements', 'inventory_status']);

// Registros com dono: o escopo por role limita as linhas.
const OWNED_TABLES = new Set(['orders', 'clients', 'vehicles']);

const READ_ONLY_TABLES = new Set(['inventory_status']);

// Nunca trafegam para o cliente, em nenhuma tabela.
const SENSITIVE_COLUMNS = new Set(['password', 'password_hash']);

// Só admin muda: impede escalonamento de privilégio via /api/query.
const PRIVILEGED_COLUMNS = new Set(['role', 'active']);

const CLIENT_ROLES = new Set(['physical', 'juridical']);

const deny = (message = 'Operação não permitida para este perfil') => ({ allowed: false, message });
const allow = () => ({ allowed: true });

const queryPolicy = (table, action, user) => {
  const isRead = action === 'select';

  if (READ_ONLY_TABLES.has(table) && !isRead) {
    return deny('Recurso somente leitura');
  }

  if (user.role === 'admin') return allow();

  if (table === 'users') {
    // Não-admin só enxerga a própria linha (ver scopeFor) e nunca escreve.
    return isRead ? allow() : deny();
  }

  if (REFERENCE_TABLES.has(table)) {
    return isRead ? allow() : deny('Apenas administradores alteram catálogos');
  }

  if (INVENTORY_TABLES.has(table)) {
    if (user.role === 'seller') {
      return isRead ? allow() : deny('Apenas administradores alteram o estoque');
    }
    return deny();
  }

  if (table === 'dashboard_layouts') {
    // scopeFor prende à própria linha; o user_id é forçado na escrita.
    return allow();
  }

  if (OWNED_TABLES.has(table)) {
    if (user.role === 'seller') return allow();
    // Clientes finais apenas consultam os próprios registros.
    return isRead ? allow() : deny();
  }

  return deny();
};

/**
 * Cláusulas de escopo por perfil. Cada entrada recebe o índice do próximo
 * placeholder e devolve o SQL correspondente, para compor com os filtros do
 * cliente sem colidir numeração.
 */
const scopeFor = (table, user, alias = '') => {
  if (user.role === 'admin') return [];

  const p = alias ? `${alias}.` : '';
  const ownClientsSubquery = (i) =>
    `(SELECT id FROM clients WHERE created_by = $${i} OR (email IS NOT NULL AND email = $${i + 1}))`;

  if (table === 'users') {
    return [{ sql: (i) => `${p}id = $${i}`, values: [user.id] }];
  }

  if (table === 'dashboard_layouts') {
    return [{ sql: (i) => `${p}user_id = $${i}`, values: [user.id] }];
  }

  if (user.role === 'seller') {
    if (table === 'orders' || table === 'clients') {
      return [{ sql: (i) => `${p}created_by = $${i}`, values: [user.id] }];
    }
    if (table === 'vehicles') {
      return [
        {
          sql: (i) => `${p}client_id IN (SELECT id FROM clients WHERE created_by = $${i})`,
          values: [user.id],
        },
      ];
    }
    return [];
  }

  if (CLIENT_ROLES.has(user.role)) {
    // O vínculo usuário → cliente é por created_by ou e-mail (ver clientProfileService).
    if (table === 'clients') {
      return [
        {
          sql: (i) => `(${p}created_by = $${i} OR (${p}email IS NOT NULL AND ${p}email = $${i + 1}))`,
          values: [user.id, user.email],
        },
      ];
    }
    if (table === 'orders' || table === 'vehicles') {
      return [
        {
          sql: (i) => `${p}client_id IN ${ownClientsSubquery(i)}`,
          values: [user.id, user.email],
        },
      ];
    }
    return [];
  }

  return [];
};

/** Filtros do cliente + escopo do servidor, com numeração de placeholders contígua. */
const buildScopedWhere = (table, filters, user, alias = '') => {
  const base = buildWhere(filters, 1, alias);
  const clauses = base.sql ? [base.sql.replace(/^WHERE /, '')] : [];
  const values = [...base.values];
  let i = base.nextIndex;

  for (const scope of scopeFor(table, user, alias)) {
    clauses.push(scope.sql(i));
    values.push(...scope.values);
    i += scope.values.length;
  }

  return {
    sql: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
    values,
    nextIndex: i,
    clientFilterCount: base.values.length,
  };
};

const stripSensitive = (row) => {
  if (!row || typeof row !== 'object') return row;
  const clean = {};
  for (const [key, value] of Object.entries(row)) {
    if (SENSITIVE_COLUMNS.has(key)) continue;
    clean[key] = value;
  }
  return clean;
};

const stripSensitiveRows = (data) => {
  if (Array.isArray(data)) return data.map(stripSensitive);
  return stripSensitive(data);
};

/**
 * Normaliza um payload de escrita: converte senha em claro para hash, remove
 * colunas privilegiadas de quem não é admin e força o dono do registro.
 */
const sanitizeWritePayload = async (table, row, user) => {
  const clean = { ...(row || {}) };

  for (const key of SENSITIVE_COLUMNS) {
    if (key === 'password') continue;
    delete clean[key];
  }

  if (typeof clean.password === 'string' && clean.password) {
    clean.password_hash = await bcrypt.hash(clean.password, BCRYPT_ROUNDS);
  }
  delete clean.password;

  if (user.role !== 'admin') {
    for (const key of PRIVILEGED_COLUMNS) delete clean[key];
  }

  if (user.role !== 'admin') {
    if (table === 'orders' || table === 'clients') clean.created_by = user.id;
    if (table === 'dashboard_layouts') clean.user_id = user.id;
  }

  return clean;
};

/** Um não-admin só pode escrever veículo de um cliente que ele enxerga. */
const assertVehicleClientInScope = async (clientId, user) => {
  if (user.role === 'admin' || !clientId) return;

  const scope = buildScopedWhere('clients', [{ op: 'eq', column: 'id', value: clientId }], user);
  const { rows } = await pool.query(`SELECT 1 FROM clients ${scope.sql} LIMIT 1`, scope.values);
  if (!rows[0]) {
    const error = new Error('Cliente fora do escopo do usuário');
    error.statusCode = 403;
    throw error;
  }
};


const ensureCoreSchema = async () => {
  await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin','seller','physical','juridical')),
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT`);
  // `password` (texto puro) vira legado: fica nullable até ser removida numa
  // migration futura, depois que todo ambiente tiver rodado o backfill.
  await pool.query(`ALTER TABLE users ALTER COLUMN password DROP NOT NULL`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at)`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS service_categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL UNIQUE,
      prefix TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS service_types (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      required_documents TEXT,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      price NUMERIC(12,2),
      category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`ALTER TABLE service_types ADD COLUMN IF NOT EXISTS required_documents TEXT`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_statuses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL UNIQUE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      color TEXT NOT NULL DEFAULT '#64748b',
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS plate_types (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      code TEXT NOT NULL UNIQUE,
      label TEXT NOT NULL,
      color TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS vehicle_types (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      code TEXT NOT NULL UNIQUE,
      label TEXT NOT NULL,
      wheel_count INTEGER,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS clients (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      document TEXT,
      type TEXT NOT NULL CHECK (type IN ('physical','juridical')),
      address TEXT,
      phone TEXT,
      email TEXT,
      created_by UUID REFERENCES users(id) ON DELETE SET NULL,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      license_plate TEXT,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      year TEXT NOT NULL,
      color TEXT,
      client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
      plate_type_id UUID REFERENCES plate_types(id) ON DELETE SET NULL,
      renavam TEXT,
      category TEXT NOT NULL DEFAULT 'carros',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS vehicle_type_id UUID REFERENCES vehicle_types(id) ON DELETE SET NULL`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
      created_by UUID REFERENCES users(id) ON DELETE SET NULL,
      service_type_id UUID REFERENCES service_types(id) ON DELETE SET NULL,
      status_id UUID REFERENCES order_statuses(id) ON DELETE SET NULL,
      order_number TEXT,
      value NUMERIC(12,2) DEFAULT 0,
      vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
      message TEXT,
      cancel_reason TEXT,
      estimated_delivery_date DATE,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS inventory_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      min_quantity INTEGER NOT NULL DEFAULT 0,
      cost_price NUMERIC(12,2) NOT NULL DEFAULT 0,
      category TEXT NOT NULL DEFAULT 'geral',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);


  await pool.query(`
    CREATE TABLE IF NOT EXISTS service_inventory_rules (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      service_type_id UUID NOT NULL REFERENCES service_types(id) ON DELETE CASCADE,
      inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
      vehicle_category TEXT NOT NULL CHECK (vehicle_category IN ('carro','moto','all')),
      quantity_required INTEGER NOT NULL CHECK (quantity_required > 0),
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS inventory_movements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
      movement_type TEXT NOT NULL CHECK (movement_type IN ('in','out')),
      quantity INTEGER NOT NULL,
      responsible_id UUID REFERENCES users(id) ON DELETE SET NULL,
      order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS dashboard_layouts (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      layout_data JSONB NOT NULL DEFAULT '[]'::jsonb,
      last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE OR REPLACE VIEW inventory_status AS
    SELECT
      i.id,
      i.name,
      i.quantity,
      i.min_quantity,
      i.cost_price,
      i.category,
      i.created_at,
      i.updated_at,
      CASE
        WHEN i.quantity <= 0 THEN 'critical'
        WHEN i.quantity <= i.min_quantity THEN 'low'
        ELSE 'adequate'
      END AS status
    FROM inventory_items i
  `);

  // DO NOTHING, e não DO UPDATE: o bootstrap cria o admin quando ele não
  // existe, mas nunca reverte a senha que o operador trocou pela interface.
  await pool.query(
    `
      INSERT INTO users (name, email, password_hash, role, active)
      VALUES ($1, $2, $3, 'admin', true)
      ON CONFLICT (email) DO NOTHING
    `,
    [DEFAULT_ADMIN_NAME, DEFAULT_ADMIN_EMAIL, await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, BCRYPT_ROUNDS)]
  );

  /*
   * Vocabulário estrutural do domínio. Sempre `DO NOTHING`: o boot preenche um
   * banco novo, mas nunca reverte o que o operador ajustou depois. Com
   * `DO UPDATE` — como era antes — cor, ordem e prefixo voltavam ao valor de
   * fábrica a cada restart.
   *
   * Os status de pedido são estruturais de verdade: a reposição automática de
   * estoque depende de existir um status cujo nome contenha "cancel".
   */
  await pool.query(`
    INSERT INTO order_statuses (name, sort_order, color, active)
    VALUES
      ('Novo', 1, '#2563eb', TRUE),
      ('Aguardando documentação', 2, '#f97316', TRUE),
      ('Documentação pendente', 3, '#ea580c', TRUE),
      ('Em análise DETRAN', 4, '#f59e0b', TRUE),
      ('Aguardando pagamento', 5, '#eab308', TRUE),
      ('Em produção', 6, '#0ea5e9', TRUE),
      ('Pronto para retirada', 7, '#14b8a6', TRUE),
      ('Concluído', 8, '#16a34a', TRUE),
      ('Cancelado', 9, '#dc2626', TRUE)
    ON CONFLICT (name) DO NOTHING
  `);

  await pool.query(`
    INSERT INTO plate_types (code, label, color)
    VALUES
      ('MERCOSUL', 'Mercosul', '#2563eb'),
      ('ANTIGA', 'Antiga', '#6b7280')
    ON CONFLICT (code) DO NOTHING
  `);

  await pool.query(`
    INSERT INTO vehicle_types (code, label, wheel_count, active)
    VALUES
      ('CARRO', 'Carro', 4, TRUE),
      ('MOTO', 'Moto', 2, TRUE),
      ('CAMINHAO', 'Caminhão', 6, TRUE),
      ('ONIBUS', 'Ônibus', 6, TRUE)
    ON CONFLICT (code) DO NOTHING
  `);

  await pool.query(`
    INSERT INTO service_categories (name, prefix)
    VALUES
      ('Emplacamento', 'EMP'),
      ('Transferência', 'TRF'),
      ('Segunda Via', '2VIA'),
      ('Documentação', 'DOC')
    ON CONFLICT (name) DO NOTHING
  `);

  // Colunas usadas em todo filtro/join do app não tinham índice algum.
  await pool.query(`CREATE INDEX IF NOT EXISTS orders_client_id_idx ON orders(client_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS orders_status_id_idx ON orders(status_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS orders_created_by_idx ON orders(created_by)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS orders_service_type_id_idx ON orders(service_type_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS clients_created_by_idx ON clients(created_by)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS clients_email_idx ON clients(email)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS vehicles_client_id_idx ON vehicles(client_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS vehicles_license_plate_idx ON vehicles(license_plate)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS inventory_movements_order_id_idx ON inventory_movements(order_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS inventory_movements_item_id_idx ON inventory_movements(inventory_item_id)`);
};

/**
 * Dados de demonstração (tipos de serviço com preços, itens de estoque e regras
 * de consumo). Ficam FORA do boot padrão: um deploy real nasce vazio e o cliente
 * cadastra os próprios serviços e preços pelas telas de administração. Carregar
 * é sempre um ato explícito — `SEED_DEMO_DATA=true` ou rodar o arquivo à mão
 * com psql. O SQL vive só em deploy/seed_emplacadora.sql, sem cópia aqui.
 */
const loadDemoData = async () => {
  const seedPath = path.join(__dirname, 'deploy', 'seed_emplacadora.sql');

  try {
    const sql = await fs.readFile(seedPath, 'utf8');
    await pool.query(sql);
    console.log('[server] dados de demonstração carregados (SEED_DEMO_DATA).');
  } catch (error) {
    console.error('[server] falha ao carregar dados de demonstração:', error);
  }
};

/**
 * Backfill das senhas em texto puro para bcrypt. Como o valor original está
 * disponível, o hash é gerado direto e a coluna legada é zerada no mesmo passo
 * — não é preciso esperar o próximo login do usuário.
 */
const migratePlaintextPasswords = async () => {
  const { rows } = await pool.query(
    `SELECT id, password FROM users
     WHERE password_hash IS NULL AND password IS NOT NULL AND password <> ''`
  );

  for (const row of rows) {
    const hash = await bcrypt.hash(row.password, BCRYPT_ROUNDS);
    await pool.query('UPDATE users SET password_hash = $1, password = NULL, updated_at = NOW() WHERE id = $2', [
      hash,
      row.id,
    ]);
  }

  // Restos de texto puro em contas que já tinham hash.
  await pool.query(`UPDATE users SET password = NULL WHERE password IS NOT NULL AND password_hash IS NOT NULL`);

  if (rows.length) {
    console.log(`[server] ${rows.length} senha(s) em texto puro migrada(s) para bcrypt.`);
  }
};

/**
 * Diagnóstico de bootstrap. Só é usado nos logs de startup e na rota
 * autenticada de integrações — o /api/health público não expõe nada disso.
 */
const getAuthDiagnostics = async () => {
  const [{ rows: adminRows }, { rows: totalRows }] = await Promise.all([
    pool.query('SELECT id, email, role, active FROM users WHERE email = $1 LIMIT 1', [DEFAULT_ADMIN_EMAIL]),
    pool.query('SELECT COUNT(*)::int AS total FROM users'),
  ]);

  return {
    adminEmail: DEFAULT_ADMIN_EMAIL,
    adminExists: !!adminRows[0],
    adminActive: adminRows[0]?.active ?? false,
    usersCount: totalRows[0]?.total ?? 0,
  };
};

const sessionCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: IS_PRODUCTION,
  maxAge: SESSION_TTL_MS,
  path: '/',
});

const createSession = async (userId) => {
  const token = crypto.randomUUID();
  await pool.query('INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3)', [
    token,
    userId,
    new Date(Date.now() + SESSION_TTL_MS),
  ]);
  return token;
};

const destroySession = (token) => pool.query('DELETE FROM sessions WHERE token = $1', [token]);

const purgeExpiredSessions = async () => {
  try {
    await pool.query('DELETE FROM sessions WHERE expires_at <= NOW()');
  } catch (error) {
    console.error('[server] falha ao limpar sessões expiradas:', error);
  }
};

/** Erro genérico para o cliente; o detalhe fica no log do servidor. */
const respondServerError = (res, context, error, shape = 'query') => {
  console.error(`[server] ${context}:`, error);
  const status = error?.statusCode || 500;
  const message = error?.statusCode ? error.message : 'Erro interno do servidor';

  if (shape === 'ok') return res.status(status).json({ ok: false, error: { message } });
  return res.status(status).json({ data: null, error: { message } });
};


const parsePagination = (req) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 500);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  return { limit, offset };
};

/** Comparação em tempo constante, para não vazar a chave por timing. */
const secretsMatch = (provided, expected) => {
  const a = Buffer.from(String(provided ?? ''), 'utf8');
  const b = Buffer.from(String(expected ?? ''), 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};

const requireIntegrationKey = (req, res, next) => {
  if (!secretsMatch(req.header('x-api-key'), INTEGRATION_API_KEY)) {
    return res.status(401).json({
      ok: false,
      error: {
        message: 'Não autorizado. Informe x-api-key válido.',
      },
    });
  }

  return next();
};

const signinLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { data: { user: null, session: null }, error: { message: 'Muitas tentativas de login. Tente novamente em alguns minutos.' } },
});

const mapOrderWhere = (params = {}) => {
  const clauses = [];
  const values = [];

  if (params.statusId) {
    clauses.push(`o.status_id = $${values.length + 1}`);
    values.push(params.statusId);
  }

  if (params.updatedSince) {
    clauses.push(`o.updated_at >= $${values.length + 1}`);
    values.push(params.updatedSince);
  }

  return {
    sql: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
    values,
  };
};

const orderSelectSql = `
  SELECT o.*,
    json_build_object('id', c.id, 'name', c.name, 'document', c.document, 'type', c.type, 'created_by', c.created_by) AS client,
    json_build_object('id', st.id, 'name', st.name, 'category_id', st.category_id) AS "serviceType",
    json_build_object('id', v.id, 'license_plate', v.license_plate, 'brand', v.brand, 'model', v.model, 'year', v.year, 'client_id', v.client_id, 'plate_type_id', v.plate_type_id, 'category', v.category) AS vehicle,
    json_build_object('id', os.id, 'name', os.name, 'color', os.color, 'sort_order', os.sort_order) AS status
  FROM orders o
  LEFT JOIN clients c ON c.id = o.client_id
  LEFT JOIN service_types st ON st.id = o.service_type_id
  LEFT JOIN vehicles v ON v.id = o.vehicle_id
  LEFT JOIN order_statuses os ON os.id = o.status_id
`;


const restoreOrderInventory = async (client, orderId, responsibleId, reason) => {
  const { rows: outstandingRows } = await client.query(
    `
      SELECT
        inventory_item_id,
        SUM(
          CASE
            WHEN movement_type = 'out' THEN quantity
            WHEN movement_type = 'in' THEN -quantity
            ELSE 0
          END
        )::int AS outstanding
      FROM inventory_movements
      WHERE order_id = $1
      GROUP BY inventory_item_id
      HAVING SUM(
        CASE
          WHEN movement_type = 'out' THEN quantity
          WHEN movement_type = 'in' THEN -quantity
          ELSE 0
        END
      ) > 0
    `,
    [orderId]
  );

  for (const row of outstandingRows) {
    const restoreQty = Number(row.outstanding || 0);
    if (restoreQty <= 0) continue;

    const { rows: itemRows } = await client.query(
      'SELECT quantity FROM inventory_items WHERE id = $1 FOR UPDATE',
      [row.inventory_item_id]
    );

    if (!itemRows[0]) continue;

    const nextQuantity = Number(itemRows[0].quantity || 0) + restoreQty;

    await client.query(
      'UPDATE inventory_items SET quantity = $1, updated_at = NOW() WHERE id = $2',
      [nextQuantity, row.inventory_item_id]
    );

    await client.query(
      `INSERT INTO inventory_movements (
        inventory_item_id,
        movement_type,
        quantity,
        responsible_id,
        order_id,
        notes
      ) VALUES ($1, 'in', $2, $3, $4, $5)`,
      [row.inventory_item_id, restoreQty, responsibleId || null, orderId, reason]
    );
  }
};
const getSessionUser = async (req) => {
  const token = req.cookies?.vp_session;
  if (!token) return null;

  const { rows } = await pool.query(
    `SELECT u.id, u.email, u.role, u.name
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token = $1 AND s.expires_at > NOW() AND u.active = true
     LIMIT 1`,
    [token]
  );

  return rows[0] || null;
};

const requireAuth = async (req, res, next) => {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return res.status(401).json({ data: null, error: { message: 'Não autenticado' } });
    }
    req.user = user;
    return next();
  } catch (error) {
    return respondServerError(res, 'falha ao resolver sessão', error);
  }
};

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, database: DB_MODE });
  } catch (error) {
    console.error('[server] health check falhou:', error);
    // 503, não 500: a API está de pé mas não consegue servir. Um 500 fazia o
    // orquestrador tratar como saudável um container sem banco.
    res.status(503).json({ ok: false, database: DB_MODE, error: { message: 'Banco de dados indisponível' } });
  }
});

app.get('/api/auth/session', async (req, res) => {
  try {
    const user = await getSessionUser(req);
    if (!user) return res.json({ data: { session: null }, error: null });
    return res.json({ data: { session: { access_token: 'server-session', user } }, error: null });
  } catch (error) {
    console.error('[server] falha ao ler sessão:', error);
    return res.status(500).json({ data: { session: null }, error: { message: 'Erro interno do servidor' } });
  }
});

app.post('/api/auth/signin', signinLimiter, async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ data: { user: null, session: null }, error: { message: 'Credenciais inválidas' } });
    }

    const { rows } = await pool.query(
      'SELECT id, email, role, name, password_hash FROM users WHERE email = $1 AND active = true LIMIT 1',
      [email]
    );

    const record = rows[0];
    // bcrypt.compare mesmo sem usuário: mantém o custo constante e não revela
    // por timing se o e-mail existe.
    const passwordMatches = await bcrypt.compare(
      String(password),
      record?.password_hash || '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidi'
    );

    if (!record || !passwordMatches) {
      return res.status(401).json({ data: { user: null, session: null }, error: { message: 'Credenciais inválidas' } });
    }

    const user = { id: record.id, email: record.email, role: record.role, name: record.name };
    const token = await createSession(user.id);
    res.cookie('vp_session', token, sessionCookieOptions());

    return res.json({ data: { user, session: { access_token: 'server-session', user } }, error: null });
  } catch (error) {
    console.error('[server] falha no login:', error);
    return res
      .status(500)
      .json({ data: { user: null, session: null }, error: { message: 'Erro interno do servidor' } });
  }
});

app.post('/api/auth/signout', async (req, res) => {
  try {
    const token = req.cookies?.vp_session;
    if (token) await destroySession(token);
  } catch (error) {
    console.error('[server] falha ao encerrar sessão:', error);
  }

  res.clearCookie('vp_session', { ...sessionCookieOptions(), maxAge: undefined });
  res.json({ error: null });
});


app.get('/api/integrations', requireIntegrationKey, (_req, res) => {
  res.json({
    ok: true,
    version: API_VERSION,
    resources: {
      health: '/api/integrations/health',
      orders: '/api/integrations/orders',
      clients: '/api/integrations/clients',
      vehicles: '/api/integrations/vehicles',
      serviceTypes: '/api/integrations/service-types',
      orderStatuses: '/api/integrations/order-statuses',
      webhookTest: '/api/integrations/webhooks/test',
    },
  });
});

app.get('/api/integrations/health', requireIntegrationKey, async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    const auth = await getAuthDiagnostics();
    return res.json({ ok: true, version: API_VERSION, auth });
  } catch (error) {
    return respondServerError(res, 'falha em rota de integração', error, 'ok');
  }
});

app.get('/api/integrations/orders', requireIntegrationKey, async (req, res) => {
  try {
    const { limit, offset } = parsePagination(req);
    const where = mapOrderWhere({
      statusId: req.query.status_id,
      updatedSince: req.query.updated_since,
    });

    const query = `${orderSelectSql} ${where.sql} ORDER BY o.updated_at DESC LIMIT $${where.values.length + 1} OFFSET $${where.values.length + 2}`;
    const params = [...where.values, limit, offset];

    const [{ rows }, { rows: countRows }] = await Promise.all([
      pool.query(query, params),
      pool.query(`SELECT COUNT(*)::int AS total FROM orders o ${where.sql}`, where.values),
    ]);

    return res.json({
      ok: true,
      data: rows,
      pagination: { limit, offset, total: countRows[0]?.total ?? 0 },
    });
  } catch (error) {
    return respondServerError(res, 'falha em rota de integração', error, 'ok');
  }
});

app.get('/api/integrations/orders/:id', requireIntegrationKey, async (req, res) => {
  try {
    const q = `${orderSelectSql} WHERE o.id = $1 LIMIT 1`;
    const { rows } = await pool.query(q, [req.params.id]);
    if (!rows[0]) {
      return res.status(404).json({ ok: false, error: { message: 'Pedido não encontrado' } });
    }
    return res.json({ ok: true, data: rows[0] });
  } catch (error) {
    return respondServerError(res, 'falha em rota de integração', error, 'ok');
  }
});

app.post('/api/integrations/orders/:id/status', requireIntegrationKey, async (req, res) => {
  const { status_id: statusId, message } = req.body || {};
  if (!statusId) {
    return res.status(400).json({ ok: false, error: { message: 'Campo status_id é obrigatório' } });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE orders SET status_id = $1, message = COALESCE($2, message), updated_at = NOW() WHERE id = $3 RETURNING *`,
      [statusId, message ?? null, req.params.id]
    );

    if (!rows[0]) {
      return res.status(404).json({ ok: false, error: { message: 'Pedido não encontrado' } });
    }

    return res.json({ ok: true, data: rows[0] });
  } catch (error) {
    return respondServerError(res, 'falha em rota de integração', error, 'ok');
  }
});

app.get('/api/integrations/clients', requireIntegrationKey, async (req, res) => {
  try {
    const { limit, offset } = parsePagination(req);
    const { rows } = await pool.query(
      `SELECT * FROM clients ORDER BY updated_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return res.json({ ok: true, data: rows, pagination: { limit, offset } });
  } catch (error) {
    return respondServerError(res, 'falha em rota de integração', error, 'ok');
  }
});

app.get('/api/integrations/vehicles', requireIntegrationKey, async (req, res) => {
  try {
    const { limit, offset } = parsePagination(req);
    const { rows } = await pool.query(
      `SELECT * FROM vehicles ORDER BY updated_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return res.json({ ok: true, data: rows, pagination: { limit, offset } });
  } catch (error) {
    return respondServerError(res, 'falha em rota de integração', error, 'ok');
  }
});

app.get('/api/integrations/service-types', requireIntegrationKey, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT st.*, sc.name AS category_name FROM service_types st LEFT JOIN service_categories sc ON sc.id = st.category_id ORDER BY st.updated_at DESC`
    );
    return res.json({ ok: true, data: rows });
  } catch (error) {
    return respondServerError(res, 'falha em rota de integração', error, 'ok');
  }
});

app.get('/api/integrations/order-statuses', requireIntegrationKey, async (_req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM order_statuses ORDER BY sort_order ASC, name ASC`);
    return res.json({ ok: true, data: rows });
  } catch (error) {
    return respondServerError(res, 'falha em rota de integração', error, 'ok');
  }
});

app.post('/api/integrations/webhooks/test', requireIntegrationKey, async (req, res) => {
  return res.json({ ok: true, receivedAt: new Date().toISOString(), payload: req.body ?? null });
});

app.post('/api/query', requireAuth, async (req, res) => {
  try {
    const {
      table,
      action = 'select',
      filters = [],
      sortBy,
      limitN,
      payload,
      upsertOptions,
      singleMode = 'none',
      selectOptions,
      returnMode = 'representation',
    } = req.body || {};

    if (!ALLOWED_TABLES.has(table)) {
      return res.status(400).json({ data: null, error: { message: 'Tabela não permitida' } });
    }

    const user = req.user;
    const policy = queryPolicy(table, action, user);
    if (!policy.allowed) {
      return res.status(403).json({ data: null, error: { message: policy.message } });
    }

    if (action === 'select') {
      // A consulta de pedidos usa join, então colunas ambíguas (created_by
      // existe em orders e em clients) precisam do alias `o`.
      const alias = table === 'orders' ? 'o' : '';
      const where = buildScopedWhere(table, filters, user, alias);
      const orderPrefix = alias ? `${alias}.` : '';
      const orderSql = sortBy && isSafeIdent(sortBy.column)
        ? ` ORDER BY ${orderPrefix}${sortBy.column} ${sortBy.ascending ? 'ASC' : 'DESC'}`
        : '';
      const limitSql = Number.isInteger(limitN) ? ` LIMIT ${limitN}` : '';

      let query;
      let countFrom;
      if (table === 'orders') {
        query = `
          SELECT o.*,
            json_build_object('id', c.id, 'name', c.name, 'document', c.document, 'type', c.type, 'created_by', c.created_by) AS client,
            json_build_object('id', st.id, 'name', st.name, 'category_id', st.category_id) AS "serviceType",
            json_build_object('id', v.id, 'license_plate', v.license_plate, 'brand', v.brand, 'model', v.model, 'year', v.year, 'client_id', v.client_id, 'plate_type_id', v.plate_type_id, 'category', v.category) AS vehicle,
            json_build_object('id', os.id, 'name', os.name, 'color', os.color, 'sort_order', os.sort_order) AS status
          FROM orders o
          LEFT JOIN clients c ON c.id = o.client_id
          LEFT JOIN service_types st ON st.id = o.service_type_id
          LEFT JOIN vehicles v ON v.id = o.vehicle_id
          LEFT JOIN order_statuses os ON os.id = o.status_id
          ${where.sql}
          ${orderSql}
          ${limitSql}
        `;
        countFrom = 'orders o';
      } else {
        query = `SELECT * FROM ${table} ${where.sql}${orderSql}${limitSql}`;
        countFrom = table;
      }

      const { rows } = await pool.query(query, where.values);
      let count;
      if (selectOptions?.count === 'exact') {
        const c = await pool.query(
          `SELECT COUNT(*)::int AS total FROM ${countFrom} ${where.sql}`,
          where.values
        );
        count = c.rows[0]?.total ?? 0;
      }

      const safeRows = stripSensitiveRows(rows);
      const data = selectOptions?.head ? null : safeRows;
      if (singleMode === 'single') {
        if (!safeRows[0]) return res.json({ data: null, error: { message: 'Registro não encontrado' }, count });
        return res.json({ data: safeRows[0], error: null, count });
      }
      if (singleMode === 'maybeSingle') {
        return res.json({ data: safeRows[0] ?? null, error: null, count });
      }
      return res.json({ data, error: null, count });
    }

    if (action === 'insert') {
      const rawRows = Array.isArray(payload) ? payload : [];
      if (!rawRows.length) return res.status(400).json({ data: null, error: { message: 'Payload vazio' } });

      const rowsToInsert = [];
      for (const raw of rawRows) {
        const clean = await sanitizeWritePayload(table, raw, user);
        if (table === 'vehicles') await assertVehicleClientInScope(clean.client_id, user);
        rowsToInsert.push(clean);
      }

      const inserted = [];
      for (const row of rowsToInsert) {
        const cols = Object.keys(row).filter(isSafeIdent);
        const vals = cols.map((c) => row[c]);
        const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
        const q = `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders}) RETURNING *`;

        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          const r = await client.query(q, vals);
          const insertedRow = r.rows[0];

          if (table === 'orders' && insertedRow?.service_type_id && insertedRow?.vehicle_id) {
            const { rows: vehicleRows } = await client.query(
              'SELECT category FROM vehicles WHERE id = $1 LIMIT 1',
              [insertedRow.vehicle_id]
            );

            const rawCategory = String(vehicleRows[0]?.category || '').toLowerCase();
            const normalizedCategory = rawCategory.includes('moto') ? 'moto' : 'carro';

            const { rows: rules } = await client.query(
              `SELECT inventory_item_id, quantity_required
               FROM service_inventory_rules
               WHERE service_type_id = $1
                 AND active = true
                 AND (vehicle_category = $2 OR vehicle_category = 'all')`,
              [insertedRow.service_type_id, normalizedCategory]
            );

            for (const rule of rules) {
              const { rows: itemRows } = await client.query(
                'SELECT quantity, name FROM inventory_items WHERE id = $1 FOR UPDATE',
                [rule.inventory_item_id]
              );

              const currentQty = Number(itemRows[0]?.quantity || 0);
              const nextQty = currentQty - Number(rule.quantity_required || 0);

              if (nextQty < 0) {
                throw new Error(
                  `Estoque insuficiente para ${itemRows[0]?.name || 'item'} ao criar pedido.`
                );
              }

              await client.query(
                'UPDATE inventory_items SET quantity = $1, updated_at = NOW() WHERE id = $2',
                [nextQty, rule.inventory_item_id]
              );

              await client.query(
                `INSERT INTO inventory_movements (
                  inventory_item_id,
                  movement_type,
                  quantity,
                  responsible_id,
                  order_id,
                  notes
                ) VALUES ($1, 'out', $2, $3, $4, $5)`,
                [
                  rule.inventory_item_id,
                  rule.quantity_required,
                  insertedRow.created_by || null,
                  insertedRow.id,
                  `Consumo automático do serviço ${insertedRow.service_type_id} (${normalizedCategory})`,
                ]
              );
            }
          }

          await client.query('COMMIT');
          inserted.push(insertedRow);
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        } finally {
          client.release();
        }
      }

      const safeInserted = stripSensitiveRows(inserted);
      if (returnMode === 'minimal') {
        return res.json({ data: null, error: null });
      }
      if (singleMode === 'single') return res.json({ data: safeInserted[0] ?? null, error: null });
      return res.json({ data: safeInserted, error: null });
    }

    if (action === 'upsert') {
      const rawRows = Array.isArray(payload) ? payload : payload ? [payload] : [];
      if (!rawRows.length) return res.status(400).json({ data: null, error: { message: 'Payload vazio' } });

      const conflictColumn = isSafeIdent(upsertOptions?.onConflict || '') ? upsertOptions.onConflict : null;
      if (!conflictColumn) {
        return res.status(400).json({ data: null, error: { message: 'onConflict é obrigatório para upsert' } });
      }

      const rowsToUpsert = [];
      for (const raw of rawRows) {
        const clean = await sanitizeWritePayload(table, raw, user);
        if (table === 'vehicles') await assertVehicleClientInScope(clean.client_id, user);
        rowsToUpsert.push(clean);
      }

      const upserted = [];
      for (const row of rowsToUpsert) {
        const cols = Object.keys(row).filter(isSafeIdent);
        const vals = cols.map((c) => row[c]);
        const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
        const updateCols = cols.filter((c) => c !== conflictColumn);
        const updateSql = updateCols.length
          ? updateCols.map((c) => `${c} = EXCLUDED.${c}`).join(', ')
          : `${conflictColumn} = EXCLUDED.${conflictColumn}`;

        const q = `
          INSERT INTO ${table} (${cols.join(', ')})
          VALUES (${placeholders})
          ON CONFLICT (${conflictColumn})
          DO UPDATE SET ${updateSql}
          RETURNING *
        `;
        const r = await pool.query(q, vals);
        upserted.push(r.rows[0]);
      }

      const safeUpserted = stripSensitiveRows(upserted);
      if (returnMode === 'minimal') {
        return res.json({ data: null, error: null });
      }
      if (singleMode === 'single' || rowsToUpsert.length === 1) return res.json({ data: safeUpserted[0] ?? null, error: null });
      return res.json({ data: safeUpserted, error: null });
    }

    if (action === 'update') {
      const where = buildScopedWhere(table, filters, user);
      // Sem filtro do cliente o UPDATE não teria WHERE e reescreveria a tabela
      // inteira — o escopo de perfil sozinho não é proteção suficiente aqui.
      if (!where.clientFilterCount) {
        return res
          .status(400)
          .json({ data: null, error: { message: 'update exige ao menos um filtro' } });
      }

      const cleanPayload = await sanitizeWritePayload(table, payload, user);
      const cols = Object.keys(cleanPayload).filter(isSafeIdent);
      if (!cols.length) return res.status(400).json({ data: null, error: { message: 'Payload vazio' } });
      const setSql = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
      const values = cols.map((c) => cleanPayload[c]);
      const whereSql = where.sql ? ` ${where.sql.replace(/\$(\d+)/g, (_, n) => `$${Number(n) + cols.length}`)}` : '';
      const q = `UPDATE ${table} SET ${setSql}, updated_at = NOW()${whereSql} RETURNING *`;

      if (table === 'orders') {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');

          const { rows: beforeRows } = await client.query(
            `SELECT id, status_id, created_by FROM orders ${where.sql}`,
            where.values
          );

          const r = await client.query(q, [...values, ...where.values]);
          const rows = stripSensitiveRows(r.rows);

          if (cleanPayload.status_id) {
            const { rows: targetStatusRows } = await client.query(
              'SELECT name FROM order_statuses WHERE id = $1 LIMIT 1',
              [cleanPayload.status_id]
            );

            const targetName = String(targetStatusRows[0]?.name || '').toLowerCase();
            const isCancelTarget = targetName.includes('cancel');

            if (isCancelTarget) {
              const beforeById = new Map(beforeRows.map((row) => [row.id, row]));
              for (const updatedOrder of rows) {
                const beforeOrder = beforeById.get(updatedOrder.id);
                if (!beforeOrder) continue;
                if (beforeOrder.status_id === updatedOrder.status_id) continue;

                await restoreOrderInventory(
                  client,
                  updatedOrder.id,
                  updatedOrder.created_by || beforeOrder.created_by || null,
                  'Reposição automática por cancelamento do pedido'
                );
              }
            }
          }

          await client.query('COMMIT');

          if (returnMode === 'minimal') {
            return res.json({ data: null, error: null });
          }
          if (singleMode === 'single') {
            if (!rows[0]) return res.json({ data: null, error: { message: 'Registro não encontrado' } });
            return res.json({ data: rows[0], error: null });
          }
          if (singleMode === 'maybeSingle') return res.json({ data: rows[0] ?? null, error: null });
          return res.json({ data: rows, error: null });
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        } finally {
          client.release();
        }
      }

      const r = await pool.query(q, [...values, ...where.values]);
      const rows = stripSensitiveRows(r.rows);
      if (returnMode === 'minimal') {
        return res.json({ data: null, error: null });
      }
      if (singleMode === 'single') {
        if (!rows[0]) return res.json({ data: null, error: { message: 'Registro não encontrado' } });
        return res.json({ data: rows[0], error: null });
      }
      if (singleMode === 'maybeSingle') return res.json({ data: rows[0] ?? null, error: null });
      return res.json({ data: rows, error: null });
    }

    if (action === 'delete') {
      const where = buildScopedWhere(table, filters, user);
      // Mesmo motivo do update: sem filtro isto vira `DELETE FROM <tabela>`.
      if (!where.clientFilterCount) {
        return res
          .status(400)
          .json({ data: null, error: { message: 'delete exige ao menos um filtro' } });
      }

      if (table === 'orders') {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');

          const { rows: orderRows } = await client.query(
            `SELECT id, created_by FROM orders ${where.sql}`,
            where.values
          );

          for (const orderRow of orderRows) {
            await restoreOrderInventory(
              client,
              orderRow.id,
              orderRow.created_by || null,
              'Reposição automática por exclusão do pedido'
            );
          }

          await client.query(`DELETE FROM ${table} ${where.sql}`, where.values);
          await client.query('COMMIT');
          return res.json({ data: [], error: null });
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        } finally {
          client.release();
        }
      }

      await pool.query(`DELETE FROM ${table} ${where.sql}`, where.values);
      return res.json({ data: [], error: null });
    }

    return res.status(400).json({ data: null, error: { message: 'Ação inválida' } });
  } catch (error) {
    return respondServerError(res, `falha em /api/query (${req.body?.table}/${req.body?.action})`, error);
  }
});


app.use(express.static(path.join(__dirname, 'dist')));

/*
 * Duas variantes do HTML saem do build (ver scripts/prerender.mjs):
 *  - index.html      → home pública já renderizada, com o texto no HTML inicial
 *                      para indexação; é o que o express.static serve em "/";
 *  - app-shell.html  → shell vazio, para as rotas do painel. Servir a home
 *                      pré-renderizada aqui só faria o navegador pintar e jogar
 *                      fora um conteúdo que não é o daquela rota.
 * Se a pré-renderização não tiver rodado, app-shell.html não existe e o
 * fallback volta ao index.html — a SPA continua funcionando normalmente.
 */
const DIST_DIR = path.join(__dirname, 'dist');
const APP_SHELL = path.join(DIST_DIR, 'app-shell.html');
const PRERENDERED_HOME = path.join(DIST_DIR, 'index.html');
const PUBLIC_SITE_ROUTES = new Set(['/', '/home', '/index']);

const appShellExists = await fs
  .access(APP_SHELL)
  .then(() => true)
  .catch(() => false);

if (!appShellExists) {
  console.warn('[server] app-shell.html ausente; servindo index.html em todas as rotas.');
}

app.get('*', (req, res) => {
  const isPublicSite = PUBLIC_SITE_ROUTES.has(req.path);
  const file = isPublicSite || !appShellExists ? PRERENDERED_HOME : APP_SHELL;
  res.sendFile(file);
});

// Sem estes handlers, uma rejeição não tratada derruba o processo silenciosamente.
process.on('unhandledRejection', (reason) => {
  console.error('[server] unhandled rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[server] uncaught exception:', error);
});

const startHttpServer = () => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[server] running on 0.0.0.0:${PORT}`);
  });
};
const bootstrap = async () => {
  try {
    await ensureCoreSchema();
    await migratePlaintextPasswords();
    if (SEED_DEMO_DATA) await loadDemoData();
    await purgeExpiredSessions();
    setInterval(purgeExpiredSessions, 1000 * 60 * 60).unref();

    const auth = await getAuthDiagnostics();
    console.log('[server] auth bootstrap:', auth);
  } catch (error) {
    console.error('[server] failed to initialize database during bootstrap:', error);
    console.error('[server] continuing startup; /api/health will report DB status.');
  } finally {
    startHttpServer();
  }
};

bootstrap();
