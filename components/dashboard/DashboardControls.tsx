'use client'

import { Download, RefreshCw } from 'lucide-react'

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
        className="p-2 text-gray-500 hover:text-[#00D632] hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
        title="Обновить данные"
      >
        <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
      </button>
      
      <button
        onClick={onExport}
        className="flex items-center gap-2 px-4 py-2 bg-[#00D632] text-white rounded-lg hover:bg-[#00b32a] transition-all shadow-md hover:shadow-lg"
      >
        <Download className="w-4 h-4" />
        <span>Экспорт CSV</span>
      </button>
    </div>
  )
}
