import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const level = searchParams.get('level') || 'warehouse'
    const parentId = searchParams.get('parentId')
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const supplier = searchParams.get('supplier')
    const abcClass = searchParams.get('abcClass')
    const statusFilter = searchParams.get('status')
    const sortField = searchParams.get('sortField') || 'name'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    let data: any[] = []

    if (level === 'warehouse') {
      const warehouses = await prisma.warehouse.findMany({
        include: {
          zones: {
            include: {
              locations: {
                include: {
                  inventories: {
                    include: {
                      sku: true
                    }
                  }
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
              // Применяем фильтры к SKU
              const sku = inv.sku
              if (category && sku?.category !== category) return
              if (supplier && sku?.supplier !== supplier) return
              if (abcClass && sku?.abcClass !== abcClass) return
              
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
          code: wh.code,
          value: totalQuantity,
          capacity: totalCapacity,
          fillPercentage: Math.round(fillPercentage * 10) / 10,
          entityType: 'warehouse',
          status
        }
      })

      // Применяем фильтры поиска и статуса
      if (search) {
        const searchLower = search.toLowerCase()
        data = data.filter((item: any) => 
          item.name.toLowerCase().includes(searchLower) || 
          item.code?.toLowerCase().includes(searchLower)
        )
      }
      if (statusFilter) {
        data = data.filter((item: any) => item.status === statusFilter)
      }

    } else if (level === 'zone') {
      if (!parentId) {
        return NextResponse.json({ error: 'parentId is required for zone level' }, { status: 400 })
      }

      const zones = await prisma.zone.findMany({
        where: { warehouseId: parentId },
        include: {
          locations: {
            include: {
              inventories: {
                include: {
                  sku: true
                }
              }
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
            // Применяем фильтры к SKU
            const sku = inv.sku
            if (category && sku?.category !== category) return
            if (supplier && sku?.supplier !== supplier) return
            if (abcClass && sku?.abcClass !== abcClass) return
            
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
          code: zone.code,
          value: totalQuantity,
          capacity: totalCapacity,
          fillPercentage: Math.round(fillPercentage * 10) / 10,
          entityType: 'zone',
          status
        }
      })

      // Применяем фильтры поиска и статуса
      if (search) {
        const searchLower = search.toLowerCase()
        data = data.filter((item: any) => 
          item.name.toLowerCase().includes(searchLower) || 
          item.code?.toLowerCase().includes(searchLower)
        )
      }
      if (statusFilter) {
        data = data.filter((item: any) => item.status === statusFilter)
      }

    } else if (level === 'location') {
      if (!parentId) {
        return NextResponse.json({ error: 'parentId is required for location level' }, { status: 400 })
      }

      const locations = await prisma.location.findMany({
        where: { zoneId: parentId },
        include: {
          inventories: {
            include: {
              sku: true
            }
          }
        }
      })

      data = locations.map((loc: any) => {
        let totalQuantity = 0
        const totalCapacity = loc.capacity || 0

        loc.inventories.forEach((inv: any) => {
          // Применяем фильтры к SKU
          const sku = inv.sku
          if (category && sku?.category !== category) return
          if (supplier && sku?.supplier !== supplier) return
          if (abcClass && sku?.abcClass !== abcClass) return
          
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
          code: loc.code,
          value: totalQuantity,
          capacity: totalCapacity,
          fillPercentage: Math.round(fillPercentage * 10) / 10,
          entityType: 'location',
          status
        }
      })

      // Применяем фильтры поиска и статуса
      if (search) {
        const searchLower = search.toLowerCase()
        data = data.filter((item: any) => 
          item.name.toLowerCase().includes(searchLower) || 
          item.code?.toLowerCase().includes(searchLower)
        )
      }
      if (statusFilter) {
        data = data.filter((item: any) => item.status === statusFilter)
      }

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

      // Group by SKU
      const skuMap = new Map<string, { id: string, name: string, code: string, quantity: number, category: string, supplier: string, abcClass: string }>()

      inventories.forEach((inv: any) => {
        const existing = skuMap.get(inv.skuId)
        if (existing) {
          existing.quantity += inv.quantity
        } else {
          skuMap.set(inv.skuId, {
            id: inv.skuId,
            name: inv.sku.name,
            code: inv.sku.code,
            quantity: inv.quantity,
            category: inv.sku.category,
            supplier: inv.sku.supplier,
            abcClass: inv.sku.abcClass
          })
        }
      })

      data = Array.from(skuMap.values()).map(item => ({
        id: item.id,
        name: item.name,
        code: item.code,
        value: item.quantity,
        capacity: 0,
        fillPercentage: 0,
        entityType: 'sku',
        status: 'green',
        category: item.category,
        supplier: item.supplier,
        abcClass: item.abcClass
      }))

      // Применяем фильтры для SKU
      if (category) {
        data = data.filter((item: any) => item.category === category)
      }
      if (supplier) {
        data = data.filter((item: any) => item.supplier === supplier)
      }
      if (abcClass) {
        data = data.filter((item: any) => item.abcClass === abcClass)
      }
      if (search) {
        const searchLower = search.toLowerCase()
        data = data.filter((item: any) => 
          item.name.toLowerCase().includes(searchLower) || 
          item.code?.toLowerCase().includes(searchLower)
        )
      }
    }

    // Применяем сортировку для всех уровней
    data.sort((a: any, b: any) => {
      let aVal: any
      let bVal: any

      switch (sortField) {
        case 'fillPercentage':
          aVal = a.fillPercentage || 0
          bVal = b.fillPercentage || 0
          break
        case 'totalQuantity':
        case 'availableQuantity':
          aVal = a.value || 0
          bVal = b.value || 0
          break
        case 'entityName':
        default:
          aVal = a.name || ''
          bVal = b.name || ''
          break
      }

      if (typeof aVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal, 'ru')
          : bVal.localeCompare(aVal, 'ru')
      } else {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
      }
    })

    return NextResponse.json({ data })

  } catch (error) {
    console.error('Error fetching dashboard bars:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
