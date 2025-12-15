import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const inventoryRowSchema = z.object({
  skuCode: z.string(),
  locationCode: z.string(),
  quantity: z.number().nonnegative(),
  reservedQty: z.number().nonnegative().optional(),
  unavailableQty: z.number().nonnegative().optional(),
  status: z.enum(['available', 'reserved', 'unavailable']).optional(),
  batchNumber: z.string().optional(),
})

const normsRowSchema = z.object({
  skuCode: z.string(),
  minLevel: z.number().nonnegative().optional(),
  targetLevel: z.number().nonnegative().optional(),
  maxLevel: z.number().nonnegative().optional(),
})

const warehouseRowSchema = z.object({
  warehouseCode: z.string(),
  warehouseName: z.string(),
  zoneCode: z.string().optional(),
  zoneName: z.string().optional(),
  locationCode: z.string().optional(),
  locationName: z.string().optional(),
  capacity: z.number().nonnegative().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Создаем лог импорта
    const importLog = await prisma.importLog.create({
      data: {
        filename: file.name,
        type,
        status: 'processing',
      },
    })

    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim())
    const dataLines = lines.slice(1)

    const errors: Array<{ row: number; message: string }> = []
    let successRows = 0
    let errorRows = 0

    try {
      if (type === 'inventory') {
        await processInventoryImport(dataLines, headers, errors, () => successRows++)
      } else if (type === 'norms') {
        await processNormsImport(dataLines, headers, errors, () => successRows++)
      } else if (type === 'warehouses') {
        await processWarehousesImport(dataLines, headers, errors, () => successRows++)
      }

      errorRows = errors.length

      // Обновляем лог
      await prisma.importLog.update({
        where: { id: importLog.id },
        data: {
          totalRows: dataLines.length,
          successRows,
          errorRows,
          status: errorRows === 0 ? 'completed' : 'failed',
          completedAt: new Date(),
          errors: JSON.stringify(errors),
        },
      })

      return NextResponse.json({
        success: errorRows === 0,
        totalRows: dataLines.length,
        successRows,
        errorRows,
        errors: errors.slice(0, 50), // Ограничиваем количество возвращаемых ошибок
      })
    } catch (error) {
      console.error('Import processing error:', error)
      
      await prisma.importLog.update({
        where: { id: importLog.id },
        data: {
          status: 'failed',
          completedAt: new Date(),
          errors: JSON.stringify([{ row: 0, message: 'Критическая ошибка обработки' }]),
        },
      })

      return NextResponse.json(
        { error: 'Failed to process import' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: 'Failed to import file' },
      { status: 500 }
    )
  }
}

async function processInventoryImport(
  lines: string[],
  headers: string[],
  errors: Array<{ row: number; message: string }>,
  onSuccess: () => void
) {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const rowNumber = i + 2 // +1 for header, +1 for 1-indexed

    try {
      const values = line.split(',').map(v => v.trim())
      const rowData: any = {}
      headers.forEach((header, index) => {
        rowData[header] = values[index]
      })

      // Преобразование числовых полей
      if (rowData.quantity) rowData.quantity = parseFloat(rowData.quantity)
      if (rowData.reservedQty) rowData.reservedQty = parseFloat(rowData.reservedQty)
      if (rowData.unavailableQty) rowData.unavailableQty = parseFloat(rowData.unavailableQty)

      const validated = inventoryRowSchema.parse(rowData)

      // Проверяем существование SKU
      const sku = await prisma.sKU.findUnique({
        where: { code: validated.skuCode },
      })

      if (!sku) {
        errors.push({ row: rowNumber, message: `SKU ${validated.skuCode} не найден` })
        continue
      }

      // Проверяем существование локации
      const location = await prisma.location.findFirst({
        where: { code: validated.locationCode },
      })

      if (!location) {
        errors.push({ row: rowNumber, message: `Локация ${validated.locationCode} не найдена` })
        continue
      }

      // Создаем или обновляем инвентарь
      const existingInventory = await prisma.inventory.findFirst({
        where: {
          skuId: sku.id,
          locationId: location.id,
          batchNumber: validated.batchNumber ?? null,
        },
      })

      if (existingInventory) {
        await prisma.inventory.update({
          where: { id: existingInventory.id },
          data: {
            quantity: validated.quantity,
            reservedQty: validated.reservedQty || 0,
            unavailableQty: validated.unavailableQty || 0,
            status: validated.status || 'available',
            lastUpdated: new Date(),
          },
        })
      } else {
        await prisma.inventory.create({
          data: {
            skuId: sku.id,
            locationId: location.id,
            quantity: validated.quantity,
            reservedQty: validated.reservedQty || 0,
            unavailableQty: validated.unavailableQty || 0,
            status: validated.status || 'available',
            batchNumber: validated.batchNumber ?? null,
          },
        })
      }

      onSuccess()
    } catch (error: any) {
      errors.push({
        row: rowNumber,
        message: error.message || 'Ошибка валидации',
      })
    }
  }
}

async function processNormsImport(
  lines: string[],
  headers: string[],
  errors: Array<{ row: number; message: string }>,
  onSuccess: () => void
) {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const rowNumber = i + 2

    try {
      const values = line.split(',').map(v => v.trim())
      const rowData: any = {}
      headers.forEach((header, index) => {
        rowData[header] = values[index]
      })

      if (rowData.minLevel) rowData.minLevel = parseFloat(rowData.minLevel)
      if (rowData.targetLevel) rowData.targetLevel = parseFloat(rowData.targetLevel)
      if (rowData.maxLevel) rowData.maxLevel = parseFloat(rowData.maxLevel)

      const validated = normsRowSchema.parse(rowData)

      const sku = await prisma.sKU.findUnique({
        where: { code: validated.skuCode },
      })

      if (!sku) {
        errors.push({ row: rowNumber, message: `SKU ${validated.skuCode} не найден` })
        continue
      }

      // Валидация: min <= target <= max
      if (
        (validated.minLevel && validated.targetLevel && validated.minLevel > validated.targetLevel) ||
        (validated.targetLevel && validated.maxLevel && validated.targetLevel > validated.maxLevel)
      ) {
        errors.push({ row: rowNumber, message: 'Некорректные значения уровней (min > target > max)' })
        continue
      }

      await prisma.sKUNorm.upsert({
        where: { skuId: sku.id },
        update: {
          minLevel: validated.minLevel,
          targetLevel: validated.targetLevel,
          maxLevel: validated.maxLevel,
        },
        create: {
          skuId: sku.id,
          minLevel: validated.minLevel,
          targetLevel: validated.targetLevel,
          maxLevel: validated.maxLevel,
        },
      })

      onSuccess()
    } catch (error: any) {
      errors.push({
        row: rowNumber,
        message: error.message || 'Ошибка валидации',
      })
    }
  }
}

async function processWarehousesImport(
  lines: string[],
  headers: string[],
  errors: Array<{ row: number; message: string }>,
  onSuccess: () => void
) {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const rowNumber = i + 2

    try {
      const values = line.split(',').map(v => v.trim())
      const rowData: any = {}
      headers.forEach((header, index) => {
        rowData[header] = values[index]
      })

      if (rowData.capacity) rowData.capacity = parseFloat(rowData.capacity)

      const validated = warehouseRowSchema.parse(rowData)

      // Создаем или находим склад
      const warehouse = await prisma.warehouse.upsert({
        where: { code: validated.warehouseCode },
        update: { name: validated.warehouseName },
        create: {
          code: validated.warehouseCode,
          name: validated.warehouseName,
        },
      })

      // Если есть зона
      if (validated.zoneCode && validated.zoneName) {
        const zone = await prisma.zone.upsert({
          where: {
            warehouseId_code: {
              warehouseId: warehouse.id,
              code: validated.zoneCode,
            },
          },
          update: { name: validated.zoneName },
          create: {
            code: validated.zoneCode,
            name: validated.zoneName,
            warehouseId: warehouse.id,
          },
        })

        // Если есть локация
        if (validated.locationCode && validated.locationName) {
          await prisma.location.upsert({
            where: {
              zoneId_code: {
                zoneId: zone.id,
                code: validated.locationCode,
              },
            },
            update: {
              name: validated.locationName,
              capacity: validated.capacity,
            },
            create: {
              code: validated.locationCode,
              name: validated.locationName,
              zoneId: zone.id,
              capacity: validated.capacity,
            },
          })
        }
      }

      onSuccess()
    } catch (error: any) {
      errors.push({
        row: rowNumber,
        message: error.message || 'Ошибка валидации',
      })
    }
  }
}
