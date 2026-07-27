-- Dados de DEMONSTRAÇÃO: tipos de serviço com preços de exemplo, itens de
-- estoque e regras de consumo.
--
-- Isto NÃO é carregado num deploy normal. Um banco novo nasce apenas com o
-- vocabulário estrutural (status de pedido, tipos de placa, tipos de veículo e
-- categorias de serviço), e o cliente cadastra os próprios serviços, preços e
-- estoque pelas telas de administração.
--
-- Carregue só quando quiser uma base populada para demonstração ou testes:
--
--   SEED_DEMO_DATA=true no ambiente (o servidor roda este arquivo no boot)
--
-- ou, com o sistema já no ar:
--
--   psql -h 127.0.0.1 -p 5435 -U emplacadora -d emplacadora -f deploy/seed_emplacadora.sql
--
-- O script é idempotente e não sobrescreve nada que já exista: rodar duas vezes
-- não duplica registros nem reverte preços ajustados pelo cliente.

BEGIN;

INSERT INTO inventory_items (name, quantity, min_quantity, cost_price, category)
SELECT seed.name, seed.quantity, seed.min_quantity, seed.cost_price, seed.category
FROM (
  VALUES
    ('Placa Mercosul Carro', 200, 20, 40::numeric, 'placas'),
    ('Placa Mercosul Moto', 150, 15, 35::numeric, 'placas'),
    ('Lacre', 500, 50, 2::numeric, 'insumos'),
    ('Tarjeta', 300, 30, 4::numeric, 'insumos')
) AS seed(name, quantity, min_quantity, cost_price, category)
WHERE NOT EXISTS (
  SELECT 1 FROM inventory_items ii WHERE ii.name = seed.name
);

INSERT INTO service_types (name, description, active, price, category_id)
SELECT seed.name, seed.description, TRUE, seed.price, sc.id
FROM (
  VALUES
    ('Primeiro emplacamento', 'Cadastro e emissão inicial de placa Mercosul', 320.00::numeric, 'Emplacamento'),
    ('Transferência de propriedade', 'Processo completo de transferência com emissão de placas', 380.00::numeric, 'Transferência'),
    ('Segunda via de placa', 'Emissão de segunda via de placa por perda ou dano', 260.00::numeric, 'Segunda Via'),
    ('Regularização documental', 'Apoio na regularização de documentação veicular', 180.00::numeric, 'Documentação')
) AS seed(name, description, price, category_name)
JOIN service_categories sc ON sc.name = seed.category_name
ON CONFLICT (name) DO NOTHING;

-- Sem DELETE prévio: a versão anterior apagava e recriava estas regras a cada
-- boot, destruindo qualquer ajuste de consumo feito pelo cliente. O NOT EXISTS
-- torna a carga repetível sem duplicar nem sobrescrever.
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
JOIN inventory_items ii ON ii.name = rules.item_name
WHERE NOT EXISTS (
  SELECT 1 FROM service_inventory_rules sir
  WHERE sir.service_type_id = st.id
    AND sir.inventory_item_id = ii.id
    AND sir.vehicle_category = rules.vehicle_category
);

COMMIT;
