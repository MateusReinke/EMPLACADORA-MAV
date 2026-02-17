import React from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import VehicleManager from '@/components/vehicles/VehicleManager';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

const AdminVehicles = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title="Gestão de Veículos"
          description="Visualize, cadastre e atualize veículos com mais contexto operacional para acelerar atendimento e conferência documental."
          stats={[
            { label: 'Módulo', value: 'Cadastro + Consulta FIPE' },
            { label: 'Fluxo', value: 'Admin completo' },
          ]}
        />
        <VehicleManager />
      </div>
    </AppLayout>
  );
};

export default AdminVehicles;
