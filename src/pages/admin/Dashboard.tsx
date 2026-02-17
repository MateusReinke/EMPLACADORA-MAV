// src/pages/admin/Dashboard.tsx
import React, { useEffect, useState, useCallback } from "react";
import { DashboardStats } from "@/types";
import {
  DashboardWidget,
  WidgetType,
  WidgetMetadata,
} from "@/types/dashboardWidgets";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CirclePlus,
  Trash2,
  Loader2,
  Users,
  Package,
  History,
  Info,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon, // Ícone para o tipo de widget
  List,
  CircleAlert,
  Settings, // Ícone para CustomData e para o botão de editar
  MoreVertical,
  DatabaseZap, // Ícone alternativo
} from "lucide-react";
import AppLayout from "@/components/layouts/AppLayout";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardService } from "@/services/dashboardApi";
import { DashboardLayoutService } from "@/services/dashboardLayoutService";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Bar,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  // BarChart as RechartsBarChart, // Usaremos RechartsBarChart diretamente se necessário
} from "recharts";

import {
  Responsive,
  WidthProvider,
  Layouts,
  Layout as RGL_Layout,
} from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import WidgetCustomData from "@/components/dashboard/widgets/WidgetCustomData"; // Importando o WidgetCustomData
import ConfigureCustomWidgetDialog from "@/components/dashboard/ConfigureCustomWidgetDialog"; // Importando o diálogo de configuração

const ResponsiveGridLayout = WidthProvider(Responsive);

// --- Componentes de Widget Focados em Administração ---

const WidgetTotalRevenue: React.FC<{
  stats: DashboardStats | null;
  config?: Record<string, any>;
}> = ({ stats, config }) => {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const totalRevenue = stats?.monthlyRevenue || 0;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {config?.title || "Faturamento Total"}
        </CardTitle>
        <CirclePlus className="h-4 w-4 text-green-500" />
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-center">
        <div className="text-3xl font-bold">
          {stats ? formatCurrency(totalRevenue) : <Loader2 className="h-6 w-6 animate-spin" />}
        </div>
        {stats !== null && (
          <p className="text-xs text-muted-foreground mt-1">Receita mensal atual</p>
        )}
      </CardContent>
    </Card>
  );
};

const WidgetOrdersInProgress: React.FC<{
  stats: DashboardStats | null;
  config?: Record<string, any>;
}> = ({ stats, config }) => {
  const ordersInProgress = stats ? (
    stats.totalOrders -
    (stats.ordersByStatus.find((s) => s.status_name === "Concluído")?.count || 0) -
    (stats.ordersByStatus.find((s) => s.status_name === "Cancelado")?.count || 0)
  ) : 0;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {config?.title || "Pedidos em Andamento"}
        </CardTitle>
        <History className="h-4 w-4 text-amber-500" />
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-center">
        <div className="text-3xl font-bold">
          {stats ? ordersInProgress : <Loader2 className="h-6 w-6 animate-spin" />}
        </div>
        {stats !== null && (
          <p className="text-xs text-muted-foreground mt-1">Necessitam atenção</p>
        )}
      </CardContent>
    </Card>
  );
};

const WidgetTotalSellers: React.FC<{
  stats: DashboardStats | null;
  config?: Record<string, any>;
}> = ({ stats, config }) => (
  <Card className="h-full flex flex-col">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">
        {config?.title || "Total de Vendedores"}
      </CardTitle>
      <Users className="h-4 w-4 text-green-500" />
    </CardHeader>
    <CardContent className="flex-grow flex flex-col justify-center">
      <div className="text-3xl font-bold">
        {stats?.totalSellers ?? <Loader2 className="h-6 w-6 animate-spin" />}
      </div>
      {stats !== null && (
        <p className="text-xs text-muted-foreground mt-1">Vendedores ativos</p>
      )}
    </CardContent>
  </Card>
);

const WidgetTotalClients: React.FC<{
  stats: DashboardStats | null;
  config?: Record<string, any>;
}> = ({ stats, config }) => (
  <Card className="h-full flex flex-col">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">
        {config?.title || "Total de Clientes"}
      </CardTitle>
      <Users className="h-4 w-4 text-green-500" />
    </CardHeader>
    <CardContent className="flex-grow flex flex-col justify-center">
      <div className="text-3xl font-bold">
        {stats?.totalClients ?? <Loader2 className="h-6 w-6 animate-spin" />}
      </div>
      {stats !== null && (
        <p className="text-xs text-muted-foreground mt-1">
          Clientes cadastrados
        </p>
      )}
    </CardContent>
  </Card>
);

const WidgetCriticalAlerts: React.FC<{
  stats: DashboardStats | null;
  config?: Record<string, any>;
}> = ({ stats, config }) => {
  const criticalItems = stats?.lowStockItems?.filter(item => item.status === 'critical')?.length || 0;
  const lowItems = stats?.lowStockItems?.filter(item => item.status === 'low')?.length || 0;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {config?.title || "Alertas Críticos"}
        </CardTitle>
        <CircleAlert className="h-4 w-4 text-red-500" />
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-center">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-red-600">Estoque Crítico:</span>
            <span className="text-lg font-bold text-red-600">{criticalItems}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-amber-600">Estoque Baixo:</span>
            <span className="text-lg font-bold text-amber-600">{lowItems}</span>
          </div>
        </div>
        {stats !== null && (
          <p className="text-xs text-muted-foreground mt-2">Itens precisam de reposição</p>
        )}
      </CardContent>
    </Card>
  );
};

const WidgetCriticalStock: React.FC<{
  stats: DashboardStats | null;
  config?: Record<string, any>;
}> = ({ stats, config }) => (
  <Card className="h-full flex flex-col">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">
        {config?.title || "Itens em Estoque Crítico"}
      </CardTitle>
      <Package className="h-4 w-4 text-orange-500" />
    </CardHeader>
    <CardContent className="flex-grow flex flex-col justify-center">
      <div className="text-3xl font-bold">
        {stats?.lowStockItems?.length ?? (
          <Loader2 className="h-6 w-6 animate-spin" />
        )}
      </div>
      {stats !== null && (
        <p className="text-xs text-muted-foreground mt-1">
          Itens precisam de reposição
        </p>
      )}
    </CardContent>
  </Card>
);

const WidgetMonthlyRevenueChart: React.FC<{
  stats: DashboardStats | null;
  config?: Record<string, any>;
}> = ({ stats, config }) => {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  const chartColors = config?.chartColors || [
    "hsl(var(--primary))",
    "hsl(var(--muted-foreground))",
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-base">
          {config?.title || "Tendência de Faturamento e Pedidos"}
        </CardTitle>
        <CardDescription className="text-xs">Últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pt-0 -ml-4">
        {!stats || !stats.ordersByMonth || stats.ordersByMonth.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm">Carregando dados...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={stats.ordersByMonth}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <XAxis
                dataKey="month"
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="left"
                stroke={chartColors[0]}
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `R$${value / 1000}k`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke={chartColors[1]}
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value: number, name: string) =>
                  name === "revenue"
                    ? [formatCurrency(value), "Faturamento"]
                    : [`${value} pedidos`, "Quantidade"]
                }
                labelFormatter={(label) => `Mês: ${label}`}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                itemStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend
                wrapperStyle={{ fontSize: "10px", paddingTop: "10px" }}
                verticalAlign="top"
                height={30}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                name="Faturamento"
                stroke={chartColors[0]}
                strokeWidth={2}
                dot={{ fill: chartColors[0], r: 2 }}
                activeDot={{ r: 4 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="count"
                name="Pedidos"
                stroke={chartColors[1]}
                strokeWidth={2}
                dot={{ fill: chartColors[1], r: 2 }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

const WidgetServiceDistributionChart: React.FC<{
  stats: DashboardStats | null;
  config?: Record<string, any>;
}> = ({ stats, config }) => {
  const chartColors = config?.chartColors || [
    "#3b82f6",
    "#06b6d4",
    "#8b5cf6",
    "#ef4444",
    "#f97316",
    "#eab308",
  ];
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-base">
          {config?.title || "Distribuição por Serviço"}
        </CardTitle>
        <CardDescription className="text-xs">
          Percentual por tipo
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pt-0 flex items-center justify-center">
        {!stats ||
        !stats.ordersByServiceType ||
        stats.ordersByServiceType.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm">Carregando dados...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats.ordersByServiceType}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius="80%"
                dataKey="count"
                nameKey="service_name"
                label={({ service_name, percent }) =>
                  `${(percent * 100).toFixed(0)}%`
                }
              >
                {stats.ordersByServiceType.map((entry, index) => (
                  <Cell
                    key={`cell-service-${entry.service_name}-${index}`}
                    fill={chartColors[index % chartColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any, name: any, props: any) => [
                  `${value} pedidos (${(props.payload.percent * 100).toFixed(
                    1
                  )}%)`,
                  props.payload.service_name,
                ]}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  fontSize: "12px",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "10px", paddingTop: "10px" }}
                verticalAlign="top"
                height={30}
                layout="horizontal"
                align="center"
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

const WidgetStatusDistributionChart: React.FC<{
  stats: DashboardStats | null;
  config?: Record<string, any>;
}> = ({ stats, config }) => {
  const chartColors = config?.chartColors || [
    "#3b82f6",
    "#8b5cf6",
    "#f97316",
    "#22c55e",
    "#ef4444",
    "#A0A0A0",
  ];
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-base">
          {config?.title || "Distribuição por Status"}
        </CardTitle>
        <CardDescription className="text-xs">Pedidos agrupados</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pt-0 overflow-y-auto">
        {!stats ||
        !stats.ordersByStatus ||
        stats.ordersByStatus.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm">Carregando dados...</p>
          </div>
        ) : (
          <div className="space-y-3 py-2">
            {stats.ordersByStatus.map((statusItem, index) => (
              <div key={statusItem.status_name || index} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor:
                          statusItem.color ||
                          chartColors[index % chartColors.length],
                      }}
                    />
                    <span className="font-medium">
                      {statusItem.status_name}
                    </span>
                  </div>
                  <span className="text-muted-foreground">
                    {statusItem.count}
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${
                        stats.totalOrders > 0
                          ? (statusItem.count / stats.totalOrders) * 100
                          : 0
                      }%`,
                      backgroundColor:
                        statusItem.color ||
                        chartColors[index % chartColors.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const WidgetRecentActivities: React.FC<{
  stats: DashboardStats | null;
  config?: Record<string, any>;
}> = ({ stats, config }) => {
  const formatActivityTime = (dateString: string) =>
    formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ptBR,
    });
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-base">
          {config?.title || "Atividades Recentes"}
        </CardTitle>
        <CardDescription className="text-xs">
          Últimas ações no sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pt-0 overflow-y-auto">
        {!stats ||
        !stats.recentActivities ||
        stats.recentActivities.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm">
              Nenhuma atividade recente.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recentActivities.slice(0, 7).map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-2.5 border-b border-border/50 pb-2.5 last:border-0 last:pb-0"
              >
                <div className="mt-0.5 rounded-full bg-primary/10 p-1.5 text-primary flex-shrink-0">
                  {activity.type === "order" && <List className="h-3 w-3" />}
                  {activity.type === "client" && <Users className="h-3 w-3" />}
                  {activity.type === "inventory_movement" && (
                    <Package className="h-3 w-3" />
                  )}
                </div>
                <div className="flex-grow">
                  <p className="text-xs font-medium leading-snug">
                    {activity.description}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {activity.user_name} •{" "}
                    {formatActivityTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const WidgetTopSellers: React.FC<{
  stats: DashboardStats | null;
  config?: Record<string, any>;
}> = ({ stats, config }) => (
  <Card className="h-full flex flex-col">
    <CardHeader>
      <CardTitle className="text-base">
        {config?.title || "Top Vendedores"}
      </CardTitle>
      <CardDescription className="text-xs">
        Desempenho do mês atual (Exemplo)
      </CardDescription>
    </CardHeader>
    <CardContent className="flex-grow flex items-center justify-center">
      <p className="text-muted-foreground text-sm">
        Dados de Top Vendedores indisponíveis.
      </p>
    </CardContent>
  </Card>
);

// Mapeamento CORRIGIDO dos componentes de widget
const widgetComponents: Record<
  WidgetType,
  React.ComponentType<{
    stats: DashboardStats | null;
    config?: Record<string, any>;
  }>
> = {
  TotalSellers: WidgetTotalSellers,
  TotalClients: WidgetTotalClients,
  OpenOrders: WidgetOrdersInProgress,
  CriticalStock: WidgetCriticalAlerts,
  TotalRevenue: WidgetTotalRevenue,
  OrdersInProgress: WidgetOrdersInProgress,
  CriticalAlerts: WidgetCriticalAlerts,
  MonthlyRevenueChart: WidgetMonthlyRevenueChart,
  ServiceDistributionChart: WidgetServiceDistributionChart,
  StatusDistributionChart: WidgetStatusDistributionChart,
  RecentActivities: WidgetRecentActivities,
  TopSellers: WidgetTopSellers,
  CustomData: WidgetCustomData,
};

// Metadados dos widgets focados em administração
const availableWidgets: WidgetMetadata[] = [
  {
    type: "TotalRevenue",
    title: "Faturamento Total",
    description: "Receita mensal atual do negócio.",
    icon: CirclePlus,
    defaultLayout: { w: 1, h: 1, minW: 1, minH: 1 },
  },
  {
    type: "OrdersInProgress", 
    title: "Pedidos em Andamento",
    description: "Pedidos que necessitam atenção.",
    icon: History,
    defaultLayout: { w: 1, h: 1, minW: 1, minH: 1 },
  },
  {
    type: "TotalClients",
    title: "Clientes",
    description: "Total de clientes cadastrados.",
    icon: Users,
    defaultLayout: { w: 1, h: 1, minW: 1, minH: 1 },
  },
  {
    type: "CriticalAlerts",
    title: "Alertas Críticos",
    description: "Problemas que precisam atenção imediata.",
    icon: CircleAlert,
    defaultLayout: { w: 1, h: 1, minW: 1, minH: 1 },
  },
  {
    type: "TotalSellers",
    title: "Vendedores",
    description: "Total de vendedores ativos.",
    icon: Users,
    defaultLayout: { w: 1, h: 1, minW: 1, minH: 1 },
  },
  {
    type: "MonthlyRevenueChart",
    title: "Receita & Pedidos",
    description: "Gráfico de receita e pedidos/mês.",
    icon: LineChartIcon,
    defaultLayout: { w: 2, h: 2, minW: 2, minH: 2 },
  },
  {
    type: "ServiceDistributionChart",
    title: "Serviços Populares",
    description: "Distribuição de pedidos por serviço.",
    icon: PieChartIcon,
    defaultLayout: { w: 2, h: 2, minW: 2, minH: 2 },
  },
  {
    type: "StatusDistributionChart",
    title: "Pedidos por Status",
    description: "Distribuição de pedidos por status.",
    icon: BarChartIcon,
    defaultLayout: { w: 2, h: 2, minW: 2, minH: 2 },
  },
  {
    type: "RecentActivities",
    title: "Atividades Recentes",
    description: "Últimas ações no sistema.",
    icon: History,
    defaultLayout: { w: 2, h: 3, minW: 1, minH: 2 },
  },
  {
    type: "CustomData",
    title: "Widget Customizável",
    description:
      "Crie visualizações (tabelas, gráficos) a partir de suas próprias consultas. Requer configuração.",
    icon: Settings,
    defaultLayout: { w: 2, h: 2, minW: 1, minH: 1 },
  },
];

// Interface para os itens de layout de configuração
interface DefaultLayoutConfigItem extends RGL_Layout {
  type: WidgetType;
}

// Configuração de Layout Padrão focado em Administração
const DEFAULT_LAYOUTS_CONFIG: { lg: DefaultLayoutConfigItem[] } = {
  lg: [
    {
      i: "TotalRevenue-default",
      type: "TotalRevenue",
      x: 0,
      y: 0,
      w: 1,
      h: 1,
      minW: 1,
      minH: 1,
    },
    {
      i: "OrdersInProgress-default",
      type: "OrdersInProgress",
      x: 1,
      y: 0,
      w: 1,
      h: 1,
      minW: 1,
      minH: 1,
    },
    {
      i: "TotalClients-default",
      type: "TotalClients",
      x: 2,
      y: 0,
      w: 1,
      h: 1,
      minW: 1,
      minH: 1,
    },
    {
      i: "CriticalAlerts-default",
      type: "CriticalAlerts",
      x: 3,
      y: 0,
      w: 1,
      h: 1,
      minW: 1,
      minH: 1,
    },
    {
      i: "MonthlyRevenueChart-default",
      type: "MonthlyRevenueChart",
      x: 0,
      y: 1,
      w: 2,
      h: 2,
      minW: 2,
      minH: 2,
    },
    {
      i: "ServiceDistributionChart-default",
      type: "ServiceDistributionChart",
      x: 2,
      y: 1,
      w: 2,
      h: 2,
      minW: 2,
      minH: 2,
    },
    {
      i: "StatusDistributionChart-default",
      type: "StatusDistributionChart",
      x: 0,
      y: 3,
      w: 2,
      h: 2,
      minW: 2,
      minH: 2,
    },
    {
      i: "RecentActivities-default",
      type: "RecentActivities",
      x: 2,
      y: 3,
      w: 2,
      h: 3,
      minW: 1,
      minH: 2,
    },
  ],
};

const getDefaultDashboardWidgets = (
  breakpoint: keyof typeof DEFAULT_LAYOUTS_CONFIG = "lg"
): DashboardWidget[] => {
  const layoutConfigForBreakpoint =
    DEFAULT_LAYOUTS_CONFIG[breakpoint] || DEFAULT_LAYOUTS_CONFIG.lg || [];
  return layoutConfigForBreakpoint.map((l_item) => {
    const widgetMeta = availableWidgets.find((w) => w.type === l_item.type);
    const defaultDims = widgetMeta?.defaultLayout || {
      w: 1,
      h: 1,
      minW: 0,
      minH: 0,
    };

    const currentW = l_item.w ?? defaultDims.w;
    const currentH = l_item.h ?? defaultDims.h;
    const currentMinW = l_item.minW ?? defaultDims.minW ?? 0;
    const currentMinH = l_item.minH ?? defaultDims.minH ?? 0;

    return {
      id: l_item.i,
      type: l_item.type,
      layout: {
        x: l_item.x,
        y: l_item.y,
        w: Math.max(currentW, currentMinW),
        h: Math.max(currentH, currentMinH),
        minW: currentMinW,
        minH: currentMinH,
        maxW: l_item.maxW,
        maxH: l_item.maxH,
      },
      config: {},
    };
  });
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingLayout, setLoadingLayout] = useState(true);
  const [currentLayout, setCurrentLayout] = useState<DashboardWidget[]>([]);
  const [isAddWidgetDialogOpen, setIsAddWidgetDialogOpen] = useState(false);
  const [isEditingLayout, setIsEditingLayout] = useState(false);
  const [isConfigureWidgetDialogOpen, setIsConfigureWidgetDialogOpen] =
    useState(false);
  const [configuringWidget, setConfiguringWidget] =
    useState<DashboardWidget | null>(null);

  const cols = { lg: 4, md: 3, sm: 2, xs: 1, xxs: 1 };

  useEffect(() => {
    const fetchStats = async () => {
      if (user?.role === "admin") {
        setLoadingStats(true);
        try {
          const data = await DashboardService.getAdminDashboardStats();
          setStats(data);
        } catch (error) {
          console.error("Error fetching dashboard stats:", error);
        } finally {
          setLoadingStats(false);
        }
      } else {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, [user]);

  useEffect(() => {
    const loadLayout = async () => {
      if (user?.id) {
        setLoadingLayout(true);
        try {
          const savedLayoutItems = await DashboardLayoutService.getLayout(
            user.id
          );
          const defaultWidgets = getDefaultDashboardWidgets("lg");

          if (
            savedLayoutItems &&
            Array.isArray(savedLayoutItems) &&
            savedLayoutItems.length > 0
          ) {
            const processedLayout = savedLayoutItems
              .filter(
                (item) =>
                  item &&
                  typeof item.id === "string" &&
                  item.id.trim() !== "" &&
                  item.layout &&
                  typeof item.layout.x === "number" &&
                  typeof item.layout.y === "number" &&
                  typeof item.layout.w === "number" &&
                  typeof item.layout.h === "number" &&
                  availableWidgets.some((aw) => aw.type === item.type)
              )
              .map((item) => {
                const widgetMeta = availableWidgets.find(
                  (w) => w.type === item.type
                )!;
                const defaultDims = widgetMeta.defaultLayout;

                const itemLayoutSource =
                  item.layout &&
                  typeof item.layout === "object" &&
                  !Array.isArray(item.layout)
                    ? item.layout
                    : { x: 0, y: 0, w: defaultDims.w, h: defaultDims.h };

                const itemLayoutMinW =
                  itemLayoutSource.minW ?? defaultDims.minW ?? 0;
                const itemLayoutMinH =
                  itemLayoutSource.minH ?? defaultDims.minH ?? 0;
                const itemLayoutW = itemLayoutSource.w || defaultDims.w;
                const itemLayoutH = itemLayoutSource.h || defaultDims.h;

                return {
                  ...item,
                  layout: {
                    x: itemLayoutSource.x ?? 0,
                    y: itemLayoutSource.y ?? 0,
                    w: Math.max(itemLayoutW, itemLayoutMinW),
                    h: Math.max(itemLayoutH, itemLayoutMinH),
                    minW: itemLayoutMinW,
                    maxW: itemLayoutSource.maxW,
                    minH: itemLayoutMinH,
                    maxH: itemLayoutSource.maxH,
                  },
                };
              });
            setCurrentLayout(
              processedLayout.length > 0 ? processedLayout : defaultWidgets
            );
          } else {
            setCurrentLayout(defaultWidgets);
          }
        } catch (error) {
          console.error("Erro ao carregar layout do DB:", error);
          setCurrentLayout(getDefaultDashboardWidgets("lg"));
        } finally {
          setLoadingLayout(false);
        }
      } else if (!loadingStats) {
        setCurrentLayout(getDefaultDashboardWidgets("lg"));
        setLoadingLayout(false);
      }
    };
    loadLayout();
  }, [user?.id, loadingStats]);

  const onLayoutChange = useCallback(
    (newGridLayout: RGL_Layout[], allRglLayouts: Layouts) => {
      if (!user?.id || !isEditingLayout) return;

      const updatedDashboardWidgets: DashboardWidget[] = newGridLayout
        .map((layoutItem) => {
          const existingWidget = currentLayout.find(
            (w) => w.id === layoutItem.i
          );
          if (!existingWidget) {
            const widgetMeta = availableWidgets.find((aw) =>
              layoutItem.i.startsWith(aw.type)
            ); // Tenta inferir pelo início do ID
            if (widgetMeta) {
              return {
                id: layoutItem.i,
                type: widgetMeta.type,
                layout: {
                  x: layoutItem.x,
                  y: layoutItem.y,
                  w: layoutItem.w,
                  h: layoutItem.h,
                  minW: layoutItem.minW ?? widgetMeta.defaultLayout.minW,
                  minH: layoutItem.minH ?? widgetMeta.defaultLayout.minH,
                },
                config: {},
              };
            }
            return null;
          }
          return {
            ...existingWidget,
            layout: {
              x: layoutItem.x,
              y: layoutItem.y,
              w: layoutItem.w,
              h: layoutItem.h,
              minW: layoutItem.minW ?? existingWidget.layout.minW,
              maxW: layoutItem.maxW ?? existingWidget.layout.maxW,
              minH: layoutItem.minH ?? existingWidget.layout.minH,
              maxH: layoutItem.maxH ?? existingWidget.layout.maxH,
            },
          };
        })
        .filter(Boolean) as DashboardWidget[];

      if (
        JSON.stringify(
          currentLayout.map((w) => ({ id: w.id, layout: w.layout }))
        ) !==
        JSON.stringify(
          updatedDashboardWidgets.map((w) => ({ id: w.id, layout: w.layout }))
        )
      ) {
        setCurrentLayout(updatedDashboardWidgets);
        DashboardLayoutService.saveLayout(user.id, updatedDashboardWidgets)
          .then(() => console.log("Layout salvo com sucesso."))
          .catch((err) => console.error("Falha ao salvar layout:", err));
      }
    },
    [user?.id, currentLayout, isEditingLayout]
  );

  const addWidget = (widgetType: WidgetType) => {
    const widgetMeta = availableWidgets.find((w) => w.type === widgetType);
    if (!widgetMeta || !user?.id) return;

    const newId = `${widgetType}-${Date.now()}`;
    const defaultDims = widgetMeta.defaultLayout;

    const newWidget: DashboardWidget = {
      id: newId,
      type: widgetType,
      layout: {
        x: (currentLayout.length * (defaultDims.w || 1)) % (cols.lg || 4),
        y: Infinity,
        w: Math.max(defaultDims.w, defaultDims.minW || 0),
        h: Math.max(defaultDims.h, defaultDims.minH || 0),
        minW: defaultDims.minW,
        minH: defaultDims.minH,
      },
      config: {},
    };

    const updatedLayout = [...currentLayout, newWidget];
    setCurrentLayout(updatedLayout);

    if (isEditingLayout) {
      DashboardLayoutService.saveLayout(user.id, updatedLayout)
        .then(() =>
          console.log(`Widget ${widgetType} adicionado e layout salvo.`)
        )
        .catch((err) =>
          console.error("Falha ao adicionar widget e salvar layout:", err)
        );
    }
    setIsAddWidgetDialogOpen(false);
  };

  const removeWidget = (widgetId: string) => {
    if (!user?.id) return;
    const updatedLayout = currentLayout.filter(
      (widget) => widget.id !== widgetId
    );
    setCurrentLayout(updatedLayout);
    if (isEditingLayout) {
      DashboardLayoutService.saveLayout(user.id, updatedLayout)
        .then(() => console.log(`Widget ${widgetId} removido e layout salvo.`))
        .catch((err) =>
          console.error("Falha ao remover widget e salvar layout:", err)
        );
    }
  };

  const handleOpenConfigureWidgetDialog = (widgetId: string) => {
    const widgetToConfigure = currentLayout.find((w) => w.id === widgetId);
    if (widgetToConfigure && widgetToConfigure.type === "CustomData") {
      setConfiguringWidget(widgetToConfigure);
      setIsConfigureWidgetDialogOpen(true);
    } else {
      alert("Este widget não é configurável ou não foi encontrado.");
    }
  };

  const handleSaveWidgetConfiguration = (
    widgetId: string,
    newConfig: DashboardWidget["config"]
  ) => {
    const layoutToSave = currentLayout.map((widget) =>
      widget.id === widgetId ? { ...widget, config: newConfig } : widget
    );
    setCurrentLayout(layoutToSave);

    if (user?.id) {
      DashboardLayoutService.saveLayout(user.id, layoutToSave)
        .then(() => console.log(`Configuração do widget ${widgetId} salva.`))
        .catch((err) =>
          console.error("Erro ao salvar configuração do widget:", err)
        );
    }
    setIsConfigureWidgetDialogOpen(false);
    setConfiguringWidget(null);
  };

  const rglLayoutsProp: Layouts = {};
  (Object.keys(cols) as Array<keyof typeof cols>).forEach((bp) => {
    rglLayoutsProp[bp] = currentLayout.map((widget) => {
      const widgetMetaForDims = availableWidgets.find(
        (aw) => aw.type === widget.type
      );
      const defaultRGL_Dimensions = widgetMetaForDims?.defaultLayout || {
        w: 1,
        h: 1,
        minW: 0,
        minH: 0,
      };

      const layoutSource =
        widget.layout &&
        typeof widget.layout === "object" &&
        !Array.isArray(widget.layout)
          ? widget.layout
          : {
              x: 0,
              y: 0,
              w: defaultRGL_Dimensions.w,
              h: defaultRGL_Dimensions.h,
            };

      const x = typeof layoutSource.x === "number" ? layoutSource.x : 0;
      const y = typeof layoutSource.y === "number" ? layoutSource.y : 0;
      const w =
        typeof layoutSource.w === "number"
          ? layoutSource.w
          : defaultRGL_Dimensions.w;
      const h =
        typeof layoutSource.h === "number"
          ? layoutSource.h
          : defaultRGL_Dimensions.h;
      const minW =
        typeof layoutSource.minW === "number"
          ? layoutSource.minW
          : defaultRGL_Dimensions.minW ?? 0;
      const minH =
        typeof layoutSource.minH === "number"
          ? layoutSource.minH
          : defaultRGL_Dimensions.minH ?? 0;

      return {
        i: widget.id,
        x,
        y,
        w: Math.max(w, minW),
        h: Math.max(h, minH),
        minW,
        minH,
        maxW: layoutSource.maxW,
        maxH: layoutSource.maxH,
      };
    });
  });

  if (loadingStats || loadingLayout) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-3 text-muted-foreground">Carregando dashboard...</p>
        </div>
      </AppLayout>
    );
  }

  if (!stats && !loadingStats) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
          <Info className="h-12 w-12 text-destructive mb-4" />
          <p className="text-lg text-destructive">
            Não foi possível carregar os dados do dashboard.
          </p>
          <p className="text-sm text-muted-foreground">
            Por favor, verifique sua conexão ou tente novamente mais tarde.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-4 md:p-6">
        <div className="space-y-4">
          <AdminPageHeader
            title="Dashboard Administrativo"
            description="Tenha visão consolidada de indicadores financeiros, serviços e performance da operação."
            stats={[
              { label: "Widgets", value: String(widgets.length) },
              { label: "Modo edição", value: isEditingLayout ? "Ligado" : "Desligado" },
            ]}
          />
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={isEditingLayout ? "default" : "outline"}
              onClick={() => setIsEditingLayout((prev) => !prev)}
            >
              <Settings className="h-4 w-4 mr-2" />
              {isEditingLayout ? "Concluir Edição" : "Editar Layout"}
            </Button>
            {isEditingLayout && (
              <Dialog
                open={isAddWidgetDialogOpen}
                onOpenChange={setIsAddWidgetDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <CirclePlus className="h-4 w-4 mr-2" />
                    Adicionar Widget
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Adicionar Widget ao Dashboard</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4 max-h-[60vh] overflow-y-auto">
                    {availableWidgets.map((widgetMeta) => {
                      // CORRIGIDO: Simplificando a lógica disabled.
                      // Se quiser permitir múltiplos com base no título ou flag, ajuste aqui.
                      const isAdded = currentLayout.some(
                        (w) => w.type === widgetMeta.type
                      );
                      const allowMultiple =
                        widgetMeta.allowMultipleInstances || false; // Usando a nova flag

                      return (
                        <Button
                          key={widgetMeta.type}
                          variant="outline"
                          onClick={() => addWidget(widgetMeta.type)}
                          className="justify-start gap-2 h-auto py-3 flex-col items-start text-left hover:bg-accent hover:text-accent-foreground"
                          disabled={isAdded && !allowMultiple} // <<< LÓGICA DE DESABILITAR AJUSTADA
                        >
                          <div className="flex items-center gap-2 w-full">
                            {React.createElement(widgetMeta.icon, {
                              className:
                                "h-4 w-4 text-muted-foreground flex-shrink-0",
                            })}
                            <span className="font-medium text-sm">
                              {widgetMeta.title}
                            </span>
                            {isAdded && !allowMultiple && (
                              <Badge
                                variant="secondary"
                                className="ml-auto text-xs"
                              >
                                Adicionado
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground whitespace-normal mt-1">
                            {widgetMeta.description}
                          </p>
                        </Button>
                      );
                    })}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* ... (Restante do JSX do AdminDashboard, incluindo ResponsiveGridLayout, como na resposta anterior) ... */}
        {/* Certifique-se de que o código para rglLayoutsProp e a renderização dos widgets dentro de ResponsiveGridLayout
            esteja como na minha última resposta completa para este arquivo, pois ele já continha as correções
            para os erros de "Property 'x' does not exist on type '[]'".
        */}
        {currentLayout.length === 0 && !isEditingLayout && !loadingLayout ? (
          <div className="flex flex-col items-center justify-center h-60 border-2 border-dashed rounded-lg p-4 text-center mt-6">
            <Info className="h-10 w-10 mb-3 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">
              Seu dashboard está vazio!
            </p>
            <p className="text-sm text-muted-foreground">
              Clique em "Editar Layout" e depois em "Adicionar Widget" para
              começar.
            </p>
          </div>
        ) : (
          <ResponsiveGridLayout
            className={`layout min-h-[calc(100vh-200px)] ${
              isEditingLayout
                ? "is-editing bg-muted/10 border border-dashed border-primary/30 rounded-lg"
                : ""
            }`}
            layouts={rglLayoutsProp}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={cols}
            rowHeight={60}
            onLayoutChange={onLayoutChange}
            isDraggable={isEditingLayout}
            isResizable={isEditingLayout}
            compactType="vertical"
            preventCollision={false}
            margin={[16, 16]}
            containerPadding={[16, 16]}
            draggableHandle=".drag-handle"
          >
            {currentLayout.map((widget) => {
              const WidgetComponent = widgetComponents[widget.type];
              if (
                !WidgetComponent ||
                !widget.id ||
                !widget.layout ||
                typeof widget.layout.x !== "number"
              ) {
                console.warn(
                  "Tentando renderizar widget inválido ou sem layout:",
                  widget
                );
                return null;
              }
              return (
                <div
                  key={widget.id}
                  className="rounded-lg shadow-sm border border-border bg-card overflow-hidden"
                >
                  <Card className="h-full flex flex-col shadow-none border-none">
                    <CardHeader
                      className={`flex flex-row items-center justify-between space-y-0 pb-2 pt-3 px-4 ${
                        isEditingLayout
                          ? "drag-handle cursor-move bg-muted/30 rounded-t-lg"
                          : ""
                      }`}
                    >
                      <CardTitle className="text-sm font-semibold truncate pr-2">
                        {widget.config?.title ||
                          availableWidgets.find((w) => w.type === widget.type)
                            ?.title ||
                          widget.type}
                      </CardTitle>
                      {isEditingLayout && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-foreground"
                            >
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Opções</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {widget.type === "CustomData" ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleOpenConfigureWidgetDialog(widget.id)
                                }
                              >
                                <Settings className="mr-2 h-3.5 w-3.5" />{" "}
                                Configurar Widget
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem disabled>
                                <Settings className="mr-2 h-3.5 w-3.5 opacity-50" />{" "}
                                <span className="opacity-50">Configurar</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => removeWidget(widget.id)}
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                              <Trash2 className="mr-2 h-3.5 w-3.5" /> Remover
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </CardHeader>
                    <CardContent className="flex-grow p-3 pt-1 overflow-auto">
                      <WidgetComponent stats={stats} config={widget.config} />
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </ResponsiveGridLayout>
        )}
      </div>
      {/* Diálogo de Configuração do Widget Customizável */}
      {configuringWidget && (
        <ConfigureCustomWidgetDialog
          open={isConfigureWidgetDialogOpen}
          onOpenChange={setIsConfigureWidgetDialogOpen}
          widget={configuringWidget}
          onSave={handleSaveWidgetConfiguration}
        />
      )}
    </AppLayout>
  );
};

export default AdminDashboard;
