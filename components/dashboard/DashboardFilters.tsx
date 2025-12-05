'use client'

import React from 'react'
import { Search, Filter } from 'lucide-react'
import type { FilterParams, SortParams } from '@/types'

interface DashboardFiltersProps {
  filters: FilterParams
  sort: SortParams
  onFiltersChange: (filters: FilterParams) => void
  onSortChange: (sort: SortParams) => void
  warehouses?: { id: string; name: string }[]
  zones?: { id: string; name: string }[]
  categories?: string[]
  suppliers?: string[]
}

export function DashboardFilters({
  filters,
  sort,
  onFiltersChange,
  onSortChange,
  warehouses = [],
  zones = [],
  categories = [],
  suppliers = [],
}: DashboardFiltersProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Фильтры и сортировка</h3>
      </div>

      {/* Поиск */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Поиск по коду или названию..."
          value={filters.search ?? ''}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value || undefined })}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Склад */}
        {warehouses.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Склад
            </label>
            <select
              value={filters.warehouseId ?? ''}
              onChange={(e) =>
                onFiltersChange({ ...filters, warehouseId: e.target.value || undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Все склады</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Зона */}
        {zones.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Зона
            </label>
            <select
              value={filters.zoneId ?? ''}
              onChange={(e) =>
                onFiltersChange({ ...filters, zoneId: e.target.value || undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Все зоны</option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Категория */}
        {categories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Категория
            </label>
            <select
              value={filters.category ?? ''}
              onChange={(e) =>
                onFiltersChange({ ...filters, category: e.target.value || undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Все категории</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Поставщик */}
        {suppliers.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Поставщик
            </label>
            <select
              value={filters.supplier ?? ''}
              onChange={(e) =>
                onFiltersChange({ ...filters, supplier: e.target.value || undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Все поставщики</option>
              {suppliers.map((sup) => (
                <option key={sup} value={sup}>
                  {sup}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ABC класс */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ABC класс
          </label>
          <select
            value={filters.abcClass ?? ''}
            onChange={(e) =>
              onFiltersChange({ ...filters, abcClass: e.target.value as any || undefined })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">Все классы</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </div>

        {/* Статус */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Статус
          </label>
          <select
            value={filters.status ?? ''}
            onChange={(e) =>
              onFiltersChange({ ...filters, status: e.target.value as any || undefined })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">Все статусы</option>
            <option value="green">✅ Нормальный</option>
            <option value="yellow">⚠️ Требует внимания</option>
            <option value="red">🔴 Критический</option>
            <option value="gray">➖ Нет данных</option>
          </select>
        </div>

        {/* Сортировка по полю */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Сортировать по
          </label>
          <select
            value={sort.field}
            onChange={(e) => onSortChange({ ...sort, field: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="entityName">Название</option>
            <option value="fillPercentage">Заполненность %</option>
            <option value="totalQuantity">Общее количество</option>
            <option value="availableQuantity">Доступно</option>
            <option value="deviationFromMin">Отклонение от min</option>
          </select>
        </div>

        {/* Порядок сортировки */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Порядок
          </label>
          <select
            value={sort.order}
            onChange={(e) => onSortChange({ ...sort, order: e.target.value as 'asc' | 'desc' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="asc">По возрастанию</option>
            <option value="desc">По убыванию</option>
          </select>
        </div>
      </div>

      {/* Кнопка сброса фильтров */}
      {(filters.search || filters.warehouseId || filters.zoneId || filters.category || 
        filters.supplier || filters.abcClass || filters.status) && (
        <button
          onClick={() => onFiltersChange({})}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Сбросить все фильтры
        </button>
      )}
    </div>
  )
}
