import React, { useEffect, useState } from "react";
import { ApiService } from "@/services/serviceTypesApi";
import { DashboardStats, Order, Client } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import {
  Calendar,
  ChartBar,
  Clock,
  Inbox,
  Loader2,
  TrendingUp,
  User,
  Car,
} from "lucide-react";
import AppLayout from "@/components/layouts/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const SellerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentClients, setRecentClients] = useState<Client[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (user) {
        try {
          const [statsData, ordersData, clientsData] = await Promise.all([
            ApiService.getDashboardStats(user.id, user.role),
            ApiService.getOrders(user.id, user.role),
            ApiService.getClients(user.id, user.role),
          ]);

          setStats(statsData);

          // Get 5 most recent orders
          const sortedOrders = [...ordersData]
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .slice(0, 5);
          setRecentOrders(sortedOrders);

          // Get 3 most recent clients - usando created_at em vez de createdAt
          // Como o tipo Client não tem createdAt, vamos usar um método diferente para ordenação
          // Se os clientes não tiverem timestamp, simplesmente pegamos os primeiros 3
          const sortedClients = [...clientsData].slice(0, 3);
          setRecentClients(sortedClients);
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();
  }, [user]);

  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Chart colors
  const chartColors = [
    "#3b82f6", // blue-500
    "#8b5cf6", // violet-500
    "#f97316", // orange-500
    "#22c55e", // green-500
    "#ef4444", // red-500
  ];

  const performanceData = (stats?.ordersByMonth || []).map((m) => ({
    month: m.month,
    orders: m.count,
    target: Math.max(m.count, 1),
  }));

  const openOrders = recentOrders.filter((o) => o.status?.name !== "Concluído").length;
  const completedOrders = recentOrders.filter((o) => o.status?.name === "Concluído").length;
  const conversionRate = recentOrders.length
    ? Math.round((completedOrders / recentOrders.length) * 100)
    : 0;

  // Helper to get status badge
  const getStatusBadge = (statusName?: string) => {
    if (!statusName) return "bg-gray-100 text-gray-800";

    const statusMap: Record<string, string> = {
      Novo: "bg-blue-100 text-blue-800",
      Pendente: "bg-amber-100 text-amber-800",
      "Em Andamento": "bg-violet-100 text-violet-800",
      Concluído: "bg-green-100 text-green-800",
      Cancelado: "bg-red-100 text-red-800",
    };

    return statusMap[statusName] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center space-y-4 min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Carregando dashboard...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Dashboard do Vendedor
            </h1>
            <p className="text-muted-foreground">
              Acompanhe seu desempenho e gerencie seus pedidos.
            </p>
          </div>
          <Button onClick={() => navigate("/vendedor/orders")}>
            Ver Todos os Pedidos
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Meus Clientes
              </CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalClients || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total de clientes vinculados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pedidos em Aberto
              </CardTitle>
              <Inbox className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{openOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Pedidos não concluídos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pedidos Finalizados
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{completedOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Pedidos concluídos recentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Taxa de Conversão
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{conversionRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Taxa com base nos pedidos recentes
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Performance Chart */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Desempenho Mensal</CardTitle>
              <CardDescription>
                Comparação entre pedidos realizados e metas
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`${value} pedidos`, "Quantidade"]}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                  <Legend />
                  <Bar
                    name="Pedidos"
                    dataKey="orders"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    name="Meta"
                    dataKey="target"
                    fill="#94a3b8"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Service Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Serviços Mais Vendidos</CardTitle>
              <CardDescription>
                Distribuição por tipo de serviço
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.ordersByServiceType &&
              stats.ordersByServiceType.length > 0 ? (
                <div className="flex items-center justify-center h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.ordersByServiceType}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="serviceName"
                        label={({ serviceName, count }) => `${count}`}
                      >
                        {stats.ordersByServiceType.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={chartColors[index % chartColors.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any, name: any, props: any) => [
                          `${value} pedidos`,
                          props.payload.serviceName,
                        ]}
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          borderColor: "var(--border)",
                          color: "var(--foreground)",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <span>Emplacamento</span>
                    <span className="font-medium">32</span>
                  </div>
                  <div className="h-2 bg-secondary rounded overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: "75%" }}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Transferência</span>
                    <span className="font-medium">28</span>
                  </div>
                  <div className="h-2 bg-secondary rounded overflow-hidden">
                    <div
                      className="h-full bg-violet-500"
                      style={{ width: "65%" }}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Legalização</span>
                    <span className="font-medium">15</span>
                  </div>
                  <div className="h-2 bg-secondary rounded overflow-hidden">
                    <div
                      className="h-full bg-orange-500"
                      style={{ width: "45%" }}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Vistorias</span>
                    <span className="font-medium">10</span>
                  </div>
                  <div className="h-2 bg-secondary rounded overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: "30%" }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Últimos Pedidos</CardTitle>
              <CardDescription>Pedidos recentemente criados</CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <div className="space-y-2">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 rounded-full bg-primary/10 p-1.5">
                          <Car className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">
                            {order.client?.name || "Cliente"}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {order.serviceType?.name || "Serviço"} -{" "}
                            {order.licensePlate}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getStatusBadge(
                          order.status?.name
                        )}`}
                      >
                        {order.status?.name || "Status"}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center p-4">
                    <p className="text-muted-foreground text-sm">
                      Nenhum pedido encontrado
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigate("/vendedor/orders")}
              >
                Ver Todos os Pedidos
              </Button>
            </CardFooter>
          </Card>

          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>Entregas Próximas</CardTitle>
              <CardDescription>
                Pedidos reais com data estimada de entrega
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentOrders.filter((o) => o.estimated_delivery_date).length > 0 ? (
                <div className="space-y-2">
                  {recentOrders
                    .filter((o) => o.estimated_delivery_date)
                    .slice(0, 6)
                    .map((o) => (
                      <div key={o.id} className="border rounded p-2">
                        <p className="font-medium">{o.serviceType?.name || "Serviço"}</p>
                        <p className="text-xs text-muted-foreground">
                          {o.client?.name || "Cliente"} • {o.licensePlate || "-"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Entrega: {new Date(o.estimated_delivery_date as string).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum prazo de entrega informado.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default SellerDashboard;
