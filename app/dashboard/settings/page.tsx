'use client'

import { useState, useEffect } from 'react'
import { Settings, Bell, Eye, Database, Clock, Save, AlertTriangle, Loader2 } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // Общие настройки
    companyName: 'ООО "ТехноСклад"',
    systemLanguage: 'ru',
    timezone: 'Europe/Moscow',
    
    // Уведомления
    emailNotifications: true,
    lowStockAlerts: true,
    criticalStockAlerts: true,
    alertThreshold: 10,
    
    // Отображение
    defaultView: 'quantity',
    showPercentages: true,
    chartAnimations: true,
    compactMode: false,
    
    // Пороги заполненности
    redThreshold: 90,
    yellowThreshold: 75,
    
    // Автообновление
    autoRefresh: true,
    refreshInterval: 30,
    
    // База данных
    enableBackups: true,
    backupFrequency: 'daily',
  })

  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Загрузка настроек при монтировании
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()
      if (data.data) {
        setSettings(data.data)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        alert('Ошибка при сохранении настроек')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Ошибка при сохранении настроек')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-[#00D632] animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#00D632] rounded-lg">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Настройки системы</h1>
            <p className="text-sm text-gray-500">Управление параметрами и конфигурацией</p>
          </div>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#00D632] text-white rounded-lg hover:bg-[#00b32a] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Сохранение...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Сохранить
            </>
          )}
        </button>
      </div>

      {/* Уведомление о сохранении */}
      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-800 font-medium">Настройки успешно сохранены!</span>
        </div>
      )}

      {/* Общие настройки */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
          <Settings className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Общие настройки</h2>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название организации
            </label>
            <input
              type="text"
              value={settings.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00D632] focus:border-[#00D632] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Язык интерфейса
              </label>
              <select
                value={settings.systemLanguage}
                onChange={(e) => handleChange('systemLanguage', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00D632] focus:border-[#00D632] outline-none"
              >
                <option value="ru">Русский</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Часовой пояс
              </label>
              <select
                value={settings.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00D632] focus:border-[#00D632] outline-none"
              >
                <option value="Europe/Moscow">МСК (UTC+3)</option>
                <option value="Europe/Samara">Самара (UTC+4)</option>
                <option value="Asia/Yekaterinburg">Екатеринбург (UTC+5)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Уведомления */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
          <Bell className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Уведомления</h2>
        </div>
        
        <div className="p-6 space-y-4">
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <div>
              <span className="font-medium text-gray-900">Email-уведомления</span>
              <p className="text-sm text-gray-500">Отправлять уведомления на почту</p>
            </div>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => handleChange('emailNotifications', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-[#00D632] focus:ring-[#00D632]"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <div>
              <span className="font-medium text-gray-900">Оповещения о низких остатках</span>
              <p className="text-sm text-gray-500">Уведомления при приближении к минимуму</p>
            </div>
            <input
              type="checkbox"
              checked={settings.lowStockAlerts}
              onChange={(e) => handleChange('lowStockAlerts', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-[#00D632] focus:ring-[#00D632]"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <div>
              <span className="font-medium text-gray-900">Критические оповещения</span>
              <p className="text-sm text-gray-500">Уведомления о дефиците товара</p>
            </div>
            <input
              type="checkbox"
              checked={settings.criticalStockAlerts}
              onChange={(e) => handleChange('criticalStockAlerts', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-[#00D632] focus:ring-[#00D632]"
            />
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Порог критических оповещений (% от минимума)
            </label>
            <input
              type="range"
              min="0"
              max="50"
              value={settings.alertThreshold}
              onChange={(e) => handleChange('alertThreshold', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>0%</span>
              <span className="font-medium text-gray-900">{settings.alertThreshold}%</span>
              <span>50%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Отображение */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
          <Eye className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Отображение</h2>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Режим отображения по умолчанию
            </label>
            <select
              value={settings.defaultView}
              onChange={(e) => handleChange('defaultView', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00D632] focus:border-[#00D632] outline-none"
            >
              <option value="quantity">Количество</option>
              <option value="percentage">Заполненность %</option>
            </select>
          </div>

          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <div>
              <span className="font-medium text-gray-900">Показывать проценты</span>
              <p className="text-sm text-gray-500">Отображать процент заполненности на диаграммах</p>
            </div>
            <input
              type="checkbox"
              checked={settings.showPercentages}
              onChange={(e) => handleChange('showPercentages', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-[#00D632] focus:ring-[#00D632]"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <div>
              <span className="font-medium text-gray-900">Анимации диаграмм</span>
              <p className="text-sm text-gray-500">Включить плавные переходы</p>
            </div>
            <input
              type="checkbox"
              checked={settings.chartAnimations}
              onChange={(e) => handleChange('chartAnimations', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-[#00D632] focus:ring-[#00D632]"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <div>
              <span className="font-medium text-gray-900">Компактный режим</span>
              <p className="text-sm text-gray-500">Уменьшенные отступы и размеры элементов</p>
            </div>
            <input
              type="checkbox"
              checked={settings.compactMode}
              onChange={(e) => handleChange('compactMode', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-[#00D632] focus:ring-[#00D632]"
            />
          </label>
        </div>
      </div>

      {/* Пороги заполненности */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Пороги заполненности</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Критический уровень (красный)
              </label>
              <span className="text-sm font-bold text-red-600">{settings.redThreshold}%</span>
            </div>
            <input
              type="range"
              min="70"
              max="100"
              value={settings.redThreshold}
              onChange={(e) => handleChange('redThreshold', parseInt(e.target.value))}
              className="w-full accent-red-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Заполненность выше этого значения отображается красным цветом
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Уровень внимания (желтый)
              </label>
              <span className="text-sm font-bold text-yellow-600">{settings.yellowThreshold}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="90"
              value={settings.yellowThreshold}
              onChange={(e) => handleChange('yellowThreshold', parseInt(e.target.value))}
              className="w-full accent-yellow-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Заполненность выше этого значения отображается желтым цветом
            </p>
          </div>
        </div>
      </div>

      {/* Автообновление */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
          <Clock className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Автообновление данных</h2>
        </div>
        
        <div className="p-6 space-y-4">
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <div>
              <span className="font-medium text-gray-900">Включить автообновление</span>
              <p className="text-sm text-gray-500">Автоматическое обновление данных на дашборде</p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoRefresh}
              onChange={(e) => handleChange('autoRefresh', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-[#00D632] focus:ring-[#00D632]"
            />
          </label>

          {settings.autoRefresh && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Интервал обновления (секунды)
              </label>
              <select
                value={settings.refreshInterval}
                onChange={(e) => handleChange('refreshInterval', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00D632] focus:border-[#00D632] outline-none"
              >
                <option value="10">10 секунд</option>
                <option value="30">30 секунд</option>
                <option value="60">1 минута</option>
                <option value="300">5 минут</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* База данных */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
          <Database className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">База данных</h2>
        </div>
        
        <div className="p-6 space-y-4">
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <div>
              <span className="font-medium text-gray-900">Автоматическое резервное копирование</span>
              <p className="text-sm text-gray-500">Создавать резервные копии БД</p>
            </div>
            <input
              type="checkbox"
              checked={settings.enableBackups}
              onChange={(e) => handleChange('enableBackups', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-[#00D632] focus:ring-[#00D632]"
            />
          </label>

          {settings.enableBackups && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Частота резервного копирования
              </label>
              <select
                value={settings.backupFrequency}
                onChange={(e) => handleChange('backupFrequency', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00D632] focus:border-[#00D632] outline-none"
              >
                <option value="hourly">Каждый час</option>
                <option value="daily">Ежедневно</option>
                <option value="weekly">Еженедельно</option>
              </select>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Создать резервную копию сейчас
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
