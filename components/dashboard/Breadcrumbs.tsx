'use client'

import React from 'react'
import { ChevronRight, Home } from 'lucide-react'
import type { DrillDownLevel } from '@/types'

interface BreadcrumbsProps {
  levels: DrillDownLevel[]
  onNavigate: (index: number) => void
}

export function Breadcrumbs({ levels, onNavigate }: BreadcrumbsProps) {
  const entityTypeLabels: Record<string, string> = {
    warehouse: 'Склады',
    zone: 'Зоны',
    location: 'Локации',
    sku: 'SKU',
  }

  return (
    <nav className="flex items-center space-x-2 text-sm">
      <button
        onClick={() => onNavigate(-1)}
        className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
      >
        <Home className="w-4 h-4 mr-1" />
        Главная
      </button>

      {levels.map((level, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <button
            onClick={() => onNavigate(index)}
            className={`font-medium transition-colors ${
              index === levels.length - 1
                ? 'text-gray-900 cursor-default'
                : 'text-blue-600 hover:text-blue-700'
            }`}
            disabled={index === levels.length - 1}
          >
            {level.entityName}
          </button>
        </React.Fragment>
      ))}
    </nav>
  )
}
