// src/services/sellersApi.ts
import { db } from "@/lib/dbClient";

export interface Seller {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  created_at: string;
  updated_at: string;
  clientsCount?: number;
  ordersCount?: number;
}

export class SellersService {
  /** Lista todos os vendedores */
  static async getSellers(): Promise<Seller[]> {
    const { data: sellers, error } = await db
      .from("users")
      .select("*")
      .eq("role", "seller")
      .order("name", { ascending: true });

    if (error) throw error;

    // Para cada vendedor, buscar quantidade de clientes e pedidos
    const sellersWithStats = await Promise.all(
      (sellers || []).map(async (seller) => {
        // Contar clientes criados por este vendedor
        const { count: clientsCount } = await db
          .from("clients")
          .select("*", { count: "exact", head: true })
          .eq("created_by", seller.id)
          .eq("active", true);

        // Contar pedidos criados por este vendedor
        const { count: ordersCount } = await db
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("created_by", seller.id);

        return {
          ...seller,
          clientsCount: clientsCount || 0,
          ordersCount: ordersCount || 0,
        };
      })
    );

    return sellersWithStats;
  }

  /** Criar novo vendedor */
  static async createSeller(payload: {
    name: string;
    email: string;
    phone?: string;
  }): Promise<Seller> {
    const { data, error } = await db
      .from("users")
      .insert([
        {
          ...payload,
          role: "seller",
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /** Atualizar vendedor */
  static async updateSeller(
    id: string,
    payload: Partial<Pick<Seller, "name" | "email" | "phone">>
  ): Promise<Seller> {
    const { data, error } = await db
      .from("users")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /** Deletar vendedor (soft delete seria melhor) */
  static async deleteSeller(id: string): Promise<void> {
    const { error } = await db.from("users").delete().eq("id", id);
    if (error) throw error;
  }
}