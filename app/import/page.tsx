'use client'

import { useState } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle, X, Download } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface ImportResult {
  success: boolean
  totalRows: number
  successRows: number
  errorRows: number
  errors: Array<{
    row: number
    message: string
  }>
}

interface ImportLogEntry {
  id: string
  filename: string | null
  type: string
  totalRows: number
  successRows: number
  errorRows: number
  status: string
  startedAt: Date
  completedAt: Date | null
}

export default function ImportPage() {
  const { data: session } = useSession()
  const [file, setFile] = useState<File | null>(null)
  const [importType, setImportType] = useState<'inventory' | 'norms' | 'warehouses'>('inventory')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [importLogs, setImportLogs] = useState<ImportLogEntry[]>([])
  const [showLogs, setShowLogs] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
    }
  }

  const handleImport = async () => {
    if (!file) return

    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', importType)

      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      setResult(data)
      
      // Обновляем логи
      fetchImportLogs()
    } catch (error) {
      console.error('Import error:', error)
      setResult({
        success: false,
        totalRows: 0,
        successRows: 0,
        errorRows: 0,
        errors: [{ row: 0, message: 'Произошла ошибка при импорте файла' }],
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchImportLogs = async () => {
    try {
      const response = await fetch('/api/import/logs')
      const data = await response.json()
      setImportLogs(data.data || [])
    } catch (error) {
      console.error('Error fetching logs:', error)
    }
  }

  const downloadTemplate = () => {
    const templates = {
      inventory: 'skuCode,locationCode,quantity,reservedQty,status\nSKU001,LOC001,100,0,available\n',
      norms: 'skuCode,minLevel,targetLevel,maxLevel\nSKU001,50,100,200\n',
      warehouses: 'warehouseCode,warehouseName,zoneCode,zoneName,locationCode,locationName,capacity\nWH01,Главный склад,ZONE01,Зона A,LOC001,Ячейка 1,1000\n',
    }

    const blob = new Blob([templates[importType]], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `template_${importType}.csv`
    a.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Upload className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Импорт данных
                </h1>
                <p className="text-sm text-gray-600">
                  Загрузка данных из CSV файлов
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
              <p className="text-xs text-gray-500">{session?.user?.role}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Import Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Загрузка файла</h2>

              {/* Import Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тип данных
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setImportType('inventory')}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      importType === 'inventory'
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FileText className="w-8 h-8 mx-auto mb-2 text-indigo-600" />
                    <p className="font-medium text-gray-900">Остатки</p>
                    <p className="text-xs text-gray-500">Инвентарь</p>
                  </button>
                  <button
                    onClick={() => setImportType('norms')}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      importType === 'norms'
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FileText className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <p className="font-medium text-gray-900">Нормы</p>
                    <p className="text-xs text-gray-500">Min/Target/Max</p>
                  </button>
                  <button
                    onClick={() => setImportType('warehouses')}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      importType === 'warehouses'
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <p className="font-medium text-gray-900">Склады</p>
                    <p className="text-xs text-gray-500">Структура</p>
                  </button>
                </div>
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Выберите CSV файл
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  <button
                    onClick={downloadTemplate}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4" />
                    Шаблон
                  </button>
                </div>
                {file && (
                  <p className="mt-2 text-sm text-gray-600">
                    Выбран файл: <span className="font-medium">{file.name}</span>
                  </p>
                )}
              </div>

              {/* Import Button */}
              <button
                onClick={handleImport}
                disabled={!file || loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Импорт...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Загрузить данные
                  </>
                )}
              </button>

              {/* Import Result */}
              {result && (
                <div className={`mt-6 p-4 rounded-lg ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex items-start gap-3">
                    {result.success ? (
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h3 className={`font-semibold ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                        {result.success ? 'Импорт завершен успешно' : 'Импорт завершен с ошибками'}
                      </h3>
                      <div className="mt-2 text-sm">
                        <p className="text-gray-700">
                          Всего строк: <span className="font-medium">{result.totalRows}</span>
                        </p>
                        <p className="text-green-700">
                          Успешно: <span className="font-medium">{result.successRows}</span>
                        </p>
                        {result.errorRows > 0 && (
                          <p className="text-red-700">
                            Ошибок: <span className="font-medium">{result.errorRows}</span>
                          </p>
                        )}
                      </div>
                      
                      {result.errors.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-900 mb-2">Ошибки валидации:</h4>
                          <div className="space-y-1 max-h-60 overflow-y-auto">
                            {result.errors.map((error, index) => (
                              <div key={index} className="text-sm text-red-800 bg-red-100 px-3 py-2 rounded">
                                <span className="font-medium">Строка {error.row}:</span> {error.message}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Import History/Stats */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">История импорта</h3>
                <button
                  onClick={() => {
                    fetchImportLogs()
                    setShowLogs(!showLogs)
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  {showLogs ? 'Скрыть' : 'Показать'}
                </button>
              </div>
              
              {showLogs && (
                <div className="space-y-3">
                  {importLogs.length === 0 ? (
                    <p className="text-sm text-gray-500">История импорта пуста</p>
                  ) : (
                    importLogs.slice(0, 10).map((log) => (
                      <div key={log.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {log.filename || 'Без имени'}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              log.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : log.status === 'failed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {log.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>Строк: {log.totalRows} | Успешно: {log.successRows} | Ошибок: {log.errorRows}</p>
                          <p>{new Date(log.startedAt).toLocaleString('ru-RU')}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
