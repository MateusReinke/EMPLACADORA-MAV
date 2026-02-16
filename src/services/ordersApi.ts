
// src/services/ordersApi.ts
import { db } from "@/lib/dbClient";
import { Order as OrderUI } from "@/types";

/* ------------------------------------------------- *
 *                    SCHEMA TYPES                   *
 * ------------------------------------------------- */
export interface OrderRaw {
  id: string;
  service_type_id: string;
  client_id: string;
  vehicle_id: string;
  message?: string | null; // ← coluna real no banco
  estimated_delivery_date?: string | null;
  status_id: string;
  value: number;
  created_by: string;
  created_at: string;
  updated_at: string;

  /* joins */
  client?: any;
  serviceType?: any;
  vehicle?: any;
  status?: any;
  order_number?: string | null;
}

export type NewOrder = Omit<OrderRaw, "id" | "created_at" | "updated_at">;

export interface UpdateOrderPayload {
  status_id?: string;
  message?: string | null; // ← mesmo nome da coluna
  attachment_url?: string | null; // se usar uploads futuramente
}

/* ------------------------------------------------- *
 *                 NORMALIZAÇÃO                      *
 * ------------------------------------------------- */
function normalize(o: OrderRaw): OrderUI {
  return {
    id: o.id,
    order_number: o.order_number ?? "",
    client: o.client ? { 
      id: o.client.id, 
      name: o.client.name,
      document: o.client.document || '',
      type: o.client.type || 'physical',
      created_by: o.client.created_by || ''
    } : undefined,
    serviceType: o.serviceType ? { 
      id: o.serviceType.id, 
      name: o.serviceType.name,
      category_id: o.serviceType.category_id || ''
    } : undefined,
    vehicle: o.vehicle ? { 
      id: o.vehicle.id, 
      license_plate: o.vehicle.license_plate,
      brand: o.vehicle.brand || '',
      model: o.vehicle.model || '',
      year: o.vehicle.year || '',
      client_id: o.vehicle.client_id || '',
      plate_type_id: o.vehicle.plate_type_id || '',
      category: o.vehicle.category || 'carros'
    } : undefined,
    status: o.status ? { 
      id: o.status.id, 
      name: o.status.name, 
      color: o.status.color || '',
      sort_order: o.status.sort_order || 0
    } : undefined,
    status_id: o.status_id,
    value: o.value,
    created_at: o.created_at,
    client_id: o.client_id,
    service_type_id: o.service_type_id,
    vehicle_id: o.vehicle_id,
    created_by: o.created_by,
    /* o frontend continua chamando de notes  */
    notes: o.message ?? "",
    /* Adicionar aliases para compatibilidade */
    statusId: o.status_id,
    createdAt: o.created_at,
    licensePlate: o.vehicle?.license_plate,
  };
}

const stripUndefined = <T extends object>(obj: T) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;

/* ------------------------------------------------- *
 *                    SERVICE                        *
 * ------------------------------------------------- */
export class OrdersService {
  /* ---------- CREATE ---------- */
  static async createOrder(payload: NewOrder): Promise<OrderUI> {
    const { data, error } = await db
      .from("orders")
      .insert([payload])
      .select(
        "*, client:clients(*), serviceType:service_types(*), vehicle:vehicles(*), status:order_statuses(*), order_number"
      )
      .single();
    if (error) throw error;
    return normalize(data);
  }

  /* ---------- READ ---------- */
  static async getOrders(userId?: string, role?: string): Promise<OrderUI[]> {
    let q = db
      .from("orders")
      .select(
        "*, client:clients(*), serviceType:service_types(*), vehicle:vehicles(*), status:order_statuses(*), order_number"
      );

    if (role !== "admin") q.eq("created_by", userId);

    const { data, error } = await q;
    if (error) throw error;
    return (data as OrderRaw[]).map(normalize);
  }

  /* ---------- UPDATE ---------- */
  static async updateOrder(
    orderId: string,
    payload: UpdateOrderPayload
  ): Promise<OrderUI> {
    const { data, error } = await db
      .from("orders")
      .update(stripUndefined(payload)) // nunca envia undefined
      .eq("id", orderId)
      .select(
        "*, client:clients(*), serviceType:service_types(*), vehicle:vehicles(*), status:order_statuses(*), order_number"
      )
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("Pedido não encontrado.");
    return normalize(data);
  }

  /* ---------- DELETE ---------- */
  static async deleteOrder(orderId: string) {
    const { error } = await db.from("orders").delete().eq("id", orderId);
    if (error) throw error;
  }

  /* ---------- STATUS LIST ---------- */
  static async getOrderStatuses() {
    const { data, error } = await db
      .from("order_statuses")
      .select("id, name, color, sort_order, active");
    if (error) throw error;
    return data ?? [];
  }
}
