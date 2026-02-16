// src/services/dashboardLayoutService.ts
import { db } from "@/lib/dbClient";
import { DashboardWidget, DashboardLayout } from "@/types/dashboardWidgets";

export class DashboardLayoutService {
  private static readonly TABLE_NAME = "dashboard_layouts";

  static async saveLayout(
    userId: string,
    layout: DashboardWidget[]
  ): Promise<void> {
    const { data, error } = await db
      .from(this.TABLE_NAME)
      .upsert(
        {
          user_id: userId,
          layout_data: layout,
          last_updated: new Date().toISOString(), // <-- Usar 'last_updated' aqui
        } as DashboardLayout,
        { onConflict: "user_id" }
      )
      .select();

    if (error) {
      console.error("Erro ao salvar layout do dashboard:", error);
      if (error.code && error.details) {
        throw new Error(
          `Não foi possível salvar o layout: ${error.message} (Detalhes: ${error.details})`
        );
      }
      throw new Error(`Não foi possível salvar o layout: ${error.message}`);
    }
    console.log("Layout salvo:", data);
  }

  static async getLayout(userId: string): Promise<DashboardWidget[] | null> {
    const { data, error } = await db
      .from(this.TABLE_NAME)
      .select("layout_data")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 é "no rows found"
      console.error("Erro ao carregar layout do dashboard:", error);
      throw new Error(`Não foi possível carregar o layout: ${error.message}`);
    }

    return data ? (data.layout_data as DashboardWidget[]) : null;
  }
}
