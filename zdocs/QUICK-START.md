# 🚀 Быстрый старт

## Шаг 1: Установка PostgreSQL

Если PostgreSQL ещё не установлен:

**Windows:**
```powershell
# Скачайте и установите с https://www.postgresql.org/download/windows/
# Или используйте Docker:
docker run --name postgres-sklad -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15
```

**Mac:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux:**
```bash
sudo apt-get install postgresql-15
sudo service postgresql start
```

## Шаг 2: Создание базы данных

```bash
# Подключитесь к PostgreSQL
psql -U postgres

# Создайте БД
CREATE DATABASE sklad_monitoring;

# Создайте пользователя (опционально)
CREATE USER sklad_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE sklad_monitoring TO sklad_user;

# Выход
\q
```

## Шаг 3: Настройка проекта

```bash
# Отредактируйте файл .env
# DATABASE_URL="postgresql://postgres:password@localhost:5432/sklad_monitoring"

# Примените миграции
npx prisma migrate dev --name init

# Сгенерируйте Prisma Client
npx prisma generate
```

## Шаг 4: Запуск приложения

```bash
# Режим разработки
npm run dev

# Откройте в браузере
http://localhost:3000
```

## Шаг 5: Загрузка демо-данных (опционально)

```bash
# Убедитесь что приложение запущено
npm run dev

# В другом терминале:
node scripts/seed-demo-data.js
```

После загрузки откройте Dashboard:
http://localhost:3000/dashboard

## Проблемы и решения

### Ошибка подключения к БД

Проверьте:
1. PostgreSQL запущен: `pg_isready`
2. Правильный `DATABASE_URL` в `.env`
3. База данных создана

### Prisma ошибки

```bash
# Пересоздайте БД
npx prisma migrate reset

# Обновите клиент
npx prisma generate
```

### Порт 3000 занят

```bash
# Используйте другой порт
PORT=3001 npm run dev
```

## Следующие шаги

1. Изучите API в `zdocs/API-EXAMPLES.md`
2. Попробуйте создать свои данные через API
3. Используйте Dashboard для анализа
4. Настройте автоматическое обновление данных

## Полезные команды

```bash
# Prisma Studio - GUI для БД
npx prisma studio

# Форматирование схемы
npx prisma format

# Проверка типов
npm run build

# Линтинг
npm run lint
```
