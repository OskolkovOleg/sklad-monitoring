import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { aggregationService } from '@/lib/services/aggregation.service'
import { importInventorySchema } from '@/lib/validations/schemas'
import { validateInventoryData } from '@/lib/validations/schemas'
import { ZodError } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = importInventorySchema.parse(body)

    const results = {
      success: true,
      imported: 0,
      errors: [] as { row: number; message: string }[],
    }

    // Обрабатываем каждую запись
    for (let i = 0; i < validated.data.length; i++) {
      const item = validated.data[i]
      
      try {
        // Валидация данных остатков
        const validation = validateInventoryData({
          quantity: item.quantity,
          reservedQty: item.reservedQty ?? 0,
          unavailableQty: item.unavailableQty ?? 0,
        })

        if (!validation.valid) {
          results.errors.push({
            row: i + 1,
            message: validation.errors.join(', '),
          })
          continue
        }

        // Найти SKU по коду
        const sku = await prisma.sKU.findUnique({
          where: { code: item.skuCode },
        })

        if (!sku) {
          results.errors.push({
            row: i + 1,
            message: `SKU с кодом ${item.skuCode} не найден`,
          })
          continue
        }

        // Найти локацию по коду (предполагаем формат "warehouse-zone-location")
        const locationParts = item.locationCode.split('-')
        let location

        if (locationParts.length === 3) {
          // Полный код: склад-зона-локация
          const [whCode, zoneCode, locCode] = locationParts
          location = await prisma.location.findFirst({
            where: {
              code: locCode,
              zone: {
                code: zoneCode,
                warehouse: { code: whCode },
              },
            },
          })
        } else {
          // Простой поиск по коду
          location = await prisma.location.findFirst({
            where: { code: item.locationCode },
          })
        }

        if (!location) {
          results.errors.push({
            row: i + 1,
            message: `Локация с кодом ${item.locationCode} не найдена`,
          })
          continue
        }

        // Создать или обновить запись остатков
        // Use empty string as default for batchNumber to work with unique constraint
        const batchNumber = item.batchNumber || 'DEFAULT'
        
        await prisma.inventory.upsert({
          where: {
            skuId_locationId_batchNumber: {
              skuId: sku.id,
              locationId: location.id,
              batchNumber: batchNumber,
            },
          },
          create: {
            skuId: sku.id,
            locationId: location.id,
            quantity: item.quantity,
            reservedQty: item.reservedQty ?? 0,
            unavailableQty: item.unavailableQty ?? 0,
            batchNumber: batchNumber,
            expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
            status: item.status ?? 'available',
            lastUpdated: new Date(),
          },
          update: {
            quantity: item.quantity,
            reservedQty: item.reservedQty ?? 0,
            unavailableQty: item.unavailableQty ?? 0,
            expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
            status: item.status ?? 'available',
            lastUpdated: new Date(),
          },
        })

        results.imported++
      } catch (error) {
        results.errors.push({
          row: i + 1,
          message: error instanceof Error ? error.message : 'Неизвестная ошибка',
        })
      }
    }

    // Пересчитать агрегации после импорта
    if (results.imported > 0) {
      await aggregationService.recalculateAll()
    }

    return NextResponse.json(results, { status: results.errors.length > 0 ? 207 : 200 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Ошибка валидации', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error importing inventory:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') ?? '1')
    const pageSize = parseInt(searchParams.get('pageSize') ?? '100')
    const skuCode = searchParams.get('skuCode')
    const locationCode = searchParams.get('locationCode')
    const status = searchParams.get('status')

    const where: any = {}

    if (skuCode) {
      where.sku = { code: skuCode }
    }

    if (locationCode) {
      where.location = { code: locationCode }
    }

    if (status) {
      where.status = status
    }

    const [total, inventories] = await Promise.all([
      prisma.inventory.count({ where }),
      prisma.inventory.findMany({
        where,
        include: {
          sku: true,
          location: {
            include: {
              zone: {
                include: {
                  warehouse: true,
                },
              },
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { lastUpdated: 'desc' },
      }),
    ])

    return NextResponse.json({
      data: inventories,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
