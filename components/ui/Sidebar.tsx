'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { 
  LayoutDashboard, 
  Activity, 
  FileText, 
  Settings, 
  LogOut, 
  User,
  ChevronRight,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Отчеты', href: '/dashboard/reports', icon: FileText },
  { name: 'Настройки', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="sr-only">Open sidebar</span>
        {isOpen ? (
          <X className="h-6 w-6" aria-hidden="true" />
        ) : (
          <Menu className="h-6 w-6 text-gray-800" aria-hidden="true" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:flex lg:flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-16 bg-slate-950 px-6">
          <div className="flex items-center gap-2 font-bold text-xl tracking-wider">
            <Activity className="h-6 w-6 text-indigo-500" />
            <span>АС ВСКЗ</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors group",
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-white" : "text-slate-500 group-hover:text-white"
                  )}
                />
                {item.name}
                {isActive && (
                  <ChevronRight className="ml-auto h-4 w-4 text-indigo-200" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
              {session?.user?.name?.[0] || <User className="h-6 w-6" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {session?.user?.name || 'Пользователь'}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {session?.user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 bg-slate-900 rounded-lg hover:bg-slate-800 hover:text-white transition-colors border border-slate-800"
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </button>
        </div>
      </div>
    </>
  )
}
