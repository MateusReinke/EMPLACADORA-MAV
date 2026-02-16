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
  'inventory_items',
  'inventory_movements',
  'dashboard_layouts',
  'inventory_status',
  'funcionario_comissao_servico',
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
  };
};

const getSessionUser = async (req) => {
  const token = req.cookies?.vp_session;
  if (!token) return null;
  const userId = sessions.get(token);
  if (!userId) return null;
  const { rows } = await pool.query(
    `SELECT id, email, role, ativo, active
     FROM users WHERE id = $1 LIMIT 1`,
    [userId]
  );
  const user = rows[0];
  if (!user) return null;
  if (user.ativo === false || user.active === false) return null;
  return user;
};

const requireAuth = async (req, res) => {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ data: null, error: { message: 'Não autenticado' } });
    return null;
  }
  return user;
};

const requireAdmin = async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return null;
  if (user.role !== 'admin') {
    res.status(403).json({ data: null, error: { message: 'Acesso restrito ao ADMIN' } });
    return null;
  }
  return user;
};

const normalizeOrderRow = (order) => ({
  ...order,
  created_by: order.created_by || order.funcionario_responsavel_id,
  value: Number(order.value || order.valor_total || 0),
});

const getCancelStatusId = async () => {
  const { rows } = await pool.query(
    `SELECT id FROM order_statuses WHERE UPPER(name) = 'CANCELADO' LIMIT 1`
  );
  return rows[0]?.id || null;
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
    `SELECT id, email, role, ativo, active
     FROM users
     WHERE email = $1 AND password = $2 AND role = 'admin' AND COALESCE(ativo, true) = true AND COALESCE(active, true) = true
     LIMIT 1`,
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

const handleOrderInsert = async (rowsToInsert, loggedUserId) => {
  const inserted = [];

  for (const raw of rowsToInsert) {
    const row = normalizeOrderRow(raw);
    const clientId = row.client_id;
    const vehicleId = row.vehicle_id;
    const serviceTypeId = row.service_type_id;
    const funcionarioId = row.funcionario_responsavel_id || row.created_by;
    const value = Number(row.valor_total || row.value || 0);

    if (!clientId || !vehicleId || !serviceTypeId || !funcionarioId || value <= 0) {
      throw new Error('Campos obrigatórios do pedido ausentes: cliente_id, veiculo_id, funcionario_id, valor_total');
    }

    const [svcRes, funcRes] = await Promise.all([
      pool.query(`SELECT * FROM service_types WHERE id = $1 LIMIT 1`, [serviceTypeId]),
      pool.query(`SELECT * FROM users WHERE id = $1 LIMIT 1`, [funcionarioId]),
    ]);

    const service = svcRes.rows[0];
    const funcionario = funcRes.rows[0];
    if (!service) throw new Error('Serviço não encontrado');
    if (!funcionario) throw new Error('Funcionário responsável não encontrado');

    // 1) Regra de estoque: bloqueia criação se faltar
    let estoqueItem = null;
    if (service.vinculado_estoque && service.estoque_item_id) {
      const st = await pool.query(`SELECT * FROM inventory_items WHERE id = $1 LIMIT 1`, [service.estoque_item_id]);
      estoqueItem = st.rows[0];
      if (!estoqueItem) throw new Error('Item de estoque vinculado ao serviço não encontrado');

      const qtdAtual = Number(estoqueItem.quantidade_atual ?? estoqueItem.quantity ?? 0);
      const qtdBaixa = Number(service.quantidade_baixa_estoque || 0);
      if (qtdBaixa > 0 && qtdAtual < qtdBaixa) {
        throw new Error('Estoque insuficiente para o serviço selecionado');
      }
    }

    // 2) Comissão: calcula no momento e nunca recalcula automaticamente
    let comissaoCalculada = 0;
    if (funcionario.recebe_comissao) {
      if (funcionario.tipo_comissao === 'percentual') {
        comissaoCalculada = value * (Number(funcionario.percentual_comissao || 0) / 100);
      } else if (funcionario.tipo_comissao === 'fixo_por_servico') {
        const fx = await pool.query(
          `SELECT valor_comissao FROM funcionario_comissao_servico
           WHERE funcionario_id = $1 AND servico_id = $2 LIMIT 1`,
          [funcionarioId, serviceTypeId]
        );
        comissaoCalculada = Number(fx.rows[0]?.valor_comissao || 0);
      }
    }

    const createdBy = row.created_by || loggedUserId;
    const statusId = row.status_id || null;

    const orderRes = await pool.query(
      `INSERT INTO orders (
        order_number, service_type_id, client_id, vehicle_id, funcionario_responsavel_id,
        message, estimated_delivery_date, status_id,
        value, valor_total, valor_comissao_calculado, comissao_status, created_by
      ) VALUES (
        $1,$2,$3,$4,$5,
        $6,$7,$8,
        $9,$10,$11,$12,$13
      ) RETURNING *`,
      [
        row.order_number || null,
        serviceTypeId,
        clientId,
        vehicleId,
        funcionarioId,
        row.message || null,
        row.estimated_delivery_date || null,
        statusId,
        value,
        value,
        Number(comissaoCalculada.toFixed(2)),
        'pendente',
        createdBy,
      ]
    );

    const createdOrder = orderRes.rows[0];

    // 3) Baixa automática de estoque após criação
    if (estoqueItem && Number(service.quantidade_baixa_estoque || 0) > 0) {
      const qtdBaixa = Number(service.quantidade_baixa_estoque || 0);
      const qtdAtual = Number(estoqueItem.quantidade_atual ?? estoqueItem.quantity ?? 0);
      const next = qtdAtual - qtdBaixa;

      await pool.query(
        `UPDATE inventory_items
         SET quantidade_atual = $2, quantity = $2, updated_at = NOW()
         WHERE id = $1`,
        [estoqueItem.id, next]
      );

      await pool.query(
        `INSERT INTO inventory_movements (inventory_item_id, movement_type, quantity, responsible_id, order_id, notes)
         VALUES ($1, 'out', $2, $3, $4, $5)`,
        [estoqueItem.id, qtdBaixa, createdBy, createdOrder.id, 'Baixa automática por criação do pedido']
      );
    }

    inserted.push(createdOrder);
  }

  return inserted;
};

const handleOrderUpdate = async (filters, payload, loggedUser) => {
  const where = buildWhere(filters);
  const currentRows = await pool.query(`SELECT * FROM orders ${where.sql}`, where.values);
  if (!currentRows.rows.length) return [];

  const cancelStatusId = await getCancelStatusId();
  const targetCancelByStatus = payload?.status_id && cancelStatusId && payload.status_id === cancelStatusId;

  // apenas admin pode marcar comissão paga
  if (payload?.comissao_status === 'pago' && loggedUser.role !== 'admin') {
    throw new Error('Somente ADMIN pode marcar comissão como paga');
  }

  const cols = Object.keys(payload || {}).filter(isSafeIdent);
  const values = cols.map((c) => payload[c]);
  let updated = [];

  if (cols.length) {
    const setSql = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
    const whereSql = where.sql
      ? ` ${where.sql.replace(/\$(\d+)/g, (_, n) => `$${Number(n) + cols.length}`)}`
      : '';

    const q = `UPDATE orders SET ${setSql}, updated_at = NOW()${whereSql} RETURNING *`;
    const r = await pool.query(q, [...values, ...where.values]);
    updated = r.rows;
  } else {
    updated = currentRows.rows;
  }

  // cancelamento: devolve estoque + cancela comissão
  for (const before of currentRows.rows) {
    const after = updated.find((u) => u.id === before.id) || before;
    const becameCanceled = targetCancelByStatus || after.comissao_status === 'cancelado';

    if (becameCanceled) {
      const svcRes = await pool.query(`SELECT * FROM service_types WHERE id = $1 LIMIT 1`, [before.service_type_id]);
      const service = svcRes.rows[0];

      if (service?.vinculado_estoque && service?.estoque_item_id && Number(service.quantidade_baixa_estoque || 0) > 0) {
        const qtd = Number(service.quantidade_baixa_estoque || 0);
        await pool.query(
          `UPDATE inventory_items
           SET quantidade_atual = COALESCE(quantidade_atual, 0) + $2,
               quantity = COALESCE(quantity, 0) + $2,
               updated_at = NOW()
           WHERE id = $1`,
          [service.estoque_item_id, qtd]
        );

        await pool.query(
          `INSERT INTO inventory_movements (inventory_item_id, movement_type, quantity, responsible_id, order_id, notes)
           VALUES ($1, 'in', $2, $3, $4, $5)`,
          [service.estoque_item_id, qtd, loggedUser.id, before.id, 'Devolução automática por cancelamento']
        );
      }

      await pool.query(
        `UPDATE orders
         SET comissao_status = 'cancelado',
             valor_comissao_calculado = 0,
             updated_at = NOW()
         WHERE id = $1`,
        [before.id]
      );
    }
  }

  const reloaded = await pool.query(`SELECT * FROM orders ${where.sql}`, where.values);
  return reloaded.rows;
};

app.post('/api/query', async (req, res) => {
  try {
    const loggedUser = await requireAuth(req, res);
    if (!loggedUser) return;

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

    // Segurança: users e comissão apenas admin
    if ((table === 'users' || table === 'funcionario_comissao_servico') && loggedUser.role !== 'admin') {
      return res.status(403).json({ data: null, error: { message: 'Acesso restrito ao ADMIN' } });
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

      let inserted;
      if (table === 'orders') {
        inserted = await handleOrderInsert(rowsToInsert, loggedUser.id);
      } else {
        inserted = [];
        for (const row of rowsToInsert) {
          const cols = Object.keys(row).filter(isSafeIdent);
          const vals = cols.map((c) => row[c]);
          const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
          const q = `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders}) RETURNING *`;
          const r = await pool.query(q, vals);
          inserted.push(r.rows[0]);
        }
      }

      if (singleMode === 'single') return res.json({ data: inserted[0] ?? null, error: null });
      return res.json({ data: inserted, error: null });
    }

    if (action === 'update') {
      const where = buildWhere(filters);
      let rows;

      if (table === 'orders') {
        rows = await handleOrderUpdate(filters, payload || {}, loggedUser);
      } else {
        const cols = Object.keys(payload || {}).filter(isSafeIdent);
        if (!cols.length) return res.status(400).json({ data: null, error: { message: 'Payload vazio' } });

        const setSql = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
        const values = cols.map((c) => payload[c]);
        const whereSql = where.sql ? ` ${where.sql.replace(/\$(\d+)/g, (_, n) => `$${Number(n) + cols.length}`)}` : '';
        const q = `UPDATE ${table} SET ${setSql}, updated_at = NOW()${whereSql} RETURNING *`;
        const r = await pool.query(q, [...values, ...where.values]);
        rows = r.rows;
      }

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
