import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import path from 'path'
import { fileURLToPath } from 'url'

const { hash } = bcrypt

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = path.join(__dirname, '..', 'dev.db')
const connectionString = `file:${dbPath}`
const adapter = new PrismaBetterSqlite3({ url: connectionString })
const prisma = new PrismaClient({ adapter })

async function seedUsers() {
  console.log('🌱 Seeding users...')

  try {
    // Создание администратора
    const adminPassword = await hash('admin123', 12)
    const admin = await prisma.user.upsert({
      where: { email: 'admin@warehouse.ru' },
      update: {
        password: adminPassword,
        role: 'admin',
        isActive: true
      },
      create: {
        email: 'admin@warehouse.ru',
        name: 'Администратор Системы',
        password: adminPassword,
        role: 'admin',
        department: 'IT',
        isActive: true,
      },
    })

    console.log('✅ Admin user created:', admin.email)

    // Создание менеджера склада
    const managerPassword = await hash('manager123', 12)
    const manager = await prisma.user.upsert({
      where: { email: 'manager@warehouse.ru' },
      update: {
        password: managerPassword,
        role: 'manager',
        isActive: true
      },
      create: {
        email: 'manager@warehouse.ru',
        name: 'Менеджер Склада',
        password: managerPassword,
        role: 'manager',
        department: 'Логистика',
        isActive: true,
      },
    })

    console.log('✅ Manager user created:', manager.email)

    // Создание обычного пользователя
    const userPassword = await hash('user123', 12)
    const user = await prisma.user.upsert({
      where: { email: 'user@warehouse.ru' },
      update: {
        password: userPassword,
        role: 'user',
        isActive: true
      },
      create: {
        email: 'user@warehouse.ru',
        name: 'Оператор Склада',
        password: userPassword,
        role: 'user',
        department: 'Склад',
        isActive: true,
      },
    })

    console.log('✅ User created:', user.email)
  } catch (e) {
    console.error(e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

seedUsers()
