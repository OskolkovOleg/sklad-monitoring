'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Warehouse, Lock, Mail } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Неверный email или пароль')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('Произошла ошибка при входе')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 to-black p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[#00D632] opacity-5"></div>
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 text-white">
            <Warehouse className="w-10 h-10 text-[#00D632]" />
            <span className="text-3xl font-black tracking-tight">АС ВСКЗ</span>
          </Link>
        </div>
        
        <div className="relative z-10 space-y-6">
          <h1 className="text-5xl font-black text-white leading-tight">
            Система визуализации<br />складских запасов
          </h1>
          <p className="text-xl text-gray-400">
            Мониторинг в реальном времени. Полный контроль. Максимальная эффективность.
          </p>
          <div className="flex gap-4 pt-8">
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-2 h-2 bg-[#00D632] rounded-full"></div>
              <span className="text-sm">Автоматизация</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-2 h-2 bg-[#00D632] rounded-full"></div>
              <span className="text-sm">Аналитика</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-2 h-2 bg-[#00D632] rounded-full"></div>
              <span className="text-sm">Контроль</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-gray-500">
          © 2025 АС ВСКЗ. Все права защищены.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-black">
        <div className="max-w-md w-full space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2 text-white">
              <Warehouse className="w-8 h-8 text-[#00D632]" />
              <span className="text-2xl font-black tracking-tight">АС ВСКЗ</span>
            </Link>
          </div>

          <div className="text-center">
            <h2 className="text-4xl font-black text-white mb-3">
              Добро пожаловать
            </h2>
            <p className="text-gray-400 text-lg">
              Войдите в систему мониторинга
            </p>
          </div>

          <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="text-sm font-medium text-gray-300 mb-2 block">
                  Email адрес
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00D632] focus:ring-2 focus:ring-[#00D632] focus:ring-opacity-20 transition-all"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="text-sm font-medium text-gray-300 mb-2 block">
                  Пароль
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00D632] focus:ring-2 focus:ring-[#00D632] focus:ring-opacity-20 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-900 bg-opacity-20 border border-red-500 p-4">
                <p className="text-sm text-red-400 text-center">{error}</p>
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#00D632] hover:bg-[#00b32a] text-black font-bold rounded-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
              >
                {loading ? 'Вход...' : 'Войти в систему'}
              </button>
            </div>

            <div className="pt-6 text-center">
              <Link href="/" className="text-sm text-gray-400 hover:text-[#00D632] transition-colors">
                ← Вернуться на главную
              </Link>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-800 text-center">
            <p className="text-xs text-gray-500 mb-2">Тестовые учетные данные:</p>
            <div className="space-y-1 text-xs text-gray-400">
              <p><strong className="text-gray-300">Admin:</strong> admin@warehouse.ru / admin123</p>
              <p><strong className="text-gray-300">Manager:</strong> manager@warehouse.ru / manager123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
