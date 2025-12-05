import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getAggregationsSchema } from '@/lib/validations/schemas'
import { sortAggregations, paginateArray } from '@/lib/utils/calculations'
import { ZodError } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Парсим параметры
    const params = {
      entityType: searchParams.get('entityType') ?? 'warehouse',
      filters: {
        warehouseId: searchParams.get('warehouseId') || undefined,
        zoneId: searchParams.get('zoneId') || undefined,
        category: searchParams.get('category') || undefined,
        supplier: searchParams.get('supplier') || undefined,
        abcClass: searchParams.get('abcClass') || undefined,
        status: searchParams.get('status') || undefined,
        search: searchParams.get('search') || undefined,
      },
      sort: {
        field: (searchParams.get('sortField') as any) ?? 'entityName',
        order: (searchParams.get('sortOrder') as any) ?? 'asc',
      },
      pagination: {
        page: parseInt(searchParams.get('page') ?? '1'),
        pageSize: parseInt(searchParams.get('pageSize') ?? '100'),
      },
    }

    // Валидация
    const validated = getAggregationsSchema.parse(params)

    // Строим запрос
    const where: any = {
      entityType: validated.entityType,
    }

    if (validated.filters) {
      if (validated.filters.status) {
        where.status = validated.filters.status
      }

      if (validated.filters.search) {
        where.OR = [
          { entityCode: { contains: validated.filters.search, mode: 'insensitive' } },
          { entityName: { contains: validated.filters.search, mode: 'insensitive' } },
        ]
      }
    }

    // Получаем агрегации
    let aggregations = await prisma.aggregation.findMany({
      where,
      orderBy: { calculatedAt: 'desc' },
    })

    // Дополнительная фильтрация для SKU
    if (validated.entityType === 'sku' && validated.filters) {
      const skuIds = new Set<string>()

      if (validated.filters.category || validated.filters.supplier || validated.filters.abcClass) {
        const skuWhere: any = {}
        if (validated.filters.category) skuWhere.category = validated.filters.category
        if (validated.filters.supplier) skuWhere.supplier = validated.filters.supplier
        if (validated.filters.abcClass) skuWhere.abcClass = validated.filters.abcClass

        const skus = await prisma.sKU.findMany({
          where: skuWhere,
          select: { id: true },
        })

        skus.forEach((sku) => skuIds.add(sku.id))
        aggregations = aggregations.filter((agg) => skuIds.has(agg.entityId))
      }
    }

    // Фильтрация по складу/зоне
    if (validated.filters?.warehouseId || validated.filters?.zoneId) {
      // Для зон и локаций нужно проверить иерархию
      if (validated.entityType === 'zone' && validated.filters.warehouseId) {
        const zones = await prisma.zone.findMany({
          where: { warehouseId: validated.filters.warehouseId },
          select: { id: true },
        })
        const zoneIds = new Set(zones.map((z) => z.id))
        aggregations = aggregations.filter((agg) => zoneIds.has(agg.entityId))
      }

      if (validated.entityType === 'location') {
        if (validated.filters.zoneId) {
          const locations = await prisma.location.findMany({
            where: { zoneId: validated.filters.zoneId },
            select: { id: true },
          })
          const locationIds = new Set(locations.map((l) => l.id))
          aggregations = aggregations.filter((agg) => locationIds.has(agg.entityId))
        } else if (validated.filters.warehouseId) {
          const zones = await prisma.zone.findMany({
            where: { warehouseId: validated.filters.warehouseId },
            select: { id: true },
          })
          const zoneIds = zones.map((z) => z.id)
          const locations = await prisma.location.findMany({
            where: { zoneId: { in: zoneIds } },
            select: { id: true },
          })
          const locationIds = new Set(locations.map((l) => l.id))
          aggregations = aggregations.filter((agg) => locationIds.has(agg.entityId))
        }
      }
    }

    // Сортировка
    if (validated.sort) {
      aggregations = sortAggregations(
        aggregations,
        validated.sort.field,
        validated.sort.order
      )
    }

    // Пагинация
    const paginationParams = validated.pagination ?? { page: 1, pageSize: 100 }
    const result = paginateArray(
      aggregations,
      paginationParams.page,
      paginationParams.pageSize
    )

    return NextResponse.json({
      data: result.data,
      total: result.total,
      page: paginationParams.page,
      pageSize: paginationParams.pageSize,
      totalPages: result.totalPages,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error fetching aggregations:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
