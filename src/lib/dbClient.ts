/*
 * Cliente local compatível com o uso atual de dados locais no projeto.
 * Mantém os mesmos métodos encadeáveis para evitar refactor massivo.
 */

type Row = Record<string, any>;
type DatabaseStore = Record<string, Row[]>;

type FilterOp = "eq" | "in" | "gte" | "lte";

interface Filter {
  op: FilterOp;
  column: string;
  value: any;
}

const DB_STORAGE_KEY = "vp_local_db";
const SESSION_STORAGE_KEY = "vp_local_session";

const nowIso = () => new Date().toISOString();
const id = () => (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);

const seedDatabase = (): DatabaseStore => {
  const adminId = id();
  const sellerId = id();
  const clientPhysicalUserId = id();
  const clientJuridicalUserId = id();
  const clientPhysicalId = id();
  const clientJuridicalId = id();

  return {
    users: [
      {
        id: adminId,
        name: "Administrador Padrão",
        email: "admin@emplacadora.com",
        password: "123456",
        role: "admin",
        active: true,
        created_at: nowIso(),
      },
      {
        id: sellerId,
        name: "Vendedor Demo",
        email: "vendedor@emplacadora.com",
        password: "123456",
        role: "seller",
        active: true,
        created_at: nowIso(),
      },
      {
        id: clientPhysicalUserId,
        name: "Cliente Físico Demo",
        email: "cliente@emplacadora.com",
        password: "123456",
        role: "physical",
        active: true,
        created_at: nowIso(),
      },
      {
        id: clientJuridicalUserId,
        name: "Cliente Jurídico Demo",
        email: "empresa@emplacadora.com",
        password: "123456",
        role: "juridical",
        active: true,
        created_at: nowIso(),
      },
    ],
    clients: [
      {
        id: clientPhysicalId,
        name: "Cliente Físico Demo",
        document: "12345678900",
        type: "physical",
        active: true,
        user_id: clientPhysicalUserId,
        created_by: sellerId,
        created_at: nowIso(),
      },
      {
        id: clientJuridicalId,
        name: "Empresa Demo LTDA",
        document: "11222333000199",
        type: "juridical",
        active: true,
        user_id: clientJuridicalUserId,
        created_by: sellerId,
        created_at: nowIso(),
      },
    ],
    vehicles: [],
    orders: [],
    service_categories: [{ id: id(), name: "Documentação", created_at: nowIso() }],
    service_types: [],
    order_statuses: [
      { id: id(), name: "Novo", color: "#3b82f6", sort_order: 1, active: true },
      { id: id(), name: "Em Andamento", color: "#f59e0b", sort_order: 2, active: true },
      { id: id(), name: "Concluído", color: "#10b981", sort_order: 3, active: true },
    ],
    plate_types: [
      { id: id(), label: "Mercosul", code: "MERCOSUL", color: "#2563eb" },
      { id: id(), label: "Antiga", code: "ANTIGA", color: "#6b7280" },
    ],
    inventory_status: [],
    inventory_movements: [],
  };
};

const getDb = (): DatabaseStore => {
  const raw = localStorage.getItem(DB_STORAGE_KEY);
  if (raw) return JSON.parse(raw);
  const seeded = seedDatabase();
  localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
};

const saveDb = (db: DatabaseStore) => {
  localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db));
};

const withOrderJoins = (db: DatabaseStore, order: Row): Row => ({
  ...order,
  client: db.clients.find((c) => c.id === order.client_id) ?? null,
  serviceType: db.service_types.find((s) => s.id === order.service_type_id) ?? null,
  vehicle: db.vehicles.find((v) => v.id === order.vehicle_id) ?? null,
  status: db.order_statuses.find((s) => s.id === order.status_id) ?? null,
});

class QueryBuilder implements PromiseLike<any> {
  private filters: Filter[] = [];
  private sortBy?: { column: string; ascending: boolean };
  private limitN?: number;
  private mode: "select" | "insert" | "update" | "delete" = "select";
  private selectOptions?: { count?: "exact"; head?: boolean };
  private payload: any;
  private singleMode: "none" | "single" | "maybeSingle" = "none";

  constructor(private table: string) {}

  select(_columns?: string, options?: { count?: "exact"; head?: boolean }) {
    this.mode = "select";
    this.selectOptions = options;
    return this;
  }

  insert(payload: Row[]) {
    this.mode = "insert";
    this.payload = payload;
    return this;
  }

  update(payload: Row) {
    this.mode = "update";
    this.payload = payload;
    return this;
  }

  delete() {
    this.mode = "delete";
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push({ op: "eq", column, value });
    return this;
  }

  in(column: string, value: any[]) {
    this.filters.push({ op: "in", column, value });
    return this;
  }

  gte(column: string, value: any) {
    this.filters.push({ op: "gte", column, value });
    return this;
  }

  lte(column: string, value: any) {
    this.filters.push({ op: "lte", column, value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.sortBy = { column, ascending: options?.ascending ?? true };
    return this;
  }

  limit(n: number) {
    this.limitN = n;
    return this;
  }

  single() {
    this.singleMode = "single";
    return this;
  }

  maybeSingle() {
    this.singleMode = "maybeSingle";
    return this;
  }

  private applyFilters(rows: Row[]) {
    return rows.filter((row) =>
      this.filters.every((f) => {
        const value = row[f.column];
        if (f.op === "eq") return value === f.value;
        if (f.op === "in") return Array.isArray(f.value) && f.value.includes(value);
        if (f.op === "gte") return value >= f.value;
        if (f.op === "lte") return value <= f.value;
        return true;
      })
    );
  }

  private toResult(data: any, count?: number) {
    return { data, error: null, count };
  }

  private execute() {
    const db = getDb();
    const tableRows = [...(db[this.table] ?? [])];
    let rows = this.applyFilters(tableRows);

    if (this.sortBy) {
      const { column, ascending } = this.sortBy;
      rows.sort((a, b) => {
        const av = a[column];
        const bv = b[column];
        if (av === bv) return 0;
        return (av > bv ? 1 : -1) * (ascending ? 1 : -1);
      });
    }

    if (this.limitN != null) rows = rows.slice(0, this.limitN);

    if (this.mode === "insert") {
      const now = nowIso();
      const newRows = (this.payload as Row[]).map((row) => ({
        id: row.id ?? id(),
        created_at: row.created_at ?? now,
        updated_at: now,
        active: row.active ?? true,
        ...row,
      }));
      db[this.table] = [...(db[this.table] ?? []), ...newRows];
      saveDb(db);
      rows = newRows;
    }

    if (this.mode === "update") {
      const target = new Set(rows.map((r) => r.id));
      const now = nowIso();
      db[this.table] = (db[this.table] ?? []).map((row) =>
        target.has(row.id) ? { ...row, ...this.payload, updated_at: now } : row
      );
      saveDb(db);
      rows = this.applyFilters(db[this.table] ?? []);
    }

    if (this.mode === "delete") {
      const target = new Set(rows.map((r) => r.id));
      db[this.table] = (db[this.table] ?? []).filter((row) => !target.has(row.id));
      saveDb(db);
      rows = [];
    }

    if (this.table === "orders") {
      rows = rows.map((r) => withOrderJoins(db, r));
    }

    const count = this.selectOptions?.count === "exact" ? rows.length : undefined;
    const data = this.selectOptions?.head ? null : rows;

    if (this.singleMode === "single") {
      if (!rows[0]) return { data: null, error: { message: "Registro não encontrado" }, count };
      return this.toResult(rows[0], count);
    }

    if (this.singleMode === "maybeSingle") {
      return this.toResult(rows[0] ?? null, count);
    }

    return this.toResult(data, count);
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return Promise.resolve(this.execute()).then(onfulfilled, onrejected);
  }
}

type AuthListener = (event: string, session: any) => void;
const authListeners: AuthListener[] = [];

const buildSession = () => {
  const db = getDb();
  const userId = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!userId) return null;
  const user = db.users.find((u) => u.id === userId);
  if (!user) return null;
  return {
    access_token: "local-token",
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
};

export const db = {
  from: (table: string) => new QueryBuilder(table),
  auth: {
    async getSession() {
      return { data: { session: buildSession() }, error: null };
    },
    onAuthStateChange(callback: AuthListener) {
      authListeners.push(callback);
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              const idx = authListeners.indexOf(callback);
              if (idx >= 0) authListeners.splice(idx, 1);
            },
          },
        },
      };
    },
    async signInWithPassword({ email, password }: { email: string; password: string }) {
      const db = getDb();
      const user = db.users.find((u) => u.email === email && u.password === password);
      if (!user) return { data: { user: null, session: null }, error: { message: "Credenciais inválidas" } };

      localStorage.setItem(SESSION_STORAGE_KEY, user.id);
      const session = buildSession();
      authListeners.forEach((cb) => cb("SIGNED_IN", session));
      return { data: { user: session?.user ?? null, session }, error: null };
    },
    async signOut() {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      authListeners.forEach((cb) => cb("SIGNED_OUT", null));
      return { error: null };
    },
  },
  functions: {
    async invoke(_name: string, _opts?: any) {
      return { data: { initialized: true }, error: null };
    },
  },
};
