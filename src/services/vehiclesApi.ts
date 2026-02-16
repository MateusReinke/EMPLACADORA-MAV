// src/services/vehiclesApi.ts
import { db } from "@/lib/dbClient";

export interface Vehicle {
  id: string;
  client_id: string;
  brand: string;
  model: string;
  year?: string;
  license_plate: string;
  color?: string;
  // remova qualquer referência a `active` ou `created_at`
}

export type NewVehicle = Omit<Vehicle, "id">;

export class VehicleService {
  /** Busca todos os veículos de um cliente */
  static async getClientVehicles(clientId: string): Promise<Vehicle[]> {
    const { data, error } = await db
      .from("vehicles")
      .select("*")
      .eq("client_id", clientId);
    if (error) throw error;
    return data;
  }

  /** Cria um novo veículo */
  static async createVehicle(payload: NewVehicle): Promise<Vehicle> {
    const { data, error } = await db
      .from("vehicles")
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
