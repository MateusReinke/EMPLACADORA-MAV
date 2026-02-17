
// src/types/index.ts
export type UserRole = "admin" | "seller" | "physical" | "juridical";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  document?: string | null;
  phone?: string | null;
  photo_url?: string | null;
  photo?: string | null; // Adding this for compatibility
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Client {
  id: string;
  name: string;
  document: string;
  type: "physical" | "juridical";
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  created_by: string; // FK to users.id
  active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  user_id?: string | null; // FK to auth.users.id (nullable from your schema)
  creator?: User; // Join
}

export interface ServiceCategory {
  id: string;
  name: string;
  created_at?: string | null;
  prefix?: string | null; // From your schema
}

export interface ServiceType {
  id: string;
  name: string;
  description?: string | null;
  required_documents?: string | null;
  active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null; // Assumindo que você tem trigger para ela
  price?: number | null; // Nullable from your schema
  category_id: string; // FK to service_categories.id
  category?: ServiceCategory; // Join
}

export interface OrderStatus {
  id: string;
  name: string;
  sort_order: number;
  color: string;
  active?: boolean | null;
  created_at?: string | null;
}

export interface PlateType {
  // From your schema
  id: string;
  code: string;
  label: string;
  color?: string | null;
}

export interface Vehicle {
  id: string;
  license_plate: string;
  brand: string;
  model: string;
  year: string;
  color?: string | null;
  client_id: string; // FK to clients.id
  plate_type_id: string; // FK to plate_types.id
  created_at?: string | null;
  updated_at?: string | null; // Assumindo que você tem trigger para ela
  renavam?: string | null;
  category: string; // From your schema, e.g., 'carros', 'motos'
  client?: Client; // Join
  plateType?: PlateType; // Join
}

export interface Order {
  id: string;
  client_id: string; // FK to clients.id
  created_by?: string | null; // FK to users.id (nullable)
  service_type_id: string; // FK to service_types.id
  status_id?: string | null; // FK to order_statuses.id (nullable)
  order_number?: string | null; // From your schema
  value?: number | null; // Nullable
  vehicle_id: string; // FK to vehicles.id
  message?: string | null;
  cancel_reason?: string | null;
  created_at?: string | null;
  updated_at?: string | null; // Assumindo que você tem trigger para ela
  estimated_delivery_date?: string | null;
  notes?: string | null;

  // Additional properties for compatibility
  statusId?: string; // Alias for status_id
  createdAt?: string; // Alias for created_at
  licensePlate?: string; // From vehicle join

  client?: Client; // Join
  seller?: User; // Join
  serviceType?: ServiceType; // Join
  status?: OrderStatus; // Join
  vehicle?: Vehicle; // Join
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  min_quantity: number;
  cost_price: number;
  category: string;
  created_at?: string | null;
  updated_at?: string | null; // Assumindo que você tem trigger para ela
  status?: "adequate" | "low" | "critical"; // From inventory_status VIEW
}

export interface InventoryMovement {
  id: string;
  inventory_item_id: string; // FK to inventory_items.id
  movement_type: "in" | "out";
  quantity: number;
  responsible_id: string; // FK to users.id
  order_id?: string | null; // FK to orders.id
  notes?: string | null;
  created_at?: string | null;
  item?: InventoryItem; // Join
  responsible?: User; // Join
  order?: Order; // Join
}

// Interfaces para os dados do Dashboard
export interface DashboardStats {
  totalOrders: number;
  monthlyRevenue: number;
  totalClients: number;
  totalSellers: number;
  ordersByStatus: { status_name: string; count: number; color?: string }[];
  ordersByServiceType: { service_name: string; count: number }[];
  ordersByMonth: { month: string; count: number; revenue: number }[];
  lowStockItems: InventoryItem[];
  recentActivities: {
    id: string;
    description: string;
    user_name: string;
    timestamp: string;
    type: "order" | "client" | "inventory_movement";
  }[];
}
