'use client'

import { useState, useEffect } from 'react'
import { Target, Edit2, Save, X, Plus, Trash2, Loader2 } from 'lucide-react'

interface Norm {
  id: string
  entityName: string
  entityType: 'warehouse' | 'zone' | 'location' | 'sku'
  minLevel: number
  targetLevel: number
  maxLevel: number
  capacity: number
  unit: string
}

export default function NormsPage() {
  const [norms, setNorms] = useState<Norm[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<Norm>>({})
  const [showAddModal, setShowAddModal] = useState(false)
  const [newNorm, setNewNorm] = useState<Partial<Norm>>({
    entityName: '',
    entityType: 'warehouse',
    minLevel: 0,
    targetLevel: 0,
    maxLevel: 0,
    capacity: 0,
    unit: 'шт',
  })

  const typeLabels = {
    warehouse: 'Склад',
    zone: 'Зона',
    location: 'Ячейка',
    sku: 'SKU',
  }

  // Загрузка нормативов
  useEffect(() => {
    fetchNorms()
  }, [])

  const fetchNorms = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/norms')
      const data = await response.json()
      if (data.data) {
        setNorms(data.data)
      }
    } catch (error) {
      console.error('Error fetching norms:', error)
      alert('Ошибка при загрузке нормативов')
    } finally {
      setLoading(false)
    }
  }

  // Начать редактирование
  const startEdit = (norm: Norm) => {
    setEditingId(norm.id)
    setEditValues(norm)
  }

  // Сохранить изменения
  const saveEdit = async () => {
    if (!editingId || !editValues) return

    // Валидация
    if (editValues.minLevel! >= editValues.targetLevel!) {
      alert('Min уровень должен быть меньше Target уровня')
      return
    }
    if (editValues.targetLevel! >= editValues.capacity!) {
      alert('Target уровень должен быть меньше вместимости')
      return
    }

    try {
      const response = await fetch('/api/norms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          minLevel: editValues.minLevel,
          targetLevel: editValues.targetLevel,
          maxLevel: editValues.capacity,
          capacity: editValues.capacity,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || 'Ошибка при сохранении')
        return
      }

      await fetchNorms()
      setEditingId(null)
      setEditValues({})
    } catch (error) {
      console.error('Error saving norm:', error)
      alert('Ошибка при сохранении норматива')
    }
  }

  // Отменить редактирование
  const cancelEdit = () => {
    setEditingId(null)
    setEditValues({})
  }

  // Удалить норматив
  const deleteNorm = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот норматив?')) return

    try {
      const response = await fetch(`/api/norms?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || 'Ошибка при удалении')
        return
      }

      await fetchNorms()
    } catch (error) {
      console.error('Error deleting norm:', error)
      alert('Ошибка при удалении норматива')
    }
  }

  // Добавить новый норматив
  const addNorm = async () => {
    if (!newNorm.entityName || !newNorm.minLevel || !newNorm.targetLevel || !newNorm.capacity) {
      alert('Заполните все обязательные поля')
      return
    }

    // Валидация
    if (newNorm.minLevel! >= newNorm.targetLevel!) {
      alert('Min уровень должен быть меньше Target уровня')
      return
    }
    if (newNorm.targetLevel! >= newNorm.capacity!) {
      alert('Target уровень должен быть меньше вместимости')
      return
    }

    try {
      const response = await fetch('/api/norms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityName: newNorm.entityName,
          entityType: newNorm.entityType,
          minLevel: newNorm.minLevel,
          targetLevel: newNorm.targetLevel,
          maxLevel: newNorm.capacity,
          capacity: newNorm.capacity,
          unit: newNorm.unit,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || 'Ошибка при создании')
        return
      }

      await fetchNorms()
      setShowAddModal(false)
      setNewNorm({
        entityName: '',
        entityType: 'warehouse',
        minLevel: 0,
        targetLevel: 0,
        maxLevel: 0,
        capacity: 0,
        unit: 'шт',
      })
    } catch (error) {
      console.error('Error creating norm:', error)
      alert('Ошибка при создании норматива')
    }
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

        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#00D632] text-white rounded-lg hover:bg-[#00b32a] transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          Добавить норматив
        </button>
      </div>

      {/* Модальное окно добавления */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Добавить норматив</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Объект</label>
                <input
                  type="text"
                  value={newNorm.entityName}
                  onChange={(e) => setNewNorm({ ...newNorm, entityName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00D632] focus:border-[#00D632]"
                  placeholder="Например: Склад №3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Тип</label>
                <select
                  value={newNorm.entityType}
                  onChange={(e) => setNewNorm({ ...newNorm, entityType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00D632] focus:border-[#00D632]"
                >
                  <option value="warehouse">Склад</option>
                  <option value="zone">Зона</option>
                  <option value="location">Ячейка</option>
                  <option value="sku">SKU</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min уровень</label>
                <input
                  type="number"
                  value={newNorm.minLevel}
                  onChange={(e) => setNewNorm({ ...newNorm, minLevel: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00D632] focus:border-[#00D632]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target уровень</label>
                <input
                  type="number"
                  value={newNorm.targetLevel}
                  onChange={(e) => setNewNorm({ ...newNorm, targetLevel: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00D632] focus:border-[#00D632]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Вместимость</label>
                <input
                  type="number"
                  value={newNorm.capacity}
                  onChange={(e) => setNewNorm({ ...newNorm, capacity: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00D632] focus:border-[#00D632]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Единица измерения</label>
                <input
                  type="text"
                  value={newNorm.unit}
                  onChange={(e) => setNewNorm({ ...newNorm, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00D632] focus:border-[#00D632]"
                  placeholder="шт"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={addNorm}
                className="flex-1 px-4 py-2 bg-[#00D632] text-white rounded-lg hover:bg-[#00b32a] transition-all"
              >
                Добавить
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#00D632] animate-spin" />
          </div>
        ) : norms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Нормативы не найдены</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-[#00D632] hover:underline"
            >
              Добавить первый норматив
            </button>
          </div>
        ) : (
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
                    <div className="text-sm font-medium text-gray-900">{norm.entityName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {typeLabels[norm.entityType]}
                    </span>
                  </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {editingId === norm.id ? (
                    <input
                      type="number"
                      value={editValues.minLevel}
                      onChange={(e) => setEditValues({ ...editValues, minLevel: parseInt(e.target.value) || 0 })}
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
                      value={editValues.targetLevel}
                      onChange={(e) => setEditValues({ ...editValues, targetLevel: parseInt(e.target.value) || 0 })}
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
                      value={editValues.capacity}
                      onChange={(e) => setEditValues({ ...editValues, capacity: parseInt(e.target.value) || 0 })}
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
                        onClick={saveEdit}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Сохранить"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                        title="Отмена"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => startEdit(norm)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Редактировать"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteNorm(norm.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
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
