/*
 * Cliente HTTP para API backend (PostgreSQL).
 * Mantém os mesmos métodos encadeáveis para evitar refactor massivo.
 */

type Row = Record<string, any>;

type FilterOp = 'eq' | 'in' | 'gte' | 'lte';

interface Filter {
  op: FilterOp;
  column: string;
  value: any;
}

interface QueryResult<T = any> {
  data: T;
  error: { message: string } | null;
  count?: number;
}

const apiRequest = async <T = any>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  let json: any = null;
  try {
    json = await response.json();
  } catch {
    // sem payload JSON
  }

  if (!response.ok && !json) {
    return { data: null, error: { message: `HTTP ${response.status}` } } as T;
  }

  return (json ?? { data: null, error: null }) as T;
};

class QueryBuilder implements PromiseLike<any> {
  private filters: Filter[] = [];
  private sortBy?: { column: string; ascending: boolean };
  private limitN?: number;
  private mode: 'select' | 'insert' | 'upsert' | 'update' | 'delete' = 'select';
  private selectOptions?: { count?: 'exact'; head?: boolean };
  private payload: any;
  private upsertOptions?: { onConflict?: string };
  private singleMode: 'none' | 'single' | 'maybeSingle' = 'none';

  constructor(private table: string) {}

  select(_columns?: string, options?: { count?: 'exact'; head?: boolean }) {
    this.mode = 'select';
    this.selectOptions = options;
    return this;
  }

  insert(payload: Row[]) {
    this.mode = 'insert';
    this.payload = payload;
    return this;
  }

  upsert(payload: Row | Row[], options?: { onConflict?: string }) {
    this.mode = 'upsert';
    this.payload = payload;
    this.upsertOptions = options;
    return this;
  }

  update(payload: Row) {
    this.mode = 'update';
    this.payload = payload;
    return this;
  }

  delete() {
    this.mode = 'delete';
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push({ op: 'eq', column, value });
    return this;
  }

  in(column: string, value: any[]) {
    this.filters.push({ op: 'in', column, value });
    return this;
  }

  gte(column: string, value: any) {
    this.filters.push({ op: 'gte', column, value });
    return this;
  }

  lte(column: string, value: any) {
    this.filters.push({ op: 'lte', column, value });
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
    this.singleMode = 'single';
    return this;
  }

  maybeSingle() {
    this.singleMode = 'maybeSingle';
    return this;
  }

  private execute(): Promise<QueryResult> {
    return apiRequest<QueryResult>('/api/query', {
      method: 'POST',
      body: JSON.stringify({
        table: this.table,
        action: this.mode,
        filters: this.filters,
        sortBy: this.sortBy,
        limitN: this.limitN,
        payload: this.payload,
        upsertOptions: this.upsertOptions,
        singleMode: this.singleMode,
        selectOptions: this.selectOptions,
      }),
    });
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
let lastSession: any = null;

const emitAuth = (event: string, session: any) => {
  authListeners.forEach((cb) => cb(event, session));
};

export const db = {
  from: (table: string) => new QueryBuilder(table),
  auth: {
    async getSession() {
      const result = await apiRequest<{ data: { session: any | null }; error: any }>('/api/auth/session');
      lastSession = result.data?.session ?? null;
      return result;
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
      const result = await apiRequest<{ data: { user: any; session: any }; error: any }>('/api/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (!result.error) {
        lastSession = result.data?.session ?? null;
        emitAuth('SIGNED_IN', lastSession);
      }

      return result;
    },
    async signOut() {
      const result = await apiRequest<{ error: any }>('/api/auth/signout', {
        method: 'POST',
      });
      lastSession = null;
      emitAuth('SIGNED_OUT', null);
      return result;
    },
  },
  functions: {
    async invoke(_name: string, _opts?: any) {
      return { data: { initialized: true }, error: null };
    },
  },
};
