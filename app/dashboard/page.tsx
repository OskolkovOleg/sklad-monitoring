'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { WarehouseChart } from '@/components/dashboard/WarehouseChart'
import { DashboardFilters } from '@/components/dashboard/DashboardFilters'
import { Breadcrumbs } from '@/components/dashboard/Breadcrumbs'
import { KPICard } from '@/components/dashboard/KPICard'
import { DetailsPanel, type DetailsPanelData } from '@/components/dashboard/DetailsPanel'
import { DashboardControls } from '@/components/dashboard/DashboardControls'
import { Loader2, BarChart3 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { exportToCSV, formatDateForFilename } from '@/lib/utils/export'
import type {
  Aggregation,
  FilterParams,
  SortParams,
  ChartDataPoint,
  DrillDownLevel,
} from '@/types'

interface KPIData {
  avgFillPercentage: number
  totalPositions: number
  redCount: number
  yellowCount: number
  grayCount: number
  greenCount: number
  lastUpdate: Date
  totalQuantity: number
  totalCapacity: number
  utilizationRate: number
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [kpiLoading, setKpiLoading] = useState(true)
  const [aggregations, setAggregations] = useState<any[]>([])
  const [kpiData, setKpiData] = useState<KPIData | null>(null)
  const [viewMode, setViewMode] = useState<'quantity' | 'percentage'>('quantity')
  const [currentEntityType, setCurrentEntityType] = useState<'warehouse' | 'zone' | 'location' | 'sku'>('warehouse')
  const [drillDownPath, setDrillDownPath] = useState<DrillDownLevel[]>([])
  const [filters, setFilters] = useState<FilterParams>({})
  const [sort, setSort] = useState<SortParams>({
    field: 'entityName',
    order: 'asc',
  })
  const [detailsPanel, setDetailsPanel] = useState<{
    isOpen: boolean
    data: DetailsPanelData | null
  }>({
    isOpen: false,
    data: null,
  })
  const [simulationEnabled, setSimulationEnabled] = useState(false)
  const [lastSimulationTime, setLastSimulationTime] = useState<Date | null>(null)

  // Загрузка KPI данных
  useEffect(() => {
    fetchKPI()
  }, [filters.warehouseId, filters.zoneId])

  // Загрузка агрегаций
  useEffect(() => {
    fetchAggregations()
  }, [currentEntityType, drillDownPath, filters, sort])

  // Симуляция обновлений данных
  useEffect(() => {
    if (!simulationEnabled) return

    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/simulate/tick', { method: 'POST' })
        const result = await response.json()
        
        if (result.success) {
          setLastSimulationTime(new Date())
          // Обновляем данные плавно без перезагрузки
          fetchKPISilent()
          fetchAggregationsSilent()
        }
      } catch (error) {
        console.error('Error during simulation tick:', error)
      }
    }, 7000) // Каждые 7 секунд

    return () => clearInterval(interval)
  }, [simulationEnabled, currentEntityType, drillDownPath, filters])

  const fetchKPI = async () => {
    setKpiLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.warehouseId) params.append('warehouseId', filters.warehouseId)
      if (filters.zoneId) params.append('zoneId', filters.zoneId)

      const response = await fetch(`/api/kpi?${params}`)
      const data = await response.json()
      if (data.data) {
        setKpiData(data.data)
      }
    } catch (error) {
      console.error('Error fetching KPI:', error)
    } finally {
      setKpiLoading(false)
    }
  }

  // Silent fetch for smooth updates during simulation
  const fetchKPISilent = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.warehouseId) params.append('warehouseId', filters.warehouseId)
      if (filters.zoneId) params.append('zoneId', filters.zoneId)

      const response = await fetch(`/api/kpi?${params}`)
      const data = await response.json()
      if (data.data) {
        setKpiData(data.data)
      }
    } catch (error) {
      console.error('Error fetching KPI:', error)
    }
  }

  const fetchAggregations = async () => {
    setLoading(true)
    try {
      // Determine parentId from drillDownPath
      let parentId = undefined
      if (drillDownPath.length > 0) {
        parentId = drillDownPath[drillDownPath.length - 1].entityId
      }

      const params = new URLSearchParams({
        level: currentEntityType,
      })

      if (parentId) {
        params.append('parentId', parentId)
      }

      console.log('[Drill-Down] Fetching:', { level: currentEntityType, parentId, drillDownPath })
      const response = await fetch(`/api/dashboard/bars?${params}`)
      const data = await response.json()
      console.log('[Drill-Down] Response:', data)

      if (data.data) {
        setAggregations(data.data)
      }
    } catch (error) {
      console.error('Error fetching aggregations:', error)
    } finally {
      setLoading(false)
    }
  }

  // Silent fetch for smooth updates during simulation
  const fetchAggregationsSilent = async () => {
    try {
      // Determine parentId from drillDownPath
      let parentId = undefined
      if (drillDownPath.length > 0) {
        parentId = drillDownPath[drillDownPath.length - 1].entityId
      }

      const params = new URLSearchParams({
        level: currentEntityType,
      })

      if (parentId) {
        params.append('parentId', parentId)
      }

      const response = await fetch(`/api/dashboard/bars?${params}`)
      const data = await response.json()

      if (data.data) {
        setAggregations(data.data)
      }
    } catch (error) {
      console.error('Error fetching aggregations:', error)
    }
  }

  // Преобразование данных для диаграммы
  const chartData: ChartDataPoint[] = aggregations.map((agg: any) => ({
    name: agg.name,
    value: agg.value,
    fillPercentage: agg.fillPercentage,
    status: agg.status,
    // minLevel: agg.minLevel, // Not yet in new API
    // targetLevel: agg.targetLevel, // Not yet in new API
    // maxLevel: agg.maxLevel, // Not yet in new API
    capacity: agg.capacity,
    id: agg.id,
    entityType: agg.entityType,
  }))

  // Обработка клика по столбцу (только drill-down)
  const handleBarClick = (dataPoint: ChartDataPoint) => {
    console.log('[Drill-Down] Bar clicked:', dataPoint)

    // Drill-down навигация (кроме SKU)
    if (dataPoint.entityType !== 'sku') {
      const newPath = [
        ...drillDownPath,
        {
          entityType: dataPoint.entityType,
          entityId: dataPoint.id,
          entityName: dataPoint.name,
        },
      ]
      
      console.log('[Drill-Down] New path:', newPath)
      setDrillDownPath(newPath)

      const nextLevelMap: Record<string, 'zone' | 'location' | 'sku'> = {
        warehouse: 'zone',
        zone: 'location',
        location: 'sku',
      }

      const nextLevel = nextLevelMap[dataPoint.entityType]
      console.log('[Drill-Down] Next level:', nextLevel)
      if (nextLevel) {
        setCurrentEntityType(nextLevel)

        // Update filters for KPI
        const newFilters: FilterParams = { ...filters }
        if (dataPoint.entityType === 'warehouse') {
          newFilters.warehouseId = dataPoint.id
        } else if (dataPoint.entityType === 'zone') {
          newFilters.zoneId = dataPoint.id
        }
        setFilters(newFilters)
      }
    }
  }

  // Показать детали для выбранного элемента
  const handleShowDetails = (dataPoint: ChartDataPoint) => {
    const aggregation = aggregations.find((a: any) => a.id === dataPoint.id)
    if (aggregation) {
      setDetailsPanel({
        isOpen: true,
        data: {
          entityId: aggregation.id,
          entityType: aggregation.entityType,
          entityName: aggregation.name,
          totalQuantity: aggregation.value,
          availableQuantity: aggregation.value, // Placeholder
          reservedQuantity: 0, // Placeholder
          capacity: aggregation.capacity || 0,
          fillPercentage: aggregation.fillPercentage || 0,
          minLevel: 0, // Placeholder
          targetLevel: 0, // Placeholder
          maxLevel: 0, // Placeholder
          status: aggregation.status,
        },
      })
    }
  }

  // Навигация по хлебным крошкам
  const handleBreadcrumbNavigate = (index: number) => {
    if (index === -1) {
      setDrillDownPath([])
      setCurrentEntityType('warehouse')
      setFilters({})
    } else {
      const newPath = drillDownPath.slice(0, index + 1)
      setDrillDownPath(newPath)

      const lastItem = newPath[newPath.length - 1]
      const levelEntityType = lastItem?.entityType

      // Reconstruct filters
      const newFilters: FilterParams = {}
      const warehouseItem = newPath.find(i => i.entityType === 'warehouse')
      if (warehouseItem) newFilters.warehouseId = warehouseItem.entityId
      
      const zoneItem = newPath.find(i => i.entityType === 'zone')
      if (zoneItem) newFilters.zoneId = zoneItem.entityId
      
      setFilters(newFilters)

      if (levelEntityType === 'warehouse') {
        setCurrentEntityType('zone')
      } else if (levelEntityType === 'zone') {
        setCurrentEntityType('location')
      } else if (levelEntityType === 'location') {
        setCurrentEntityType('sku')
      }
    }
  }

  const entityTypeLabels: Record<string, string> = {
    warehouse: 'Склады',
    zone: 'Зоны',
    location: 'Локации',
    sku: 'Товары (SKU)',
  }

  // Export current data to CSV
  const handleExport = async () => {
    console.log('handleExport started')
    console.log('aggregations:', aggregations)
    console.log('aggregations.length:', aggregations.length)
    
    try {
      if (aggregations.length === 0) {
        console.log('No data to export')
        alert('Нет данных для экспорта')
        return
      }

      // Prepare export data
      const exportData = aggregations.map((agg: any) => ({
        'Тип': entityTypeLabels[agg.entityType] || agg.entityType,
        'Код': agg.entityCode || '',
        'Название': agg.name,
        'Количество': agg.value,
        'Вместимость': agg.capacity || '',
        'Заполненность %': agg.fillPercentage ? agg.fillPercentage.toFixed(2) : '',
        'Статус': agg.status,
        'Дата расчета': new Date(agg.calculatedAt || Date.now()).toLocaleString('ru-RU'),
      }))

      console.log('exportData prepared:', exportData)

      // Generate filename
      const level = entityTypeLabels[currentEntityType] || currentEntityType
      const timestamp = formatDateForFilename()
      const filename = `отчет_${level}_${timestamp}.csv`
      
      console.log('filename:', filename)
      console.log('Calling exportToCSV...')

      // Export to CSV
      exportToCSV(exportData, filename)
      
      console.log('exportToCSV called')

      // Save export history to API (non-blocking)
      try {
        await fetch('/api/reports/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename,
            reportType: 'warehouse_status',
            entityType: currentEntityType,
            recordCount: exportData.length,
            filters: JSON.stringify(filters),
          }),
        })
      } catch (apiError) {
        // Не блокируем экспорт, если не удалось сохранить историю
        console.warn('Could not save export history:', apiError)
      }

      // Success message
      alert(`Файл ${filename} успешно экспортирован!`)
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Ошибка при экспорте данных. Проверьте консоль для деталей.')
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Командный Пункт</h1>
          <p className="text-gray-500">Мониторинг заполненности и KPI</p>
          
          {/* Активные фильтры - индикатор */}
          {Object.keys(filters).filter(key => filters[key as keyof FilterParams]).length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-500">Активные фильтры:</span>
              <div className="flex items-center gap-1">
                {filters.warehouseId && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                    Склад
                  </span>
                )}
                {filters.zoneId && (
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                    Зона
                  </span>
                )}
                {filters.category && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                    {filters.category}
                  </span>
                )}
                {filters.supplier && (
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                    {filters.supplier}
                  </span>
                )}
                {filters.abcClass && (
                  <span className="px-2 py-0.5 bg-pink-100 text-pink-700 text-xs rounded-full">
                    ABC: {filters.abcClass}
                  </span>
                )}
                {filters.status && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                    Статус: {filters.status}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Simulation Toggle */}
          <button
            onClick={() => setSimulationEnabled(!simulationEnabled)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              simulationEnabled
                ? 'bg-[#00D632] bg-opacity-20 text-white hover:bg-opacity-30 border border-[#00D632]'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${simulationEnabled ? 'bg-white animate-pulse' : 'bg-gray-400'}`} />
            {simulationEnabled ? 'Симуляция активна' : 'Включить симуляцию'}
          </button>
          
          {/* Last Update Indicator */}
          {lastSimulationTime && simulationEnabled && (
            <div className="text-xs text-gray-500">
              Обновлено: {formatDistanceToNow(lastSimulationTime, { addSuffix: true, locale: ru })}
            </div>
          )}
          
          <DashboardControls 
            onRefresh={() => {
              fetchKPI()
              fetchAggregations()
            }}
            onExport={handleExport}
            isRefreshing={loading || kpiLoading}
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiLoading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse border border-gray-100">
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-3"></div>
              <div className="h-8 bg-gray-100 rounded w-1/2"></div>
            </div>
          ))
        ) : kpiData ? (
          <>
            <KPICard
              title="Средняя заполненность"
              value={`${kpiData.avgFillPercentage}%`}
              subtitle={`${kpiData.totalPositions} позиций`}
              icon="activity"
              color="blue"
            />
            <KPICard
              title="Дефицит"
              value={kpiData.redCount}
              subtitle="Ниже минимума"
              icon="alert"
              color="red"
            />
            <KPICard
              title="Требуют внимания"
              value={kpiData.yellowCount}
              subtitle="Между min и target"
              icon="trending"
              color="yellow"
            />
            <KPICard
              title="Без данных"
              value={kpiData.grayCount}
              subtitle="Нет вместимости"
              icon="package"
              color="gray"
            />
            <KPICard
              title="Последнее обновление"
              value={formatDistanceToNow(new Date(kpiData.lastUpdate), {
                addSuffix: true,
                locale: ru,
              })}
              subtitle={new Date(kpiData.lastUpdate).toLocaleString('ru-RU')}
              icon="clock"
              color="green"
            />
          </>
        ) : null}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col space-y-6">
            {/* Breadcrumbs & View Toggle */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                {drillDownPath.length > 0 ? (
                  <Breadcrumbs levels={drillDownPath} onNavigate={handleBreadcrumbNavigate} />
                ) : (
                  <h2 className="text-lg font-semibold text-gray-900">Обзор складов</h2>
                )}
              </div>
              
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('quantity')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    viewMode === 'quantity'
                      ? 'bg-[#00D632] text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Количество
                </button>
                <button
                  onClick={() => setViewMode('percentage')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    viewMode === 'percentage'
                      ? 'bg-[#00D632] text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Заполненность %
                </button>
              </div>
            </div>

            {/* Filters */}
            <DashboardFilters
              filters={filters}
              sort={sort}
              onFiltersChange={setFilters}
              onSortChange={setSort}
            />
          </div>
        </div>

        {/* Chart Area */}
        <div className="p-6 bg-gray-50/50 min-h-[500px]">
          {loading ? (
            <div className="flex items-center justify-center h-[400px]">
              <Loader2 className="w-8 h-8 animate-spin text-[#00D632]" />
            </div>
          ) : chartData.length > 0 ? (
            <>
              <WarehouseChart
                data={chartData}
                viewMode={viewMode}
                onBarClick={handleBarClick}
              />
              
              {/* Items List with Details Buttons */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {chartData.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg p-4 border border-gray-200 hover:border-[#00D632] transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{item.name}</h3>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Количество: <span className="font-medium">{item.value.toLocaleString()}</span></p>
                          {item.fillPercentage !== undefined && item.fillPercentage > 0 && (
                            <p>Заполненность: <span className={`font-medium ${
                              item.status === 'red' ? 'text-red-600' :
                              item.status === 'yellow' ? 'text-yellow-600' :
                              item.status === 'green' ? 'text-[#00D632]' : 'text-gray-600'
                            }`}>{item.fillPercentage.toFixed(1)}%</span></p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleShowDetails(item)}
                        className="ml-3 px-3 py-1.5 text-sm font-medium text-[#00D632] hover:text-[#00b32a] hover:bg-green-50 rounded-md transition-colors"
                      >
                        Подробно
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
              <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                <BarChart3 className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-900">Нет данных</p>
              <p className="text-sm text-gray-500">Измените параметры фильтрации</p>
            </div>
          )}
        </div>
      </div>

      {/* Details Panel */}
      <DetailsPanel
        isOpen={detailsPanel.isOpen}
        onClose={() => setDetailsPanel({ isOpen: false, data: null })}
        data={detailsPanel.data}
      />
    </div>
  )
}