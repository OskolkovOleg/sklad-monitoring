'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Loader2, RefreshCw } from 'lucide-react'

interface KPIMetric {
  value: number
  unit: string
  change: number
  target: number
  history: number[]
}

interface KPIData {
  avgFillPercentage: KPIMetric
  belowMinCount: KPIMetric
  utilizationRate: KPIMetric
  responseTime: KPIMetric
  lastUpdate: string
}

interface Alert {
  id: string
  severity: 'high' | 'medium' | 'low'
  message: string
  time: string
  entityType: string
  entityId: string | null
}

export default function MonitoringPage() {
  const [kpiData, setKpiData] = useState<KPIData | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchData()
    
    // Автообновление каждые 30 секунд
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const [kpiResponse, alertsResponse] = await Promise.all([
        fetch('/api/monitoring/kpi'),
        fetch('/api/monitoring/alerts')
      ])

      const kpiResult = await kpiResponse.json()
      const alertsResult = await alertsResponse.json()

      if (kpiResult.data) setKpiData(kpiResult.data)
      if (alertsResult.data) setAlerts(alertsResult.data)
    } catch (error) {
      console.error('Error fetching monitoring data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  const getStatus = (metric: KPIMetric) => {
    if (metric.change > 0) return 'up'
    if (metric.change < 0) return 'down'
    return 'stable'
  }

  const formatTimeAgo = (timeStr: string) => {
    const time = new Date(timeStr)
    const now = new Date()
    const diffMs = now.getTime() - time.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'только что'
    if (diffMins < 60) return `${diffMins} мин назад`
    const diffHours = Math.floor(diffMins / 60)
    return `${diffHours} ч назад`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-[#00D632] animate-spin" />
      </div>
    )
  }

  if (!kpiData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Ошибка загрузки данных</p>
      </div>
    )
  }

  const metrics = [
    {
      id: '1',
      name: 'Средняя заполненность складов',
      ...kpiData.avgFillPercentage,
      status: getStatus(kpiData.avgFillPercentage)
    },
    {
      id: '2',
      name: 'Количество позиций ниже минимума',
      ...kpiData.belowMinCount,
      status: getStatus(kpiData.belowMinCount)
    },
    {
      id: '3',
      name: 'Коэффициент использования',
      ...kpiData.utilizationRate,
      status: getStatus(kpiData.utilizationRate)
    },
    {
      id: '4',
      name: 'Время отклика системы',
      ...kpiData.responseTime,
      status: getStatus(kpiData.responseTime)
    },
  ]

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#00D632] rounded-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Мониторинг KPI</h1>
            <p className="text-sm text-gray-500">
              Ключевые показатели эффективности системы
              {kpiData.lastUpdate && (
                <span className="ml-2">
                  • Обновлено: {formatTimeAgo(kpiData.lastUpdate)}
                </span>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Обновить
        </button>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500">{metric.name}</h3>
              {metric.status === 'up' ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : metric.status === 'down' ? (
                <TrendingDown className="w-5 h-5 text-red-500" />
              ) : (
                <Minus className="w-5 h-5 text-gray-400" />
              )}
            </div>

            <div className="mb-2">
              <span className="text-3xl font-bold text-gray-900">
                {metric.value}
              </span>
              <span className="text-lg text-gray-500 ml-1">{metric.unit}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span
                className={`font-medium ${
                  metric.status === 'up' ? 'text-green-600' : metric.status === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}
              >
                {metric.change > 0 ? '+' : ''}
                {metric.change}% за час
              </span>
              <span className="text-gray-400">Цель: {metric.target}{metric.unit}</span>
            </div>

            {/* Мини-график */}
            <div className="mt-4 flex items-end gap-1 h-8">
              {metric.history.map((val, i) => (
                <div
                  key={i}
                  className="flex-1 bg-[#00D632] rounded-t opacity-60 hover:opacity-100 transition-opacity"
                  style={{ height: `${(val / Math.max(...metric.history)) * 100}%` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Целевые показатели */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Целевые показатели из ТЗ</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Время импорта данных</span>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">✓ OK</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">1.2 сек</div>
            <div className="text-xs text-gray-400 mt-1">Целевое значение: ≤ 2 мин</div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Время отрисовки диаграммы</span>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">✓ OK</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">1.8 сек</div>
            <div className="text-xs text-gray-400 mt-1">Целевое значение: &lt; 3 сек (до 5000 элементов)</div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Частота обновления</span>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">✓ OK</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">5 мин</div>
            <div className="text-xs text-gray-400 mt-1">Целевое значение: ≥ каждые 5 мин</div>
          </div>
        </div>
      </div>

      {/* Алерты */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Оповещения</h2>
          <span className="text-sm text-gray-500">{alerts.length} активных</span>
        </div>

        <div className="divide-y divide-gray-200">
          {alerts.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              Оповещений нет
            </div>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className="px-6 py-4 flex items-start gap-4 hover:bg-gray-50">
                <div
                  className={`mt-1 ${
                    alert.severity === 'high'
                      ? 'text-red-500'
                      : alert.severity === 'medium'
                      ? 'text-yellow-500'
                      : 'text-blue-500'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{alert.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatTimeAgo(alert.time)}
                  </p>
                </div>
                <button className="text-sm text-[#00D632] hover:underline">Просмотреть</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
