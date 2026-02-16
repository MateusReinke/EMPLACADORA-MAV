// src/services/orderStatusesApi.ts
import { db } from "@/lib/dbClient";

export interface OrderStatus {
  id: string;
  name: string;
  active: boolean;
  color: string;
  sort_order: number;
}

export class OrderStatusesService {
  /** Retorna todos os status ativos ordenados por sort_order */
  static async getOrderStatuses(): Promise<OrderStatus[]> {
    const { data, error } = await db
      .from("order_statuses")
      .select("id, name, active, color, sort_order")
      .eq("active", true)
      .order("sort_order", { ascending: true, nullsFirst: false });
    if (error) throw error;
    return data || [];
  }
}