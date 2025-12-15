'use client'

import { X, Package, TrendingUp, AlertCircle, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'

export interface DetailsPanelData {
  entityId: string
  entityType: 'warehouse' | 'zone' | 'location' | 'sku'
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
  topSKUs?: Array<{
    code: string
    name: string
    quantity: number
    percentage: number
  }>
  problemItems?: Array<{
    code: string
    name: string
    issue: string
    severity: 'critical' | 'warning' | 'info'
  }>
}

interface DetailsPanelProps {
  isOpen: boolean
  onClose: () => void
  data: DetailsPanelData | null
}

export function DetailsPanel({ isOpen, onClose, data }: DetailsPanelProps) {
  const [loading, setLoading] = useState(false)
  const [detailedData, setDetailedData] = useState<DetailsPanelData | null>(data)

  useEffect(() => {
    if (isOpen && data) {
      fetchDetailedInfo()
    }
  }, [isOpen, data])

  const fetchDetailedInfo = async () => {
    if (!data) return
    
    setLoading(true)
    try {
      // Запрос детальной информации
      const response = await fetch(
        `/api/details?entityType=${data.entityType}&entityId=${data.entityId}`
      )
      const result = await response.json()
      setDetailedData(result.data)
    } catch (error) {
      console.error('Error fetching details:', error)
      setDetailedData(data)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const statusColors = {
    green: 'text-green-600 bg-green-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    red: 'text-red-600 bg-red-50',
    gray: 'text-gray-600 bg-gray-50',
  }

  const statusLabels = {
    green: 'Норма',
    yellow: 'Внимание',
    red: 'Дефицит',
    gray: 'Нет данных',
  }

  return (
    <>
      {/* Backdrop - transparent */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-white shadow-2xl z-50 overflow-y-auto slide-in-right border-l border-gray-100">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{data?.entityName}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {data?.entityType === 'warehouse' && 'Склад'}
              {data?.entityType === 'zone' && 'Зона'}
              {data?.entityType === 'location' && 'Локация'}
              {data?.entityType === 'sku' && 'SKU'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
          </div>
        ) : detailedData ? (
          <div className="p-6 space-y-6">
            {/* Статус */}
            <div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  statusColors[detailedData.status]
                }`}
              >
                {statusLabels[detailedData.status]}
              </span>
            </div>

            {/* Основные метрики */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Текущий остаток</p>
                <p className="text-2xl font-bold text-gray-900">
                  {detailedData.totalQuantity.toLocaleString()}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Доступно</p>
                <p className="text-2xl font-bold text-green-600">
                  {detailedData.availableQuantity.toLocaleString()}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">В резерве</p>
                <p className="text-2xl font-bold text-orange-600">
                  {detailedData.reservedQuantity.toLocaleString()}
                </p>
              </div>

              {detailedData.capacity && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Вместимость</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {detailedData.capacity.toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Заполненность */}
            {detailedData.fillPercentage !== undefined && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Заполненность</span>
                  <span className="text-sm font-bold text-gray-900">
                    {detailedData.fillPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      detailedData.status === 'green'
                        ? 'bg-green-500'
                        : detailedData.status === 'yellow'
                        ? 'bg-yellow-500'
                        : detailedData.status === 'red'
                        ? 'bg-red-500'
                        : 'bg-gray-400'
                    }`}
                    style={{ width: `${Math.min(detailedData.fillPercentage, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Нормативы */}
            {(detailedData.minLevel || detailedData.targetLevel || detailedData.maxLevel) && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Нормативные уровни</h3>
                <div className="space-y-2">
                  {detailedData.minLevel && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Минимум:</span>
                      <span className="text-sm font-medium text-red-600">
                        {detailedData.minLevel.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {detailedData.targetLevel && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Целевой:</span>
                      <span className="text-sm font-medium text-green-600">
                        {detailedData.targetLevel.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {detailedData.maxLevel && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Максимум:</span>
                      <span className="text-sm font-medium text-gray-700">
                        {detailedData.maxLevel.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Топ SKU */}
            {detailedData.topSKUs && detailedData.topSKUs.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Топ SKU по занимаемому месту
                </h3>
                <div className="space-y-3">
                  {detailedData.topSKUs.map((sku, index) => (
                    <div key={sku.code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-sm font-bold">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{sku.name}</p>
                          <p className="text-xs text-gray-500">{sku.code}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{sku.quantity.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{sku.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Проблемные позиции */}
            {detailedData.problemItems && detailedData.problemItems.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
                  Проблемные позиции
                </h3>
                <div className="space-y-2">
                  {detailedData.problemItems.map((item) => (
                    <div
                      key={item.code}
                      className={`p-3 rounded-lg border-l-4 ${
                        item.severity === 'critical'
                          ? 'bg-red-50 border-red-500'
                          : item.severity === 'warning'
                          ? 'bg-yellow-50 border-yellow-500'
                          : 'bg-blue-50 border-blue-500'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.code}</p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            item.severity === 'critical'
                              ? 'bg-red-200 text-red-800'
                              : item.severity === 'warning'
                              ? 'bg-yellow-200 text-yellow-800'
                              : 'bg-blue-200 text-blue-800'
                          }`}
                        >
                          {item.severity === 'critical' ? 'Критично' : item.severity === 'warning' ? 'Внимание' : 'Инфо'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{item.issue}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </>
  )
}
