import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, Plus, Minus, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { db } from '@/lib/dbClient';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface InventoryItemRow {
  id: string;
  name: string;
  quantity: number | string;
  min_quantity: number | string;
  cost_price: number | string;
  category: string;
}

interface InventoryMovementRow {
  id: string;
  created_at: string;
  inventory_item_id: string;
  movement_type: 'in' | 'out';
  quantity: number | string;
  notes?: string | null;
}

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number;
  costPrice: number;
  category: string;
  status: 'adequate' | 'low' | 'critical';
}

interface InventoryHistory {
  id: string;
  created_at: string;
  item_name: string;
  movement_type: 'in' | 'out';
  quantity: number;
  notes?: string;
}

const itemFormSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  quantity: z.coerce.number().min(0, 'Quantidade inválida'),
  minQuantity: z.coerce.number().min(0, 'Mínimo inválido'),
  costPrice: z.coerce.number().min(0, 'Custo inválido'),
  category: z.string().min(1, 'Categoria obrigatória'),
});

const movementFormSchema = z.object({
  itemId: z.string().min(1, 'Selecione um item'),
  movement: z.enum(['in', 'out']),
  quantity: z.coerce.number().min(1, 'Quantidade deve ser maior que zero'),
  notes: z.string().optional(),
});

const statusFrom = (quantity: number, minQuantity: number): InventoryItem['status'] => {
  if (quantity <= 0) return 'critical';
  if (quantity <= minQuantity) return 'low';
  return 'adequate';
};

const statusLabel: Record<InventoryItem['status'], string> = {
  adequate: 'Adequado',
  low: 'Baixo',
  critical: 'Crítico',
};

const AdminInventory = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [history, setHistory] = useState<InventoryHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [movementDialogOpen, setMovementDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const itemForm = useForm<z.infer<typeof itemFormSchema>>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: { name: '', quantity: 0, minQuantity: 0, costPrice: 0, category: '' },
  });

  const movementForm = useForm<z.infer<typeof movementFormSchema>>({
    resolver: zodResolver(movementFormSchema),
    defaultValues: { itemId: '', movement: 'in', quantity: 1, notes: '' },
  });

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const [{ data: items, error: itemError }, { data: movements, error: movementError }] = await Promise.all([
        db.from('inventory_items').select('*').order('created_at', { ascending: false }),
        db.from('inventory_movements').select('*').order('created_at', { ascending: false }).limit(20),
      ]);

      if (itemError) throw itemError;
      if (movementError) throw movementError;

      const typedItems = (items ?? []) as InventoryItemRow[];
      const typedMovements = (movements ?? []) as InventoryMovementRow[];
      const itemMap = new Map(typedItems.map((item) => [item.id, item.name]));

      setInventory(
        typedItems.map((item) => {
          const quantity = Number(item.quantity || 0);
          const minQuantity = Number(item.min_quantity || 0);
          return {
            id: item.id,
            name: item.name,
            quantity,
            minQuantity,
            costPrice: Number(item.cost_price || 0),
            category: item.category || '',
            status: statusFrom(quantity, minQuantity),
          };
        })
      );

      setHistory(
        typedMovements.map((movement) => ({
          id: movement.id,
          created_at: movement.created_at,
          item_name: itemMap.get(movement.inventory_item_id) || 'Item removido',
          movement_type: movement.movement_type,
          quantity: Number(movement.quantity || 0),
          notes: movement.notes || '',
        }))
      );
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro', description: 'Falha ao carregar estoque.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filteredInventory = useMemo(
    () =>
      inventory.filter((item) => {
        const query = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(query) || item.category.toLowerCase().includes(query);
      }),
    [inventory, searchQuery]
  );

  const handleAddItem = () => {
    setIsEditMode(false);
    setCurrentItem(null);
    itemForm.reset({ name: '', quantity: 0, minQuantity: 0, costPrice: 0, category: '' });
    setItemDialogOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setIsEditMode(true);
    setCurrentItem(item);
    itemForm.reset(item);
    setItemDialogOpen(true);
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await db.from('inventory_items').delete().eq('id', id);
      if (error) throw error;
      await fetchInventory();
      toast({ title: 'Sucesso', description: 'Item excluído com sucesso.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro', description: 'Não foi possível excluir item.', variant: 'destructive' });
    }
  };

  const onSubmitItem = async (values: z.infer<typeof itemFormSchema>) => {
    try {
      const payload = {
        name: values.name,
        quantity: values.quantity,
        min_quantity: values.minQuantity,
        cost_price: values.costPrice,
        category: values.category,
      };

      const result =
        isEditMode && currentItem
          ? await db.from('inventory_items').update(payload).eq('id', currentItem.id)
          : await db.from('inventory_items').insert([payload]);

      if (result.error) throw result.error;

      setItemDialogOpen(false);
      await fetchInventory();
      toast({ title: 'Sucesso', description: 'Item salvo com sucesso.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro', description: 'Falha ao salvar item.', variant: 'destructive' });
    }
  };

  const openMovementDialog = (item?: InventoryItem) => {
    setCurrentItem(item ?? null);
    movementForm.reset({
      itemId: item?.id || '',
      movement: 'in',
      quantity: 1,
      notes: '',
    });
    setMovementDialogOpen(true);
  };

  const onSubmitMovement = async (values: z.infer<typeof movementFormSchema>) => {
    try {
      const item = inventory.find((inventoryItem) => inventoryItem.id === values.itemId);
      if (!item) {
        toast({ title: 'Erro', description: 'Item selecionado não encontrado.', variant: 'destructive' });
        return;
      }

      const delta = values.movement === 'in' ? values.quantity : -values.quantity;
      const nextQuantity = item.quantity + delta;

      if (nextQuantity < 0) {
        toast({ title: 'Erro', description: 'Quantidade insuficiente para saída.', variant: 'destructive' });
        return;
      }

      const [updateItemResult, insertMovementResult] = await Promise.all([
        db.from('inventory_items').update({ quantity: nextQuantity }).eq('id', item.id),
        db
          .from('inventory_movements')
          .insert([
            {
              inventory_item_id: item.id,
              movement_type: values.movement,
              quantity: values.quantity,
              responsible_id: user?.id,
              notes: values.notes || null,
            },
          ]),
      ]);

      if (updateItemResult.error) throw updateItemResult.error;
      if (insertMovementResult.error) throw insertMovementResult.error;

      setMovementDialogOpen(false);
      await fetchInventory();
      toast({ title: 'Sucesso', description: 'Movimentação registrada com sucesso.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro', description: 'Falha ao registrar movimentação.', variant: 'destructive' });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <AdminPageHeader
          title="Estoque"
          description="Gerencie itens, reposições e movimentações com foco em prevenção de ruptura."
          stats={[
            { label: 'Itens', value: String(inventory.length) },
            { label: 'Baixo estoque', value: String(inventory.filter((item) => item.status === 'low').length) },
          ]}
          action={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => openMovementDialog()}>
                <Plus className="w-4 h-4 mr-2" /> Nova Movimentação
              </Button>
              <Button onClick={handleAddItem}>
                <PlusCircle className="w-4 h-4 mr-2" /> Novo Item
              </Button>
            </div>
          }
        />

        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar item/categoria"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        <Tabs defaultValue="items">
          <TabsList>
            <TabsTrigger value="items">Itens</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-2">
            <div className="rounded border overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-2 text-left">Item</th>
                    <th className="p-2 text-left">Categoria</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Qtd</th>
                    <th className="p-2 text-left">Mín</th>
                    <th className="p-2 text-left">Custo</th>
                    <th className="p-2 text-left">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td className="p-4" colSpan={7}>
                        Carregando...
                      </td>
                    </tr>
                  ) : filteredInventory.length === 0 ? (
                    <tr>
                      <td className="p-8 text-center text-muted-foreground" colSpan={7}>
                        <div className="flex items-center justify-center gap-2">
                          <Package className="w-4 h-4" /> Nenhum item encontrado.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="p-2">{item.name}</td>
                        <td className="p-2">{item.category}</td>
                        <td className="p-2">
                          <Badge
                            variant={item.status === 'adequate' ? 'default' : 'destructive'}
                            className={item.status === 'low' ? 'bg-yellow-500 text-black' : ''}
                          >
                            {statusLabel[item.status]}
                          </Badge>
                        </td>
                        <td className="p-2">{item.quantity}</td>
                        <td className="p-2">{item.minQuantity}</td>
                        <td className="p-2">R$ {item.costPrice.toFixed(2)}</td>
                        <td className="p-2 flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openMovementDialog(item)}>
                            <Plus className="w-4 h-4 mr-1" /> Mov
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditItem(item)}>
                            Editar
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteItem(item.id)}>
                            Excluir
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="rounded border overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-2 text-left">Data</th>
                    <th className="p-2 text-left">Item</th>
                    <th className="p-2 text-left">Tipo</th>
                    <th className="p-2 text-left">Qtd</th>
                    <th className="p-2 text-left">Obs</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr>
                      <td className="p-8 text-center text-muted-foreground" colSpan={5}>
                        Nenhuma movimentação registrada.
                      </td>
                    </tr>
                  ) : (
                    history.map((entry) => (
                      <tr key={entry.id} className="border-t">
                        <td className="p-2">{new Date(entry.created_at).toLocaleString('pt-BR')}</td>
                        <td className="p-2">{entry.item_name}</td>
                        <td className="p-2">{entry.movement_type === 'in' ? 'Entrada' : 'Saída'}</td>
                        <td className="p-2">{entry.quantity}</td>
                        <td className="p-2">{entry.notes || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditMode ? 'Editar item' : 'Novo item'}</DialogTitle>
            </DialogHeader>
            <Form {...itemForm}>
              <form onSubmit={itemForm.handleSubmit(onSubmitItem)} className="space-y-3">
                <FormField
                  control={itemForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={itemForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={itemForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={itemForm.control}
                  name="minQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade mínima</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={itemForm.control}
                  name="costPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custo</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Salvar
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Dialog open={movementDialogOpen} onOpenChange={setMovementDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Movimentação</DialogTitle>
            </DialogHeader>
            <Form {...movementForm}>
              <form onSubmit={movementForm.handleSubmit(onSubmitMovement)} className="space-y-3">
                <FormField
                  control={movementForm.control}
                  name="itemId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um item" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {inventory.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={movementForm.control}
                  name="movement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={field.value === 'in' ? 'default' : 'outline'}
                            onClick={() => field.onChange('in')}
                          >
                            <Plus className="w-4 h-4 mr-1" /> Entrada
                          </Button>
                          <Button
                            type="button"
                            variant={field.value === 'out' ? 'default' : 'outline'}
                            onClick={() => field.onChange('out')}
                          >
                            <Minus className="w-4 h-4 mr-1" /> Saída
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={movementForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={movementForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Registrar
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default AdminInventory;
