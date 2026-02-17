import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Trash2 } from 'lucide-react';
import {
  ApiService,
  CategoryService,
  InventoryItemOption,
  ServiceCategory,
  ServiceInventoryRule,
  ServiceType,
} from '@/services/serviceTypesApi';

interface RuleDraft {
  inventory_item_id: string;
  vehicle_category: 'carro' | 'moto' | 'all';
  quantity_required: number;
  active: boolean;
}

interface ServiceFormData {
  name: string;
  description: string;
  price: number;
  active: boolean;
  category_id: string;
}

const emptyServiceForm: ServiceFormData = {
  name: '',
  description: '',
  price: 0,
  active: true,
  category_id: '',
};

const emptyRule = (): RuleDraft => ({
  inventory_item_id: '',
  vehicle_category: 'carro',
  quantity_required: 1,
  active: true,
});

const AdminServices = () => {
  const { toast } = useToast();

  const [services, setServices] = useState<ServiceType[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItemOption[]>([]);
  const [rules, setRules] = useState<ServiceInventoryRule[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [serviceForm, setServiceForm] = useState<ServiceFormData>(emptyServiceForm);
  const [ruleDrafts, setRuleDrafts] = useState<RuleDraft[]>([]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [serviceList, categoryList, inventoryList, ruleList] = await Promise.all([
        ApiService.getServiceTypes(),
        CategoryService.getCategories(),
        ApiService.getInventoryItems(),
        ApiService.getServiceInventoryRules(),
      ]);

      setServices(serviceList);
      setCategories(categoryList);
      setInventoryItems(inventoryList);
      setRules(ruleList);
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro', description: 'Falha ao carregar serviços.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredServices = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return services.filter((service) => service.name.toLowerCase().includes(query));
  }, [services, searchTerm]);

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((category) => map.set(category.id, category.name));
    return map;
  }, [categories]);

  const inventoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    inventoryItems.forEach((item) => map.set(item.id, item.name));
    return map;
  }, [inventoryItems]);

  const rulesByServiceId = useMemo(() => {
    const map = new Map<string, ServiceInventoryRule[]>();
    for (const rule of rules) {
      const current = map.get(rule.service_type_id) || [];
      current.push(rule);
      map.set(rule.service_type_id, current);
    }
    return map;
  }, [rules]);

  const openCreateDialog = () => {
    setEditingServiceId(null);
    setServiceForm(emptyServiceForm);
    setRuleDrafts([]);
    setDialogOpen(true);
  };

  const openEditDialog = (service: ServiceType) => {
    setEditingServiceId(service.id);
    setServiceForm({
      name: service.name,
      description: service.description || '',
      price: Number(service.price || 0),
      active: service.active,
      category_id: service.category_id,
    });

    const serviceRules = (rulesByServiceId.get(service.id) || []).map((rule) => ({
      inventory_item_id: rule.inventory_item_id,
      vehicle_category: rule.vehicle_category,
      quantity_required: Number(rule.quantity_required || 1),
      active: rule.active,
    }));

    setRuleDrafts(serviceRules);
    setDialogOpen(true);
  };

  const validateRuleDrafts = () => {
    for (const rule of ruleDrafts) {
      if (!rule.inventory_item_id) {
        throw new Error('Selecione o item de estoque em todas as regras.');
      }
      if (!rule.quantity_required || rule.quantity_required <= 0) {
        throw new Error('Quantidade de consumo deve ser maior que zero.');
      }
    }
  };

  const handleSave = async () => {
    try {
      if (!serviceForm.name.trim()) throw new Error('Nome do serviço é obrigatório.');
      if (!serviceForm.category_id) throw new Error('Categoria do serviço é obrigatória.');
      if (serviceForm.price < 0) throw new Error('Preço não pode ser negativo.');

      validateRuleDrafts();
      setSaving(true);

      const payload = {
        name: serviceForm.name.trim(),
        description: serviceForm.description.trim() || null,
        price: serviceForm.price,
        active: serviceForm.active,
        category_id: serviceForm.category_id,
      };

      let serviceId = editingServiceId;
      if (editingServiceId) {
        await ApiService.updateServiceType(editingServiceId, payload);
      } else {
        const created = await ApiService.createServiceType(payload);
        serviceId = created.id;
      }

      if (!serviceId) throw new Error('Não foi possível identificar o serviço salvo.');

      await ApiService.saveServiceInventoryRules(
        serviceId,
        ruleDrafts.map((rule) => ({
          inventory_item_id: rule.inventory_item_id,
          vehicle_category: rule.vehicle_category,
          quantity_required: Number(rule.quantity_required),
          active: rule.active,
        }))
      );

      setDialogOpen(false);
      await loadData();
      toast({ title: 'Sucesso', description: 'Serviço salvo com sucesso.' });
    } catch (error: unknown) {
      console.error(error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Falha ao salvar serviço.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    try {
      await ApiService.deleteServiceType(serviceId);
      await loadData();
      toast({ title: 'Sucesso', description: 'Serviço removido com sucesso.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro', description: 'Falha ao remover serviço.', variant: 'destructive' });
    }
  };

  const updateRule = (index: number, patch: Partial<RuleDraft>) => {
    setRuleDrafts((current) => current.map((rule, idx) => (idx === index ? { ...rule, ...patch } : rule)));
  };

  const removeRule = (index: number) => {
    setRuleDrafts((current) => current.filter((_, idx) => idx !== index));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Gerenciar Serviços</h1>
          <Button onClick={openCreateDialog} className="gap-2">
            <PlusCircle className="h-4 w-4" /> Novo Serviço
          </Button>
        </div>

        <Input
          placeholder="Buscar serviço por nome..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="max-w-sm"
        />

        <div className="rounded border overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3">Nome</th>
                <th className="text-left p-3">Categoria</th>
                <th className="text-left p-3">Preço</th>
                <th className="text-left p-3">Consumo de estoque</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center">Carregando...</td>
                </tr>
              ) : filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted-foreground">Nenhum serviço encontrado.</td>
                </tr>
              ) : (
                filteredServices.map((service) => {
                  const serviceRules = rulesByServiceId.get(service.id) || [];
                  return (
                    <tr key={service.id} className="border-t">
                      <td className="p-3 font-medium">{service.name}</td>
                      <td className="p-3">{categoryNameById.get(service.category_id) || '-'}</td>
                      <td className="p-3">R$ {Number(service.price || 0).toFixed(2)}</td>
                      <td className="p-3">
                        {serviceRules.length === 0
                          ? 'Sem consumo'
                          : serviceRules
                              .map((rule) => {
                                const vehicleLabel =
                                  rule.vehicle_category === 'carro'
                                    ? 'Carro'
                                    : rule.vehicle_category === 'moto'
                                    ? 'Moto'
                                    : 'Todos';
                                return `${vehicleLabel}: ${rule.quantity_required}x ${inventoryNameById.get(rule.inventory_item_id) || 'Item'}`;
                              })
                              .join(' | ')}
                      </td>
                      <td className="p-3">{service.active ? 'Ativo' : 'Inativo'}</td>
                      <td className="p-3 space-x-2">
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(service)}>Editar</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(service.id)}>Excluir</Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingServiceId ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Nome</label>
                <Input
                  value={serviceForm.name}
                  onChange={(event) => setServiceForm((prev) => ({ ...prev, name: event.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Categoria</label>
                <select
                  className="w-full border rounded px-3 py-2 bg-background"
                  value={serviceForm.category_id}
                  onChange={(event) => setServiceForm((prev) => ({ ...prev, category_id: event.target.value }))}
                >
                  <option value="">Selecione...</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Preço</label>
                <Input
                  type="number"
                  step="0.01"
                  value={serviceForm.price}
                  onChange={(event) => setServiceForm((prev) => ({ ...prev, price: Number(event.target.value || 0) }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  className="w-full border rounded px-3 py-2 bg-background"
                  value={serviceForm.active ? 'active' : 'inactive'}
                  onChange={(event) => setServiceForm((prev) => ({ ...prev, active: event.target.value === 'active' }))}
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Input
                value={serviceForm.description}
                onChange={(event) => setServiceForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Consumo de estoque (opcional)</h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRuleDrafts((current) => [...current, emptyRule()])}
                >
                  + Regra de consumo
                </Button>
              </div>

              {ruleDrafts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Sem regras: este serviço não consumirá estoque automaticamente.
                </p>
              ) : (
                <div className="space-y-3">
                  {ruleDrafts.map((rule, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end border rounded p-3">
                      <div className="md:col-span-5">
                        <label className="text-sm font-medium">Item de estoque</label>
                        <select
                          className="w-full border rounded px-3 py-2 bg-background"
                          value={rule.inventory_item_id}
                          onChange={(event) => updateRule(index, { inventory_item_id: event.target.value })}
                        >
                          <option value="">Selecione...</option>
                          {inventoryItems.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name} (saldo: {item.quantity})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-3">
                        <label className="text-sm font-medium">Tipo de veículo</label>
                        <select
                          className="w-full border rounded px-3 py-2 bg-background"
                          value={rule.vehicle_category}
                          onChange={(event) =>
                            updateRule(index, {
                              vehicle_category: event.target.value as 'carro' | 'moto' | 'all',
                            })
                          }
                        >
                          <option value="carro">Carro</option>
                          <option value="moto">Moto</option>
                          <option value="all">Todos</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-sm font-medium">Qtd. consumo</label>
                        <Input
                          type="number"
                          min={1}
                          value={rule.quantity_required}
                          onChange={(event) =>
                            updateRule(index, {
                              quantity_required: Number(event.target.value || 1),
                            })
                          }
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Button type="button" variant="destructive" className="w-full" onClick={() => removeRule(index)}>
                          <Trash2 className="w-4 h-4 mr-1" /> Remover
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Exemplo: Primeiro emplacamento → Carro: 2 placas, Moto: 1 placa.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar serviço'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default AdminServices;
