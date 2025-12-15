import type { Aggregation } from '@/types'

/**
 * Рассчитывает процент заполненности
 */
export const calculateFillPercentage = (
  quantity: number,
  capacity?: number
): number | undefined => {
  if (capacity === undefined || capacity <= 0) return undefined
  return Math.round((quantity / capacity) * 100 * 100) / 100 // Округление до 2 знаков
}

/**
 * Определяет статус на основе пороговых уровней
 * Зеленый — >= target
 * Желтый — между min и target
 * Красный — < min
 * Серый — отсутствие данных/вместимости
 */
export const calculateStatus = (
  quantity: number,
  minLevel?: number,
  targetLevel?: number,
  capacity?: number
): 'green' | 'yellow' | 'red' | 'gray' => {
  // Если нет данных о нормах
  if (minLevel === undefined && targetLevel === undefined) {
    // Проверяем по вместимости
    if (capacity !== undefined && capacity > 0) {
      const fillPercentage = (quantity / capacity) * 100
      if (fillPercentage >= 80) return 'green'
      if (fillPercentage >= 50) return 'yellow'
      if (fillPercentage > 0) return 'red'
    }
    return 'gray'
  }

  // Если есть целевой уровень
  if (targetLevel !== undefined && quantity >= targetLevel) {
    return 'green'
  }

  // Если есть минимальный уровень
  if (minLevel !== undefined) {
    if (quantity < minLevel) {
      return 'red'
    }
    // Между min и target
    if (targetLevel !== undefined && quantity < targetLevel) {
      return 'yellow'
    }
    // Выше min, но нет target
    if (targetLevel === undefined) {
      return 'green'
    }
  }

  // Если есть только target, но не достигнут
  if (targetLevel !== undefined && quantity < targetLevel) {
    return 'yellow'
  }

  return 'gray'
}

/**
 * Рассчитывает отклонение от минимального уровня
 */
export const calculateDeviationFromMin = (
  quantity: number,
  minLevel?: number
): number => {
  if (minLevel === undefined) return 0
  return quantity - minLevel
}

/**
 * Рассчитывает отклонение от целевого уровня
 */
export const calculateDeviationFromTarget = (
  quantity: number,
  targetLevel?: number
): number => {
  if (targetLevel === undefined) return 0
  return quantity - targetLevel
}

/**
 * Форматирует число для отображения
 */
export const formatNumber = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Форматирует процент для отображения
 */
export const formatPercentage = (value: number): string => {
  return `${formatNumber(value, 1)}%`
}

/**
 * Получает цвет для статуса
 */
export const getStatusColor = (
  status: 'green' | 'yellow' | 'red' | 'gray'
): string => {
  const colors = {
    green: '#10b981', // green-500
    yellow: '#f59e0b', // amber-500
    red: '#ef4444', // red-500
    gray: '#9ca3af', // gray-400
  }
  return colors[status]
}

/**
 * Получает текстовое описание статуса
 */
export const getStatusLabel = (
  status: 'green' | 'yellow' | 'red' | 'gray'
): string => {
  const labels = {
    green: 'Нормальный уровень',
    yellow: 'Требует внимания',
    red: 'Критический уровень',
    gray: 'Нет данных',
  }
  return labels[status]
}

/**
 * Валидирует и нормализует единицу измерения
 */
export const normalizeUnit = (unit?: string): string => {
  if (!unit) return 'шт'
  const normalized = unit.toLowerCase().trim()
  
  // Мапинг распространенных единиц
  const unitMap: Record<string, string> = {
    'шт': 'шт',
    'штук': 'шт',
    'штука': 'шт',
    'piece': 'шт',
    'pcs': 'шт',
    'кг': 'кг',
    'килограмм': 'кг',
    'kg': 'кг',
    'л': 'л',
    'литр': 'л',
    'liter': 'л',
    'м': 'м',
    'метр': 'м',
    'meter': 'м',
    'м2': 'м²',
    'м3': 'м³',
  }
  
  return unitMap[normalized] || normalized
}

/**
 * Сортирует агрегации по заданному полю
 */
export const sortAggregations = (
  aggregations: Aggregation[],
  field: 'entityName' | 'fillPercentage' | 'totalQuantity' | 'availableQuantity' | 'deviationFromMin',
  order: 'asc' | 'desc'
): Aggregation[] => {
  const sorted = [...aggregations].sort((a, b) => {
    let aValue: number | string
    let bValue: number | string
    
    switch (field) {
      case 'entityName':
        aValue = a.entityName.toLowerCase()
        bValue = b.entityName.toLowerCase()
        break
      case 'fillPercentage':
        aValue = a.fillPercentage ?? -1
        bValue = b.fillPercentage ?? -1
        break
      case 'totalQuantity':
        aValue = a.totalQuantity
        bValue = b.totalQuantity
        break
      case 'availableQuantity':
        aValue = a.availableQuantity
        bValue = b.availableQuantity
        break
      case 'deviationFromMin':
        aValue = calculateDeviationFromMin(a.totalQuantity, a.minLevel)
        bValue = calculateDeviationFromMin(b.totalQuantity, b.minLevel)
        break
      default:
        aValue = 0
        bValue = 0
    }
    
    if (aValue < bValue) return order === 'asc' ? -1 : 1
    if (aValue > bValue) return order === 'asc' ? 1 : -1
    return 0
  })
  
  return sorted
}

/**
 * Применяет пагинацию к массиву
 */
export const paginateArray = <T>(
  array: T[],
  page: number,
  pageSize: number
): { data: T[]; total: number; totalPages: number } => {
  const total = array.length
  const totalPages = Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const data = array.slice(start, end)
  
  return { data, total, totalPages }
}
