// src/services/dashboardApi.ts
import { db } from "@/lib/dbClient";
import { DashboardStats, InventoryItem } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export class DashboardService {
  static async getAdminDashboardStats(): Promise<DashboardStats> {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // Mês atual (1-12)
    const currentYear = today.getFullYear();
    const startOfMonth = new Date(
      currentYear,
      currentMonth - 1,
      1
    ).toISOString();
    const endOfMonth = new Date(
      currentYear,
      currentMonth,
      0,
      23,
      59,
      59,
      999
    ).toISOString();

    // 1. Total de pedidos
    const { count: totalOrdersCount, error: ordersCountError } = await db
      .from("orders")
      .select("*", { count: "exact" });
    if (ordersCountError)
      console.error("Erro ao buscar total de pedidos:", ordersCountError);

    // 2. Faturamento do mês
    const { data: monthlyOrders, error: monthlyOrdersError } = await db
      .from("orders")
      .select("value")
      .gte("created_at", startOfMonth)
      .lte("created_at", endOfMonth);
    const monthlyRevenue =
      monthlyOrders?.reduce((sum, order) => sum + (order.value || 0), 0) || 0;
    if (monthlyOrdersError)
      console.error("Erro ao buscar faturamento mensal:", monthlyOrdersError);

    // 3. Total de clientes
    const { count: totalClientsCount, error: clientsCountError } =
      await db.from("clients").select("*", { count: "exact" });
    if (clientsCountError)
      console.error("Erro ao buscar total de clientes:", clientsCountError);

    // 4. Total de vendedores
    const { count: totalSellersCount, error: sellersCountError } =
      await db
        .from("users")
        .select("*", { count: "exact" })
        .eq("role", "seller");
    if (sellersCountError)
      console.error("Erro ao buscar total de vendedores:", sellersCountError);

    // 5. Pedidos por status
    const { data: ordersByStatusData, error: ordersByStatusError } =
      await db.from("orders").select(`
        status_id,
        status:order_statuses (name, color)
      `);
    const ordersByStatusMap = new Map<
      string,
      { status_name: string; count: number; color?: string }
    >();
    ordersByStatusData?.forEach((order) => {
      const statusName = order.status?.[0]?.name || "Desconhecido";
      const color = order.status?.[0]?.color;
      if (!ordersByStatusMap.has(statusName)) {
        ordersByStatusMap.set(statusName, {
          status_name: statusName,
          count: 0,
          color,
        });
      }
      ordersByStatusMap.get(statusName)!.count++;
    });
    const ordersByStatus = Array.from(ordersByStatusMap.values());
    if (ordersByStatusError)
      console.error("Erro ao buscar pedidos por status:", ordersByStatusError);

    // 6. Pedidos por tipo de serviço
    const { data: ordersByServiceTypeData, error: ordersByServiceTypeError } =
      await db.from("orders").select(`
        service_type_id,
        serviceType:service_types (name)
      `);
    const ordersByServiceTypeMap = new Map<
      string,
      { service_name: string; count: number }
    >();
    ordersByServiceTypeData?.forEach((order) => {
      const serviceName = order.serviceType?.[0]?.name || "Desconhecido";
      if (!ordersByServiceTypeMap.has(serviceName)) {
        ordersByServiceTypeMap.set(serviceName, {
          service_name: serviceName,
          count: 0,
        });
      }
      ordersByServiceTypeMap.get(serviceName)!.count++;
    });
    const ordersByServiceType = Array.from(ordersByServiceTypeMap.values());
    if (ordersByServiceTypeError)
      console.error(
        "Erro ao buscar pedidos por tipo de serviço:",
        ordersByServiceTypeError
      );

    // 7. Pedidos e Faturamento por mês (últimos 6 meses)
    const ordersByMonth: { month: string; count: number; revenue: number }[] =
      [];
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(today.getMonth() - i);
      const monthName = format(date, "MMM", { locale: ptBR });
      const monthStart = new Date(
        date.getFullYear(),
        date.getMonth(),
        1
      ).toISOString();
      const monthEnd = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      ).toISOString();

      const { data: monthOrdersData, error: monthOrdersError } = await db
        .from("orders")
        .select("value")
        .gte("created_at", monthStart)
        .lte("created_at", monthEnd);

      const count = monthOrdersData?.length || 0;
      const revenue =
        monthOrdersData?.reduce((sum, order) => sum + (order.value || 0), 0) ||
        0;

      if (monthOrdersError)
        console.error(
          `Erro ao buscar dados do mês ${monthName}:`,
          monthOrdersError
        );

      ordersByMonth.unshift({ month: monthName, count, revenue });
    }

    // 8. Itens em estoque baixo/crítico
    const { data: inventoryItemsData, error: inventoryItemsError } =
      await db
        .from("inventory_status") // Usando a VIEW aqui
        .select("*");

    const lowStockItems: InventoryItem[] = (inventoryItemsData || []).filter(
      (item) => {
        return item.status === "low" || item.status === "critical";
      }
    ) as InventoryItem[];
    if (inventoryItemsError)
      console.error("Erro ao buscar itens de estoque:", inventoryItemsError);

    // 9. Atividades Recentes (combina orders, clients e inventory_movements)
    const { data: recentOrdersData, error: recentOrdersError } = await db
      .from("orders")
      .select(
        `
            id,
            created_at,
            order_number,
            value,
            client:clients (name),
            serviceType:service_types (name),
            vehicle:vehicles (license_plate)
        `
      )
      .order("created_at", { ascending: false })
      .limit(5);

    const { data: recentClientsData, error: recentClientsError } =
      await db
        .from("clients")
        .select(
          `
            id,
            created_at,
            name,
            type
        `
        )
        .order("created_at", { ascending: false })
        .limit(5);

    const { data: recentMovementsData, error: recentMovementsError } =
      await db
        .from("inventory_movements")
        .select(
          `
            id,
            created_at,
            movement_type,
            quantity,
            item:inventory_items (name),
            responsible:users (name)
        `
        )
        .order("created_at", { ascending: false })
        .limit(5);

    const recentActivities: DashboardStats["recentActivities"] = [];

    recentOrdersData?.forEach((order) => {
      recentActivities.push({
        id: order.id,
        description: `Pedido ${
          order.serviceType?.[0]?.name || "desconhecido"
        } para ${order.vehicle?.[0]?.license_plate || "veículo desconhecido"} (R$ ${(
          order.value || 0
        ).toFixed(2)})`,
        user_name: order.client?.[0]?.name || "Cliente Desconhecido",
        timestamp: order.created_at || new Date().toISOString(),
        type: "order",
      });
    });

    recentClientsData?.forEach((client) => {
      recentActivities.push({
        id: client.id,
        description: `Novo cliente ${client.name} (${
          client.type === "physical" ? "Pessoa Física" : "Pessoa Jurídica"
        })`,
        user_name: client.name,
        timestamp: client.created_at || new Date().toISOString(),
        type: "client",
      });
    });

    recentMovementsData?.forEach((movement) => {
      const item = movement.item?.[0]?.name || "Item Desconhecido";
      const responsible =
        movement.responsible?.[0]?.name || "Responsável Desconhecido";
      const type = movement.movement_type === "in" ? "Entrada" : "Saída";
      recentActivities.push({
        id: movement.id,
        description: `${type} de ${movement.quantity} un. de ${item}`,
        user_name: responsible,
        timestamp: movement.created_at || new Date().toISOString(),
        type: "inventory_movement",
      });
    });

    recentActivities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    if (recentOrdersError)
      console.error("Erro ao buscar pedidos recentes:", recentOrdersError);
    if (recentClientsError)
      console.error("Erro ao buscar clientes recentes:", recentClientsError);
    if (recentMovementsError)
      console.error(
        "Erro ao buscar movimentos de estoque recentes:",
        recentMovementsError
      );

    return {
      totalOrders: totalOrdersCount || 0,
      monthlyRevenue: monthlyRevenue,
      totalClients: totalClientsCount || 0,
      totalSellers: totalSellersCount || 0,
      ordersByStatus: ordersByStatus,
      ordersByServiceType: ordersByServiceType,
      ordersByMonth: ordersByMonth,
      lowStockItems: lowStockItems,
      recentActivities: recentActivities.slice(0, 5),
    };
  }
}
