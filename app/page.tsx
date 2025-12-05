import Link from 'next/link'
import { BarChart3, Database, TrendingUp, Package } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            АС «Визуализация складской заполненности»
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Система визуализации заполненности склада — столбчатая диаграмма остатков материалов
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            <BarChart3 className="w-6 h-6" />
            Открыть Dashboard
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-8 h-8 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">Интеграция данных</h3>
            </div>
            <p className="text-gray-600">
              Получение исходных данных об остатках, движениях и нормативах из WMS/ERP систем
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-900">Аналитика</h3>
            </div>
            <p className="text-gray-600">
              Расчет заполненности, сравнение с нормами, выявление дефицитов и излишков
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-8 h-8 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-900">Визуализация</h3>
            </div>
            <p className="text-gray-600">
              Интерактивная столбчатая диаграмма с пороговыми уровнями и drill-down навигацией
            </p>
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

