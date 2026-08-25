import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, ChevronDown, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SellersService, type Seller } from '@/services/sellersApi';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const AdminSellers = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newSellerOpen, setNewSellerOpen] = useState(false);
  const [newSellerName, setNewSellerName] = useState('');
  const [newSellerEmail, setNewSellerEmail] = useState('');
  const [newSellerPhone, setNewSellerPhone] = useState('');
  const [savingSeller, setSavingSeller] = useState(false);
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null);

  const loadSellers = async () => {
    try {
      setLoading(true);
      const data = await SellersService.getSellers();
      setSellers(data);
    } catch (error) {
      console.error('Erro ao carregar vendedores:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar vendedores',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellers();
  }, []);

  const filteredSellers = sellers.filter(
    (seller) =>
      seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusToggle = async (seller: Seller) => {
    try {
      if (seller.active === false) {
        await SellersService.reactivateSeller(seller.id);
      } else {
        await SellersService.deleteSeller(seller.id);
      }
      await loadSellers();
      toast({
        title: 'Sucesso',
        description: seller.active === false ? 'Vendedor reativado com sucesso' : 'Vendedor desativado com sucesso',
      });
    } catch (error) {
      console.error('Erro ao alterar status do vendedor:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar vendedor',
        variant: 'destructive',
      });
    }
  };

  const handleCreateSeller = async () => {
    if (!newSellerName.trim() || !newSellerEmail.trim()) {
      toast({ title: 'Campos obrigatórios', description: 'Informe ao menos nome e email do vendedor.', variant: 'destructive' });
      return;
    }

    try {
      setSavingSeller(true);
      const created = await SellersService.createSeller({
        name: newSellerName.trim(),
        email: newSellerEmail.trim(),
        phone: newSellerPhone.trim() || undefined,
      });

      setNewSellerOpen(false);
      setNewSellerName('');
      setNewSellerEmail('');
      setNewSellerPhone('');
      await loadSellers();

      toast({
        title: 'Vendedor criado',
        description: `Senha inicial: ${created.initialPassword} — anote agora, ela não será exibida novamente.`,
        duration: 30000,
      });
    } catch (error) {
      console.error('Erro ao criar vendedor:', error);
      toast({ title: 'Erro', description: 'Falha ao criar vendedor.', variant: 'destructive' });
    } finally {
      setSavingSeller(false);
    }
  };

  const handleUpdateSeller = async () => {
    if (!editingSeller) return;

    try {
      setSavingSeller(true);
      await SellersService.updateSeller(editingSeller.id, {
        name: editingSeller.name,
        email: editingSeller.email,
        phone: editingSeller.phone,
      });
      setEditingSeller(null);
      await loadSellers();
      toast({ title: 'Sucesso', description: 'Vendedor atualizado com sucesso.' });
    } catch (error) {
      console.error('Erro ao atualizar vendedor:', error);
      toast({ title: 'Erro', description: 'Falha ao atualizar vendedor.', variant: 'destructive' });
    } finally {
      setSavingSeller(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title="Gerenciar Funcionários (Vendedores)"
          description="Acompanhe a equipe comercial e ajuste o status de atuação de cada vendedor."
          stats={[
            { label: 'Total', value: String(sellers.length) },
            { label: 'Ativos', value: String(sellers.filter((s) => s.active !== false).length) },
          ]}
          action={
            <Dialog open={newSellerOpen} onOpenChange={setNewSellerOpen}>
              <DialogTrigger asChild>
                <Button className="flex gap-2">
                  <PlusCircle className="h-4 w-4" />
                  <span>Novo Funcionário</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Funcionário</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Nome" value={newSellerName} onChange={(e) => setNewSellerName(e.target.value)} />
                  <Input placeholder="Email" type="email" value={newSellerEmail} onChange={(e) => setNewSellerEmail(e.target.value)} />
                  <Input placeholder="Telefone (opcional)" value={newSellerPhone} onChange={(e) => setNewSellerPhone(e.target.value)} />
                  <Button className="w-full" onClick={handleCreateSeller} disabled={savingSeller}>
                    {savingSeller ? 'Salvando...' : 'Criar funcionário'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          }
        />

        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome ou email..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <Button variant="outline" className="flex gap-1">
            <span>Filtrar</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        <div className="rounded-md border">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Telefone</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Clientes</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Pedidos</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center"><div className="flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin mr-2" /><span>Carregando...</span></div></td></tr>
              ) : filteredSellers.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">Nenhum funcionário encontrado</td></tr>
              ) : (
                filteredSellers.map((seller) => (
                  <tr key={seller.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{seller.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{seller.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{seller.phone || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><Badge variant="outline">{seller.clientsCount}</Badge></td>
                    <td className="px-6 py-4 whitespace-nowrap"><Badge variant="outline">{seller.ordersCount}</Badge></td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={seller.active === false ? 'destructive' : 'default'} className={seller.active === false ? '' : 'bg-green-100 text-green-800'}>
                        {seller.active === false ? 'Inativo' : 'Ativo'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingSeller({ ...seller })}>Editar</Button>
                      <Button variant={seller.active === false ? 'default' : 'destructive'} size="sm" onClick={() => handleStatusToggle(seller)}>
                        {seller.active === false ? 'Reativar' : 'Desativar'}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!editingSeller} onOpenChange={(open) => !open && setEditingSeller(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Funcionário</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Nome" value={editingSeller?.name || ''} onChange={(e) => setEditingSeller((prev) => prev ? { ...prev, name: e.target.value } : prev)} />
            <Input placeholder="Email" type="email" value={editingSeller?.email || ''} onChange={(e) => setEditingSeller((prev) => prev ? { ...prev, email: e.target.value } : prev)} />
            <Input placeholder="Telefone" value={editingSeller?.phone || ''} onChange={(e) => setEditingSeller((prev) => prev ? { ...prev, phone: e.target.value } : prev)} />
            <Button className="w-full" onClick={handleUpdateSeller} disabled={savingSeller}>{savingSeller ? 'Salvando...' : 'Salvar alterações'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default AdminSellers;
