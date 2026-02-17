// src/pages/admin/Orders.tsx
import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getErrorMessage } from "@/lib/utils";

import { OrdersService } from "@/services/ordersApi";
import { OrderStatus, OrderStatusesService } from "@/services/orderStatusesApi";
import { Order, Client, ServiceType } from "@/types"; // Adicionado Client e ServiceType

// Importando do barrel file para componentes de Orders
import { OrdersHeader, OrdersList, OrdersKanban } from "@/components/Orders";
// Importando diretamente o ConfirmDeleteModal
import ConfirmDeleteModal from "@/components/Modals/ConfirmDeleteModal"; // Verifique se este arquivo existe em src/components/Modals/

/* -------------------------------------------------------------------------- */

const OrdersPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  /* ---------- STATE ------------------------------------------------------- */
  const [orders, setOrders] = useState<Order[]>([]);
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false); // Para o modal de novo pedido no Header

  const [organizationMode, setOrganizationMode] = useState<"list" | "kanban">(
    "kanban"
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [clientFilter, setClientFilter] = useState("all"); // ID do cliente ou "all"
  const [serviceFilter, setServiceFilter] = useState("all"); // ID do serviço ou "all"

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    orderId?: string;
  }>({ open: false });
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* ---------- LOAD DATA --------------------------------------------------- */
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [fetchedOrders, fetchedStatuses] = await Promise.all([
          OrdersService.getOrders(user?.id, user?.role),
          OrderStatusesService.getOrderStatuses(),
        ]);

        setOrders(fetchedOrders);
        setStatuses(
          fetchedStatuses.sort((a, b) => {
            const sortA = a.sort_order ?? Infinity;
            const sortB = b.sort_order ?? Infinity;

            if (sortA !== Infinity && sortB !== Infinity) {
              return sortA - sortB;
            }
            if (sortA !== Infinity) return -1;
            if (sortB !== Infinity) return 1;
            return a.name.localeCompare(b.name);
          })
        );
      } catch (err: unknown) {
        toast({
          title: "Erro ao carregar dados",
          description: getErrorMessage(err, "Não foi possível carregar os pedidos e status."),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [toast, user?.id, user?.role]);

  /* ---------- MEMO LISTS (para filtros no Header) ----------------------- */
  const uniqueClients = useMemo(() => {
    const clientMap = new Map<string, string>();
    orders.forEach((order) => {
      if (order.client?.id && order.client?.name) {
        clientMap.set(order.client.id, order.client.name);
      }
    });
    return Array.from(clientMap.entries()).map(
      ([id, name]) => ({ id, name } as Pick<Client, "id" | "name">)
    );
  }, [orders]);

  const uniqueServices = useMemo(() => {
    const serviceMap = new Map<string, string>();
    orders.forEach((order) => {
      if (order.serviceType?.id && order.serviceType?.name) {
        serviceMap.set(order.serviceType.id, order.serviceType.name);
      }
    });
    return Array.from(serviceMap.entries()).map(
      ([id, name]) => ({ id, name } as Pick<ServiceType, "id" | "name">)
    );
  }, [orders]);

  /* ---------- FILTERED ORDERS -------------------------------------------- */
  const filteredOrders = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return orders.filter((o) => {
      const clientName = o.client?.name?.toLowerCase() || "";
      const serviceTypeName = o.serviceType?.name?.toLowerCase() || "";
      const vehiclePlate = o.vehicle?.license_plate?.toLowerCase() || "";

      const okSearch =
        !q ||
        (o.order_number && o.order_number.toLowerCase().includes(q)) ||
        clientName.includes(q) ||
        serviceTypeName.includes(q) ||
        vehiclePlate.includes(q);

      const okClient = clientFilter === "all" || o.client?.id === clientFilter;
      const okService =
        serviceFilter === "all" || o.serviceType?.id === serviceFilter;

      return okSearch && okClient && okService;
    });
  }, [orders, searchQuery, clientFilter, serviceFilter]);

  /* ---------- HELPERS (classe para badge de status) --------------------- */
  const getStatusColorClass = (colorValue?: string): string => {
    if (!colorValue) return "bg-gray-400 text-white"; // Cor padrão se indefinida
    const color = colorValue.toLowerCase();

    // Mapeamento direto de cores hexadecimais conhecidas para classes Tailwind
    // Adicione mais mapeamentos conforme as cores definidas no seu `order_statuses`
    const colorMap: Record<string, string> = {
      "#3498db": "bg-blue-500 text-blue-50", // Novo
      "#f39c12": "bg-amber-500 text-amber-50", // Em Análise
      "#e74c3c": "bg-red-500 text-red-50", // Aguardando Documentação
      "#2ecc71": "bg-emerald-500 text-emerald-50", // Processando
      "#27ae60": "bg-green-600 text-green-50", // Concluído
      "#7f8c8d": "bg-slate-500 text-slate-50", // Cancelado
      "#9b59b6": "bg-purple-500 text-purple-50", // Exemplo de outra cor
    };

    return colorMap[color] || `bg-[${color}] text-white`; // Fallback para usar a cor diretamente (requer Tailwind JIT)
  };

  /* ---------- DRAG / STATUS UPDATE ---------- */
  const handleMoveOrder = async (
    orderId: string,
    toStatusId: string,
    note = "" // Nota é opcional
  ) => {
    try {
      const updated = await OrdersService.updateOrder(orderId, {
        status_id: toStatusId,
        message: note || undefined, // A API espera 'message' para notas
      });

      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      toast({ title: "Status atualizado com sucesso!" });
    } catch (e: unknown) {
      toast({
        title: "Erro ao atualizar status",
        description: getErrorMessage(e, "Não foi possível atualizar o status do pedido."),
        variant: "destructive",
      });
    }
  };

  /* ---------- DELETE ------------------------------------------------------ */
  const handleRemoveOrder = async () => {
    if (!deleteModal.orderId) return;
    setDeleteLoading(true);
    try {
      await OrdersService.deleteOrder(deleteModal.orderId);
      setOrders((prev) => prev.filter((o) => o.id !== deleteModal.orderId));
      toast({ title: "Pedido removido com sucesso" });
    } catch (e: unknown) {
      toast({
        title: "Erro ao remover pedido",
        description: getErrorMessage(e, "Não foi possível remover o pedido."),
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
      setDeleteModal({ open: false });
    }
  };

  /* ---------- RENDER ------------------------------------------------------ */
  return (
    <AppLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title="Pedidos"
          description="Monitore pedidos em tempo real, filtre por cliente/serviço e acompanhe produtividade do time."
          stats={[
            { label: 'Total', value: String(orders.length) },
            { label: 'Filtrados', value: String(filteredOrders.length) },
          ]}
        />
        {/* HEADER */}
        <OrdersHeader
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          clientFilter={clientFilter}
          setClientFilter={setClientFilter}
          serviceFilter={serviceFilter}
          setServiceFilter={setServiceFilter}
          organizationMode={organizationMode}
          setOrganizationMode={setOrganizationMode}
          uniqueClients={uniqueClients}
          uniqueServices={uniqueServices}
          onOrderCreated={(newOrder) =>
            setOrders((prev) => [newOrder, ...prev])
          }
        />

        {/* BODY */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <p className="text-muted-foreground">Carregando pedidos…</p>
          </div>
        ) : organizationMode === "kanban" ? (
          <OrdersKanban
            orders={filteredOrders}
            statuses={statuses}
            badge={getStatusColorClass}
            onMove={handleMoveOrder}
            onDelete={(id) => setDeleteModal({ open: true, orderId: id })}
          />
        ) : (
          <OrdersList
            orders={filteredOrders}
            statuses={statuses}
            setDeleteModal={setDeleteModal}
          />
        )}

        {/* MODAL DELETE */}
        <ConfirmDeleteModal
          open={deleteModal.open}
          onClose={() => setDeleteModal({ open: false })}
          onConfirm={handleRemoveOrder}
          loading={deleteLoading}
          title="Confirmar Remoção de Pedido"
          description="Tem certeza que deseja remover este pedido? Esta ação não pode ser desfeita."
        />
      </div>
    </AppLayout>
  );
};

export default OrdersPage;
