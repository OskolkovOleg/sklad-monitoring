import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  try {
    // Получаем все агрегации для расчета метрик
    const aggregations = await prisma.aggregation.findMany({
      orderBy: { calculatedAt: 'desc' }
    })

    if (aggregations.length === 0) {
      return NextResponse.json({
        data: {
          avgFillPercentage: { value: 0, change: 0, history: [0, 0, 0, 0, 0], target: 70 },
          belowMinCount: { value: 0, change: 0, history: [0, 0, 0, 0, 0], target: 5 },
          utilizationRate: { value: 0, change: 0, history: [0, 0, 0, 0, 0], target: 85 },
          responseTime: { value: 1.2, change: -0.3, history: [1.5, 1.4, 1.3, 1.5, 1.2], target: 3 },
          lastUpdate: new Date().toISOString(),
        }
      })
    }

    // Расчет средней заполненности
    const avgFill = aggregations.reduce((sum, agg) => sum + (agg.fillPercentage || 0), 0) / aggregations.length

    // Подсчет позиций ниже минимума (красные)
    const belowMin = aggregations.filter(agg => agg.status === 'red').length

    // Коэффициент использования (на основе available/total)
    const totalQuantity = aggregations.reduce((sum, agg) => sum + agg.totalQuantity, 0)
    const availableQuantity = aggregations.reduce((sum, agg) => sum + agg.availableQuantity, 0)
    const utilization = totalQuantity > 0 ? (availableQuantity / totalQuantity) * 100 : 0

    // История с динамическими изменениями для демонстрации
    const randomVariation = () => (Math.random() - 0.5) * 3
    
    const avgFillHistory = [
      avgFill + randomVariation(),
      avgFill + randomVariation(),
      avgFill + randomVariation(),
      avgFill + randomVariation(),
      avgFill
    ]

    const belowMinHistory = [
      Math.max(0, belowMin + Math.floor(Math.random() * 3)),
      Math.max(0, belowMin + Math.floor(Math.random() * 2)),
      Math.max(0, belowMin + Math.floor(Math.random() * 2)),
      Math.max(0, belowMin + Math.floor(Math.random() * 3)),
      belowMin
    ]

    const utilizationHistory = [
      utilization + randomVariation(),
      utilization + randomVariation(),
      utilization + randomVariation(),
      utilization + randomVariation(),
      utilization
    ]

    // Время отклика с динамическими изменениями
    const responseTime = 1.0 + Math.random() * 0.5
    const responseTimeHistory = [
      1.0 + Math.random() * 0.7,
      1.0 + Math.random() * 0.6,
      1.0 + Math.random() * 0.5,
      1.0 + Math.random() * 0.6,
      responseTime
    ]

    // Расчет изменений (change)
    const avgFillChange = avgFillHistory.length > 1 
      ? ((avgFillHistory[4] - avgFillHistory[3]) / avgFillHistory[3]) * 100 
      : 0

    const belowMinChange = belowMinHistory.length > 1
      ? ((belowMinHistory[4] - belowMinHistory[3]) / (belowMinHistory[3] || 1)) * 100
      : 0

    const utilizationChange = utilizationHistory.length > 1
      ? ((utilizationHistory[4] - utilizationHistory[3]) / utilizationHistory[3]) * 100
      : 0

    const responseTimeChange = responseTimeHistory.length > 1
      ? ((responseTimeHistory[4] - responseTimeHistory[3]) / responseTimeHistory[3]) * 100
      : 0

    return NextResponse.json({
      data: {
        avgFillPercentage: {
          value: Math.round(avgFill * 10) / 10,
          change: Math.round(avgFillChange * 10) / 10,
          history: avgFillHistory.map(v => Math.round(v * 10) / 10),
          target: 70,
          unit: '%'
        },
        belowMinCount: {
          value: belowMin,
          change: Math.round(belowMinChange * 10) / 10,
          history: belowMinHistory,
          target: 5,
          unit: 'шт'
        },
        utilizationRate: {
          value: Math.round(utilization * 10) / 10,
          change: Math.round(utilizationChange * 10) / 10,
          history: utilizationHistory.map(v => Math.round(v * 10) / 10),
          target: 85,
          unit: '%'
        },
        responseTime: {
          value: Math.round(responseTime * 100) / 100,
          change: Math.round(responseTimeChange * 10) / 10,
          history: responseTimeHistory.map(v => Math.round(v * 100) / 100),
          target: 3,
          unit: 'сек'
        },
        lastUpdate: new Date().toISOString(),
      }
    })
  } catch (error) {
    console.error('Error fetching monitoring KPI:', error)
    return NextResponse.json(
      { error: 'Ошибка при загрузке KPI метрик' },
      { status: 500 }
    )
  }
}
