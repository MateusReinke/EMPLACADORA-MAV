import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  OrderStatusItem,
  OrderStatusService,
  ServiceCategory,
  ServiceDocument,
  ServiceInventoryRule,
  ServiceRequiredDocument,
  ServiceType,
} from '@/services/serviceTypesApi';

interface RuleDraft {
  inventory_item_id: string;
  vehicle_category: 'carro' | 'moto' | 'all';
  quantity_required: number;
  active: boolean;
}

interface ServiceDocumentDraft {
  document_id: string;
  required: boolean;
}

interface ServiceFormData {
  name: string;
  description: string;
  required_documents: string;
  price: number;
  active: boolean;
  category_id: string;
}

const emptyServiceForm: ServiceFormData = {
  name: '',
  description: '',
  required_documents: '',
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
  const [statuses, setStatuses] = useState<OrderStatusItem[]>([]);
  const [documents, setDocuments] = useState<ServiceDocument[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItemOption[]>([]);
  const [rules, setRules] = useState<ServiceInventoryRule[]>([]);
  const [serviceRequiredDocs, setServiceRequiredDocs] = useState<ServiceRequiredDocument[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [serviceForm, setServiceForm] = useState<ServiceFormData>(emptyServiceForm);
  const [ruleDrafts, setRuleDrafts] = useState<RuleDraft[]>([]);
  const [serviceDocumentDrafts, setServiceDocumentDrafts] = useState<ServiceDocumentDraft[]>([]);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryPrefix, setNewCategoryPrefix] = useState('');
  const [newStatusName, setNewStatusName] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('#2563eb');
  const [newStatusOrder, setNewStatusOrder] = useState(1);
  const [newDocumentName, setNewDocumentName] = useState('');
  const [newDocumentDescription, setNewDocumentDescription] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [serviceList, categoryList, statusList, documentList, inventoryList, ruleList, requiredDocsList] =
        await Promise.all([
          ApiService.getServiceTypes(),
          CategoryService.getCategories(),
          OrderStatusService.getStatuses(),
          ApiService.getDocuments(),
          ApiService.getInventoryItems(),
          ApiService.getServiceInventoryRules(),
          ApiService.getServiceRequiredDocuments(),
        ]);

      setServices(serviceList);
      setCategories(categoryList);
      setStatuses(statusList);
      setDocuments(documentList);
      setInventoryItems(inventoryList);
      setRules(ruleList);
      setServiceRequiredDocs(requiredDocsList);
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro', description: 'Falha ao carregar dados.', variant: 'destructive' });
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

  const documentNameById = useMemo(() => {
    const map = new Map<string, string>();
    documents.forEach((doc) => map.set(doc.id, doc.name));
    return map;
  }, [documents]);

  const rulesByServiceId = useMemo(() => {
    const map = new Map<string, ServiceInventoryRule[]>();
    for (const rule of rules) {
      const current = map.get(rule.service_type_id) || [];
      current.push(rule);
      map.set(rule.service_type_id, current);
    }
    return map;
  }, [rules]);

  const requiredDocsByServiceId = useMemo(() => {
    const map = new Map<string, ServiceRequiredDocument[]>();
    for (const link of serviceRequiredDocs) {
      const current = map.get(link.service_type_id) || [];
      current.push(link);
      map.set(link.service_type_id, current);
    }
    return map;
  }, [serviceRequiredDocs]);

  const openCreateDialog = () => {
    setEditingServiceId(null);
    setServiceForm(emptyServiceForm);
    setRuleDrafts([]);
    setServiceDocumentDrafts([]);
    setDialogOpen(true);
  };

  const openEditDialog = (service: ServiceType) => {
    setEditingServiceId(service.id);
    setServiceForm({
      name: service.name,
      description: service.description || '',
      required_documents: service.required_documents || '',
      price: Number(service.price || 0),
      active: service.active,
      category_id: service.category_id,
    });

    setRuleDrafts(
      (rulesByServiceId.get(service.id) || []).map((rule) => ({
        inventory_item_id: rule.inventory_item_id,
        vehicle_category: rule.vehicle_category,
        quantity_required: Number(rule.quantity_required || 1),
        active: rule.active,
      }))
    );

    setServiceDocumentDrafts(
      (requiredDocsByServiceId.get(service.id) || []).map((doc) => ({
        document_id: doc.document_id,
        required: doc.required,
      }))
    );

    setDialogOpen(true);
  };

  const validateRuleDrafts = () => {
    for (const rule of ruleDrafts) {
      if (!rule.inventory_item_id) throw new Error('Selecione o item de estoque em todas as regras.');
      if (!rule.quantity_required || rule.quantity_required <= 0) {
        throw new Error('Quantidade de consumo deve ser maior que zero.');
      }
    }
  };

  const handleSaveService = async () => {
    try {
      if (!serviceForm.name.trim()) throw new Error('Nome do serviço é obrigatório.');
      if (!serviceForm.category_id) throw new Error('Categoria do serviço é obrigatória.');
      if (serviceForm.price < 0) throw new Error('Preço não pode ser negativo.');

      validateRuleDrafts();
      setSaving(true);

      const payload = {
        name: serviceForm.name.trim(),
        description: serviceForm.description.trim() || null,
        required_documents: serviceForm.required_documents.trim() || null,
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

      await ApiService.saveServiceRequiredDocuments(
        serviceId,
        serviceDocumentDrafts.map((doc) => ({
          document_id: doc.document_id,
          required: doc.required,
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

  const handleDeleteService = async (serviceId: string) => {
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

  const toggleServiceDocument = (documentId: string, required = true) => {
    setServiceDocumentDrafts((current) => {
      const existing = current.find((doc) => doc.document_id === documentId);
      if (existing) {
        return current.filter((doc) => doc.document_id !== documentId);
      }
      return [...current, { document_id: documentId, required }];
    });
  };

  const setDocumentRequiredFlag = (documentId: string, required: boolean) => {
    setServiceDocumentDrafts((current) =>
      current.map((doc) => (doc.document_id === documentId ? { ...doc, required } : doc))
    );
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await CategoryService.createCategory({ name: newCategoryName.trim(), prefix: newCategoryPrefix.trim() || undefined });
      setNewCategoryName('');
      setNewCategoryPrefix('');
      await loadData();
      toast({ title: 'Sucesso', description: 'Categoria criada com sucesso.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro', description: 'Falha ao criar categoria.', variant: 'destructive' });
    }
  };

  const handleEditCategory = async (category: ServiceCategory) => {
    const name = window.prompt('Nome da categoria:', category.name);
    if (!name) return;
    const prefix = window.prompt('Prefixo:', category.prefix || '');
    try {
      await CategoryService.updateCategory(category.id, { name, prefix: prefix || null });
      await loadData();
      toast({ title: 'Sucesso', description: 'Categoria atualizada.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro', description: 'Falha ao atualizar categoria.', variant: 'destructive' });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await CategoryService.deleteCategory(categoryId);
      await loadData();
      toast({ title: 'Sucesso', description: 'Categoria removida.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro', description: 'Falha ao remover categoria.', variant: 'destructive' });
    }
  };

  const handleCreateStatus = async () => {
    if (!newStatusName.trim()) return;
    try {
      await OrderStatusService.createStatus({
        name: newStatusName.trim(),
        sort_order: newStatusOrder,
        color: newStatusColor,
        active: true,
      });
      setNewStatusName('');
      setNewStatusOrder(1);
      setNewStatusColor('#2563eb');
      await loadData();
      toast({ title: 'Sucesso', description: 'Status criado com sucesso.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro', description: 'Falha ao criar status.', variant: 'destructive' });
    }
  };

  const handleEditStatus = async (status: OrderStatusItem) => {
    const name = window.prompt('Nome do status:', status.name);
    if (!name) return;
    const sortOrder = window.prompt('Ordem:', String(status.sort_order));
    const color = window.prompt('Cor hexadecimal:', status.color || '#2563eb');
    try {
      await OrderStatusService.updateStatus(status.id, {
        name,
        sort_order: Number(sortOrder || status.sort_order),
        color: color || status.color,
      });
      await loadData();
      toast({ title: 'Sucesso', description: 'Status atualizado.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro', description: 'Falha ao atualizar status.', variant: 'destructive' });
    }
  };

  const handleDeleteStatus = async (statusId: string) => {
    try {
      await OrderStatusService.deleteStatus(statusId);
      await loadData();
      toast({ title: 'Sucesso', description: 'Status removido.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro', description: 'Falha ao remover status.', variant: 'destructive' });
    }
  };

  const handleCreateDocument = async () => {
    if (!newDocumentName.trim()) return;
    try {
      await ApiService.createDocument({ name: newDocumentName.trim(), description: newDocumentDescription.trim() || undefined });
      setNewDocumentName('');
      setNewDocumentDescription('');
      await loadData();
      toast({ title: 'Sucesso', description: 'Documento cadastrado com sucesso.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro', description: 'Falha ao criar documento.', variant: 'destructive' });
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await ApiService.deleteDocument(id);
      await loadData();
      toast({ title: 'Sucesso', description: 'Documento removido.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro', description: 'Falha ao remover documento.', variant: 'destructive' });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Administração de Serviços</h1>

        <Tabs defaultValue="services" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="services">Serviços</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="statuses">Status</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <Input
                placeholder="Buscar serviço por nome..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="max-w-sm"
              />
              <Button onClick={openCreateDialog} className="gap-2">
                <PlusCircle className="h-4 w-4" /> Novo Serviço
              </Button>
            </div>

            <div className="rounded border overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3">Nome</th>
                    <th className="text-left p-3">Categoria</th>
                    <th className="text-left p-3">Preço</th>
                    <th className="text-left p-3">Documentos necessários</th>
                    <th className="text-left p-3">Consumo de estoque</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center">Carregando...</td>
                    </tr>
                  ) : filteredServices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-muted-foreground">Nenhum serviço encontrado.</td>
                    </tr>
                  ) : (
                    filteredServices.map((service) => {
                      const serviceRules = rulesByServiceId.get(service.id) || [];
                      const selectedDocs = requiredDocsByServiceId.get(service.id) || [];
                      return (
                        <tr key={service.id} className="border-t">
                          <td className="p-3 font-medium">{service.name}</td>
                          <td className="p-3">{categoryNameById.get(service.category_id) || '-'}</td>
                          <td className="p-3">R$ {Number(service.price || 0).toFixed(2)}</td>
                          <td className="p-3 max-w-md whitespace-pre-wrap">
                            {selectedDocs.length
                              ? selectedDocs
                                  .map((doc) => `${documentNameById.get(doc.document_id) || 'Documento'}${doc.required ? '' : ' (opcional)'}`)
                                  .join(', ')
                              : service.required_documents || '-'}
                          </td>
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
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteService(service.id)}>Excluir</Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input placeholder="Nome da categoria" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
              <Input placeholder="Prefixo" value={newCategoryPrefix} onChange={(e) => setNewCategoryPrefix(e.target.value)} />
              <Button onClick={handleCreateCategory}>Adicionar categoria</Button>
            </div>
            <div className="rounded border overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50"><tr><th className="p-3 text-left">Nome</th><th className="p-3 text-left">Prefixo</th><th className="p-3 text-left">Ações</th></tr></thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id} className="border-t">
                      <td className="p-3">{category.name}</td>
                      <td className="p-3">{category.prefix || '-'}</td>
                      <td className="p-3 space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditCategory(category)}>Editar</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteCategory(category.id)}>Remover</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="statuses" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Input placeholder="Nome" value={newStatusName} onChange={(e) => setNewStatusName(e.target.value)} />
              <Input type="number" placeholder="Ordem" value={newStatusOrder} onChange={(e) => setNewStatusOrder(Number(e.target.value || 1))} />
              <Input type="color" value={newStatusColor} onChange={(e) => setNewStatusColor(e.target.value)} />
              <Button onClick={handleCreateStatus}>Adicionar status</Button>
            </div>
            <div className="rounded border overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50"><tr><th className="p-3 text-left">Nome</th><th className="p-3 text-left">Ordem</th><th className="p-3 text-left">Cor</th><th className="p-3 text-left">Ações</th></tr></thead>
                <tbody>
                  {statuses.map((status) => (
                    <tr key={status.id} className="border-t">
                      <td className="p-3">{status.name}</td>
                      <td className="p-3">{status.sort_order}</td>
                      <td className="p-3"><span className="inline-block w-6 h-6 rounded" style={{ background: status.color }} /></td>
                      <td className="p-3 space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditStatus(status)}>Editar</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteStatus(status.id)}>Remover</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input placeholder="Nome do documento" value={newDocumentName} onChange={(e) => setNewDocumentName(e.target.value)} />
              <Input placeholder="Descrição (opcional)" value={newDocumentDescription} onChange={(e) => setNewDocumentDescription(e.target.value)} />
              <Button onClick={handleCreateDocument}>Adicionar documento</Button>
            </div>
            <div className="rounded border overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50"><tr><th className="p-3 text-left">Nome</th><th className="p-3 text-left">Descrição</th><th className="p-3 text-left">Ações</th></tr></thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id} className="border-t">
                      <td className="p-3">{doc.name}</td>
                      <td className="p-3">{doc.description || '-'}</td>
                      <td className="p-3">
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteDocument(doc.id)}>Remover</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-5xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingServiceId ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Nome</label>
                <Input value={serviceForm.name} onChange={(e) => setServiceForm((prev) => ({ ...prev, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium">Categoria</label>
                <select className="w-full border rounded px-3 py-2 bg-background" value={serviceForm.category_id} onChange={(e) => setServiceForm((prev) => ({ ...prev, category_id: e.target.value }))}>
                  <option value="">Selecione...</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Preço</label>
                <Input type="number" step="0.01" value={serviceForm.price} onChange={(e) => setServiceForm((prev) => ({ ...prev, price: Number(e.target.value || 0) }))} />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select className="w-full border rounded px-3 py-2 bg-background" value={serviceForm.active ? 'active' : 'inactive'} onChange={(e) => setServiceForm((prev) => ({ ...prev, active: e.target.value === 'active' }))}>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Input value={serviceForm.description} onChange={(e) => setServiceForm((prev) => ({ ...prev, description: e.target.value }))} />
            </div>

            <div>
              <label className="text-sm font-medium">Observação livre de documentos (opcional)</label>
              <textarea
                className="w-full border rounded px-3 py-2 bg-background min-h-[100px]"
                placeholder="Texto livre opcional"
                value={serviceForm.required_documents}
                onChange={(e) => setServiceForm((prev) => ({ ...prev, required_documents: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Documentos selecionáveis (tabela de documentos)</h3>
              {documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">Cadastre documentos na aba "Documentos".</p>
              ) : (
                <div className="space-y-2 border rounded p-3">
                  {documents.map((doc) => {
                    const selected = serviceDocumentDrafts.find((item) => item.document_id === doc.id);
                    return (
                      <div key={doc.id} className="flex items-center gap-3 flex-wrap">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={!!selected}
                            onChange={() => toggleServiceDocument(doc.id)}
                          />
                          <span>{doc.name}</span>
                        </label>
                        {!!selected && (
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={selected.required}
                              onChange={(e) => setDocumentRequiredFlag(doc.id, e.target.checked)}
                            />
                            Obrigatório
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Consumo de estoque (opcional)</h3>
                <Button type="button" variant="outline" onClick={() => setRuleDrafts((current) => [...current, emptyRule()])}>
                  + Regra de consumo
                </Button>
              </div>

              {ruleDrafts.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem regras: este serviço não consumirá estoque automaticamente.</p>
              ) : (
                <div className="space-y-3">
                  {ruleDrafts.map((rule, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end border rounded p-3">
                      <div className="md:col-span-5">
                        <label className="text-sm font-medium">Item de estoque</label>
                        <select className="w-full border rounded px-3 py-2 bg-background" value={rule.inventory_item_id} onChange={(e) => updateRule(index, { inventory_item_id: e.target.value })}>
                          <option value="">Selecione...</option>
                          {inventoryItems.map((item) => (
                            <option key={item.id} value={item.id}>{item.name} (saldo: {item.quantity})</option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-3">
                        <label className="text-sm font-medium">Tipo de veículo</label>
                        <select className="w-full border rounded px-3 py-2 bg-background" value={rule.vehicle_category} onChange={(e) => updateRule(index, { vehicle_category: e.target.value as 'carro' | 'moto' | 'all' })}>
                          <option value="carro">Carro</option>
                          <option value="moto">Moto</option>
                          <option value="all">Todos</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-sm font-medium">Qtd. consumo</label>
                        <Input type="number" min={1} value={rule.quantity_required} onChange={(e) => updateRule(index, { quantity_required: Number(e.target.value || 1) })} />
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
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancelar</Button>
              <Button onClick={handleSaveService} disabled={saving}>{saving ? 'Salvando...' : 'Salvar serviço'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default AdminServices;
