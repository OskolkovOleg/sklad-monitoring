# 🏗 Архитектура проекта АС ВСКЗ

## 📐 Общая архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                       │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Landing   │  │  Auth Login  │  │    Dashboard     │   │
│  │   Page     │  │     Page     │  │   (Protected)    │   │
│  └────────────┘  └──────────────┘  └──────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                ┌──────────┴──────────┐
                │   Next.js Server    │
                │  (SSR + API Routes) │
                └──────────┬──────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼────────┐ ┌───────▼────────┐ ┌─────▼──────┐
│   Middleware   │ │   API Routes   │ │ NextAuth   │
│   (Auth Guard) │ │  /api/*        │ │  Provider  │
└───────┬────────┘ └───────┬────────┘ └─────┬──────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                   ┌───────▼────────┐
                   │  Prisma Client │
                   │  (ORM Layer)   │
                   └───────┬────────┘
                           │
                   ┌───────▼────────┐
                   │   PostgreSQL   │
                   │   Database     │
                   └────────────────┘
```

## 🔐 Аутентификация и авторизация

### NextAuth.js Flow
```
User Input (email/password)
    │
    ▼
/api/auth/[...nextauth] (NextAuth Route)
    │
    ▼
Credentials Provider → Validate
    │
    ├─ Hash check (bcrypt)
    ├─ User active check
    └─ Role verification
    │
    ▼
JWT Token Generation
    │
    ▼
Session Cookie (httpOnly, secure)
    │
    ▼
Protected Routes (via middleware)
```

### Роли и права доступа
- **Admin**: Все + импорт данных
- **Manager**: Просмотр + фильтры
- **User**: Только просмотр

## 📊 Data Flow (Drill-down)

```
Dashboard Page
    │
    ▼
GET /api/kpi → KPI Cards Display
    │
    ▼
GET /api/aggregations?entityType=warehouse
    │
    ▼
Prisma Query → PostgreSQL
    │
    ▼
Chart Component (Recharts)
    │
    └─► User clicks bar
         │
         ▼
    Drill-down logic
         │
         ├─ Update breadcrumbs
         ├─ Update filters
         └─ Change entityType
         │
         ▼
    GET /api/aggregations?entityType=zone&warehouseId=...
         │
         ▼
    New chart rendered
         │
         └─► User clicks bar
              │
              ▼
         GET /api/details?entityType=zone&entityId=...
              │
              ▼
         Details Panel opens
              │
              ├─ Top SKUs
              ├─ Problem items
              └─ Metrics
```

## 🗄 Модель данных

### Иерархия сущностей
```
Warehouse (Склад)
    │
    └─► Zone (Зона)
         │
         └─► Location (Локация/Ячейка)
              │
              └─► Inventory (Остатки)
                   │
                   └─► SKU (Товар)
```

### Ключевые таблицы

**Warehouse** (Склады)
- id, code, name, description
- isActive, createdAt, updatedAt

**Zone** (Зоны)
- id, code, name, warehouseId
- isActive, createdAt, updatedAt

**Location** (Локации)
- id, code, name, zoneId
- capacity, unit (вместимость)
- row, rack, level (физическое расположение)

**SKU** (Товары)
- id, code, name, description
- category, supplier, abcClass
- unit (единица измерения)

**Inventory** (Остатки)
- id, skuId, locationId
- quantity, reservedQty, unavailableQty
- batchNumber, expiryDate
- status, lastUpdated

**Aggregation** (Агрегаты для быстрой визуализации)
- entityType, entityId, entityCode, entityName
- totalQuantity, availableQuantity, reservedQuantity
- capacity, fillPercentage
- minLevel, targetLevel, maxLevel
- status (green/yellow/red/gray)

**LocationNorm / SKUNorm** (Нормативы)
- minLevel, targetLevel, maxLevel
- unit

**User** (Пользователи - NextAuth)
- email, password (hashed), role
- name, department, isActive

**ImportLog** (Логи импорта)
- filename, type, totalRows, successRows, errorRows
- status, errors (JSON)

## 🔄 Процесс импорта данных

```
1. User uploads CSV
    │
    ▼
2. POST /api/import
    │
    ├─ Create ImportLog (status: processing)
    │
    ├─ Parse CSV → validate rows
    │   │
    │   ├─ inventoryRowSchema (Zod)
    │   ├─ normsRowSchema (Zod)
    │   └─ warehouseRowSchema (Zod)
    │
    ├─ Check SKU/Location exists
    │
    ├─ Validate logic (min ≤ target ≤ max)
    │
    ├─ Upsert to database
    │   │
    │   └─ Collect errors
    │
    └─ Update ImportLog (status: completed/failed)
        │
        └─ Return result + error list
```

## 🎨 UI Components Structure

```
app/
├── page.tsx (Landing)
├── auth/login/page.tsx (Login)
├── dashboard/page.tsx (Main Dashboard)
└── import/page.tsx (Import Page - Admin only)

components/
├── Providers.tsx (SessionProvider wrapper)
└── dashboard/
    ├── KPICard.tsx (KPI метрики)
    ├── WarehouseChart.tsx (Recharts диаграмма)
    ├── DashboardFilters.tsx (Фильтры + multi-select)
    ├── DetailsPanel.tsx (Drawer с деталями)
    └── Breadcrumbs.tsx (Навигация)

lib/
├── auth/
│   ├── auth.config.ts (NextAuth конфигурация)
│   └── index.ts (экспорт auth функций)
├── db/
│   └── prisma.ts (Prisma Client singleton)
└── services/
    └── aggregation.service.ts (Бизнес-логика)
```

## 🚀 Performance оптимизации

### 1. Database уровень
- **Индексы** на часто запрашиваемых полях (code, status, lastUpdated)
- **Агрегированная таблица** (Aggregation) - предрасчитанные метрики
- **Unique constraints** - предотвращение дубликатов
- **Cascade delete** - автоочистка связанных записей

### 2. API уровень
- **Серверная пагинация** - limit/offset
- **Фильтрация на сервере** - WHERE clause
- **Projection** - select только нужные поля
- **Batch operations** - массовые upsert

### 3. Frontend уровень
- **React.memo** - предотвращение лишних рендеров
- **useCallback** - мемоизация функций
- **Lazy loading** - динамический импорт компонентов
- **Debounce** на поиске

## 🛡 Безопасность

### 1. Аутентификация
- bcrypt (cost=12) для хеширования паролей
- JWT токены в httpOnly cookies
- Session expiry (30 days)

### 2. Авторизация
- Middleware проверка на каждый защищенный роут
- Role-based access control (RBAC)
- API endpoints защищены

### 3. Валидация
- Zod schemas для всех входных данных
- Prisma предотвращение SQL injection
- CSR protection (Next.js)

### 4. Логирование
- Все импорты логируются
- Ошибки валидации сохраняются
- Audit trail для критичных операций

## 📈 Масштабирование

### Horizontal Scaling
- Stateless Next.js server - можно запустить N инстансов
- PostgreSQL read replicas для чтения
- Load balancer (nginx/HAProxy)

### Vertical Scaling
- Connection pooling (Prisma)
- Database indexes
- Caching layer (Redis) для KPI

### Monitoring
- Application logs → ELK/Splunk
- Database metrics → Prometheus
- Error tracking → Sentry

## 🔧 Development Workflow

```
1. Local Development
   npm run dev → localhost:3000
   
2. Database Changes
   Edit schema.prisma → npx prisma migrate dev
   
3. Code Changes
   TypeScript checks → Auto-complete
   
4. Testing
   Manual testing + Prisma Studio
   
5. Build
   npm run build → Production build
   
6. Deploy
   Vercel/Docker/VPS
```

## 📦 Production Deployment

### Vercel (Рекомендуется)
- Автодеплой из Git
- Serverless functions
- Edge network (CDN)
- Environment variables

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Traditional VPS
- Node.js процесс (PM2)
- Nginx reverse proxy
- PostgreSQL на отдельном сервере
- SSL (Let's Encrypt)

---

## 🎯 Итоговая оценка архитектуры

✅ **Модульность** - разделение на компоненты/сервисы
✅ **Масштабируемость** - горизонтальное и вертикальное
✅ **Безопасность** - аутентификация, валидация, RBAC
✅ **Производительность** - индексы, агрегаты, пагинация
✅ **Поддерживаемость** - TypeScript, четкая структура
✅ **Production-ready** - логирование, error handling

**Архитектура соответствует enterprise стандартам! 🏆**
