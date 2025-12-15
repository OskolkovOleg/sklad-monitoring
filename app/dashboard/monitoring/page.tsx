'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react'

interface KPIMetric {
  id: string
  name: string
  value: number
  unit: string
  change: number
  status: 'up' | 'down' | 'stable'
  target: number
  history: number[]
}

export default function MonitoringPage() {
  const [metrics, setMetrics] = useState<KPIMetric[]>([
    {
      id: '1',
      name: 'Средняя заполненность складов',
      value: 43.8,
      unit: '%',
      change: 2.5,
      status: 'down',
      target: 70,
      history: [45, 46, 44, 45, 43.8],
    },
    {
      id: '2',
      name: 'Количество позиций ниже минимума',
      value: 12,
      unit: 'шт',
      change: -3,
      status: 'up',
      target: 5,
      history: [15, 14, 13, 15, 12],
    },
    {
      id: '3',
      name: 'Коэффициент использования',
      value: 87.2,
      unit: '%',
      change: 1.8,
      status: 'up',
      target: 85,
      history: [85, 86, 85.5, 86.8, 87.2],
    },
    {
      id: '4',
      name: 'Время отклика системы',
      value: 1.2,
      unit: 'сек',
      change: -0.3,
      status: 'up',
      target: 3,
      history: [1.5, 1.4, 1.3, 1.5, 1.2],
    },
  ])

  const alerts = [
    {
      id: '1',
      severity: 'high',
      message: 'Зона А-1: остаток ниже минимального уровня на 15%',
      time: new Date(Date.now() - 300000),
    },
    {
      id: '2',
      severity: 'medium',
      message: 'Склад №2: заполненность превысила 95%',
      time: new Date(Date.now() - 600000),
    },
    {
      id: '3',
      severity: 'low',
      message: 'Обновление справочника SKU завершено',
      time: new Date(Date.now() - 900000),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-[#00D632] rounded-lg">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Мониторинг KPI</h1>
          <p className="text-sm text-gray-500">Ключевые показатели эффективности системы</p>
        </div>
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
          {alerts.map((alert) => (
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
                  {Math.floor((Date.now() - alert.time.getTime()) / 60000)} минут назад
                </p>
              </div>
              <button className="text-sm text-[#00D632] hover:underline">Просмотреть</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
