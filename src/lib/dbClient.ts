/*
 * Cliente HTTP para backend PostgreSQL.
 * Sem localStorage para dados da aplicação.
 */

type Row = Record<string, any>;

type FilterOp = "eq" | "in" | "gte" | "lte";

interface Filter {
  op: FilterOp;
  column: string;
  value: any;
}

const API_BASE = "/api";

type QueryAction = "select" | "insert" | "update" | "delete";

class QueryBuilder implements PromiseLike<any> {
  private filters: Filter[] = [];
  private sortBy?: { column: string; ascending: boolean };
  private limitN?: number;
  private mode: QueryAction = "select";
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

  private async execute() {
    const response = await fetch(`${API_BASE}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        table: this.table,
        action: this.mode,
        filters: this.filters,
        sortBy: this.sortBy,
        limitN: this.limitN,
        payload: this.payload,
        singleMode: this.singleMode,
        selectOptions: this.selectOptions,
      }),
    });

    return response.json();
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

type AuthListener = (event: string, session: any) => void;
const authListeners: AuthListener[] = [];

const notify = (event: string, session: any) => {
  authListeners.forEach((cb) => cb(event, session));
};

export const db = {
  from: (table: string) => new QueryBuilder(table),
  auth: {
    async getSession() {
      const response = await fetch(`${API_BASE}/auth/session`, { credentials: "include" });
      return response.json();
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
      const response = await fetch(`${API_BASE}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const payload = await response.json();
      if (!payload.error) notify("SIGNED_IN", payload.data?.session ?? null);
      return payload;
    },
    async signOut() {
      const response = await fetch(`${API_BASE}/auth/signout`, {
        method: "POST",
        credentials: "include",
      });
      const payload = await response.json();
      notify("SIGNED_OUT", null);
      return payload;
    },
  },
  functions: {
    async invoke(_name: string, _opts?: any) {
      return { data: { initialized: true }, error: null };
    },
  },
};
