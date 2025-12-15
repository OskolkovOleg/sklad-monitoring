import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const level = searchParams.get('level') || 'warehouse'
    const parentId = searchParams.get('parentId')

    let data: any[] = []

    if (level === 'warehouse') {
      const warehouses = await prisma.warehouse.findMany({
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

      data = warehouses.map((wh: any) => {
        let totalQuantity = 0
        let totalCapacity = 0

        wh.zones.forEach((zone: any) => {
          zone.locations.forEach((loc: any) => {
            totalCapacity += loc.capacity || 0
            loc.inventories.forEach((inv: any) => {
              totalQuantity += inv.quantity
            })
          })
        })

        const fillPercentage = totalCapacity > 0 ? (totalQuantity / totalCapacity) * 100 : 0
        
        let status = 'gray'
        if (totalCapacity > 0) {
          if (fillPercentage > 90) status = 'red'
          else if (fillPercentage > 75) status = 'yellow'
          else status = 'green'
        }

        return {
          id: wh.id,
          name: wh.name,
          value: totalQuantity,
          capacity: totalCapacity,
          fillPercentage: Math.round(fillPercentage * 10) / 10,
          entityType: 'warehouse',
          status
        }
      })

    } else if (level === 'zone') {
      if (!parentId) {
        return NextResponse.json({ error: 'parentId is required for zone level' }, { status: 400 })
      }

      const zones = await prisma.zone.findMany({
        where: { warehouseId: parentId },
        include: {
          locations: {
            include: {
              inventories: true
            }
          }
        }
      })

      data = zones.map((zone: any) => {
        let totalQuantity = 0
        let totalCapacity = 0

        zone.locations.forEach((loc: any) => {
          totalCapacity += loc.capacity || 0
          loc.inventories.forEach((inv: any) => {
            totalQuantity += inv.quantity
          })
        })

        const fillPercentage = totalCapacity > 0 ? (totalQuantity / totalCapacity) * 100 : 0

        let status = 'gray'
        if (totalCapacity > 0) {
          if (fillPercentage > 90) status = 'red'
          else if (fillPercentage > 75) status = 'yellow'
          else status = 'green'
        }

        return {
          id: zone.id,
          name: zone.name,
          value: totalQuantity,
          capacity: totalCapacity,
          fillPercentage: Math.round(fillPercentage * 10) / 10,
          entityType: 'zone',
          status
        }
      })

    } else if (level === 'location') {
      if (!parentId) {
        return NextResponse.json({ error: 'parentId is required for location level' }, { status: 400 })
      }

      const locations = await prisma.location.findMany({
        where: { zoneId: parentId },
        include: {
          inventories: true
        }
      })

      data = locations.map((loc: any) => {
        let totalQuantity = 0
        const totalCapacity = loc.capacity || 0

        loc.inventories.forEach((inv: any) => {
          totalQuantity += inv.quantity
        })

        const fillPercentage = totalCapacity > 0 ? (totalQuantity / totalCapacity) * 100 : 0

        let status = 'gray'
        if (totalCapacity > 0) {
          if (fillPercentage > 90) status = 'red'
          else if (fillPercentage > 75) status = 'yellow'
          else status = 'green'
        }

        return {
          id: loc.id,
          name: loc.name,
          value: totalQuantity,
          capacity: totalCapacity,
          fillPercentage: Math.round(fillPercentage * 10) / 10,
          entityType: 'location',
          status
        }
      })

    } else if (level === 'sku') {
      if (!parentId) {
        return NextResponse.json({ error: 'parentId is required for sku level' }, { status: 400 })
      }

      const inventories = await prisma.inventory.findMany({
        where: { locationId: parentId },
        include: {
          sku: true
        }
      })

      // Group by SKU (though usually one inventory record per SKU per location, but let's be safe)
      const skuMap = new Map<string, { id: string, name: string, quantity: number }>()

      inventories.forEach((inv: any) => {
        const existing = skuMap.get(inv.skuId)
        if (existing) {
          existing.quantity += inv.quantity
        } else {
          skuMap.set(inv.skuId, {
            id: inv.skuId,
            name: inv.sku.name,
            quantity: inv.quantity
          })
        }
      })

      data = Array.from(skuMap.values()).map(item => ({
        id: item.id,
        name: item.name,
        value: item.quantity,
        capacity: 0,
        fillPercentage: 0,
        entityType: 'sku',
        status: 'green' // Default for SKU
      }))
    }

    return NextResponse.json({ data })

  } catch (error) {
    console.error('Error fetching dashboard bars:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
