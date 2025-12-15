'use client'

import { useState } from 'react'
import { Target, Edit2, Save, X, Plus } from 'lucide-react'

interface Norm {
  id: string
  entity: string
  type: 'warehouse' | 'zone' | 'location' | 'sku'
  minLevel: number
  targetLevel: number
  maxLevel: number
  capacity: number
  unit: string
}

export default function NormsPage() {
  const [norms, setNorms] = useState<Norm[]>([
    {
      id: '1',
      entity: 'Главный склад',
      type: 'warehouse',
      minLevel: 30000,
      targetLevel: 50000,
      maxLevel: 84930,
      capacity: 84930,
      unit: 'шт',
    },
    {
      id: '2',
      entity: 'Зона А - Электроника',
      type: 'zone',
      minLevel: 5000,
      targetLevel: 8000,
      maxLevel: 12000,
      capacity: 12000,
      unit: 'шт',
    },
    {
      id: '3',
      entity: 'Зона В - Бытовая техника',
      type: 'zone',
      minLevel: 8000,
      targetLevel: 12000,
      maxLevel: 18000,
      capacity: 18000,
      unit: 'шт',
    },
  ])

  const [editingId, setEditingId] = useState<string | null>(null)

  const typeLabels = {
    warehouse: 'Склад',
    zone: 'Зона',
    location: 'Ячейка',
    sku: 'SKU',
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#00D632] rounded-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Нормативы и вместимости</h1>
            <p className="text-sm text-gray-500">Управление min/target/max уровнями</p>
          </div>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-[#00D632] text-white rounded-lg hover:bg-[#00b32a] transition-all shadow-md">
          <Plus className="w-4 h-4" />
          Добавить норматив
        </button>
      </div>

      {/* Инструкция */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Цветовые правила</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-blue-800">
              <strong>Зелёный:</strong> ≥ Target (норма)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-blue-800">
              <strong>Жёлтый:</strong> между Min и Target (внимание)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-blue-800">
              <strong>Красный:</strong> &lt; Min (дефицит)
            </span>
          </div>
        </div>
      </div>

      {/* Таблица нормативов */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Объект
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Тип
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Min уровень
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Target уровень
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Max / Вместимость
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {norms.map((norm) => (
              <tr key={norm.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{norm.entity}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {typeLabels[norm.type]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {editingId === norm.id ? (
                    <input
                      type="number"
                      defaultValue={norm.minLevel}
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                    />
                  ) : (
                    <span className="text-sm text-red-600 font-medium">
                      {norm.minLevel.toLocaleString('ru-RU')} {norm.unit}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {editingId === norm.id ? (
                    <input
                      type="number"
                      defaultValue={norm.targetLevel}
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                    />
                  ) : (
                    <span className="text-sm text-yellow-600 font-medium">
                      {norm.targetLevel.toLocaleString('ru-RU')} {norm.unit}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {editingId === norm.id ? (
                    <input
                      type="number"
                      defaultValue={norm.capacity}
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                    />
                  ) : (
                    <span className="text-sm text-green-600 font-medium">
                      {norm.capacity.toLocaleString('ru-RU')} {norm.unit}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {editingId === norm.id ? (
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingId(norm.id)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Подсказка */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          <strong>Примечание:</strong> Изменения нормативов применяются немедленно и влияют на цветовую индикацию на дашборде.
          Убедитесь, что значения указаны корректно: Min &lt; Target &lt; Max ≤ Вместимость.
        </p>
      </div>
    </div>
  )
}
