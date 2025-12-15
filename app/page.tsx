import Link from 'next/link'
import { BarChart3, Database, TrendingUp, Package, Lock } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-full mb-6">
            <BarChart3 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-6xl font-extrabold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            АС ВСКЗ
          </h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Визуализация складской заполненности
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Профессиональная система мониторинга остатков и управления складскими мощностями
            с поддержкой drill-down навигации, KPI-аналитики и импорта данных
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Lock className="w-6 h-6" />
              Войти в систему
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 text-lg font-semibold rounded-lg hover:bg-gray-50 transition-all shadow-lg border-2 border-indigo-600"
            >
              <BarChart3 className="w-6 h-6" />
              Dashboard
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Database className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Интеграция данных</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Импорт из CSV, подключение к WMS/ERP, валидация и нормализация данных об остатках
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>✓ Загрузка остатков</li>
              <li>✓ Импорт нормативов</li>
              <li>✓ Синхронизация структуры</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">KPI Аналитика</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Мониторинг ключевых показателей: заполненность, дефициты, отклонения от нормы
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>✓ Средняя заполненность</li>
              <li>✓ Критические позиции</li>
              <li>✓ ABC-анализ</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Package className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Drill-down</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Интерактивная навигация по иерархии: Склад → Зона → Локация → SKU
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>✓ Breadcrumbs навигация</li>
              <li>✓ Детальные панели</li>
              <li>✓ Цветовая индикация</li>
            </ul>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Основные возможности</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">📊 Визуальный мониторинг</h3>
              <p className="text-gray-600 text-sm">
                Наглядное отображение текущих остатков и заполненности складских мощностей
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🎯 Пороговые уровни</h3>
              <p className="text-gray-600 text-sm">
                Цветовая индикация: зелёный (≥ target), жёлтый (min-target), красный (&lt; min)
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🔍 Drill-down навигация</h3>
              <p className="text-gray-600 text-sm">
                Детализация от склада к зонам, локациям и конкретным SKU
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">⚡ Быстрая фильтрация</h3>
              <p className="text-gray-600 text-sm">
                Фильтры по складу, зоне, категории, поставщику, ABC-классу и статусу
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">📈 Гибкая сортировка</h3>
              <p className="text-gray-600 text-sm">
                Сортировка по заполненности, количеству, отклонению от нормы
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🔄 Автообновление</h3>
              <p className="text-gray-600 text-sm">
                Поддержка обновления данных каждые 5 минут для актуальной информации
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-600">
          <p className="text-sm">
            АО «Консист ОС» | Разработано в соответствии с ГОСТ Р 59793-2021 и ГОСТ 34.602-2020
          </p>
        </div>
      </div>
    </div>
  )
}

