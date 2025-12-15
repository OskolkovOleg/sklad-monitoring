import { Activity, AlertTriangle, TrendingUp, Clock, Package } from 'lucide-react'

export interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: 'activity' | 'alert' | 'trending' | 'clock' | 'package'
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'blue' | 'red' | 'yellow' | 'gray' | 'green'
}

const iconMap = {
  activity: Activity,
  alert: AlertTriangle,
  trending: TrendingUp,
  clock: Clock,
  package: Package,
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600',
  red: 'bg-red-50 text-red-600',
  yellow: 'bg-yellow-50 text-yellow-600',
  gray: 'bg-gray-50 text-gray-600',
  green: 'bg-green-50 text-green-600',
}

export function KPICard({ title, value, subtitle, icon, trend, color = 'blue' }: KPICardProps) {
  const Icon = iconMap[icon]

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 transition-all duration-500">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1 transition-opacity duration-300">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500 ml-2">от прошлого периода</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]} transition-all duration-300`}>
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </div>
  )
}
