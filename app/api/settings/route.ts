import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// GET - Получить настройки
export async function GET(request: NextRequest) {
  try {
    // Получаем первую запись настроек или создаем дефолтную
    let settings = await prisma.settings.findFirst()
    
    if (!settings) {
      // Создаем настройки по умолчанию
      settings = await prisma.settings.create({
        data: {
          companyName: 'ООО "ТехноСклад"',
          systemLanguage: 'ru',
          timezone: 'Europe/Moscow',
          emailNotifications: true,
          lowStockAlerts: true,
          criticalStockAlerts: true,
          alertThreshold: 10,
          defaultView: 'quantity',
          showPercentages: true,
          chartAnimations: true,
          compactMode: false,
          redThreshold: 90,
          yellowThreshold: 75,
          autoRefresh: true,
          refreshInterval: 30,
          enableBackups: true,
          backupFrequency: 'daily',
        }
      })
    }

    return NextResponse.json({ data: settings })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// PUT - Обновить настройки
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Получаем существующую запись
    let settings = await prisma.settings.findFirst()
    
    if (!settings) {
      // Создаем если не существует
      settings = await prisma.settings.create({
        data: body
      })
    } else {
      // Обновляем существующую
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: body
      })
    }

    return NextResponse.json({ 
      data: settings,
      message: 'Настройки успешно сохранены'
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
