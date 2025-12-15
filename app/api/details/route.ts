import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get('entityType') as 'warehouse' | 'zone' | 'location' | 'sku'
    const entityId = searchParams.get('entityId')

    if (!entityType || !entityId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    let name = ''
    let totalQuantity = 0
    let capacity = 0
    let fillPercentage = 0
    let status: 'green' | 'yellow' | 'red' | 'gray' = 'gray'
    let topSKUs: any[] = []
    let problemItems: any[] = []

    // 1. Calculate Basic Stats & Name
    if (entityType === 'warehouse') {
      const warehouse = await prisma.warehouse.findUnique({
        where: { id: entityId },
        include: {
          zones: {
            include: {
              locations: {
                include: {
                  inventories: true
                }
              }
            }
          }
        }
      })
      if (!warehouse) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      
      name = warehouse.name
      
      warehouse.zones.forEach((zone: any) => {
        zone.locations.forEach((loc: any) => {
          capacity += loc.capacity || 0
          loc.inventories.forEach((inv: any) => {
            totalQuantity += inv.quantity
          })
        })
      })

    } else if (entityType === 'zone') {
      const zone = await prisma.zone.findUnique({
        where: { id: entityId },
        include: {
          locations: {
            include: {
              inventories: true
            }
          }
        }
      })
      if (!zone) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      
      name = zone.name
      
      zone.locations.forEach((loc: any) => {
        capacity += loc.capacity || 0
        loc.inventories.forEach((inv: any) => {
          totalQuantity += inv.quantity
        })
      })

    } else if (entityType === 'location') {
      const location = await prisma.location.findUnique({
        where: { id: entityId },
        include: {
          inventories: true
        }
      })
      if (!location) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      
      name = location.name
      capacity = location.capacity || 0
      location.inventories.forEach((inv: any) => {
        totalQuantity += inv.quantity
      })

    } else if (entityType === 'sku') {
      const sku = await prisma.sKU.findUnique({
        where: { id: entityId },
        include: {
          inventories: true
        }
      })
      if (!sku) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      
      name = sku.name
      capacity = 0
      sku.inventories.forEach((inv: any) => {
        totalQuantity += inv.quantity
      })
    }

    // Calculate Fill Percentage & Status
    if (capacity > 0) {
      fillPercentage = (totalQuantity / capacity) * 100
      if (fillPercentage >= 90) status = 'red'
      else if (fillPercentage >= 75) status = 'yellow'
      else status = 'green'
    } else {
      fillPercentage = 0
      status = 'gray'
    }
    
    if (entityType === 'sku') {
        status = 'green'
    }

    // 2. Top SKUs & Problem Items
    if (entityType !== 'sku') {
       const inventoryQuery: any = {}
       if (entityType === 'warehouse') {
         inventoryQuery.location = { zone: { warehouseId: entityId } }
       } else if (entityType === 'zone') {
         inventoryQuery.location = { zoneId: entityId }
       } else if (entityType === 'location') {
         inventoryQuery.locationId = entityId
       }

       const inventories = await prisma.inventory.findMany({
        where: inventoryQuery,
        include: { sku: true }
       })

       const skuMap = new Map<string, { quantity: number; sku: any }>()
       inventories.forEach((inv: any) => {
         const existing = skuMap.get(inv.skuId)
         if (existing) {
           existing.quantity += inv.quantity
         } else {
           skuMap.set(inv.skuId, { quantity: inv.quantity, sku: inv.sku })
         }
       })

       topSKUs = Array.from(skuMap.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10)
        .map((item) => ({
          code: item.sku.code,
          name: item.sku.name,
          quantity: item.quantity,
          percentage: totalQuantity > 0 ? (item.quantity / totalQuantity) * 100 : 0,
        }))
        
       // Problem items
       const skuNorms = await prisma.sKUNorm.findMany({
        where: {
          skuId: {
            in: Array.from(skuMap.keys()),
          },
        },
        include: {
          sku: true,
        },
      })

      problemItems = skuNorms
        .map((norm: any) => {
          const item = skuMap.get(norm.skuId)
          if (!item) return null

          if (norm.minLevel && item.quantity < norm.minLevel) {
            return {
              code: item.sku.code,
              name: item.sku.name,
              issue: `Остаток ${item.quantity} ниже минимума ${norm.minLevel}`,
              severity: 'critical' as const,
            }
          }

          if (norm.targetLevel && item.quantity < norm.targetLevel) {
            return {
              code: item.sku.code,
              name: item.sku.name,
              issue: `Остаток ${item.quantity} ниже целевого уровня ${norm.targetLevel}`,
              severity: 'warning' as const,
            }
          }

          return null
        })
        .filter(Boolean)
        .slice(0, 10)
    }

    const detailedData = {
      entityId,
      entityType,
      entityName: name,
      totalQuantity,
      availableQuantity: totalQuantity,
      reservedQuantity: 0,
      capacity,
      fillPercentage,
      minLevel: 0,
      targetLevel: 0,
      maxLevel: 0,
      status,
      topSKUs,
      problemItems,
    }

    return NextResponse.json({ data: detailedData })
  } catch (error) {
    console.error('Error fetching details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch details' },
      { status: 500 }
    )
  }
}
