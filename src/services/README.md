# API Services Documentation

Este diretório contém todos os serviços de API para o sistema de gestão de pedidos e clientes.

## Estrutura de Arquivos

### Core APIs
- `serviceTypesApi.ts` - Gerenciamento de tipos de serviços e categorias
- `clientsApi.ts` - Gerenciamento de clientes  
- `ordersApi.ts` - Gerenciamento de pedidos
- `orderStatusesApi.ts` - Gerenciamento de status de pedidos
- `vehiclesApi.ts` - Gerenciamento de veículos
- `dashboardApi.ts` - Dados e estatísticas do dashboard

### Utilitários
- `apiIndex.ts` - Arquivo central com exports e helpers
- `fipeApi.ts` - API externa para dados de veículos

## Como Usar

### Importação Centralizada
```typescript
import { ApiService, ClientsService, OrdersService } from '@/services/apiIndex';
```

### Importação Individual
```typescript
import { ApiService } from '@/services/serviceTypesApi';
import { ClientsService } from '@/services/clientsApi';
```

## APIs Disponíveis

### 1. ApiService (serviceTypesApi.ts)
Gerencia tipos de serviços e suas operações CRUD.

**Métodos:**
- `getServiceTypes()` - Lista todos os tipos de serviços
- `createServiceType(data)` - Cria novo tipo de serviço
- `updateServiceType(id, data)` - Atualiza tipo de serviço
- `deleteServiceType(id)` - Remove tipo de serviço
- `getDashboardStats(userId, role)` - Dados do dashboard
- `getOrders(userId, role)` - Lista pedidos
- `getOrderStatuses()` - Lista status de pedidos
- `updateOrder(id, data)` - Atualiza pedido
- `getClients(userId, role)` - Lista clientes

### 2. ClientsService (clientsApi.ts)
Gerencia clientes do sistema.

**Métodos:**
- `getClients()` - Lista todos os clientes ativos
- `createClient(data)` - Cria novo cliente

### 3. OrdersService (ordersApi.ts)
Gerencia pedidos e suas operações.

**Métodos:**
- `createOrder(data)` - Cria novo pedido
- `getOrders(userId, role)` - Lista pedidos com filtros
- `updateOrder(id, data)` - Atualiza pedido
- `deleteOrder(id)` - Remove pedido
- `getOrderStatuses()` - Lista status disponíveis

### 4. OrderStatusesService (orderStatusesApi.ts)
Gerencia status dos pedidos.

**Métodos:**
- `getOrderStatuses()` - Lista todos os status ativos

### 5. VehicleService (vehiclesApi.ts)
Gerencia veículos dos clientes.

**Métodos:**
- `getClientVehicles(clientId)` - Lista veículos de um cliente
- `createVehicle(data)` - Cria novo veículo

### 6. DashboardService (dashboardApi.ts)
Fornece dados agregados para dashboards.

**Métodos:**
- `getAdminDashboardStats()` - Estatísticas completas do sistema

## Tratamento de Erros

Todas as APIs implementam tratamento de erros consistente:

```typescript
import { handleAPIError } from '@/services/apiIndex';

try {
  const result = await ApiService.getServiceTypes();
} catch (error) {
  const userMessage = handleAPIError(error, 'loadingServices');
  toast.error(userMessage);
}
```

## Segurança

- Autenticação automática via contexto de auth
- Validação de dados nas camadas de serviço
- Operações com persistência local para ambiente de execução único

## Tipos TypeScript

Todos os serviços são totalmente tipados:

```typescript
import type { ServiceType, Client, Order } from '@/services/apiIndex';
```

## Convenções

### Nomenclatura
- Classes: `PascalCase` (ex: `ApiService`)
- Métodos: `camelCase` (ex: `getServiceTypes`)
- Interfaces: `PascalCase` (ex: `ServiceType`)

### Retornos
- Métodos GET: Retornam arrays ou objetos tipados
- Métodos POST: Retornam o objeto criado
- Métodos PUT: Retornam o objeto atualizado  
- Métodos DELETE: Retornam void

### Parâmetros
- IDs sempre como string
- Dados de criação tipados como `New*` (ex: `NewClient`)
- Dados de atualização tipados como `Partial<*>`

## Status da Implementação

✅ **Completo e Funcional:**
- Gerenciamento de Serviços
- Gerenciamento de Clientes
- Gerenciamento de Pedidos
- Gerenciamento de Veículos
- Dashboard e Estatísticas
- Autenticação e Autorização
- Tratamento de Erros
- Validação de Dados
- Auditoria de Operações

🎯 **Projeto 100% Funcional!**