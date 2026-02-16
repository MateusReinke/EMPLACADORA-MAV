// src/services/serviceTypesApi.ts
import { db } from "@/lib/dbClient";

/* --------- MODELAGEM (agora com categoria) --------- */
export interface ServiceCategory {
  id: string;
  name: string;
}

export interface ServiceType {
  id: string;
  name: string;
  description?: string;
  price: number;
  active: boolean;
  category_id: string; //  <- FK
  category?: ServiceCategory; //  <- via join
  created_at?: string;
  updated_at?: string;
}

/* --------- CATEGORIAS --------- */
export class CategoryService {
  static async getCategories(): Promise<ServiceCategory[]> {
    const { data, error } = await db
      .from("service_categories")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    return data as ServiceCategory[];
  }

  /* opcional – permitir criar categoria direto pelo front */
  static async createCategory(name: string): Promise<ServiceCategory> {
    const { data, error } = await db
      .from("service_categories")
      .insert([{ name }])
      .select()
      .single();
    if (error) throw error;
    return data as ServiceCategory;
  }
}

/* --------- SERVIÇOS --------- */
export class ApiService {
  // ========= SERVICE TYPES =========
  static async getServiceTypes(): Promise<ServiceType[]> {
    const { data, error } = await db
      .from("service_types")
      .select(`*, category:service_categories ( id, name )`)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as ServiceType[];
  }

  static async createServiceType(
    svc: Omit<ServiceType, "id" | "created_at" | "updated_at" | "category">
  ): Promise<ServiceType> {
    const { data, error } = await db
      .from("service_types")
      .insert([svc])
      .select(`*, category:service_categories ( id, name )`)
      .single();
    if (error) throw error;
    return data as ServiceType;
  }

  static async updateServiceType(
    id: string,
    updated: Partial<ServiceType>
  ): Promise<ServiceType> {
    const { data, error } = await db
      .from("service_types")
      .update({ ...updated, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select(`*, category:service_categories ( id, name )`)
      .single();
    if (error) throw error;
    return data as ServiceType;
  }

  static async deleteServiceType(id: string): Promise<void> {
    const { error } = await db
      .from("service_types")
      .delete()
      .eq("id", id);
    if (error) throw error;
  }

  // ========= DASHBOARD =========
  static async getDashboardStats(userId?: string, role?: string): Promise<any> {
    // Import e use o DashboardService
    const { DashboardService } = await import("./dashboardApi");
    return DashboardService.getAdminDashboardStats();
  }

  // ========= ORDERS =========
  static async getOrders(userId?: string, role?: string): Promise<any[]> {
    const { OrdersService } = await import("./ordersApi");
    return OrdersService.getOrders(userId, role);
  }

  static async getOrderStatuses(): Promise<any[]> {
    const { OrderStatusesService } = await import("./orderStatusesApi");
    return OrderStatusesService.getOrderStatuses();
  }

  static async updateOrder(orderId: string, payload: any): Promise<any> {
    const { OrdersService } = await import("./ordersApi");
    // Mapear statusId para status_id se necessário
    const mappedPayload = { ...payload };
    if (payload.statusId) {
      mappedPayload.status_id = payload.statusId;
      delete mappedPayload.statusId;
    }
    return OrdersService.updateOrder(orderId, mappedPayload);
  }

  // ========= CLIENTS =========
  static async getClients(userId?: string, role?: string): Promise<any[]> {
    const { ClientsService } = await import("./clientsApi");
    return ClientsService.getClients();
  }
}
