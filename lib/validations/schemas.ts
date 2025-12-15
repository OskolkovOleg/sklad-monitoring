import { z } from 'zod'

// Валидация для импорта остатков
export const importInventorySchema = z.object({
  data: z.array(
    z.object({
      skuCode: z.string().min(1, 'SKU код обязателен'),
      locationCode: z.string().min(1, 'Код локации обязателен'),
      quantity: z.number().min(0, 'Количество не может быть отрицательным'),
      reservedQty: z.number().min(0).optional().default(0),
      unavailableQty: z.number().min(0).optional().default(0),
      batchNumber: z.string().optional(),
      expiryDate: z.string().datetime().optional(),
      status: z.enum(['available', 'reserved', 'unavailable']).optional().default('available'),
    })
  ),
})

// Валидация для синхронизации складов
export const syncWarehousesSchema = z.object({
  warehouses: z.array(
    z.object({
      code: z.string().min(1),
      name: z.string().min(1),
      description: z.string().optional(),
      zones: z.array(
        z.object({
          code: z.string().min(1),
          name: z.string().min(1),
          locations: z.array(
            z.object({
              code: z.string().min(1),
              name: z.string().min(1),
              row: z.string().optional(),
              rack: z.string().optional(),
              level: z.string().optional(),
              capacity: z.number().min(0).optional(),
              unit: z.string().optional(),
            })
          ).optional(),
        })
      ).optional(),
    })
  ),
})

// Валидация для импорта норм
export const importNormsSchema = z.object({
  skuNorms: z.array(
    z.object({
      skuCode: z.string().min(1),
      minLevel: z.number().min(0).optional(),
      targetLevel: z.number().min(0).optional(),
      maxLevel: z.number().min(0).optional(),
      unit: z.string().optional(),
    })
  ).optional(),
  locationNorms: z.array(
    z.object({
      locationCode: z.string().min(1),
      minLevel: z.number().min(0).optional(),
      targetLevel: z.number().min(0).optional(),
      maxLevel: z.number().min(0).optional(),
      unit: z.string().optional(),
    })
  ).optional(),
}).refine(
  (data) => {
    // Проверка, что min <= target <= max
    const checkNorms = (norms: any[]) => {
      return norms.every((norm) => {
        const { minLevel, targetLevel, maxLevel } = norm
        if (minLevel !== undefined && targetLevel !== undefined && minLevel > targetLevel) {
          return false
        }
        if (targetLevel !== undefined && maxLevel !== undefined && targetLevel > maxLevel) {
          return false
        }
        if (minLevel !== undefined && maxLevel !== undefined && minLevel > maxLevel) {
          return false
        }
        return true
      })
    }
    
    if (data.skuNorms && !checkNorms(data.skuNorms)) return false
    if (data.locationNorms && !checkNorms(data.locationNorms)) return false
    return true
  },
  {
    message: 'Уровни должны соответствовать правилу: min <= target <= max',
  }
)

// Валидация для создания SKU
export const createSKUSchema = z.object({
  code: z.string().min(1, 'Код SKU обязателен'),
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  category: z.string().optional(),
  supplier: z.string().optional(),
  abcClass: z.enum(['A', 'B', 'C']).optional(),
  unit: z.string().default('шт'),
})

// Валидация для получения агрегаций
export const getAggregationsSchema = z.object({
  entityType: z.enum(['warehouse', 'zone', 'location', 'sku']),
  filters: z.object({
    warehouseId: z.string().optional(),
    zoneId: z.string().optional(),
    category: z.string().optional(),
    supplier: z.string().optional(),
    abcClass: z.enum(['A', 'B', 'C']).optional(),
    status: z.enum(['green', 'yellow', 'red', 'gray']).optional(),
    search: z.string().optional(),
  }).optional(),
  sort: z.object({
    field: z.enum(['entityName', 'fillPercentage', 'totalQuantity', 'availableQuantity', 'deviationFromMin']),
    order: z.enum(['asc', 'desc']),
  }).optional(),
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(1).max(5000).default(100),
  }).optional(),
})

// Валидация данных перед записью в БД
export const validateInventoryData = (data: {
  quantity: number
  reservedQty: number
  unavailableQty: number
}) => {
  const errors: string[] = []
  
  if (data.quantity < 0) {
    errors.push('Количество не может быть отрицательным')
  }
  
  if (data.reservedQty < 0) {
    errors.push('Зарезервированное количество не может быть отрицательным')
  }
  
  if (data.unavailableQty < 0) {
    errors.push('Недоступное количество не может быть отрицательным')
  }
  
  if (data.reservedQty + data.unavailableQty > data.quantity) {
    errors.push('Сумма зарезервированного и недоступного не может превышать общее количество')
  }
  
  return { valid: errors.length === 0, errors }
}

// Валидация вместимости
export const validateCapacity = (data: {
  quantity: number
  capacity?: number
}) => {
  if (data.capacity !== undefined && data.capacity > 0 && data.quantity > data.capacity) {
    return {
      valid: false,
      errors: ['Количество превышает вместимость'],
    }
  }
  return { valid: true, errors: [] }
}
