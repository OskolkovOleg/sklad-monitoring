import { prisma } from '@/lib/db/prisma'
import {
  calculateFillPercentage,
  calculateStatus,
} from '@/lib/utils/calculations'
import type { Aggregation } from '@/types'

/**
 * Сервис для расчета и обновления агрегированных данных
 */
export class AggregationService {
  /**
   * Пересчитывает все агрегации
   */
  async recalculateAll(): Promise<void> {
    await Promise.all([
      this.recalculateWarehouseAggregations(),
      this.recalculateZoneAggregations(),
      this.recalculateLocationAggregations(),
      this.recalculateSKUAggregations(),
    ])
  }

  /**
   * Пересчитывает агрегации по складам
   */
  async recalculateWarehouseAggregations(): Promise<void> {
    const warehouses = await prisma.warehouse.findMany({
      where: { isActive: true },
      include: {
        zones: {
          include: {
            locations: {
              include: {
                inventories: {
                  include: { sku: true },
                },
                norms: true,
              },
            },
          },
        },
      },
    })

    for (const warehouse of warehouses) {
      let totalQuantity = 0
      let availableQuantity = 0
      let reservedQuantity = 0
      let capacity = 0
      let minLevel = 0
      let targetLevel = 0
      let maxLevel = 0
      let hasCapacity = false
      let hasNorms = false

      for (const zone of warehouse.zones) {
        for (const location of zone.locations) {
          // Суммируем остатки
          for (const inv of location.inventories) {
            totalQuantity += inv.quantity
            if (inv.status === 'available') {
              availableQuantity += inv.quantity - inv.reservedQty
            }
            reservedQuantity += inv.reservedQty
          }

          // Суммируем вместимость и нормы
          if (location.capacity) {
            capacity += location.capacity
            hasCapacity = true
          }

          if (location.norms.length > 0) {
            const norm = location.norms[0]
            if (norm.minLevel) {
              minLevel += norm.minLevel
              hasNorms = true
            }
            if (norm.targetLevel) {
              targetLevel += norm.targetLevel
              hasNorms = true
            }
            if (norm.maxLevel) {
              maxLevel += norm.maxLevel
              hasNorms = true
            }
          }
        }
      }

      const fillPercentage = calculateFillPercentage(
        totalQuantity,
        hasCapacity ? capacity : undefined
      )
      const status = calculateStatus(
        totalQuantity,
        hasNorms ? minLevel : undefined,
        hasNorms ? targetLevel : undefined,
        hasCapacity ? capacity : undefined
      )

      await prisma.aggregation.upsert({
        where: {
          entityType_entityId: {
            entityType: 'warehouse',
            entityId: warehouse.id,
          },
        },
        create: {
          entityType: 'warehouse',
          entityId: warehouse.id,
          entityCode: warehouse.code,
          entityName: warehouse.name,
          totalQuantity,
          availableQuantity,
          reservedQuantity,
          capacity: hasCapacity ? capacity : undefined,
          fillPercentage,
          minLevel: hasNorms ? minLevel : undefined,
          targetLevel: hasNorms ? targetLevel : undefined,
          maxLevel: hasNorms ? maxLevel : undefined,
          status,
          calculatedAt: new Date(),
        },
        update: {
          entityCode: warehouse.code,
          entityName: warehouse.name,
          totalQuantity,
          availableQuantity,
          reservedQuantity,
          capacity: hasCapacity ? capacity : undefined,
          fillPercentage,
          minLevel: hasNorms ? minLevel : undefined,
          targetLevel: hasNorms ? targetLevel : undefined,
          maxLevel: hasNorms ? maxLevel : undefined,
          status,
          calculatedAt: new Date(),
        },
      })
    }
  }

  /**
   * Пересчитывает агрегации по зонам
   */
  async recalculateZoneAggregations(): Promise<void> {
    const zones = await prisma.zone.findMany({
      where: { isActive: true },
      include: {
        warehouse: true,
        locations: {
          include: {
            inventories: true,
            norms: true,
          },
        },
      },
    })

    for (const zone of zones) {
      let totalQuantity = 0
      let availableQuantity = 0
      let reservedQuantity = 0
      let capacity = 0
      let minLevel = 0
      let targetLevel = 0
      let maxLevel = 0
      let hasCapacity = false
      let hasNorms = false

      for (const location of zone.locations) {
        for (const inv of location.inventories) {
          totalQuantity += inv.quantity
          if (inv.status === 'available') {
            availableQuantity += inv.quantity - inv.reservedQty
          }
          reservedQuantity += inv.reservedQty
        }

        if (location.capacity) {
          capacity += location.capacity
          hasCapacity = true
        }

        if (location.norms.length > 0) {
          const norm = location.norms[0]
          if (norm.minLevel) {
            minLevel += norm.minLevel
            hasNorms = true
          }
          if (norm.targetLevel) {
            targetLevel += norm.targetLevel
            hasNorms = true
          }
          if (norm.maxLevel) {
            maxLevel += norm.maxLevel
            hasNorms = true
          }
        }
      }

      const fillPercentage = calculateFillPercentage(
        totalQuantity,
        hasCapacity ? capacity : undefined
      )
      const status = calculateStatus(
        totalQuantity,
        hasNorms ? minLevel : undefined,
        hasNorms ? targetLevel : undefined,
        hasCapacity ? capacity : undefined
      )

      await prisma.aggregation.upsert({
        where: {
          entityType_entityId: {
            entityType: 'zone',
            entityId: zone.id,
          },
        },
        create: {
          entityType: 'zone',
          entityId: zone.id,
          entityCode: zone.code,
          entityName: `${zone.warehouse.name} / ${zone.name}`,
          totalQuantity,
          availableQuantity,
          reservedQuantity,
          capacity: hasCapacity ? capacity : undefined,
          fillPercentage,
          minLevel: hasNorms ? minLevel : undefined,
          targetLevel: hasNorms ? targetLevel : undefined,
          maxLevel: hasNorms ? maxLevel : undefined,
          status,
          calculatedAt: new Date(),
        },
        update: {
          entityCode: zone.code,
          entityName: `${zone.warehouse.name} / ${zone.name}`,
          totalQuantity,
          availableQuantity,
          reservedQuantity,
          capacity: hasCapacity ? capacity : undefined,
          fillPercentage,
          minLevel: hasNorms ? minLevel : undefined,
          targetLevel: hasNorms ? targetLevel : undefined,
          maxLevel: hasNorms ? maxLevel : undefined,
          status,
          calculatedAt: new Date(),
        },
      })
    }
  }

  /**
   * Пересчитывает агрегации по локациям
   */
  async recalculateLocationAggregations(): Promise<void> {
    const locations = await prisma.location.findMany({
      where: { isActive: true },
      include: {
        zone: {
          include: { warehouse: true },
        },
        inventories: true,
        norms: true,
      },
    })

    for (const location of locations) {
      let totalQuantity = 0
      let availableQuantity = 0
      let reservedQuantity = 0

      for (const inv of location.inventories) {
        totalQuantity += inv.quantity
        if (inv.status === 'available') {
          availableQuantity += inv.quantity - inv.reservedQty
        }
        reservedQuantity += inv.reservedQty
      }

      const norm = location.norms[0]
      const fillPercentage = calculateFillPercentage(totalQuantity, location.capacity ?? undefined)
      const status = calculateStatus(
        totalQuantity,
        norm?.minLevel ?? undefined,
        norm?.targetLevel ?? undefined,
        location.capacity ?? undefined
      )

      await prisma.aggregation.upsert({
        where: {
          entityType_entityId: {
            entityType: 'location',
            entityId: location.id,
          },
        },
        create: {
          entityType: 'location',
          entityId: location.id,
          entityCode: location.code,
          entityName: `${location.zone.warehouse.name} / ${location.zone.name} / ${location.name}`,
          totalQuantity,
          availableQuantity,
          reservedQuantity,
          capacity: location.capacity ?? undefined,
          fillPercentage,
          minLevel: norm?.minLevel,
          targetLevel: norm?.targetLevel,
          maxLevel: norm?.maxLevel,
          status,
          calculatedAt: new Date(),
        },
        update: {
          entityCode: location.code,
          entityName: `${location.zone.warehouse.name} / ${location.zone.name} / ${location.name}`,
          totalQuantity,
          availableQuantity,
          reservedQuantity,
          capacity: location.capacity ?? undefined,
          fillPercentage,
          minLevel: norm?.minLevel,
          targetLevel: norm?.targetLevel,
          maxLevel: norm?.maxLevel,
          status,
          calculatedAt: new Date(),
        },
      })
    }
  }

  /**
   * Пересчитывает агрегации по SKU
   */
  async recalculateSKUAggregations(): Promise<void> {
    const skus = await prisma.sKU.findMany({
      where: { isActive: true },
      include: {
        inventories: true,
        norms: true,
      },
    })

    for (const sku of skus) {
      let totalQuantity = 0
      let availableQuantity = 0
      let reservedQuantity = 0

      for (const inv of sku.inventories) {
        totalQuantity += inv.quantity
        if (inv.status === 'available') {
          availableQuantity += inv.quantity - inv.reservedQty
        }
        reservedQuantity += inv.reservedQty
      }

      const norm = sku.norms[0]
      const status = calculateStatus(
        totalQuantity,
        norm?.minLevel ?? undefined,
        norm?.targetLevel ?? undefined
      )

      await prisma.aggregation.upsert({
        where: {
          entityType_entityId: {
            entityType: 'sku',
            entityId: sku.id,
          },
        },
        create: {
          entityType: 'sku',
          entityId: sku.id,
          entityCode: sku.code,
          entityName: sku.name,
          totalQuantity,
          availableQuantity,
          reservedQuantity,
          minLevel: norm?.minLevel,
          targetLevel: norm?.targetLevel,
          maxLevel: norm?.maxLevel,
          status,
          calculatedAt: new Date(),
        },
        update: {
          entityCode: sku.code,
          entityName: sku.name,
          totalQuantity,
          availableQuantity,
          reservedQuantity,
          minLevel: norm?.minLevel,
          targetLevel: norm?.targetLevel,
          maxLevel: norm?.maxLevel,
          status,
          calculatedAt: new Date(),
        },
      })
    }
  }
}

export const aggregationService = new AggregationService()
