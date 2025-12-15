import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function POST(request: NextRequest) {
  try {
    const changes = {
      inventoryUpdates: 0,
      movements: 0,
      greyHoles: 0,
    }

    // 1. Колебания остатков (приход/расход) - обновляем 5-10% инвентаря
    const allInventory = await prisma.inventory.findMany()
    const inventoryToUpdate = allInventory
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(allInventory.length * (0.05 + Math.random() * 0.05)))

    for (const inv of inventoryToUpdate) {
      // Изменяем количество на ±10-30%
      const changePercent = 0.1 + Math.random() * 0.2 // 10-30%
      const change = Math.floor(inv.quantity * changePercent * (Math.random() > 0.5 ? 1 : -1))
      const newQuantity = Math.max(0, inv.quantity + change)

      await prisma.inventory.update({
        where: { id: inv.id },
        data: {
          quantity: newQuantity,
          lastUpdated: new Date(),
        },
      })
      changes.inventoryUpdates++
    }

    // 2. Перемещения (часть остатков переезжает между локациями одной зоны) - 2-3 перемещения
    const zones = await prisma.zone.findMany({
      include: {
        locations: {
          include: {
            inventories: true
          },
        },
      },
    })

    const movementCount = 2 + Math.floor(Math.random() * 2) // 2-3 перемещения
    for (let i = 0; i < movementCount; i++) {
      // Выбираем случайную зону с минимум 2 локациями
      const validZones = zones.filter((z: any) => z.locations.length >= 2)
      if (validZones.length === 0) continue

      const zone = validZones[Math.floor(Math.random() * validZones.length)]
      
      // Выбираем 2 случайные локации
      const locations = zone.locations.sort(() => Math.random() - 0.5).slice(0, 2)
      const fromLocation = locations[0]
      const toLocation = locations[1]

      // Выбираем случайный инвентарь из исходной локации
      if (fromLocation.inventories.length === 0) continue
      const inventoryToMove = fromLocation.inventories[Math.floor(Math.random() * fromLocation.inventories.length)]

      // Перемещаем 30-70% количества
      const movePercent = 0.3 + Math.random() * 0.4
      const moveQuantity = Math.floor(inventoryToMove.quantity * movePercent)
      
      if (moveQuantity === 0) continue

      // Обновляем исходный инвентарь
      await prisma.inventory.update({
        where: { id: inventoryToMove.id },
        data: {
          quantity: inventoryToMove.quantity - moveQuantity,
          lastUpdated: new Date(),
        },
      })

      // Проверяем, есть ли такой SKU в целевой локации
      const existingInTarget = await prisma.inventory.findFirst({
        where: {
          locationId: toLocation.id,
          skuId: inventoryToMove.skuId,
        },
      })

      if (existingInTarget) {
        // Добавляем к существующему
        await prisma.inventory.update({
          where: { id: existingInTarget.id },
          data: {
            quantity: existingInTarget.quantity + moveQuantity,
            lastUpdated: new Date(),
          },
        })
      } else {
        // Создаем новую запись
        await prisma.inventory.create({
          data: {
            locationId: toLocation.id,
            skuId: inventoryToMove.skuId,
            quantity: moveQuantity,
            lastUpdated: new Date(),
          },
        })
      }

      changes.movements++
    }

    // 3. Периодические "дыры" в данных (1-2% позиций становятся "серые")
    const allLocations = await prisma.location.findMany()
    const locationsToGrey = allLocations
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(allLocations.length * (0.01 + Math.random() * 0.01)))

    for (const loc of locationsToGrey) {
      // Случайно выбираем: обнулить capacity или удалить весь инвентарь
      if (Math.random() > 0.5) {
        // Обнуляем capacity
        await prisma.location.update({
          where: { id: loc.id },
          data: { capacity: 0 },
        })
      } else {
        // Обнуляем весь инвентарь в этой локации
        await prisma.inventory.updateMany({
          where: { locationId: loc.id },
          data: {
            quantity: 0,
            lastUpdated: new Date(),
          },
        })
      }
      changes.greyHoles++
    }

    // Иногда восстанавливаем "серые" зоны (5% шанс)
    if (Math.random() < 0.05) {
      const greyLocations = await prisma.location.findMany({
        where: { capacity: 0 },
      })
      
      if (greyLocations.length > 0) {
        const toRestore = greyLocations.slice(0, Math.max(1, Math.floor(greyLocations.length * 0.2)))
        for (const loc of toRestore) {
          await prisma.location.update({
            where: { id: loc.id },
            data: { capacity: 100 + Math.floor(Math.random() * 400) }, // 100-500
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      changes,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error simulating tick:', error)
    return NextResponse.json(
      { error: 'Failed to simulate tick' },
      { status: 500 }
    )
  }
}
