// src/services/serviceTypesApi.ts
import { db } from "@/lib/dbClient";

export interface ServiceCategory {
  id: string;
  name: string;
  prefix?: string;
}

export interface ServiceType {
  id: string;
  name: string;
  description?: string;
  required_documents?: string;
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
  vehicle_category: "carro" | "moto" | "all";
  quantity_required: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceDocument {
  id: string;
  name: string;
  description?: string;
  active: boolean;
}

export interface ServiceRequiredDocument {
  id: string;
  service_type_id: string;
  document_id: string;
  required: boolean;
  document?: ServiceDocument;
}

export interface OrderStatusItem {
  id: string;
  name: string;
  sort_order: number;
  color: string;
  active: boolean;
}

export type ServiceInventoryRuleInput = Omit<ServiceInventoryRule, "id" | "created_at" | "updated_at">;

export class CategoryService {
  static async getCategories(): Promise<ServiceCategory[]> {
    const { data, error } = await db
      .from("service_categories")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    return (data || []) as ServiceCategory[];
  }

  static async createCategory(payload: { name: string; prefix?: string }): Promise<ServiceCategory> {
    const { data, error } = await db
      .from("service_categories")
      .insert([{ name: payload.name, prefix: payload.prefix || null }])
      .select()
      .single();
    if (error) throw error;
    return data as ServiceCategory;
  }

  static async updateCategory(id: string, payload: Partial<ServiceCategory>): Promise<ServiceCategory> {
    const { data, error } = await db
      .from("service_categories")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as ServiceCategory;
  }

  static async deleteCategory(id: string): Promise<void> {
    const { error } = await db.from("service_categories").delete().eq("id", id);
    if (error) throw error;
  }
}

export class OrderStatusService {
  static async getStatuses(): Promise<OrderStatusItem[]> {
    const { data, error } = await db
      .from("order_statuses")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data || []) as OrderStatusItem[];
  }

  static async createStatus(payload: Omit<OrderStatusItem, "id">): Promise<OrderStatusItem> {
    const { data, error } = await db.from("order_statuses").insert([payload]).select().single();
    if (error) throw error;
    return data as OrderStatusItem;
  }

  static async updateStatus(id: string, payload: Partial<OrderStatusItem>): Promise<OrderStatusItem> {
    const { data, error } = await db
      .from("order_statuses")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as OrderStatusItem;
  }

  static async deleteStatus(id: string): Promise<void> {
    const { error } = await db.from("order_statuses").delete().eq("id", id);
    if (error) throw error;
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
    const { data, error } = await db.from("service_types").insert([svc]).select("*").single();
    if (error) throw error;
    return data as ServiceType;
  }

  static async updateServiceType(id: string, updated: Partial<ServiceType>): Promise<ServiceType> {
    const { data, error } = await db
      .from("service_types")
      .update(updated)
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
    let query = db.from("service_inventory_rules").select("*").order("created_at", { ascending: true });
    if (serviceTypeId) query = query.eq("service_type_id", serviceTypeId);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as ServiceInventoryRule[];
  }

  static async saveServiceInventoryRules(
    serviceTypeId: string,
    rules: Omit<ServiceInventoryRuleInput, "service_type_id">[]
  ): Promise<void> {
    const { error: deleteError } = await db
      .from("service_inventory_rules")
      .delete()
      .eq("service_type_id", serviceTypeId);
    if (deleteError) throw deleteError;

    if (!rules.length) return;
    const payload = rules.map((rule) => ({ ...rule, service_type_id: serviceTypeId, active: rule.active ?? true }));
    const { error: insertError } = await db.from("service_inventory_rules").insert(payload as ServiceInventoryRuleInput[]);
    if (insertError) throw insertError;
  }

  static async getDocuments(): Promise<ServiceDocument[]> {
    const { data, error } = await db
      .from("service_documents")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    return (data || []) as ServiceDocument[];
  }

  static async createDocument(payload: { name: string; description?: string; active?: boolean }): Promise<ServiceDocument> {
    const { data, error } = await db
      .from("service_documents")
      .insert([{ name: payload.name, description: payload.description || null, active: payload.active ?? true }])
      .select()
      .single();
    if (error) throw error;
    return data as ServiceDocument;
  }

  static async updateDocument(id: string, payload: Partial<ServiceDocument>): Promise<ServiceDocument> {
    const { data, error } = await db.from("service_documents").update(payload).eq("id", id).select().single();
    if (error) throw error;
    return data as ServiceDocument;
  }

  static async deleteDocument(id: string): Promise<void> {
    const { error } = await db.from("service_documents").delete().eq("id", id);
    if (error) throw error;
  }

  static async getServiceRequiredDocuments(serviceTypeId?: string): Promise<ServiceRequiredDocument[]> {
    let query = db
      .from("service_required_documents")
      .select("*")
      .order("created_at", { ascending: true });
    if (serviceTypeId) query = query.eq("service_type_id", serviceTypeId);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as ServiceRequiredDocument[];
  }

  static async saveServiceRequiredDocuments(
    serviceTypeId: string,
    docs: Array<{ document_id: string; required: boolean }>
  ): Promise<void> {
    const { error: deleteError } = await db
      .from("service_required_documents")
      .delete()
      .eq("service_type_id", serviceTypeId);
    if (deleteError) throw deleteError;

    if (!docs.length) return;

    const payload = docs.map((doc) => ({
      service_type_id: serviceTypeId,
      document_id: doc.document_id,
      required: doc.required,
    }));

    const { error: insertError } = await db.from("service_required_documents").insert(payload);
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
