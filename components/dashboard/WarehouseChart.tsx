'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts'
import { getStatusColor, formatNumber, formatPercentage } from '@/lib/utils/calculations'
import type { ChartDataPoint } from '@/types'

interface WarehouseChartProps {
  data: ChartDataPoint[]
  viewMode: 'quantity' | 'percentage'
  onBarClick?: (dataPoint: ChartDataPoint) => void
}

export function WarehouseChart({ data, viewMode, onBarClick }: WarehouseChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: ChartDataPoint = payload[0].payload
      
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{data.name}</p>
          <div className="space-y-1 text-sm">
            <p className="text-gray-700">
              Количество: <span className="font-medium">{formatNumber(data.value)}</span>
            </p>
            {data.fillPercentage !== undefined && (
              <p className="text-gray-700">
                Заполненность: <span className="font-medium">{formatPercentage(data.fillPercentage)}</span>
              </p>
            )}
            {data.capacity !== undefined && (
              <p className="text-gray-700">
                Вместимость: <span className="font-medium">{formatNumber(data.capacity)}</span>
              </p>
            )}
            {data.minLevel !== undefined && (
              <p className="text-gray-700">
                Мин. уровень: <span className="font-medium">{formatNumber(data.minLevel)}</span>
              </p>
            )}
            {data.targetLevel !== undefined && (
              <p className="text-gray-700">
                Целевой уровень: <span className="font-medium">{formatNumber(data.targetLevel)}</span>
              </p>
            )}
            {data.maxLevel !== undefined && (
              <p className="text-gray-700">
                Макс. уровень: <span className="font-medium">{formatNumber(data.maxLevel)}</span>
              </p>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  const chartData = data.map((item) => ({
    ...item,
    displayValue: viewMode === 'percentage' ? item.fillPercentage ?? 0 : item.value,
  }))

  const maxValue = Math.max(...chartData.map((d) => d.displayValue))
  const yAxisMax = Math.ceil(maxValue * 1.1)

  return (
    <ResponsiveContainer width="100%" height={500}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          height={120}
          tick={{ fill: '#6b7280', fontSize: 12 }}
        />
        <YAxis
          domain={[0, yAxisMax]}
          tick={{ fill: '#6b7280' }}
          label={{
            value: viewMode === 'percentage' ? 'Заполненность (%)' : 'Количество',
            angle: -90,
            position: 'insideLeft',
            style: { fill: '#6b7280' },
          }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(156, 163, 175, 0.1)' }} />
        <Legend
          wrapperStyle={{ paddingTop: '20px' }}
          payload={[
            { value: 'Нормальный уровень (≥ target)', type: 'square', color: '#10b981' },
            { value: 'Требует внимания (min - target)', type: 'square', color: '#f59e0b' },
            { value: 'Критический уровень (< min)', type: 'square', color: '#ef4444' },
            { value: 'Нет данных', type: 'square', color: '#9ca3af' },
          ]}
        />
        
        <Bar
          dataKey="displayValue"
          cursor="pointer"
          radius={[8, 8, 0, 0]}
          animationDuration={800}
          animationEasing="ease-in-out"
          isAnimationActive={true}
          onClick={(data: any) => {
            if (data && data.name) {
              const dataPoint = chartData.find(d => d.name === data.name)
              if (dataPoint) {
                onBarClick?.(dataPoint)
              }
            }
          }}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
          ))}
        </Bar>

        {/* Референсные линии для пороговых значений */}
        {viewMode === 'quantity' && data.some((d) => d.targetLevel) && (
          <ReferenceLine
            y={data.find((d) => d.targetLevel)?.targetLevel}
            stroke="#10b981"
            strokeDasharray="3 3"
            label={{ value: 'Target', fill: '#10b981', fontSize: 12 }}
          />
        )}
        {viewMode === 'quantity' && data.some((d) => d.minLevel) && (
          <ReferenceLine
            y={data.find((d) => d.minLevel)?.minLevel}
            stroke="#ef4444"
            strokeDasharray="3 3"
            label={{ value: 'Min', fill: '#ef4444', fontSize: 12 }}
          />
        )}
        {viewMode === 'percentage' && (
          <>
            <ReferenceLine y={80} stroke="#10b981" strokeDasharray="3 3" />
            <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="3 3" />
          </>
        )}
      </BarChart>
    </ResponsiveContainer>
  )
}
