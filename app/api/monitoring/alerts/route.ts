import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import type { Aggregation } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const aggregations = await prisma.aggregation.findMany({
      where: {
        status: {
          in: ['red', 'yellow']
        }
      },
      orderBy: { calculatedAt: 'desc' },
      take: 10
    })

    const alerts = aggregations.map((agg: Aggregation, index: number) => {
      let severity: 'high' | 'medium' | 'low' = 'low'
      let message = ''

      if (agg.status === 'red') {
        severity = 'high'
        const fillPct = agg.fillPercentage || 0
        message = `${agg.entityName}: критический уровень заполненности ${Math.round(fillPct)}%`
      } else if (agg.status === 'yellow') {
        severity = 'medium'
        const fillPct = agg.fillPercentage || 0
        if (fillPct > 90) {
          message = `${agg.entityName}: заполненность превысила ${Math.round(fillPct)}%`
        } else {
          message = `${agg.entityName}: требует внимания (между min и target)`
        }
      }

      // Расчет времени (от 5 минут до 1 часа назад)
      const minutesAgo = 5 + (index * 5)
      const time = new Date(Date.now() - minutesAgo * 60000)

      return {
        id: agg.id,
        severity,
        message,
        time: time.toISOString(),
        entityType: agg.entityType,
        entityId: agg.entityId
      }
    })

    // Добавляем системные алерты
    if (alerts.length < 5) {
      alerts.push({
        id: 'sys-1',
        severity: 'low',
        message: 'Обновление справочника SKU завершено',
        time: new Date(Date.now() - 900000).toISOString(),
        entityType: 'system',
        entityId: 'system'
      })
    }

    return NextResponse.json({ data: alerts })
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { error: 'Ошибка при загрузке оповещений' },
      { status: 500 }
    )
  }
}
