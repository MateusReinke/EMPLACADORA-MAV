// src/services/sellersApi.ts
import { db } from "@/lib/dbClient";

export interface Seller {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  active?: boolean;
  created_at: string;
  updated_at: string;
  clientsCount?: number;
  ordersCount?: number;
}

/** Senha inicial aleatória: o backend a converte em hash bcrypt na escrita. */
const generateInitialPassword = (): string => {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
};

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
  }): Promise<Seller & { initialPassword: string }> {
    const initialPassword = generateInitialPassword();

    const { data, error } = await db
      .from("users")
      .insert([
        {
          ...payload,
          role: "seller",
          password: initialPassword,
          active: true,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    // Única oportunidade de mostrar a senha: o backend só guarda o hash.
    return { ...data, initialPassword };
  }

  /** Atualizar vendedor */
  static async updateSeller(
    id: string,
    payload: Partial<Pick<Seller, "name" | "email" | "phone" | "active">>
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
    const { error } = await db
      .from("users")
      .update({ active: false })
      .eq("id", id);
    if (error) throw error;
  }

  static async reactivateSeller(id: string): Promise<Seller> {
    const { data, error } = await db
      .from("users")
      .update({ active: true })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
