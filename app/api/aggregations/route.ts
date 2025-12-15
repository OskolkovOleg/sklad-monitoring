import { NextRequest, NextResponse } from 'next/server'
import { getMockData } from '@/lib/data/mock-data'
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

    // Получаем моковые данные
    let aggregations = getMockData(validated.entityType)

    // ========== ПРИМЕНЯЕМ ВСЕ ФИЛЬТРЫ ==========
    if (validated.filters) {
      // Фильтр по статусу
      if (validated.filters.status) {
        aggregations = aggregations.filter((agg) => agg.status === validated.filters!.status)
      }

      // Фильтр по складу (множественный выбор через запятую)
      if (validated.filters.warehouseId) {
        const warehouseIds = validated.filters.warehouseId.split(',')
        aggregations = aggregations.filter((agg) => 
          warehouseIds.some(id => agg.entityCode === id || agg.entityName.includes(id))
        )
      }

      // Фильтр по зоне
      if (validated.filters.zoneId) {
        aggregations = aggregations.filter((agg) => 
          agg.entityCode === validated.filters!.zoneId ||
          agg.entityName.includes(validated.filters!.zoneId || '')
        )
      }

      // Фильтр по категории
      if (validated.filters.category) {
        aggregations = aggregations.filter((agg) => 
          agg.entityName.includes(validated.filters!.category || '')
        )
      }

      // Фильтр по поставщику
      if (validated.filters.supplier) {
        aggregations = aggregations.filter((agg) => 
          agg.entityName.includes(validated.filters!.supplier || '')
        )
      }

      // Фильтр по ABC классу
      if (validated.filters.abcClass) {
        aggregations = aggregations.filter((agg) => 
          agg.entityName.includes(validated.filters!.abcClass || '')
        )
      }

      // Поиск по коду и названию
      if (validated.filters.search) {
        const search = validated.filters.search.toLowerCase()
        aggregations = aggregations.filter(
          (agg) =>
            agg.entityCode.toLowerCase().includes(search) ||
            agg.entityName.toLowerCase().includes(search)
        )
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
        { error: 'Ошибка валидации', details: error.issues },
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
