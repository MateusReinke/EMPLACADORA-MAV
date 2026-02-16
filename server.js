import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import pg from 'pg';

const { Pool } = pg;

const PORT = Number(process.env.APP_PORT || 8090);
const DB_HOST = process.env.POSTGRES_HOST || '127.0.0.1';
const DB_PORT = Number(process.env.POSTGRES_PORT || 5435);
const DB_NAME = process.env.POSTGRES_DB || 'emplacadora';
const DB_USER = process.env.POSTGRES_USER || 'emplacadora';
const DB_PASSWORD = process.env.POSTGRES_PASSWORD || 'emplacadora123';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

const pool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
});

const sessions = new Map();
const ALLOWED_TABLES = new Set([
  'users',
  'clients',
  'vehicles',
  'orders',
  'service_categories',
  'service_types',
  'order_statuses',
  'plate_types',
  'inventory_movements',
  'dashboard_layouts',
  'inventory_status',
]);

const isSafeIdent = (s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s);

const buildWhere = (filters = [], startIndex = 1) => {
  const clauses = [];
  const values = [];
  let i = startIndex;

  for (const f of filters) {
    if (!f || !isSafeIdent(f.column)) continue;

    if (f.op === 'eq') {
      clauses.push(`${f.column} = $${i++}`);
      values.push(f.value);
    } else if (f.op === 'in' && Array.isArray(f.value) && f.value.length > 0) {
      clauses.push(`${f.column} = ANY($${i++})`);
      values.push(f.value);
    } else if (f.op === 'gte') {
      clauses.push(`${f.column} >= $${i++}`);
      values.push(f.value);
    } else if (f.op === 'lte') {
      clauses.push(`${f.column} <= $${i++}`);
      values.push(f.value);
    }
  }

  return {
    sql: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
    values,
    nextIndex: i,
  };
};

const getSessionUser = async (req) => {
  const token = req.cookies?.vp_session;
  if (!token) return null;
  const userId = sessions.get(token);
  if (!userId) return null;
  const { rows } = await pool.query(
    'SELECT id, email, role FROM users WHERE id = $1 AND active = true LIMIT 1',
    [userId]
  );
  return rows[0] || null;
};

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, error: String(error) });
  }
});

app.get('/api/auth/session', async (req, res) => {
  try {
    const user = await getSessionUser(req);
    if (!user) return res.json({ data: { session: null }, error: null });
    return res.json({ data: { session: { access_token: 'server-session', user } }, error: null });
  } catch (error) {
    return res.status(500).json({ data: { session: null }, error: { message: String(error) } });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ data: { user: null, session: null }, error: { message: 'Credenciais inválidas' } });
  }

  const { rows } = await pool.query(
    'SELECT id, email, role FROM users WHERE email = $1 AND password = $2 AND active = true LIMIT 1',
    [email, password]
  );
  const user = rows[0];
  if (!user) {
    return res.status(401).json({ data: { user: null, session: null }, error: { message: 'Credenciais inválidas' } });
  }

  const token = crypto.randomUUID();
  sessions.set(token, user.id);
  res.cookie('vp_session', token, { httpOnly: true, sameSite: 'lax' });
  return res.json({ data: { user, session: { access_token: 'server-session', user } }, error: null });
});

app.post('/api/auth/signout', (req, res) => {
  const token = req.cookies?.vp_session;
  if (token) sessions.delete(token);
  res.clearCookie('vp_session');
  res.json({ error: null });
});

app.post('/api/query', async (req, res) => {
  try {
    const {
      table,
      action = 'select',
      filters = [],
      sortBy,
      limitN,
      payload,
      singleMode = 'none',
      selectOptions,
    } = req.body || {};

    if (!ALLOWED_TABLES.has(table)) {
      return res.status(400).json({ data: null, error: { message: 'Tabela não permitida' } });
    }

    if (action === 'select') {
      const where = buildWhere(filters);
      const orderSql = sortBy && isSafeIdent(sortBy.column)
        ? ` ORDER BY ${sortBy.column} ${sortBy.ascending ? 'ASC' : 'DESC'}`
        : '';
      const limitSql = Number.isInteger(limitN) ? ` LIMIT ${limitN}` : '';

      let query;
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
      } else {
        query = `SELECT * FROM ${table} ${where.sql}${orderSql}${limitSql}`;
      }

      const { rows } = await pool.query(query, where.values);
      let count;
      if (selectOptions?.count === 'exact') {
        const c = await pool.query(`SELECT COUNT(*)::int AS total FROM ${table} ${where.sql}`, where.values);
        count = c.rows[0]?.total ?? 0;
      }

      const data = selectOptions?.head ? null : rows;
      if (singleMode === 'single') {
        if (!rows[0]) return res.json({ data: null, error: { message: 'Registro não encontrado' }, count });
        return res.json({ data: rows[0], error: null, count });
      }
      if (singleMode === 'maybeSingle') {
        return res.json({ data: rows[0] ?? null, error: null, count });
      }
      return res.json({ data, error: null, count });
    }

    if (action === 'insert') {
      const rowsToInsert = Array.isArray(payload) ? payload : [];
      if (!rowsToInsert.length) return res.status(400).json({ data: null, error: { message: 'Payload vazio' } });

      const inserted = [];
      for (const row of rowsToInsert) {
        const cols = Object.keys(row).filter(isSafeIdent);
        const vals = cols.map((c) => row[c]);
        const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
        const q = `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders}) RETURNING *`;
        const r = await pool.query(q, vals);
        inserted.push(r.rows[0]);
      }

      if (singleMode === 'single') return res.json({ data: inserted[0] ?? null, error: null });
      return res.json({ data: inserted, error: null });
    }

    if (action === 'update') {
      const where = buildWhere(filters);
      const cols = Object.keys(payload || {}).filter(isSafeIdent);
      if (!cols.length) return res.status(400).json({ data: null, error: { message: 'Payload vazio' } });
      const setSql = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
      const values = cols.map((c) => payload[c]);
      const whereSql = where.sql ? ` ${where.sql.replace(/\$(\d+)/g, (_, n) => `$${Number(n) + cols.length}`)}` : '';
      const q = `UPDATE ${table} SET ${setSql}, updated_at = NOW()${whereSql} RETURNING *`;
      const r = await pool.query(q, [...values, ...where.values]);
      const rows = r.rows;
      if (singleMode === 'single') {
        if (!rows[0]) return res.json({ data: null, error: { message: 'Registro não encontrado' } });
        return res.json({ data: rows[0], error: null });
      }
      if (singleMode === 'maybeSingle') return res.json({ data: rows[0] ?? null, error: null });
      return res.json({ data: rows, error: null });
    }

    if (action === 'delete') {
      const where = buildWhere(filters);
      await pool.query(`DELETE FROM ${table} ${where.sql}`, where.values);
      return res.json({ data: [], error: null });
    }

    return res.status(400).json({ data: null, error: { message: 'Ação inválida' } });
  } catch (error) {
    return res.status(500).json({ data: null, error: { message: String(error) } });
  }
});

app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] running on 0.0.0.0:${PORT}`);
});
