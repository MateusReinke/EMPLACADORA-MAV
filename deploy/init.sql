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
  brand TEXT,
  model TEXT,
  year TEXT,
  category TEXT DEFAULT 'carros',
  plate_type_id UUID REFERENCES plate_types(id) ON DELETE SET NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
  category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,
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
  message TEXT,
  estimated_delivery_date DATE,
  status_id UUID REFERENCES order_statuses(id) ON DELETE SET NULL,
  value NUMERIC(12,2) DEFAULT 0,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  quantity NUMERIC(12,2) NOT NULL DEFAULT 0,
  min_quantity NUMERIC(12,2) NOT NULL DEFAULT 0,
  cost_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
WHERE i.active = TRUE;

INSERT INTO users (name, email, password, role, active)
VALUES (:'admin_name', :'admin_email', :'admin_password', 'admin', TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (name, email, password, role, active)
VALUES ('Vendedor Demo', 'vendedor@emplacadora.com', '123456', 'seller', TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (name, email, password, role, active)
VALUES ('Cliente Demo', 'cliente@emplacadora.com', '123456', 'physical', TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO service_categories (name)
VALUES ('Documentação')
ON CONFLICT (name) DO NOTHING;

INSERT INTO order_statuses (name, color, sort_order, active)
VALUES
  ('Novo', '#3b82f6', 1, TRUE),
  ('Em Andamento', '#f59e0b', 2, TRUE),
  ('Concluído', '#10b981', 3, TRUE)
ON CONFLICT (name) DO NOTHING;

INSERT INTO plate_types (label, code, color, active)
VALUES
  ('Mercosul', 'MERCOSUL', '#2563eb', TRUE),
  ('Antiga', 'ANTIGA', '#6b7280', TRUE)
ON CONFLICT (code) DO NOTHING;


INSERT INTO inventory_items (name, quantity, min_quantity, cost_price, category, active)
SELECT 'Placas Modelo Mercosul', 20, 10, 95.00, 'Emplacamento', TRUE
WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE name = 'Placas Modelo Mercosul');

INSERT INTO inventory_items (name, quantity, min_quantity, cost_price, category, active)
SELECT 'Adesivos de Segurança', 30, 15, 15.00, 'Emplacamento', TRUE
WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE name = 'Adesivos de Segurança');

INSERT INTO inventory_items (name, quantity, min_quantity, cost_price, category, active)
SELECT 'Lacres', 50, 20, 5.00, 'Emplacamento', TRUE
WHERE NOT EXISTS (SELECT 1 FROM inventory_items WHERE name = 'Lacres');
