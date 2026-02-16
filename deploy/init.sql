CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','seller','physical','juridical')),
  phone TEXT,
  document TEXT,
  photo_url TEXT,
  recebe_comissao BOOLEAN NOT NULL DEFAULT FALSE,
  tipo_comissao TEXT CHECK (tipo_comissao IN ('percentual','fixo_por_servico')),
  percentual_comissao NUMERIC(8,2),
  observacao_acordo TEXT,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  document TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  type TEXT NOT NULL CHECK (type IN ('physical','juridical')),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plate_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  color TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  license_plate TEXT NOT NULL,
  chassis TEXT,
  renavam TEXT,
  brand TEXT,
  model TEXT,
  year TEXT,
  tipo_veiculo TEXT NOT NULL DEFAULT 'carro' CHECK (tipo_veiculo IN ('carro','moto','caminhao')),
  category TEXT DEFAULT 'carros',
  plate_type_id UUID REFERENCES plate_types(id) ON DELETE SET NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_item TEXT NOT NULL,
  tipo_veiculo TEXT NOT NULL DEFAULT 'carro' CHECK (tipo_veiculo IN ('carro','moto','caminhao')),
  quantidade_atual NUMERIC(12,2) NOT NULL DEFAULT 0,
  quantidade_minima_alerta NUMERIC(12,2) NOT NULL DEFAULT 0,
  cost_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (nome_item, tipo_veiculo)
);

CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,
  tipo_veiculo TEXT NOT NULL DEFAULT 'carro' CHECK (tipo_veiculo IN ('carro','moto','caminhao')),
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  vinculado_estoque BOOLEAN NOT NULL DEFAULT FALSE,
  estoque_item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
  quantidade_baixa_estoque NUMERIC(12,2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT,
  service_type_id UUID REFERENCES service_types(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  funcionario_responsavel_id UUID REFERENCES users(id) ON DELETE SET NULL,
  message TEXT,
  estimated_delivery_date DATE,
  status_id UUID REFERENCES order_statuses(id) ON DELETE SET NULL,
  value NUMERIC(12,2) NOT NULL DEFAULT 0,
  valor_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  valor_comissao_calculado NUMERIC(12,2) NOT NULL DEFAULT 0,
  comissao_status TEXT NOT NULL DEFAULT 'pendente' CHECK (comissao_status IN ('pendente','pago','cancelado')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS funcionario_comissao_servico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funcionario_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  servico_id UUID NOT NULL REFERENCES service_types(id) ON DELETE CASCADE,
  valor_comissao NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (funcionario_id, servico_id)
);

CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('in','out')),
  quantity NUMERIC(12,2) NOT NULL,
  responsible_id UUID REFERENCES users(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dashboard_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  layout JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

-- Compatibilidade com schema anterior
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS quantity NUMERIC(12,2);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS min_quantity NUMERIC(12,2);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS category TEXT;
UPDATE inventory_items SET
  name = COALESCE(name, nome_item),
  quantity = COALESCE(quantity, quantidade_atual),
  min_quantity = COALESCE(min_quantity, quantidade_minima_alerta),
  category = COALESCE(category, tipo_veiculo)
WHERE TRUE;

CREATE OR REPLACE VIEW inventory_status AS
SELECT
  i.id,
  COALESCE(i.name, i.nome_item) AS name,
  COALESCE(i.quantity, i.quantidade_atual) AS quantity,
  COALESCE(i.min_quantity, i.quantidade_minima_alerta) AS min_quantity,
  i.cost_price,
  COALESCE(i.category, i.tipo_veiculo) AS category,
  i.created_at,
  i.updated_at,
  CASE
    WHEN COALESCE(i.quantity, i.quantidade_atual) <= 0 THEN 'critical'
    WHEN COALESCE(i.quantity, i.quantidade_atual) <= COALESCE(i.min_quantity, i.quantidade_minima_alerta) THEN 'low'
    ELSE 'adequate'
  END AS status
FROM inventory_items i
WHERE i.active = TRUE;

-- Usuário inicial: somente ADMIN
INSERT INTO users (name, email, password, role, recebe_comissao, ativo, active)
VALUES (:'admin_name', :'admin_email', :'admin_password', 'admin', FALSE, TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO service_categories (name)
VALUES ('Documentação')
ON CONFLICT (name) DO NOTHING;

INSERT INTO order_statuses (name, color, sort_order, active)
VALUES
  ('CRIADO', '#3b82f6', 1, TRUE),
  ('AGUARDANDO PAGAMENTO', '#f59e0b', 2, TRUE),
  ('PAGO', '#22c55e', 3, TRUE),
  ('EM PRODUÇÃO', '#8b5cf6', 4, TRUE),
  ('FINALIZADO', '#10b981', 5, TRUE),
  ('ENTREGUE', '#0ea5e9', 6, TRUE),
  ('CANCELADO', '#ef4444', 7, TRUE)
ON CONFLICT (name) DO NOTHING;

INSERT INTO plate_types (label, code, color, active)
VALUES
  ('Mercosul', 'MERCOSUL', '#2563eb', TRUE),
  ('Antiga', 'ANTIGA', '#6b7280', TRUE)
ON CONFLICT (code) DO NOTHING;

INSERT INTO inventory_items (nome_item, tipo_veiculo, quantidade_atual, quantidade_minima_alerta, cost_price, active, name, quantity, min_quantity, category)
SELECT 'Placa Mercosul Carro', 'carro', 50, 10, 95.00, TRUE, 'Placa Mercosul Carro', 50, 10, 'carro'
WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE nome_item = 'Placa Mercosul Carro' AND tipo_veiculo = 'carro');

INSERT INTO inventory_items (nome_item, tipo_veiculo, quantidade_atual, quantidade_minima_alerta, cost_price, active, name, quantity, min_quantity, category)
SELECT 'Placa Mercosul Moto', 'moto', 50, 10, 65.00, TRUE, 'Placa Mercosul Moto', 50, 10, 'moto'
WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE nome_item = 'Placa Mercosul Moto' AND tipo_veiculo = 'moto');
