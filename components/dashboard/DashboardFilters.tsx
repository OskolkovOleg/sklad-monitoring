'use client'

import React, { useState, useEffect } from 'react'
import { Search, Filter, X, ChevronDown } from 'lucide-react'
import type { FilterParams, SortParams } from '@/types'

interface DashboardFiltersProps {
  filters: FilterParams
  sort: SortParams
  onFiltersChange: (filters: FilterParams) => void
  onSortChange: (sort: SortParams) => void
  currentLevel: 'warehouse' | 'zone' | 'location' | 'sku'
}

export function DashboardFilters({
  filters,
  sort,
  onFiltersChange,
  onSortChange,
  currentLevel,
}: DashboardFiltersProps) {
  const [warehouses, setWarehouses] = useState<{ id: string; name: string; code: string }[]>([])
  const [zones, setZones] = useState<{ id: string; name: string; code: string }[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [suppliers, setSuppliers] = useState<string[]>([])
  const [selectedWarehouses, setSelectedWarehouses] = useState<string[]>([])
  const [showWarehouseDropdown, setShowWarehouseDropdown] = useState(false)

  useEffect(() => {
    fetchFilterOptions()
  }, [])

  const fetchFilterOptions = async () => {
    try {
      // Получаем склады
      const whResponse = await fetch('/api/warehouses')
      const whData = await whResponse.json()
      setWarehouses(whData.data || [])

      // Получаем категории и поставщиков
      const skuResponse = await fetch('/api/sku')
      const skuData = await skuResponse.json()
      const skus = skuData.data || []
      
      const uniqueCategories = [...new Set(skus.map((s: any) => s.category).filter(Boolean))] as string[]
      const uniqueSuppliers = [...new Set(skus.map((s: any) => s.supplier).filter(Boolean))] as string[]
      
      setCategories(uniqueCategories)
      setSuppliers(uniqueSuppliers)
    } catch (error) {
      console.error('Error fetching filter options:', error)
    }
  }

  const handleWarehouseToggle = (warehouseId: string) => {
    const newSelection = selectedWarehouses.includes(warehouseId)
      ? selectedWarehouses.filter(id => id !== warehouseId)
      : [...selectedWarehouses, warehouseId]
    
    setSelectedWarehouses(newSelection)
    onFiltersChange({
      ...filters,
      warehouseId: newSelection.length > 0 ? newSelection.join(',') : undefined,
    })
  }

  const clearFilters = () => {
    setSelectedWarehouses([])
    onFiltersChange({})
  }

  const activeFiltersCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Фильтры и сортировка</h3>
          {activeFiltersCount > 0 && (
            <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Сбросить все
          </button>
        )}
      </div>

      {/* Поиск */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Поиск по коду или названию..."
          value={filters.search ?? ''}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value || undefined })}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Multi-select Склады - скрываем на уровне warehouse
        {/* {currentLevel !== 'warehouse' && (
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Склады
          </label>
          <button
            onClick={() => setShowWarehouseDropdown(!showWarehouseDropdown)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-700">
              {selectedWarehouses.length === 0
                ? 'Все склады'
                : `Выбрано: ${selectedWarehouses.length}`}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button> */}
          
          {/* {showWarehouseDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowWarehouseDropdown(false)}
              />
              <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {warehouses.map((wh) => (
                  <label
                    key={wh.id}
                    className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedWarehouses.includes(wh.id)}
                      onChange={() => handleWarehouseToggle(wh.id)}
                      className="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">{wh.name}</span>
                  </label>
                ))}
              </div> */}
            {/* </> */}
          {/* )} */}
        {/* </div>
        )} */}

        {/* Зона - скрываем на уровне warehouse и zone */}
        {/* {currentLevel !== 'warehouse' && currentLevel !== 'zone' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Зона
          </label>
          <select
            value={filters.zoneId ?? ''}
            onChange={(e) =>
              onFiltersChange({ ...filters, zoneId: e.target.value || undefined })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            <option value="">Все зоны</option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name}
              </option>
            ))}
          </select>)} */}
        {/* </div>         */}

        {/* Категория */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Категория
          </label>
          <select
            value={filters.category ?? ''}
            onChange={(e) =>
              onFiltersChange({ ...filters, category: e.target.value || undefined })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            <option value="">Все категории</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Поставщик */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Поставщик
          </label>
          <select
            value={filters.supplier ?? ''}
            onChange={(e) =>
              onFiltersChange({ ...filters, supplier: e.target.value || undefined })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            <option value="">Все поставщики</option>
            {suppliers.map((sup) => (
              <option key={sup} value={sup}>
                {sup}
              </option>
            ))}
          </select>
        </div>

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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            <option value="">Все классы</option>
            <option value="A">A - Высокая оборачиваемость</option>
            <option value="B">B - Средняя оборачиваемость</option>
            <option value="C">C - Низкая оборачиваемость</option>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            <option value="">Все статусы</option>
            <option value="green">✅ Норма</option>
            <option value="yellow">⚠️ Внимание</option>
            <option value="red">🔴 Дефицит</option>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            <option value="entityName">Название</option>
            <option value="fillPercentage">Заполненность %</option>
            <option value="totalQuantity">Общее количество</option>
            <option value="availableQuantity">Доступно</option>
            <option value="deviationFromMin">Отклонение от минимума</option>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            <option value="asc">↑ По возрастанию</option>
            <option value="desc">↓ По убыванию</option>
          </select>
        </div>
      </div>
    </div>
  )
}

