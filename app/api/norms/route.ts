import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// GET - получить все нормативы
export async function GET(request: NextRequest) {
  try {
    const norms = await prisma.norm.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ data: norms })
  } catch (error) {
    console.error('Error fetching norms:', error)
    return NextResponse.json(
      { error: 'Ошибка при загрузке нормативов' },
      { status: 500 }
    )
  }
}

// POST - создать новый норматив
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { entityName, entityType, entityId, minLevel, targetLevel, maxLevel, capacity, unit } = body

    // Валидация
    if (!entityName || !entityType || minLevel == null || targetLevel == null || capacity == null) {
      return NextResponse.json(
        { error: 'Заполните все обязательные поля' },
        { status: 400 }
      )
    }

    if (minLevel >= targetLevel) {
      return NextResponse.json(
        { error: 'Min уровень должен быть меньше Target уровня' },
        { status: 400 }
      )
    }

    if (targetLevel >= capacity) {
      return NextResponse.json(
        { error: 'Target уровень должен быть меньше вместимости' },
        { status: 400 }
      )
    }

    const norm = await prisma.norm.create({
      data: {
        entityName,
        entityType,
        entityId,
        minLevel: parseFloat(minLevel),
        targetLevel: parseFloat(targetLevel),
        maxLevel: parseFloat(maxLevel || capacity),
        capacity: parseFloat(capacity),
        unit: unit || 'шт',
      }
    })

    return NextResponse.json({ data: norm }, { status: 201 })
  } catch (error) {
    console.error('Error creating norm:', error)
    return NextResponse.json(
      { error: 'Ошибка при создании норматива' },
      { status: 500 }
    )
  }
}

// PUT - обновить норматив
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, minLevel, targetLevel, maxLevel, capacity } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID норматива обязателен' },
        { status: 400 }
      )
    }

    // Валидация
    if (minLevel >= targetLevel) {
      return NextResponse.json(
        { error: 'Min уровень должен быть меньше Target уровня' },
        { status: 400 }
      )
    }

    if (targetLevel >= capacity) {
      return NextResponse.json(
        { error: 'Target уровень должен быть меньше вместимости' },
        { status: 400 }
      )
    }

    const norm = await prisma.norm.update({
      where: { id },
      data: {
        minLevel: parseFloat(minLevel),
        targetLevel: parseFloat(targetLevel),
        maxLevel: parseFloat(maxLevel || capacity),
        capacity: parseFloat(capacity),
      }
    })

    return NextResponse.json({ data: norm })
  } catch (error) {
    console.error('Error updating norm:', error)
    return NextResponse.json(
      { error: 'Ошибка при обновлении норматива' },
      { status: 500 }
    )
  }
}

// DELETE - удалить норматив
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID норматива обязателен' },
        { status: 400 }
      )
    }

    await prisma.norm.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting norm:', error)
    return NextResponse.json(
      { error: 'Ошибка при удалении норматива' },
      { status: 500 }
    )
  }
}
