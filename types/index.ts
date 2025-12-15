// Базовые типы для сущностей

export interface Warehouse {
  id: string
  code: string
  name: string
  description?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Zone {
  id: string
  code: string
  name: string
  warehouseId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Location {
  id: string
  code: string
  name: string
  zoneId: string
  row?: string
  rack?: string
  level?: string
  capacity?: number
  unit?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface SKU {
  id: string
  code: string
  name: string
  description?: string
  category?: string
  supplier?: string
  abcClass?: string
  unit: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Inventory {
  id: string
  skuId: string
  locationId: string
  quantity: number
  reservedQty: number
  unavailableQty: number
  batchNumber?: string
  expiryDate?: Date
  status: 'available' | 'reserved' | 'unavailable'
  lastUpdated: Date
  createdAt: Date
  updatedAt: Date
}

export interface LocationNorm {
  id: string
  locationId: string
  minLevel?: number
  targetLevel?: number
  maxLevel?: number
  unit: string
  createdAt: Date
  updatedAt: Date
}

export interface SKUNorm {
  id: string
  skuId: string
  minLevel?: number
  targetLevel?: number
  maxLevel?: number
  unit: string
  createdAt: Date
  updatedAt: Date
}

export interface Aggregation {
  id: string
  entityType: 'warehouse' | 'zone' | 'location' | 'sku'
  entityId: string
  entityCode: string
  entityName: string
  totalQuantity: number
  availableQuantity: number
  reservedQuantity: number
  capacity?: number
  fillPercentage?: number
  minLevel?: number
  targetLevel?: number
  maxLevel?: number
  status: 'green' | 'yellow' | 'red' | 'gray'
  calculatedAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface ErrorLog {
  id: string
  source: 'import' | 'validation' | 'calculation'
  severity: 'info' | 'warning' | 'error' | 'critical'
  message: string
  details?: string
  entityType?: string
  entityId?: string
  createdAt: Date
}

// Расширенные типы с вложенными данными

export interface InventoryWithDetails extends Inventory {
  sku: SKU
  location: Location & {
    zone: Zone & {
      warehouse: Warehouse
    }
  }
}

export interface AggregationWithHierarchy extends Aggregation {
  warehouse?: Warehouse
  zone?: Zone
  location?: Location
  sku?: SKU
}

// Типы для фильтрации и сортировки

export type SortField = 
  | 'entityName'
  | 'fillPercentage'
  | 'totalQuantity'
  | 'availableQuantity'
  | 'deviationFromMin'

export type SortOrder = 'asc' | 'desc'

export interface FilterParams {
  warehouseId?: string
  zoneId?: string
  category?: string
  supplier?: string
  abcClass?: string
  status?: 'green' | 'yellow' | 'red' | 'gray'
  search?: string
}

export interface SortParams {
  field: SortField
  order: SortOrder
}

export interface PaginationParams {
  page: number
  pageSize: number
}

// Типы для API запросов/ответов

export interface GetAggregationsRequest {
  entityType: 'warehouse' | 'zone' | 'location' | 'sku'
  filters?: FilterParams
  sort?: SortParams
  pagination?: PaginationParams
}

export interface GetAggregationsResponse {
  data: Aggregation[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ImportInventoryRequest {
  data: {
    skuCode: string
    locationCode: string
    quantity: number
    reservedQty?: number
    unavailableQty?: number
    batchNumber?: string
    expiryDate?: string
    status?: 'available' | 'reserved' | 'unavailable'
  }[]
}

export interface ImportInventoryResponse {
  success: boolean
  imported: number
  errors: {
    row: number
    message: string
  }[]
}

export interface SyncWarehousesRequest {
  warehouses: {
    code: string
    name: string
    description?: string
    zones?: {
      code: string
      name: string
      locations?: {
        code: string
        name: string
        row?: string
        rack?: string
        level?: string
        capacity?: number
        unit?: string
      }[]
    }[]
  }[]
}

export interface ImportNormsRequest {
  skuNorms?: {
    skuCode: string
    minLevel?: number
    targetLevel?: number
    maxLevel?: number
    unit?: string
  }[]
  locationNorms?: {
    locationCode: string
    minLevel?: number
    targetLevel?: number
    maxLevel?: number
    unit?: string
  }[]
}

// Типы для визуализации

export interface ChartDataPoint {
  name: string
  value: number
  fillPercentage?: number
  status: 'green' | 'yellow' | 'red' | 'gray'
  minLevel?: number
  targetLevel?: number
  maxLevel?: number
  capacity?: number
  id: string
  entityType: 'warehouse' | 'zone' | 'location' | 'sku'
}

export interface DrillDownLevel {
  entityType: 'warehouse' | 'zone' | 'location' | 'sku'
  entityId: string
  entityName: string
}

export interface DashboardState {
  currentLevel: DrillDownLevel[]
  filters: FilterParams
  sort: SortParams
  viewMode: 'quantity' | 'percentage'
}
