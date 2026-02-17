import React, { useState } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { useToast } from '@/hooks/use-toast';

const AdminSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    companyName: 'Despachante Rápido LTDA',
    cnpj: '12.345.678/0001-90',
    phone: '(11) 3456-7890',
    email: 'contato@despachantefast.com',
    address: 'Av. Paulista, 1000, São Paulo - SP',
    darkMode: false,
    stockAlerts: true,
    emailConfirmation: true,
    autoSignup: false,
    sellerCanCreateServices: false,
    twoFactor: true,
    notifyNewOrders: true,
    notifyUpdatedOrders: true,
    notifyNewClients: true,
    notifyEmail: false,
    autoBackup: false,
  });

  const onSave = () => {
    toast({ title: 'Configurações salvas', description: 'As preferências do painel administrativo foram atualizadas.' });
  };

  const onExport = (type: string) => {
    toast({ title: 'Exportação iniciada', description: `Estamos preparando o arquivo de ${type}.` });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title="Configurações"
          description="Centralize preferências da empresa, permissões de usuários e rotinas operacionais em um único painel."
          action={<Button onClick={onSave}>Salvar Tudo</Button>}
          stats={[
            { label: 'Ambiente', value: 'Administrativo' },
            { label: 'Última ação', value: 'Salvamento manual' },
          ]}
        />

        <Tabs defaultValue="general">
          <TabsList className="mb-4">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="backups">Backup e Exportação</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Empresa</CardTitle>
                <CardDescription>Defina as informações básicas da sua empresa.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Nome da Empresa</Label>
                    <Input id="company-name" value={settings.companyName} onChange={(e) => setSettings((p) => ({ ...p, companyName: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input id="cnpj" value={settings.cnpj} onChange={(e) => setSettings((p) => ({ ...p, cnpj: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" value={settings.phone} onChange={(e) => setSettings((p) => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={settings.email} onChange={(e) => setSettings((p) => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input id="address" value={settings.address} onChange={(e) => setSettings((p) => ({ ...p, address: e.target.value }))} />
                  </div>
                </div>
                <Button className="mt-4" onClick={onSave}>Salvar Alterações</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configurações do Sistema</CardTitle>
                <CardDescription>Personalize o comportamento do sistema.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between"><p className="font-medium">Modo Escuro</p><Switch checked={settings.darkMode} onCheckedChange={(v) => setSettings((p) => ({ ...p, darkMode: v }))} /></div>
                <div className="flex items-center justify-between"><p className="font-medium">Alertas de Estoque Baixo</p><Switch checked={settings.stockAlerts} onCheckedChange={(v) => setSettings((p) => ({ ...p, stockAlerts: v }))} /></div>
                <div className="flex items-center justify-between"><p className="font-medium">Confirmação de Emails</p><Switch checked={settings.emailConfirmation} onCheckedChange={(v) => setSettings((p) => ({ ...p, emailConfirmation: v }))} /></div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card><CardHeader><CardTitle>Configurações de Usuários</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between"><p className="font-medium">Auto-registro de Clientes</p><Switch checked={settings.autoSignup} onCheckedChange={(v) => setSettings((p) => ({ ...p, autoSignup: v }))} /></div>
                <div className="flex items-center justify-between"><p className="font-medium">Vendedores podem criar serviços</p><Switch checked={settings.sellerCanCreateServices} onCheckedChange={(v) => setSettings((p) => ({ ...p, sellerCanCreateServices: v }))} /></div>
                <div className="flex items-center justify-between"><p className="font-medium">Autenticação em duas etapas</p><Switch checked={settings.twoFactor} onCheckedChange={(v) => setSettings((p) => ({ ...p, twoFactor: v }))} /></div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card><CardHeader><CardTitle>Configurações de Notificações</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between"><p className="font-medium">Novos Pedidos</p><Switch checked={settings.notifyNewOrders} onCheckedChange={(v) => setSettings((p) => ({ ...p, notifyNewOrders: v }))} /></div>
                <div className="flex items-center justify-between"><p className="font-medium">Pedidos Atualizados</p><Switch checked={settings.notifyUpdatedOrders} onCheckedChange={(v) => setSettings((p) => ({ ...p, notifyUpdatedOrders: v }))} /></div>
                <div className="flex items-center justify-between"><p className="font-medium">Novos Clientes</p><Switch checked={settings.notifyNewClients} onCheckedChange={(v) => setSettings((p) => ({ ...p, notifyNewClients: v }))} /></div>
                <div className="flex items-center justify-between"><p className="font-medium">Notificações por Email</p><Switch checked={settings.notifyEmail} onCheckedChange={(v) => setSettings((p) => ({ ...p, notifyEmail: v }))} /></div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backups" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Backup e Exportação</CardTitle>
                <CardDescription>Gerencie backups do sistema e exportação de dados.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={() => toast({ title: 'Backup criado', description: 'Backup manual executado com sucesso.' })}>Criar Backup</Button>
                <div className="flex items-center space-x-2"><Switch id="auto-backup" checked={settings.autoBackup} onCheckedChange={(v) => setSettings((p) => ({ ...p, autoBackup: v }))} /><Label htmlFor="auto-backup">Ativar backup automático</Label></div>
                <div className="pt-2 border-t space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={() => onExport('clientes (CSV)')}>Exportar Clientes (CSV)</Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => onExport('pedidos (CSV)')}>Exportar Pedidos (CSV)</Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => onExport('financeiro (PDF)')}>Exportar Relatório Financeiro (PDF)</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AdminSettings;
