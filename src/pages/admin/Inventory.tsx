import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, Plus, Minus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from '@/components/ui/use-toast';
import { db } from '@/lib/dbClient';
import { useAuth } from '@/contexts/AuthContext';

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
  name: z.string().min(2),
  quantity: z.coerce.number().min(0),
  minQuantity: z.coerce.number().min(0),
  costPrice: z.coerce.number().min(0),
  category: z.string().min(1),
});

const movementFormSchema = z.object({
  itemId: z.string().min(1),
  movement: z.enum(['in', 'out']),
  quantity: z.coerce.number().min(1),
  notes: z.string().optional(),
});

const statusFrom = (q: number, min: number): InventoryItem['status'] => {
  if (q <= 0) return 'critical';
  if (q <= min) return 'low';
  return 'adequate';
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
      const [{ data: items, error: e1 }, { data: movements, error: e2 }] = await Promise.all([
        db.from('inventory_items').select('*').order('created_at', { ascending: false }),
        db.from('inventory_movements').select('*').order('created_at', { ascending: false }).limit(20),
      ]);
      if (e1) throw e1;
      if (e2) throw e2;

      const itemMap = new Map((items || []).map((i: any) => [i.id, i.name]));
      setInventory((items || []).map((i: any) => ({
        id: i.id,
        name: i.name,
        quantity: Number(i.quantity || 0),
        minQuantity: Number(i.min_quantity || 0),
        costPrice: Number(i.cost_price || 0),
        category: i.category || '',
        status: statusFrom(Number(i.quantity || 0), Number(i.min_quantity || 0)),
      })));

      setHistory((movements || []).map((m: any) => ({
        id: m.id,
        created_at: m.created_at,
        item_name: itemMap.get(m.inventory_item_id) || 'Item',
        movement_type: m.movement_type,
        quantity: Number(m.quantity || 0),
        notes: m.notes || '',
      })));
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro', description: 'Falha ao carregar estoque.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInventory(); }, []);

  const filteredInventory = useMemo(() => inventory.filter((item) => {
    const q = searchQuery.toLowerCase();
    return item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
  }), [inventory, searchQuery]);

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
    const { error } = await db.from('inventory_items').delete().eq('id', id);
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível excluir item.', variant: 'destructive' });
      return;
    }
    await fetchInventory();
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

      const res = isEditMode && currentItem
        ? await db.from('inventory_items').update(payload).eq('id', currentItem.id)
        : await db.from('inventory_items').insert([payload]);

      if (res.error) throw res.error;
      setItemDialogOpen(false);
      await fetchInventory();
      toast({ title: 'Sucesso', description: 'Item salvo com sucesso.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro', description: 'Falha ao salvar item.', variant: 'destructive' });
    }
  };

  const openMovementDialog = (item: InventoryItem) => {
    setCurrentItem(item);
    movementForm.reset({ itemId: item.id, movement: 'in', quantity: 1, notes: '' });
    setMovementDialogOpen(true);
  };

  const onSubmitMovement = async (values: z.infer<typeof movementFormSchema>) => {
    try {
      const item = inventory.find((i) => i.id === values.itemId);
      if (!item) return;

      const delta = values.movement === 'in' ? values.quantity : -values.quantity;
      const nextQuantity = item.quantity + delta;
      if (nextQuantity < 0) {
        toast({ title: 'Erro', description: 'Quantidade insuficiente para saída.', variant: 'destructive' });
        return;
      }

      const [u, m] = await Promise.all([
        db.from('inventory_items').update({ quantity: nextQuantity }).eq('id', item.id),
        db.from('inventory_movements').insert([{
          inventory_item_id: item.id,
          movement_type: values.movement,
          quantity: values.quantity,
          responsible_id: user?.id,
          notes: values.notes || null,
        }]),
      ]);

      if (u.error) throw u.error;
      if (m.error) throw m.error;

      setMovementDialogOpen(false);
      await fetchInventory();
      toast({ title: 'Movimentação registrada' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro', description: 'Falha ao registrar movimentação.', variant: 'destructive' });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Estoque</h1>
          <Button onClick={handleAddItem}><PlusCircle className="w-4 h-4 mr-2" /> Novo Item</Button>
        </div>

        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar item/categoria" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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
                    <th className="p-2 text-left">Item</th><th className="p-2 text-left">Categoria</th><th className="p-2 text-left">Qtd</th><th className="p-2 text-left">Mín</th><th className="p-2 text-left">Custo</th><th className="p-2 text-left">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? <tr><td className="p-4" colSpan={6}>Carregando...</td></tr> : filteredInventory.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="p-2">{item.name}</td>
                      <td className="p-2">{item.category}</td>
                      <td className="p-2">{item.quantity}</td>
                      <td className="p-2">{item.minQuantity}</td>
                      <td className="p-2">R$ {item.costPrice.toFixed(2)}</td>
                      <td className="p-2 flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openMovementDialog(item)}><Plus className="w-4 h-4 mr-1" /> Mov</Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditItem(item)}>Editar</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteItem(item.id)}>Excluir</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="rounded border overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50"><tr><th className="p-2 text-left">Data</th><th className="p-2 text-left">Item</th><th className="p-2 text-left">Tipo</th><th className="p-2 text-left">Qtd</th><th className="p-2 text-left">Obs</th></tr></thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id} className="border-t">
                      <td className="p-2">{new Date(h.created_at).toLocaleString('pt-BR')}</td>
                      <td className="p-2">{h.item_name}</td>
                      <td className="p-2">{h.movement_type === 'in' ? 'Entrada' : 'Saída'}</td>
                      <td className="p-2">{h.quantity}</td>
                      <td className="p-2">{h.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>{isEditMode ? 'Editar item' : 'Novo item'}</DialogTitle></DialogHeader>
            <Form {...itemForm}>
              <form onSubmit={itemForm.handleSubmit(onSubmitItem)} className="space-y-3">
                <FormField control={itemForm.control} name="name" render={({ field }) => <FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={itemForm.control} name="category" render={({ field }) => <FormItem><FormLabel>Categoria</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={itemForm.control} name="quantity" render={({ field }) => <FormItem><FormLabel>Quantidade</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={itemForm.control} name="minQuantity" render={({ field }) => <FormItem><FormLabel>Quantidade mínima</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={itemForm.control} name="costPrice" render={({ field }) => <FormItem><FormLabel>Custo</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>} />
                <Button type="submit" className="w-full">Salvar</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Dialog open={movementDialogOpen} onOpenChange={setMovementDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Movimentação</DialogTitle></DialogHeader>
            <Form {...movementForm}>
              <form onSubmit={movementForm.handleSubmit(onSubmitMovement)} className="space-y-3">
                <FormField control={movementForm.control} name="movement" render={({ field }) => <FormItem><FormLabel>Tipo</FormLabel><FormControl><div className="flex gap-2"><Button type="button" variant={field.value === 'in' ? 'default' : 'outline'} onClick={() => field.onChange('in')}><Plus className="w-4 h-4 mr-1" />Entrada</Button><Button type="button" variant={field.value === 'out' ? 'default' : 'outline'} onClick={() => field.onChange('out')}><Minus className="w-4 h-4 mr-1" />Saída</Button></div></FormControl><FormMessage /></FormItem>} />
                <FormField control={movementForm.control} name="quantity" render={({ field }) => <FormItem><FormLabel>Quantidade</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={movementForm.control} name="notes" render={({ field }) => <FormItem><FormLabel>Observações</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>} />
                <Button type="submit" className="w-full">Registrar</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default AdminInventory;
