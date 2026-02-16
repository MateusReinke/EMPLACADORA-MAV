// src/services/apiIndex.ts
// Arquivo central para todas as APIs do projeto

// Re-export all API services for easy access
export { ApiService, CategoryService } from './serviceTypesApi';
export { ClientsService } from './clientsApi';
export { OrdersService } from './ordersApi';
export { OrderStatusesService } from './orderStatusesApi';
export { VehicleService } from './vehiclesApi';
export { DashboardService } from './dashboardApi';

// Types exports
export type { ServiceType, ServiceCategory } from './serviceTypesApi';
export type { Vehicle, NewVehicle } from './vehiclesApi';
export type { OrderRaw, NewOrder, UpdateOrderPayload } from './ordersApi';
export type { OrderStatus } from './orderStatusesApi';
export type { Client, NewClient } from './clientsApi';

// Re-export types from main types file
export type { 
  User, 
  UserRole, 
  Order, 
  InventoryItem, 
  InventoryMovement, 
  DashboardStats 
} from '../types';

// Helper function to get all APIs in one place
export const getAllAPIs = async () => {
  const { ApiService, CategoryService } = await import('./serviceTypesApi');
  const { ClientsService } = await import('./clientsApi');
  const { OrdersService } = await import('./ordersApi');
  const { OrderStatusesService } = await import('./orderStatusesApi');
  const { VehicleService } = await import('./vehiclesApi');
  const { DashboardService } = await import('./dashboardApi');
  
  return {
    services: ApiService,
    categories: CategoryService,
    clients: ClientsService,
    orders: OrdersService,
    orderStatuses: OrderStatusesService,
    vehicles: VehicleService,
    dashboard: DashboardService
  };
};

// Common error handler for API calls
export const handleAPIError = (error: any, context?: string) => {
  console.error(`API Error${context ? ` in ${context}` : ''}:`, error);
  
  // Return a user-friendly message based on error type
  if (error?.message?.includes('duplicate key')) {
    return 'Este registro já existe no sistema.';
  }
  
  if (error?.message?.includes('foreign key')) {
    return 'Há dependências que impedem esta operação.';
  }
  
  if (error?.message?.includes('permission denied') || error?.code === '42501') {
    return 'Você não tem permissão para realizar esta operação.';
  }
  
  if (error?.message?.includes('network') || error?.code === 'NETWORK_ERROR') {
    return 'Erro de conexão. Verifique sua internet.';
  }
  
  return error?.message || 'Erro interno do servidor.';
};

// Common success messages
export const SUCCESS_MESSAGES = {
  created: 'Registro criado com sucesso!',
  updated: 'Registro atualizado com sucesso!',
  deleted: 'Registro removido com sucesso!',
  loaded: 'Dados carregados com sucesso!',
} as const;

// API status check function
export const checkAPIHealth = async () => {
  try {
    // Simple query to check if DB is responsive
    const { data, error } = await import('@/lib/dbClient').then(
      ({ db }) => db.from('service_categories').select('count').limit(1)
    );
    
    return !error;
  } catch (error) {
    console.error('API Health Check Failed:', error);
    return false;
  }
};