import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { createSKUSchema } from '@/lib/validations/schemas'
import { ZodError } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = createSKUSchema.parse(body)

    const sku = await prisma.sKU.create({
      data: {
        code: validated.code,
        name: validated.name,
        description: validated.description,
        category: validated.category,
        supplier: validated.supplier,
        abcClass: validated.abcClass,
        unit: validated.unit,
        isActive: true,
      },
    })

    return NextResponse.json({ success: true, data: sku }, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Ошибка валидации', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating SKU:', error)
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
    const category = searchParams.get('category')
    const supplier = searchParams.get('supplier')
    const abcClass = searchParams.get('abcClass')
    const search = searchParams.get('search')

    const where: any = { isActive: true }

    if (category) where.category = category
    if (supplier) where.supplier = supplier
    if (abcClass) where.abcClass = abcClass
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [total, skus] = await Promise.all([
      prisma.sKU.count({ where }),
      prisma.sKU.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { name: 'asc' },
      }),
    ])

    return NextResponse.json({
      data: skus,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('Error fetching SKUs:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
