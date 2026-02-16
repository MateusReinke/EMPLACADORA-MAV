import React, { useEffect, useState } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Car,
  TrendingUp,
  ClipboardList,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import { db } from "@/lib/dbClient";
import { useAuth } from "@/contexts/AuthContext";

export default function ClientDashboard() {
  const { user } = useAuth();
  const [clientId, setClientId] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  // Buscar client_id pelo user_id
  useEffect(() => {
    if (!user) return;
    db
      .from("clients")
      .select("id")
      .eq("user_id", user.id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) setClientId(data.id);
      });
  }, [user]);

  // Buscar veículos e pedidos do cliente
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
      if (!oRes.error) setOrders(oRes.data || []);
    });
  }, [clientId]);

  const pedidosAtivos = orders.filter((o) => o.status !== "concluido");
  const pedidosConcluidos = orders.filter((o) => o.status === "concluido");
  const valorTotal = orders.reduce((acc, o) => acc + (o.valor || 0), 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Meu Dashboard</h1>
          <Button asChild>
            <Link to="/client/orders" className="flex gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>Novo Pedido</span>
            </Link>
          </Button>
        </div>

        {/* Resumo */}
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
            value={pedidosAtivos.length}
            link="/client/orders"
          />
          <ResumoCard
            title="Concluídos"
            icon={<TrendingUp className="h-5 w-5 text-muted-foreground" />}
            value={pedidosConcluidos.length}
          />
          <ResumoCard
            title="Valor Total"
            icon={<Wallet className="h-5 w-5 text-muted-foreground" />}
            value={`R$ ${valorTotal.toFixed(2)}`}
          />
        </div>

        {/* Últimos veículos */}
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
            {vehicles.slice(0, 3).map((v, i) => (
              <div
                key={i}
                className="flex justify-between items-center border-b pb-3"
              >
                <div>
                  <p className="font-medium">{v.model}</p>
                  <p className="text-sm text-muted-foreground">
                    {v.license_plate} • {v.year}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  Detalhes
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Últimos pedidos */}
        <div className="p-6 bg-card text-card-foreground rounded-lg border shadow">
          <h3 className="text-lg font-semibold mb-4">Pedidos Recentes</h3>
          <div className="space-y-4">
            {orders.slice(0, 3).map((p, i) => (
              <div
                key={i}
                className="flex justify-between items-center border-b pb-3"
              >
                <div>
                  <p className="font-medium">{p.servico}</p>
                  <p className="text-sm text-muted-foreground">
                    {p.modelo} • {p.placa}
                  </p>
                </div>
                <span
                  className={`bg-${statusColor(
                    p.status
                  )}-100 text-${statusColor(
                    p.status
                  )}-800 text-xs px-2 py-1 rounded-full capitalize`}
                >
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// Card de resumo reutilizável
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

// Mapeia status para cor
const statusColor = (status: string) => {
  if (status === "concluido") return "green";
  if (status === "em andamento") return "amber";
  return "blue";
};
