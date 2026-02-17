import React, { useState, useEffect, useMemo } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Search, PlusCircle, Eye } from "lucide-react";
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
import { Order } from "@/types";
import { resolveClientIdForUser } from "@/services/clientProfileService";

const formatCurrency = (value?: number | null) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));

const statusClass = (statusName?: string) => {
  const key = (statusName || "").toLowerCase();
  if (key.includes("concl")) return "bg-green-100 text-green-800";
  if (key.includes("cancel")) return "bg-red-100 text-red-800";
  if (key.includes("andamento")) return "bg-amber-100 text-amber-800";
  return "bg-blue-100 text-blue-800";
};

const ClientOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const resolvedClientId = await resolveClientIdForUser(user);
      if (!resolvedClientId) return;

      setClientId(resolvedClientId);

      const { data: ordersData, error } = await db
        .from("orders")
        .select("*")
        .eq("client_id", resolvedClientId)
        .order("created_at", { ascending: false });

      if (!error) setOrders((ordersData || []) as Order[]);
    };

    fetchOrders();
  }, [user]);

  const filtered = useMemo(
    () =>
      orders.filter((order) => {
        const query = search.toLowerCase();
        return (
          order.order_number?.toLowerCase().includes(query) ||
          order.serviceType?.name?.toLowerCase().includes(query) ||
          order.vehicle?.model?.toLowerCase().includes(query) ||
          order.vehicle?.license_plate?.toLowerCase().includes(query)
        );
      }),
    [orders, search]
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
                    setOrders((prev) => [newOrder as Order, ...prev])
                  }
                />
              )}
            </DialogContent>
          </Dialog>
        </div>

        <Input
          placeholder="Buscar por código, serviço, modelo ou placa"
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
                  <td className="px-4 py-2 font-medium">{order.order_number || order.id.slice(0, 8)}</td>
                  <td className="px-4 py-2">{order.serviceType?.name || "-"}</td>
                  <td className="px-4 py-2">{order.vehicle?.model || "-"}</td>
                  <td className="px-4 py-2">
                    {order.created_at
                      ? new Date(order.created_at).toLocaleDateString("pt-BR")
                      : "-"}
                  </td>
                  <td className="px-4 py-2">{formatCurrency(order.value)}</td>
                  <td className="px-4 py-2">
                    <Badge className={statusClass(order.status?.name)}>{order.status?.name || "Sem status"}</Badge>
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
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
