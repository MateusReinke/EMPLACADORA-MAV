import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClientsService } from "@/services/clientsApi";
import { Client } from "@/types";
import NewVehicleForm from "@/components/forms/NewVehicleForm";
import VehicleTable from "@/components/vehicles/VehicleTable";
import VehicleSearch from "@/components/vehicles/VehicleSearch";
import { db } from "@/lib/dbClient";

interface Vehicle {
  id: string;
  model: string;
  brand: string;
  licensePlate: string;
  year: string;
  renavam: string;
  chassis?: string;
  clientId: string;
  client?: {
    id: string;
    name: string;
  };
}

const mapVehicle = (row: any, clients: Client[]): Vehicle => ({
  id: row.id,
  model: row.model || "",
  brand: row.brand || "",
  licensePlate: row.license_plate || "",
  year: row.year || "",
  renavam: row.renavam || "",
  clientId: row.client_id || "",
  client: clients.find((c) => c.id === row.client_id)
    ? { id: row.client_id, name: clients.find((c) => c.id === row.client_id)!.name }
    : undefined,
});

const VehicleManager: React.FC = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [clientFilter, setClientFilter] = useState("all");
  const [newVehicleClientId, setNewVehicleClientId] = useState<string | undefined>(undefined);

  const fetchData = async () => {
    setLoading(true);
    try {
      const fetchedClients = await ClientsService.getClients();
      setClients(fetchedClients);

      const { data, error } = await db
        .from("vehicles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVehicles((data || []).map((row: any) => mapVehicle(row, fetchedClients)));
    } catch (error) {
      console.error("Erro ao carregar veículos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar veículos/clientes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddEditVehicle = async (vehicle?: any | null) => {
    if (!vehicle) {
      setIsDialogOpen(false);
      await fetchData();
      return;
    }

    await fetchData();
    toast({
      title: isEditMode ? "Veículo atualizado" : "Veículo adicionado",
      description: "Operação realizada com sucesso.",
    });
    setIsDialogOpen(false);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setCurrentVehicle(vehicle);
    setNewVehicleClientId(vehicle.clientId);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleDeleteVehicle = async (id: string) => {
    try {
      const { error } = await db.from("vehicles").delete().eq("id", id);
      if (error) throw error;
      setVehicles((prev) => prev.filter((vehicle) => vehicle.id !== id));
      toast({ title: "Veículo removido", description: "Veículo removido com sucesso." });
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", description: "Não foi possível remover o veículo.", variant: "destructive" });
    }
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      vehicle.model.toLowerCase().includes(query) ||
      vehicle.brand.toLowerCase().includes(query) ||
      vehicle.licensePlate.toLowerCase().includes(query) ||
      vehicle.year.toLowerCase().includes(query) ||
      vehicle.client?.name.toLowerCase().includes(query);

    if (clientFilter !== "all") {
      return matchesSearch && vehicle.clientId === clientFilter;
    }

    return matchesSearch;
  });

  const handleNewVehicle = () => {
    if (clientFilter === "all") {
      toast({
        title: "Selecione um cliente",
        description: "Para cadastrar um veículo no admin, selecione um cliente no filtro.",
        variant: "destructive",
      });
      return;
    }

    setCurrentVehicle(null);
    setNewVehicleClientId(clientFilter);
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Gerenciar Veículos</h1>
        <Button className="flex gap-2" onClick={handleNewVehicle}>
          <PlusCircle className="h-4 w-4" />
          <span>Adicionar Veículo</span>
        </Button>
      </div>

      <VehicleSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        clients={clients}
        onClientFilterChange={setClientFilter}
      />

      <VehicleTable
        vehicles={filteredVehicles}
        loading={loading}
        onEdit={handleEditVehicle}
        onDelete={handleDeleteVehicle}
        searchQuery={searchQuery}
        clientFilter={clientFilter}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Editar Veículo" : "Adicionar Novo Veículo"}</DialogTitle>
          </DialogHeader>
          <NewVehicleForm
            onSuccess={handleAddEditVehicle}
            initialData={currentVehicle as any}
            clientId={newVehicleClientId}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VehicleManager;
