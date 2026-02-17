import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { PlusCircle, Car, TrendingUp, ClipboardList, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { db } from "@/lib/dbClient";
import { useAuth } from "@/contexts/AuthContext";
import { Order } from "@/types";
import { resolveClientIdForUser } from "@/services/clientProfileService";
import { Badge } from "@/components/ui/badge";

export default function ClientDashboard() {
  const { user } = useAuth();
  const [clientId, setClientId] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const loadClientId = async () => {
      const resolvedClientId = await resolveClientIdForUser(user);
      setClientId(resolvedClientId);
    };

    loadClientId();
  }, [user]);

  useEffect(() => {
    if (!clientId) return;

    Promise.all([
      db.from("vehicles").select("*").eq("client_id", clientId),
      db
        .from("orders")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false }),
    ]).then(([vRes, oRes]) => {
      if (!vRes.error) setVehicles(vRes.data || []);
      if (!oRes.error) setOrders((oRes.data || []) as Order[]);
    });
  }, [clientId]);

  const pedidosConcluidos = useMemo(
    () => orders.filter((o) => o.status?.name?.toLowerCase() === "concluído").length,
    [orders]
  );
  const pedidosAtivos = orders.length - pedidosConcluidos;
  const valorTotal = orders.reduce((acc, o) => acc + Number(o.value || 0), 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Meu Dashboard</h1>
          <Button asChild>
            <Link to="/client/orders" className="flex gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>Novo Pedido</span>
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <ResumoCard
            title="Meus Veículos"
            icon={<Car className="h-5 w-5 text-muted-foreground" />}
            value={vehicles.length}
            link="/client/vehicles"
          />
          <ResumoCard
            title="Pedidos Ativos"
            icon={<ClipboardList className="h-5 w-5 text-muted-foreground" />}
            value={pedidosAtivos}
            link="/client/orders"
          />
          <ResumoCard
            title="Concluídos"
            icon={<TrendingUp className="h-5 w-5 text-muted-foreground" />}
            value={pedidosConcluidos}
          />
          <ResumoCard
            title="Valor Total"
            icon={<Wallet className="h-5 w-5 text-muted-foreground" />}
            value={new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valorTotal)}
          />
        </div>

        <div className="p-6 bg-card text-card-foreground rounded-lg border shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Meus Veículos</h3>
            <Button variant="outline" size="sm" asChild>
              <Link to="/client/vehicles" className="flex items-center gap-2">
                <Car className="h-4 w-4" />
                <span>Adicionar Veículo</span>
              </Link>
            </Button>
          </div>
          <div className="space-y-4">
            {vehicles.slice(0, 3).map((v) => (
              <div key={v.id} className="flex justify-between items-center border-b pb-3">
                <div>
                  <p className="font-medium">{v.model}</p>
                  <p className="text-sm text-muted-foreground">{v.license_plate} • {v.year}</p>
                </div>
                <Button variant="ghost" size="sm">Detalhes</Button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-card text-card-foreground rounded-lg border shadow">
          <h3 className="text-lg font-semibold mb-4">Pedidos Recentes</h3>
          <div className="space-y-4">
            {orders.slice(0, 3).map((order) => (
              <div key={order.id} className="flex justify-between items-center border-b pb-3">
                <div>
                  <p className="font-medium">{order.serviceType?.name || "Serviço"}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.vehicle?.model || "Veículo"} • {order.vehicle?.license_plate || "-"}
                  </p>
                </div>
                <Badge className={statusClass(order.status?.name)}>{order.status?.name || "Sem status"}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

const ResumoCard = ({
  title,
  icon,
  value,
  link,
}: {
  title: string;
  icon: JSX.Element;
  value: string | number;
  link?: string;
}) => (
  <div className="p-5 bg-card text-card-foreground rounded-lg border shadow flex flex-col gap-1">
    <div className="flex items-center justify-between">
      <h3 className="font-medium">{title}</h3>
      {icon}
    </div>
    <p className="text-3xl font-bold">{value}</p>
    {link && (
      <Button variant="link" asChild className="p-0 mt-1">
        <Link to={link}>Ver mais</Link>
      </Button>
    )}
  </div>
);

const statusClass = (statusName?: string) => {
  const key = (statusName || "").toLowerCase();
  if (key.includes("concl")) return "bg-green-100 text-green-800";
  if (key.includes("cancel")) return "bg-red-100 text-red-800";
  if (key.includes("andamento")) return "bg-amber-100 text-amber-800";
  return "bg-blue-100 text-blue-800";
};
