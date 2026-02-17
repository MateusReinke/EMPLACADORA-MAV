// src/services/serviceTypesApi.ts
import { db } from "@/lib/dbClient";

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
  category_id: string;
  category?: ServiceCategory;
  created_at?: string;
  updated_at?: string;
}

export interface InventoryItemOption {
  id: string;
  name: string;
  quantity: number;
  category: string;
}

export interface ServiceInventoryRule {
  id: string;
  service_type_id: string;
  inventory_item_id: string;
  vehicle_category: 'carro' | 'moto' | 'all';
  quantity_required: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type ServiceInventoryRuleInput = Omit<
  ServiceInventoryRule,
  'id' | 'created_at' | 'updated_at'
>;

export class CategoryService {
  static async getCategories(): Promise<ServiceCategory[]> {
    const { data, error } = await db
      .from("service_categories")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    return (data || []) as ServiceCategory[];
  }

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

export class ApiService {
  static async getServiceTypes(): Promise<ServiceType[]> {
    const { data, error } = await db
      .from("service_types")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []) as ServiceType[];
  }

  static async createServiceType(
    svc: Omit<ServiceType, "id" | "created_at" | "updated_at" | "category">
  ): Promise<ServiceType> {
    const { data, error } = await db
      .from("service_types")
      .insert([svc])
      .select("*")
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
      .select("*")
      .single();
    if (error) throw error;
    return data as ServiceType;
  }

  static async deleteServiceType(id: string): Promise<void> {
    const { error } = await db.from("service_types").delete().eq("id", id);
    if (error) throw error;
  }

  static async getInventoryItems(): Promise<InventoryItemOption[]> {
    const { data, error } = await db
      .from("inventory_items")
      .select("id, name, quantity, category")
      .order("name", { ascending: true });
    if (error) throw error;
    return (data || []) as InventoryItemOption[];
  }

  static async getServiceInventoryRules(serviceTypeId?: string): Promise<ServiceInventoryRule[]> {
    let query = db
      .from("service_inventory_rules")
      .select("*")
      .order("created_at", { ascending: true });

    if (serviceTypeId) {
      query = query.eq("service_type_id", serviceTypeId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as ServiceInventoryRule[];
  }

  static async saveServiceInventoryRules(
    serviceTypeId: string,
    rules: Omit<ServiceInventoryRuleInput, 'service_type_id'>[]
  ): Promise<void> {
    const { error: deleteError } = await db
      .from("service_inventory_rules")
      .delete()
      .eq("service_type_id", serviceTypeId);

    if (deleteError) throw deleteError;

    if (!rules.length) return;

    const payload = rules.map((rule) => ({
      ...rule,
      service_type_id: serviceTypeId,
      active: rule.active ?? true,
    }));

    const { error: insertError } = await db
      .from("service_inventory_rules")
      .insert(payload as ServiceInventoryRuleInput[]);

    if (insertError) throw insertError;
  }

  static async getDashboardStats(_userId?: string, _role?: string): Promise<unknown> {
    const { DashboardService } = await import("./dashboardApi");
    return DashboardService.getAdminDashboardStats();
  }

  static async getOrders(userId?: string, role?: string): Promise<unknown[]> {
    const { OrdersService } = await import("./ordersApi");
    return OrdersService.getOrders(userId, role);
  }

  static async getOrderStatuses(): Promise<unknown[]> {
    const { OrderStatusesService } = await import("./orderStatusesApi");
    return OrderStatusesService.getOrderStatuses();
  }

  static async updateOrder(orderId: string, payload: Record<string, unknown>): Promise<unknown> {
    const { OrdersService } = await import("./ordersApi");
    const mappedPayload = { ...payload };
    if (mappedPayload.statusId) {
      mappedPayload.status_id = mappedPayload.statusId;
      delete mappedPayload.statusId;
    }
    return OrdersService.updateOrder(orderId, mappedPayload);
  }

  static async getClients(): Promise<unknown[]> {
    const { ClientsService } = await import("./clientsApi");
    return ClientsService.getClients();
  }
}
