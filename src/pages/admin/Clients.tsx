import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, ChevronDown, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ClientsService, type Client } from '@/services/clientsApi';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import NewClientForm from '@/components/forms/NewClientForm';

const AdminClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newClientOpen, setNewClientOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [savingClient, setSavingClient] = useState(false);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await ClientsService.getClients(true);
      setClients(data as Client[]);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast({ title: 'Erro', description: 'Falha ao carregar clientes', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.document.includes(searchTerm) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDocument = (doc: string) => {
    const numbers = doc.replace(/\D/g, '');
    if (numbers.length === 11) return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    if (numbers.length === 14) return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    return doc;
  };

  const handleUpdateClient = async () => {
    if (!editingClient) return;

    try {
      setSavingClient(true);
      await ClientsService.updateClient(editingClient.id, {
        name: editingClient.name,
        document: editingClient.document,
        type: editingClient.type,
        phone: editingClient.phone,
        email: editingClient.email,
        address: editingClient.address,
        active: editingClient.active,
      });
      setEditingClient(null);
      await loadClients();
      toast({ title: 'Sucesso', description: 'Cliente atualizado com sucesso.' });
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      toast({ title: 'Erro', description: 'Falha ao atualizar cliente', variant: 'destructive' });
    } finally {
      setSavingClient(false);
    }
  };

  const handleStatusToggle = async (client: Client) => {
    try {
      if (client.active) {
        await ClientsService.deactivateClient(client.id);
      } else {
        await ClientsService.reactivateClient(client.id);
      }
      await loadClients();
      toast({ title: 'Sucesso', description: client.active ? 'Cliente desativado' : 'Cliente reativado' });
    } catch (error) {
      console.error('Erro ao alterar status do cliente:', error);
      toast({ title: 'Erro', description: 'Falha ao atualizar cliente', variant: 'destructive' });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Clientes</h1>
          <Dialog open={newClientOpen} onOpenChange={setNewClientOpen}>
            <DialogTrigger asChild>
              <Button className="flex gap-2"><PlusCircle className="h-4 w-4" /><span>Novo Cliente</span></Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Novo Cliente</DialogTitle></DialogHeader>
              <NewClientForm onSuccess={async () => { setNewClientOpen(false); await loadClients(); }} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar cliente por nome, CPF/CNPJ..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <Button variant="outline" className="flex gap-1"><span>Filtrar</span><ChevronDown className="h-4 w-4" /></Button>
        </div>

        <div className="rounded-md border">
          <table className="min-w-full divide-y divide-border">
            <thead><tr className="bg-muted/50">
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">CPF/CNPJ</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Telefone</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Ações</th>
            </tr></thead>
            <tbody className="bg-card divide-y divide-border">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center"><div className="flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin mr-2" /><span>Carregando...</span></div></td></tr>
              ) : filteredClients.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">Nenhum cliente encontrado</td></tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{client.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{formatDocument(client.document)}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><Badge variant={client.type === 'physical' ? 'default' : 'secondary'}>{client.type === 'physical' ? 'Pessoa Física' : 'Pessoa Jurídica'}</Badge></td>
                    <td className="px-6 py-4 whitespace-nowrap">{client.phone || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{client.email || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><Badge variant={client.active ? 'default' : 'destructive'}>{client.active ? 'Ativo' : 'Inativo'}</Badge></td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingClient({ ...client })}>Editar</Button>
                      <Button variant={client.active ? 'destructive' : 'default'} size="sm" onClick={() => handleStatusToggle(client)}>{client.active ? 'Desativar' : 'Reativar'}</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!editingClient} onOpenChange={(open) => !open && setEditingClient(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>Editar Cliente</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Nome</label>
                <Input
                  placeholder="Nome"
                  value={editingClient?.name || ''}
                  onChange={(e) => setEditingClient((prev) => prev ? { ...prev, name: e.target.value } : prev)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tipo</label>
                <select
                  className="w-full border rounded px-3 py-2 bg-background"
                  value={editingClient?.type || 'physical'}
                  onChange={(e) =>
                    setEditingClient((prev) => prev ? { ...prev, type: e.target.value as 'physical' | 'juridical' } : prev)
                  }
                >
                  <option value="physical">Pessoa Física</option>
                  <option value="juridical">Pessoa Jurídica</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">CPF/CNPJ</label>
                <Input
                  placeholder="CPF/CNPJ"
                  value={editingClient?.document || ''}
                  onChange={(e) => setEditingClient((prev) => prev ? { ...prev, document: e.target.value } : prev)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Telefone</label>
                <Input
                  placeholder="Telefone"
                  value={editingClient?.phone || ''}
                  onChange={(e) => setEditingClient((prev) => prev ? { ...prev, phone: e.target.value } : prev)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  placeholder="Email"
                  value={editingClient?.email || ''}
                  onChange={(e) => setEditingClient((prev) => prev ? { ...prev, email: e.target.value } : prev)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Endereço</label>
                <Input
                  placeholder="Rua, número, bairro, cidade"
                  value={editingClient?.address || ''}
                  onChange={(e) => setEditingClient((prev) => prev ? { ...prev, address: e.target.value } : prev)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  className="w-full border rounded px-3 py-2 bg-background"
                  value={editingClient?.active ? 'active' : 'inactive'}
                  onChange={(e) =>
                    setEditingClient((prev) => prev ? { ...prev, active: e.target.value === 'active' } : prev)
                  }
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
            </div>
            <Button className="w-full" onClick={handleUpdateClient} disabled={savingClient}>
              {savingClient ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default AdminClients;
