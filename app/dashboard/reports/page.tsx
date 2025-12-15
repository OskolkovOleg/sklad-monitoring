'use client'

import { useState, useEffect } from 'react'
import { FileText, Download, Calendar, Filter, RefreshCw } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'

interface ExportRecord {
  id: string
  filename: string
  reportType: string
  entityType: string | null
  recordCount: number
  filters: string | null
  exportedBy: string | null
  exportedAt: string
}

const reportTypeLabels: Record<string, string> = {
  warehouse_status: 'Статус складов',
  kpi_report: 'KPI отчет',
  inventory_report: 'Отчет по остаткам',
}

const entityTypeLabels: Record<string, string> = {
  warehouse: 'Склады',
  zone: 'Зоны',
  location: 'Локации',
  sku: 'Товары (SKU)',
}

export default function ReportsPage() {
  const [exports, setExports] = useState<ExportRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('')

  const fetchExports = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterType) params.append('reportType', filterType)
      
      const response = await fetch(`/api/reports/history?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setExports(data.data)
      }
    } catch (error) {
      console.error('Error fetching exports:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExports()
  }, [filterType])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">История отчетов</h1>
          <p className="text-gray-500 mt-1">Просмотр и управление экспортированными отчетами</p>
        </div>
        <button
          onClick={fetchExports}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Обновить
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D632] focus:border-[#00D632]"
          >
            <option value="">Все типы отчетов</option>
            <option value="warehouse_status">Статус складов</option>
            <option value="kpi_report">KPI отчет</option>
            <option value="inventory_report">Отчет по остаткам</option>
          </select>
        </div>
      </div>

      {/* Export History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-[#00D632] animate-spin" />
          </div>
        ) : exports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <FileText className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-900">Нет экспортированных отчетов</p>
            <p className="text-sm">Экспортируйте данные с дашборда для просмотра истории</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Файл
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Тип отчета
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Уровень
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Записей
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Экспортировал
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {exports.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#00D632]" />
                        <span className="text-sm font-medium text-gray-900">{record.filename}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {reportTypeLabels[record.reportType] || record.reportType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {record.entityType ? entityTypeLabels[record.entityType] || record.entityType : 'Все'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.recordCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {record.exportedBy || 'Неизвестно'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDistanceToNow(new Date(record.exportedAt), {
                          addSuffix: true,
                          locale: ru,
                        })}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(record.exportedAt).toLocaleString('ru-RU')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Statistics */}
      {exports.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Всего отчетов</p>
                <p className="text-2xl font-bold text-gray-900">{exports.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <Download className="w-6 h-6 text-[#00D632]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Всего записей</p>
                <p className="text-2xl font-bold text-gray-900">
                  {exports.reduce((sum, e) => sum + e.recordCount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Последний экспорт</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDistanceToNow(new Date(exports[0].exportedAt), {
                    addSuffix: true,
                    locale: ru,
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
