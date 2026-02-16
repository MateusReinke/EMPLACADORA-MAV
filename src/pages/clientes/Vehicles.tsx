import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Search, PlusCircle, Eye, Pencil, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import NewVehicleForm from "@/components/forms/NewVehicleForm";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/dbClient";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Vehicle {
  id: string;
  license_plate: string;
  brand: string;
  model: string;
  year: string;
  category: "carros" | "motos" | "caminhoes";
  color?: string;
  renavam?: string;
}

type VehicleCategory = "all" | "carros" | "motos" | "caminhoes";

const ClientVehicles = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory>("all");
  const [clientId, setClientId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchClientAndVehicles = async () => {
      try {
        // First, find the client
        const { data: client, error: clientError } = await db
          .from("clients")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (clientError || !client) {
          toast.error("Erro", {
            description: "Não foi possível encontrar seu perfil de cliente.",
          });
          return;
        }

        setClientId(client.id);

        // Then fetch vehicles
        await fetchVehicles(client.id);
      } catch (error) {
        console.error("Error fetching client vehicles:", error);
        toast.error("Erro", {
          description: "Erro ao carregar veículos.",
        });
      }
    };

    fetchClientAndVehicles();
  }, [user]);

  const fetchVehicles = async (clientId: string) => {
    try {
      const { data: vehicles, error } = await db
        .from("vehicles")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (vehicles) setVehicles(vehicles);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      toast.error("Erro ao carregar veículos");
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    try {
      const { error } = await db
        .from("vehicles")
        .delete()
        .eq("id", vehicleId);

      if (error) throw error;

      setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
      toast.success("Veículo removido com sucesso");
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      toast.error("Erro ao remover veículo");
    }
  };

  const onVehicleAdded = (newVehicle: Vehicle) => {
    setVehicles((prev) => [newVehicle, ...prev]);
    setIsDialogOpen(false);
    toast.success("Veículo adicionado com sucesso");
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.license_plate.toLowerCase().includes(search.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(search.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = 
      selectedCategory === "all" || vehicle.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "carros":
        return "bg-blue-100 text-blue-800";
      case "motos":
        return "bg-green-100 text-green-800";
      case "caminhoes":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "carros":
        return "Carro";
      case "motos":
        return "Moto";
      case "caminhoes":
        return "Caminhão";
      default:
        return "Outros";
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Meus Veículos</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="w-4 h-4 mr-2" /> Novo Veículo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Veículo</DialogTitle>
              </DialogHeader>
              {clientId && (
                <NewVehicleForm
                  clientId={clientId}
                  onSuccess={onVehicleAdded}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por placa, marca ou modelo"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select
            value={selectedCategory}
            onValueChange={(value: VehicleCategory) => setSelectedCategory(value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os veículos</SelectItem>
              <SelectItem value="carros">Carros</SelectItem>
              <SelectItem value="motos">Motos</SelectItem>
              <SelectItem value="caminhoes">Caminhões</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Placa
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Marca
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Modelo
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Ano
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Cor
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    {vehicles.length === 0 
                      ? "Nenhum veículo cadastrado. Clique em 'Novo Veículo' para começar."
                      : "Nenhum veículo encontrado com os filtros aplicados."
                    }
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-muted/50">
                    <td className="px-4 py-2 font-medium">
                      {vehicle.license_plate}
                    </td>
                    <td className="px-4 py-2">{vehicle.brand}</td>
                    <td className="px-4 py-2">{vehicle.model}</td>
                    <td className="px-4 py-2">{vehicle.year}</td>
                    <td className="px-4 py-2">
                      <Badge
                        variant="secondary"
                        className={getCategoryBadgeColor(vehicle.category)}
                      >
                        {getCategoryLabel(vehicle.category)}
                      </Badge>
                    </td>
                    <td className="px-4 py-2">{vehicle.color || "-"}</td>
                    <td className="px-4 py-2">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => handleDeleteVehicle(vehicle.id)}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredVehicles.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredVehicles.length} de {vehicles.length} veículos
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ClientVehicles;