
// src/services/clientsApi.ts
import { db } from "@/lib/dbClient";
import { Client as ClientType } from "@/types";

export interface Client {
  id: string;
  name: string;
  document: string;
  phone?: string;
  email?: string;
  address?: string;
  type: "physical" | "juridical";
  active?: boolean;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

export type NewClient = Omit<
  Client,
  "id" | "active" | "created_at" | "updated_at"
>;

export class ClientsService {
  /** Lista todos os clientes ativos */
  static async getClients(includeInactive = false): Promise<ClientType[]> {
    let query = db
      .from("clients")
      .select("*")
      .order("name", { ascending: true });

    if (!includeInactive) {
      query = query.eq("active", true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  /** Cria um novo cliente */
  static async createClient(payload: NewClient): Promise<ClientType> {
    const { data, error } = await db
      .from("clients")
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async updateClient(
    id: string,
    payload: Partial<Omit<Client, "id" | "created_at" | "updated_at">>
  ): Promise<ClientType> {
    const { data, error } = await db
      .from("clients")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async deactivateClient(id: string): Promise<void> {
    const { error } = await db
      .from("clients")
      .update({ active: false })
      .eq("id", id);
    if (error) throw error;
  }

  static async reactivateClient(id: string): Promise<ClientType> {
    const { data, error } = await db
      .from("clients")
      .update({ active: true })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
