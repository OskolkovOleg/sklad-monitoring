'use client'

import { useState } from 'react'
import { Database, Upload, RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react'

export default function IntegrationPage() {
  const [importing, setImporting] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(new Date())

  const handleImport = async () => {
    setImporting(true)
    // Здесь будет логика импорта
    setTimeout(() => {
      setImporting(false)
      setLastSync(new Date())
    }, 2000)
  }

  const integrationSources = [
    {
      name: 'WMS SAP',
      status: 'connected',
      lastSync: new Date(Date.now() - 300000),
      frequency: '5 минут',
      records: 15234,
    },
    {
      name: 'ERP 1C',
      status: 'connected',
      lastSync: new Date(Date.now() - 600000),
      frequency: '10 минут',
      records: 8472,
    },
    {
      name: 'Excel импорт',
      status: 'manual',
      lastSync: null,
      frequency: 'Вручную',
      records: 0,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#00D632] rounded-lg">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Интеграция данных</h1>
            <p className="text-sm text-gray-500">Подключение к WMS/ERP и импорт данных</p>
          </div>
        </div>

        <button
          onClick={handleImport}
          disabled={importing}
          className="flex items-center gap-2 px-4 py-2 bg-[#00D632] text-white rounded-lg hover:bg-[#00b32a] transition-all shadow-md disabled:opacity-50"
        >
          {importing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Синхронизация...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Запустить импорт
            </>
          )}
        </button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-500">Успешных импортов</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">1,247</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-gray-500">Ошибки</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">3</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-500">Всего записей</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">23,706</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-gray-500">Последняя синхронизация</span>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {lastSync ? lastSync.toLocaleTimeString('ru-RU') : '—'}
          </p>
        </div>
      </div>

      {/* Источники данных */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Источники данных</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {integrationSources.map((source) => (
            <div key={source.name} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <div
                  className={`w-3 h-3 rounded-full ${
                    source.status === 'connected' ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
                <div>
                  <p className="font-medium text-gray-900">{source.name}</p>
                  <p className="text-sm text-gray-500">
                    {source.lastSync
                      ? `Обновлено: ${source.lastSync.toLocaleTimeString('ru-RU')}`
                      : 'Не синхронизировано'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Частота</p>
                  <p className="font-medium text-gray-900">{source.frequency}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Записей</p>
                  <p className="font-medium text-gray-900">{source.records.toLocaleString('ru-RU')}</p>
                </div>
                <button className="px-3 py-1 text-sm text-[#00D632] hover:bg-green-50 rounded-lg border border-[#00D632] transition-colors">
                  Настроить
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Лог импорта */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">История импорта</h2>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {[
              { time: '14:35:22', type: 'success', message: 'WMS SAP: импортировано 15,234 записей' },
              { time: '14:30:15', type: 'success', message: 'ERP 1C: импортировано 8,472 записей' },
              { time: '14:25:08', type: 'warning', message: 'WMS SAP: обнаружено 3 дублирующихся записей' },
              { time: '14:20:02', type: 'success', message: 'Справочники синхронизированы' },
            ].map((log, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span className="text-gray-400 font-mono">{log.time}</span>
                <div
                  className={`w-2 h-2 rounded-full mt-1 ${
                    log.type === 'success'
                      ? 'bg-green-500'
                      : log.type === 'warning'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                />
                <span className="text-gray-700">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
