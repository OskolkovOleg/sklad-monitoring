import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { syncWarehousesSchema } from '@/lib/validations/schemas'
import { ZodError } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = syncWarehousesSchema.parse(body)

    let warehousesCreated = 0
    let zonesCreated = 0
    let locationsCreated = 0

    for (const whData of validated.warehouses) {
      // Создать или обновить склад
      const warehouse = await prisma.warehouse.upsert({
        where: { code: whData.code },
        create: {
          code: whData.code,
          name: whData.name,
          description: whData.description,
          isActive: true,
        },
        update: {
          name: whData.name,
          description: whData.description,
          isActive: true,
        },
      })
      warehousesCreated++

      // Обработать зоны, если есть
      if (whData.zones) {
        for (const zoneData of whData.zones) {
          const zone = await prisma.zone.upsert({
            where: {
              warehouseId_code: {
                warehouseId: warehouse.id,
                code: zoneData.code,
              },
            },
            create: {
              code: zoneData.code,
              name: zoneData.name,
              warehouseId: warehouse.id,
              isActive: true,
            },
            update: {
              name: zoneData.name,
              isActive: true,
            },
          })
          zonesCreated++

          // Обработать локации, если есть
          if (zoneData.locations) {
            for (const locData of zoneData.locations) {
              await prisma.location.upsert({
                where: {
                  zoneId_code: {
                    zoneId: zone.id,
                    code: locData.code,
                  },
                },
                create: {
                  code: locData.code,
                  name: locData.name,
                  zoneId: zone.id,
                  row: locData.row,
                  rack: locData.rack,
                  level: locData.level,
                  capacity: locData.capacity,
                  unit: locData.unit,
                  isActive: true,
                },
                update: {
                  name: locData.name,
                  row: locData.row,
                  rack: locData.rack,
                  level: locData.level,
                  capacity: locData.capacity,
                  unit: locData.unit,
                  isActive: true,
                },
              })
              locationsCreated++
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      warehousesCreated,
      zonesCreated,
      locationsCreated,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Ошибка валидации', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error syncing warehouses:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const warehouses = await prisma.warehouse.findMany({
      where: { isActive: true },
      include: {
        zones: {
          where: { isActive: true },
          include: {
            locations: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ data: warehouses })
  } catch (error) {
    console.error('Error fetching warehouses:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
