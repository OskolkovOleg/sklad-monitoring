import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const warehouseId = searchParams.get('warehouseId')
    const zoneId = searchParams.get('zoneId')

    let totalQuantity = 0
    let totalCapacity = 0
    let redCount = 0
    let yellowCount = 0
    let greenCount = 0
    let grayCount = 0
    let totalPositions = 0

    // Calculate stats based on Locations
    const whereLocation: any = {}
    if (zoneId) {
      whereLocation.zoneId = zoneId
    } else if (warehouseId) {
      whereLocation.zone = { warehouseId }
    }

    const locations = await prisma.location.findMany({
      where: whereLocation,
      include: {
        inventories: true
      }
    })

    totalPositions = locations.length

    locations.forEach((loc: any) => {
      const locCapacity = loc.capacity || 0
      const locQuantity = loc.inventories.reduce((sum: number, inv: any) => sum + inv.quantity, 0)
      
      totalCapacity += locCapacity
      totalQuantity += locQuantity
      
      let fillPercentage = 0
      if (locCapacity > 0) {
        fillPercentage = (locQuantity / locCapacity) * 100
        if (fillPercentage >= 90) redCount++
        else if (fillPercentage >= 75) yellowCount++
        else greenCount++
      } else {
        grayCount++
      }
    })

    const avgFillPercentage = totalCapacity > 0 ? (totalQuantity / totalCapacity) * 100 : 0

    // Last update
    const lastUpdate = await prisma.inventory.findFirst({
      orderBy: { lastUpdated: 'desc' },
      select: { lastUpdated: true },
    })

    const kpiData = {
      avgFillPercentage: Math.round(avgFillPercentage * 10) / 10,
      totalPositions,
      redCount,
      yellowCount,
      grayCount,
      greenCount,
      lastUpdate: lastUpdate?.lastUpdated || new Date(),
      totalQuantity: Math.round(totalQuantity),
      totalCapacity: Math.round(totalCapacity),
      utilizationRate: totalCapacity > 0 ? Math.round((totalQuantity / totalCapacity) * 100) : 0,
    }

    return NextResponse.json({ data: kpiData })
  } catch (error) {
    console.error('Error fetching KPI:', error)
    return NextResponse.json(
      { error: 'Failed to fetch KPI data' },
      { status: 500 }
    )
  }
}
