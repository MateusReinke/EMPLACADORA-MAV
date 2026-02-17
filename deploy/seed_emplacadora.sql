-- Rode este script após o backend criar o schema base (ensureCoreSchema).
-- Exemplo:
-- psql -h 127.0.0.1 -p 5435 -U emplacadora -d emplacadora -f deploy/seed_emplacadora.sql

BEGIN;

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
ON CONFLICT (name) DO UPDATE SET
  sort_order = EXCLUDED.sort_order,
  color = EXCLUDED.color,
  active = EXCLUDED.active,
  updated_at = NOW();

INSERT INTO vehicle_types (code, label, wheel_count, active)
VALUES
  ('CARRO', 'Carro', 4, TRUE),
  ('MOTO', 'Moto', 2, TRUE),
  ('CAMINHAO', 'Caminhão', 6, TRUE),
  ('ONIBUS', 'Ônibus', 6, TRUE)
ON CONFLICT (code) DO UPDATE SET
  label = EXCLUDED.label,
  wheel_count = EXCLUDED.wheel_count,
  active = EXCLUDED.active,
  updated_at = NOW();

INSERT INTO service_categories (name, prefix)
VALUES
  ('Emplacamento', 'EMP'),
  ('Transferência', 'TRF'),
  ('Segunda Via', '2VIA'),
  ('Documentação', 'DOC')
ON CONFLICT (name) DO UPDATE SET
  prefix = EXCLUDED.prefix,
  updated_at = NOW();

INSERT INTO inventory_items (name, quantity, min_quantity, cost_price, category)
VALUES
  ('Placa Mercosul Carro', 200, 20, 40, 'placas'),
  ('Placa Mercosul Moto', 150, 15, 35, 'placas'),
  ('Lacre', 500, 50, 2, 'insumos'),
  ('Tarjeta', 300, 30, 4, 'insumos')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS service_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_required_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type_id UUID NOT NULL REFERENCES service_types(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES service_documents(id) ON DELETE CASCADE,
  required BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(service_type_id, document_id)
);

INSERT INTO service_documents (name, description, active)
VALUES
  ('Documento pessoal com foto', 'RG ou CNH do titular/procurador', TRUE),
  ('CPF ou CNPJ', 'Cadastro da pessoa física ou jurídica', TRUE),
  ('Comprovante de endereço', 'Comprovante recente em nome do cliente', TRUE),
  ('Nota fiscal do veículo', 'NF-e de compra ou documento equivalente', TRUE),
  ('CRV/ATPV-e', 'Documento de transferência quando aplicável', TRUE),
  ('Boletim de ocorrência', 'Necessário para perda/roubo em casos específicos', TRUE),
  ('Laudo de vistoria', 'Laudo de vistoria aprovado no órgão competente', TRUE)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  active = EXCLUDED.active,
  updated_at = NOW();

ALTER TABLE service_types ADD COLUMN IF NOT EXISTS required_documents TEXT;

INSERT INTO service_types (name, description, required_documents, active, price, category_id)
SELECT seed.name, seed.description, seed.required_documents, TRUE, seed.price, sc.id
FROM (
  VALUES
    ('Primeiro emplacamento', 'Cadastro e emissão inicial de placa Mercosul', 'Documento pessoal com foto, comprovante de endereço, nota fiscal do veículo, laudo de vistoria e autorização do proprietário (se aplicável).', 320.00::numeric, 'Emplacamento'),
    ('Transferência de propriedade', 'Processo completo de transferência com emissão de placas', 'CRV/ATPV-e assinado, documento do comprador e vendedor, comprovante de quitação de débitos e comprovante de endereço.', 380.00::numeric, 'Transferência'),
    ('Segunda via de placa', 'Emissão de segunda via de placa por perda ou dano', 'Boletim de ocorrência (quando aplicável), CRLV e documento do proprietário.', 260.00::numeric, 'Segunda Via'),
    ('Regularização documental', 'Apoio na regularização de documentação veicular', 'Documentos pendentes apontados pelo DETRAN, RG/CPF ou CNPJ e comprovante de endereço atualizado.', 180.00::numeric, 'Documentação')
) AS seed(name, description, required_documents, price, category_name)
JOIN service_categories sc ON sc.name = seed.category_name
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  required_documents = EXCLUDED.required_documents,
  active = EXCLUDED.active,
  price = EXCLUDED.price,
  category_id = EXCLUDED.category_id,
  updated_at = NOW();

DELETE FROM service_inventory_rules
WHERE service_type_id IN (
  SELECT id FROM service_types
  WHERE name IN (
    'Primeiro emplacamento',
    'Transferência de propriedade',
    'Segunda via de placa'
  )
);

DELETE FROM service_required_documents
WHERE service_type_id IN (
  SELECT id FROM service_types
  WHERE name IN (
    'Primeiro emplacamento',
    'Transferência de propriedade',
    'Segunda via de placa',
    'Regularização documental'
  )
);

INSERT INTO service_required_documents (service_type_id, document_id, required)
SELECT st.id, sd.id, rules.required
FROM (
  VALUES
    ('Primeiro emplacamento', 'Documento pessoal com foto', TRUE),
    ('Primeiro emplacamento', 'CPF ou CNPJ', TRUE),
    ('Primeiro emplacamento', 'Comprovante de endereço', TRUE),
    ('Primeiro emplacamento', 'Nota fiscal do veículo', TRUE),
    ('Primeiro emplacamento', 'Laudo de vistoria', TRUE),
    ('Transferência de propriedade', 'Documento pessoal com foto', TRUE),
    ('Transferência de propriedade', 'CPF ou CNPJ', TRUE),
    ('Transferência de propriedade', 'Comprovante de endereço', TRUE),
    ('Transferência de propriedade', 'CRV/ATPV-e', TRUE),
    ('Segunda via de placa', 'Documento pessoal com foto', TRUE),
    ('Segunda via de placa', 'CPF ou CNPJ', TRUE),
    ('Segunda via de placa', 'Boletim de ocorrência', FALSE),
    ('Regularização documental', 'Documento pessoal com foto', TRUE),
    ('Regularização documental', 'CPF ou CNPJ', TRUE),
    ('Regularização documental', 'Comprovante de endereço', TRUE)
) AS rules(service_name, document_name, required)
JOIN service_types st ON st.name = rules.service_name
JOIN service_documents sd ON sd.name = rules.document_name;

INSERT INTO service_inventory_rules (service_type_id, inventory_item_id, vehicle_category, quantity_required, active)
SELECT st.id, ii.id, rules.vehicle_category, rules.quantity_required, TRUE
FROM (
  VALUES
    ('Primeiro emplacamento', 'Placa Mercosul Carro', 'carro', 2),
    ('Primeiro emplacamento', 'Placa Mercosul Moto', 'moto', 1),
    ('Primeiro emplacamento', 'Lacre', 'all', 1),
    ('Transferência de propriedade', 'Placa Mercosul Carro', 'carro', 2),
    ('Transferência de propriedade', 'Placa Mercosul Moto', 'moto', 1),
    ('Transferência de propriedade', 'Lacre', 'all', 1),
    ('Segunda via de placa', 'Placa Mercosul Carro', 'carro', 2),
    ('Segunda via de placa', 'Placa Mercosul Moto', 'moto', 1)
) AS rules(service_name, item_name, vehicle_category, quantity_required)
JOIN service_types st ON st.name = rules.service_name
JOIN inventory_items ii ON ii.name = rules.item_name;

COMMIT;
