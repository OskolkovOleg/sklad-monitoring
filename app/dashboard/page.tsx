'use client'

import React, { useState, useEffect } from 'react'
import { WarehouseChart } from '@/components/dashboard/WarehouseChart'
import { DashboardFilters } from '@/components/dashboard/DashboardFilters'
import { Breadcrumbs } from '@/components/dashboard/Breadcrumbs'
import { Loader2, BarChart3 } from 'lucide-react'
import type {
  Aggregation,
  FilterParams,
  SortParams,
  ChartDataPoint,
  DrillDownLevel,
} from '@/types'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [aggregations, setAggregations] = useState<Aggregation[]>([])
  const [viewMode, setViewMode] = useState<'quantity' | 'percentage'>('quantity')
  const [currentEntityType, setCurrentEntityType] = useState<'warehouse' | 'zone' | 'location' | 'sku'>('warehouse')
  const [drillDownPath, setDrillDownPath] = useState<DrillDownLevel[]>([])
  const [filters, setFilters] = useState<FilterParams>({})
  const [sort, setSort] = useState<SortParams>({
    field: 'entityName',
    order: 'asc',
  })

  // Загрузка данных
  useEffect(() => {
    fetchAggregations()
  }, [currentEntityType, filters, sort])

  const fetchAggregations = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        entityType: currentEntityType,
        sortField: sort.field,
        sortOrder: sort.order,
      })

      if (filters.warehouseId) params.append('warehouseId', filters.warehouseId)
      if (filters.zoneId) params.append('zoneId', filters.zoneId)
      if (filters.category) params.append('category', filters.category)
      if (filters.supplier) params.append('supplier', filters.supplier)
      if (filters.abcClass) params.append('abcClass', filters.abcClass)
      if (filters.status) params.append('status', filters.status)
      if (filters.search) params.append('search', filters.search)

      const response = await fetch(`/api/aggregations?${params}`)
      const data = await response.json()

      if (data.data) {
        setAggregations(data.data)
      }
    } catch (error) {
      console.error('Error fetching aggregations:', error)
    } finally {
      setLoading(false)
    }
  }

  // Преобразование данных для диаграммы
  const chartData: ChartDataPoint[] = aggregations.map((agg) => ({
    name: agg.entityName,
    value: agg.totalQuantity,
    fillPercentage: agg.fillPercentage,
    status: agg.status,
    minLevel: agg.minLevel,
    targetLevel: agg.targetLevel,
    maxLevel: agg.maxLevel,
    capacity: agg.capacity,
    id: agg.entityId,
    entityType: agg.entityType,
  }))

  // Обработка клика по столбцу (drill-down)
  const handleBarClick = (dataPoint: ChartDataPoint) => {
    // Добавляем в путь навигации
    setDrillDownPath([
      ...drillDownPath,
      {
        entityType: dataPoint.entityType,
        entityId: dataPoint.id,
        entityName: dataPoint.name,
      },
    ])

    // Определяем следующий уровень детализации
    const nextLevelMap: Record<string, 'zone' | 'location' | 'sku'> = {
      warehouse: 'zone',
      zone: 'location',
      location: 'sku',
    }

    const nextLevel = nextLevelMap[dataPoint.entityType]
    if (nextLevel) {
      setCurrentEntityType(nextLevel)

      // Обновляем фильтры для следующего уровня
      if (dataPoint.entityType === 'warehouse') {
        setFilters({ ...filters, warehouseId: dataPoint.id })
      } else if (dataPoint.entityType === 'zone') {
        setFilters({ ...filters, zoneId: dataPoint.id })
      }
    }
  }

  // Навигация по хлебным крошкам
  const handleBreadcrumbNavigate = (index: number) => {
    if (index === -1) {
      // Возврат на главную
      setDrillDownPath([])
      setCurrentEntityType('warehouse')
      setFilters({})
    } else {
      // Возврат на определенный уровень
      const newPath = drillDownPath.slice(0, index + 1)
      setDrillDownPath(newPath)

      const levelEntityType = newPath[newPath.length - 1]?.entityType
      if (levelEntityType === 'warehouse') {
        setCurrentEntityType('zone')
        setFilters({ warehouseId: newPath[newPath.length - 1].entityId })
      } else if (levelEntityType === 'zone') {
        setCurrentEntityType('location')
        setFilters({ zoneId: newPath[newPath.length - 1].entityId })
      }
    }
  }

  const entityTypeLabels: Record<string, string> = {
    warehouse: 'Склады',
    zone: 'Зоны',
    location: 'Локации',
    sku: 'Товары (SKU)',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Визуализация заполненности склада
            </h1>
          </div>
          <p className="text-gray-600">
            Система мониторинга остатков и заполненности складских помещений
          </p>
        </div>

        {/* Хлебные крошки */}
        {drillDownPath.length > 0 && (
          <div className="mb-6">
            <Breadcrumbs levels={drillDownPath} onNavigate={handleBreadcrumbNavigate} />
          </div>
        )}

        {/* Фильтры */}
        <div className="mb-6">
          <DashboardFilters
            filters={filters}
            sort={sort}
            onFiltersChange={setFilters}
            onSortChange={setSort}
          />
        </div>

        {/* Переключатель режима отображения */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {entityTypeLabels[currentEntityType]}
            </h2>
            <span className="text-sm text-gray-500">
              {aggregations.length} записей
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('quantity')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'quantity'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Количество
            </button>
            <button
              onClick={() => setViewMode('percentage')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'percentage'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Заполненность %
            </button>
          </div>
        </div>

        {/* Диаграмма */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="flex items-center justify-center h-[500px]">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : chartData.length > 0 ? (
            <WarehouseChart
              data={chartData}
              viewMode={viewMode}
              onBarClick={handleBarClick}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-[500px] text-gray-500">
              <BarChart3 className="w-16 h-16 mb-4 text-gray-400" />
              <p className="text-lg font-medium">Нет данных для отображения</p>
              <p className="text-sm">Попробуйте изменить фильтры или загрузите данные</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
