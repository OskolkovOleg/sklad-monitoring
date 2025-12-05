import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { importNormsSchema } from '@/lib/validations/schemas'
import { aggregationService } from '@/lib/services/aggregation.service'
import { ZodError } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = importNormsSchema.parse(body)

    let skuNormsImported = 0
    let locationNormsImported = 0
    const errors: { message: string }[] = []

    // Импорт норм SKU
    if (validated.skuNorms) {
      for (const normData of validated.skuNorms) {
        try {
          const sku = await prisma.sKU.findUnique({
            where: { code: normData.skuCode },
          })

          if (!sku) {
            errors.push({ message: `SKU с кодом ${normData.skuCode} не найден` })
            continue
          }

          await prisma.sKUNorm.upsert({
            where: { skuId: sku.id },
            create: {
              skuId: sku.id,
              minLevel: normData.minLevel,
              targetLevel: normData.targetLevel,
              maxLevel: normData.maxLevel,
              unit: normData.unit ?? sku.unit,
            },
            update: {
              minLevel: normData.minLevel,
              targetLevel: normData.targetLevel,
              maxLevel: normData.maxLevel,
              unit: normData.unit ?? sku.unit,
            },
          })

          skuNormsImported++
        } catch (error) {
          errors.push({
            message: `Ошибка импорта нормы для SKU ${normData.skuCode}: ${
              error instanceof Error ? error.message : 'Неизвестная ошибка'
            }`,
          })
        }
      }
    }

    // Импорт норм локаций
    if (validated.locationNorms) {
      for (const normData of validated.locationNorms) {
        try {
          const location = await prisma.location.findFirst({
            where: { code: normData.locationCode },
          })

          if (!location) {
            errors.push({ message: `Локация с кодом ${normData.locationCode} не найдена` })
            continue
          }

          await prisma.locationNorm.upsert({
            where: { locationId: location.id },
            create: {
              locationId: location.id,
              minLevel: normData.minLevel,
              targetLevel: normData.targetLevel,
              maxLevel: normData.maxLevel,
              unit: normData.unit ?? location.unit ?? 'шт',
            },
            update: {
              minLevel: normData.minLevel,
              targetLevel: normData.targetLevel,
              maxLevel: normData.maxLevel,
              unit: normData.unit ?? location.unit ?? 'шт',
            },
          })

          locationNormsImported++
        } catch (error) {
          errors.push({
            message: `Ошибка импорта нормы для локации ${normData.locationCode}: ${
              error instanceof Error ? error.message : 'Неизвестная ошибка'
            }`,
          })
        }
      }
    }

    // Пересчитать агрегации после импорта норм
    if (skuNormsImported > 0 || locationNormsImported > 0) {
      await aggregationService.recalculateAll()
    }

    return NextResponse.json({
      success: true,
      skuNormsImported,
      locationNormsImported,
      errors,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Ошибка валидации', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error importing norms:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
