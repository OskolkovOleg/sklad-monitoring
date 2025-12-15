import { hash } from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedUsers() {
  console.log('🌱 Seeding users...')

  // Создание администратора
  const adminPassword = await hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@warehouse.ru' },
    update: {},
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
    update: {},
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
    update: {},
    create: {
      email: 'user@warehouse.ru',
      name: 'Оператор Склада',
      password: userPassword,
      role: 'user',
      department: 'Склад',
      isActive: true,
    },
  })

  console.log('✅ Regular user created:', user.email)

  console.log('🎉 User seeding completed!')
}

seedUsers()
  .catch((e) => {
    console.error('❌ Error seeding users:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
