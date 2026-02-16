import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Search, PlusCircle, Eye, Pencil, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import NewOrderForm from "@/components/forms/NewOrderForm";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/dbClient";
import { useAuth } from "@/contexts/AuthContext";

interface Order {
  id: string;
  order_number: string;
  service: string;
  modelo: string;
  created_at: string;
  valor: number;
  status: string;
}

const ClientOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      const { data: client, error: clientError } = await db
        .from("clients")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (clientError || !client) return;

      setClientId(client.id);

      const { data: ordersData } = await db
        .from("orders")
        .select("*")
        .eq("client_id", client.id)
        .order("created_at", { ascending: false });

      if (ordersData) setOrders(ordersData);
    };

    fetchOrders();
  }, [user]);

  const filtered = orders.filter(
    (o) =>
      o.service?.toLowerCase().includes(search.toLowerCase()) ||
      o.modelo?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Meus Pedidos</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="w-4 h-4 mr-2" /> Novo Pedido
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Pedido</DialogTitle>
              </DialogHeader>
              {clientId && (
                <NewOrderForm
                  onSuccess={(newOrder) =>
                    setOrders((prev) => [newOrder, ...prev])
                  }
                />
              )}
            </DialogContent>
          </Dialog>
        </div>

        <Input
          placeholder="Buscar por serviço ou veículo"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />

        <div className="rounded-md border overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-2 text-left text-xs">Código</th>
                <th className="px-4 py-2 text-left text-xs">Serviço</th>
                <th className="px-4 py-2 text-left text-xs">Veículo</th>
                <th className="px-4 py-2 text-left text-xs">Data</th>
                <th className="px-4 py-2 text-left text-xs">Valor</th>
                <th className="px-4 py-2 text-left text-xs">Status</th>
                <th className="px-4 py-2 text-left text-xs">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filtered.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-2 font-medium">
                    {order.order_number}
                  </td>
                  <td className="px-4 py-2">{order.service ?? "-"}</td>
                  <td className="px-4 py-2">{order.modelo}</td>
                  <td className="px-4 py-2">
                    {new Date(order.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-2">
                    R$ {order.valor?.toFixed(2) ?? "0,00"}
                  </td>
                  <td className="px-4 py-2">
                    <Badge>{order.status}</Badge>
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

export default ClientOrders;
