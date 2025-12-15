import Database from 'better-sqlite3'
import { join } from 'path'

const db = new Database(join(process.cwd(), 'prisma', 'dev.db'))

console.log('Seeding norms...')

// Создаем таблицу если не существует
db.exec(`
  CREATE TABLE IF NOT EXISTS Norm (
    id TEXT PRIMARY KEY,
    entityName TEXT NOT NULL,
    entityType TEXT NOT NULL,
    entityId TEXT,
    minLevel REAL NOT NULL,
    targetLevel REAL NOT NULL,
    maxLevel REAL NOT NULL,
    capacity REAL NOT NULL,
    unit TEXT NOT NULL DEFAULT 'шт',
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )
`)

db.exec(`CREATE INDEX IF NOT EXISTS Norm_entityType_idx ON Norm(entityType)`)
db.exec(`CREATE INDEX IF NOT EXISTS Norm_entityId_idx ON Norm(entityId)`)

// Удаляем существующие нормативы
db.exec('DELETE FROM Norm')

// Добавляем начальные нормативы
const insert = db.prepare(`
  INSERT INTO Norm (id, entityName, entityType, minLevel, targetLevel, maxLevel, capacity, unit, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

const now = new Date().toISOString()

const norms = [
  ['norm1', 'Главный склад', 'warehouse', 30000, 50000, 84930, 84930, 'шт', now, now],
  ['norm2', 'Зона А - Электроника', 'zone', 5000, 8000, 12000, 12000, 'шт', now, now],
  ['norm3', 'Зона В - Бытовая техника', 'zone', 8000, 12000, 18000, 18000, 'шт', now, now],
  ['norm4', 'Зона С - Мебель', 'zone', 3000, 5000, 8000, 8000, 'шт', now, now],
]

for (const norm of norms) {
  insert.run(...norm)
}

console.log(`✅ Created ${norms.length} norms`)

db.close()

