'use client'

import { Download, RefreshCw, FileText } from 'lucide-react'

interface DashboardControlsProps {
  onRefresh: () => void
  onExport: () => void
  isRefreshing: boolean
}

export function DashboardControls({ onRefresh, onExport, isRefreshing }: DashboardControlsProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
        title="Обновить данные"
      >
        <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
      </button>
      
      <button
        onClick={onExport}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
      >
        <FileText className="w-4 h-4 text-gray-500" />
        <span>Экспорт отчета</span>
      </button>
      
      <button
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
      >
        <Download className="w-4 h-4" />
        <span>Скачать PDF</span>
      </button>
    </div>
  )
}
