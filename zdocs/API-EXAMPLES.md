# Примеры использования API

Этот файл содержит примеры вызовов API для различных операций системы.

## 1. Синхронизация складской структуры

### Создание складов с зонами и локациями

```bash
curl -X POST http://localhost:3000/api/warehouses \
  -H "Content-Type: application/json" \
  -d '{
    "warehouses": [
      {
        "code": "WH001",
        "name": "Главный склад",
        "description": "Центральное хранилище",
        "zones": [
          {
            "code": "Z01",
            "name": "Зона хранения А",
            "locations": [
              {
                "code": "A-001",
                "name": "Стеллаж А, ряд 1",
                "row": "1",
                "rack": "A",
                "level": "1",
                "capacity": 1000,
                "unit": "шт"
              },
              {
                "code": "A-002",
                "name": "Стеллаж А, ряд 2",
                "row": "2",
                "rack": "A",
                "level": "1",
                "capacity": 1200,
                "unit": "шт"
              }
            ]
          },
          {
            "code": "Z02",
            "name": "Зона хранения B",
            "locations": [
              {
                "code": "B-001",
                "name": "Стеллаж B, ряд 1",
                "capacity": 800,
                "unit": "кг"
              }
            ]
          }
        ]
      }
    ]
  }'
```

## 2. Создание SKU (товаров)

### Добавление нескольких SKU

```bash
# SKU 1 - Болты М8
curl -X POST http://localhost:3000/api/sku \
  -H "Content-Type: application/json" \
  -d '{
    "code": "BOLT-M8",
    "name": "Болт М8х40",
    "description": "Болт оцинкованный",
    "category": "Крепеж",
    "supplier": "ТехКрепеж ООО",
    "abcClass": "A",
    "unit": "шт"
  }'

# SKU 2 - Гайки
curl -X POST http://localhost:3000/api/sku \
  -H "Content-Type: application/json" \
  -d '{
    "code": "NUT-M8",
    "name": "Гайка М8",
    "category": "Крепеж",
    "supplier": "ТехКрепеж ООО",
    "abcClass": "B",
    "unit": "шт"
  }'

# SKU 3 - Листовая сталь
curl -X POST http://localhost:3000/api/sku \
  -H "Content-Type: application/json" \
  -d '{
    "code": "STEEL-3MM",
    "name": "Лист стальной 3мм",
    "category": "Металлопрокат",
    "supplier": "МеталлТорг ЗАО",
    "abcClass": "A",
    "unit": "кг"
  }'
```

## 3. Установка норм запасов

### Нормы по SKU и локациям

```bash
curl -X POST http://localhost:3000/api/inventory/norms \
  -H "Content-Type: application/json" \
  -d '{
    "skuNorms": [
      {
        "skuCode": "BOLT-M8",
        "minLevel": 500,
        "targetLevel": 2000,
        "maxLevel": 5000,
        "unit": "шт"
      },
      {
        "skuCode": "NUT-M8",
        "minLevel": 500,
        "targetLevel": 2000,
        "maxLevel": 5000,
        "unit": "шт"
      },
      {
        "skuCode": "STEEL-3MM",
        "minLevel": 100,
        "targetLevel": 500,
        "maxLevel": 1000,
        "unit": "кг"
      }
    ],
    "locationNorms": [
      {
        "locationCode": "A-001",
        "minLevel": 100,
        "targetLevel": 500,
        "maxLevel": 1000
      }
    ]
  }'
```

## 4. Импорт остатков

### Загрузка текущих остатков

```bash
curl -X POST http://localhost:3000/api/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "data": [
      {
        "skuCode": "BOLT-M8",
        "locationCode": "WH001-Z01-A-001",
        "quantity": 1500,
        "reservedQty": 100,
        "unavailableQty": 0,
        "status": "available"
      },
      {
        "skuCode": "NUT-M8",
        "locationCode": "WH001-Z01-A-001",
        "quantity": 800,
        "reservedQty": 50,
        "unavailableQty": 0,
        "status": "available"
      },
      {
        "skuCode": "STEEL-3MM",
        "locationCode": "WH001-Z02-B-001",
        "quantity": 350,
        "reservedQty": 50,
        "unavailableQty": 10,
        "batchNumber": "BATCH-001",
        "status": "available"
      }
    ]
  }'
```

## 5. Получение агрегаций для Dashboard

### Просмотр складов

```bash
curl "http://localhost:3000/api/aggregations?entityType=warehouse&sortField=fillPercentage&sortOrder=desc"
```

### Просмотр зон конкретного склада

```bash
# Замените {warehouseId} на реальный ID склада
curl "http://localhost:3000/api/aggregations?entityType=zone&warehouseId={warehouseId}&sortField=entityName&sortOrder=asc"
```

### Поиск критических уровней

```bash
curl "http://localhost:3000/api/aggregations?entityType=sku&status=red&sortField=deviationFromMin&sortOrder=asc"
```

### Фильтрация по категории и поставщику

```bash
curl "http://localhost:3000/api/aggregations?entityType=sku&category=Крепеж&supplier=ТехКрепеж%20ООО"
```

### Пагинация

```bash
curl "http://localhost:3000/api/aggregations?entityType=location&page=1&pageSize=50"
```

## 6. Получение списков

### Список всех складов

```bash
curl "http://localhost:3000/api/warehouses"
```

### Список SKU с фильтрами

```bash
# Все SKU категории "Крепеж"
curl "http://localhost:3000/api/sku?category=Крепеж"

# SKU класса A
curl "http://localhost:3000/api/sku?abcClass=A"

# Поиск по названию
curl "http://localhost:3000/api/sku?search=болт"
```

### Просмотр остатков

```bash
# Все остатки
curl "http://localhost:3000/api/inventory?page=1&pageSize=100"

# Остатки конкретного SKU
curl "http://localhost:3000/api/inventory?skuCode=BOLT-M8"

# Только зарезервированные
curl "http://localhost:3000/api/inventory?status=reserved"
```

## Сценарии использования

### Сценарий 1: Начальная настройка системы

1. Создать структуру складов:
```bash
POST /api/warehouses
```

2. Добавить SKU:
```bash
POST /api/sku (для каждого товара)
```

3. Установить нормы:
```bash
POST /api/inventory/norms
```

4. Импортировать текущие остатки:
```bash
POST /api/inventory
```

5. Открыть Dashboard:
```
http://localhost:3000/dashboard
```

### Сценарий 2: Регулярное обновление данных

1. Обновление остатков (каждые 5 минут):
```bash
POST /api/inventory
```

Система автоматически пересчитает агрегации и обновит Dashboard.

### Сценарий 3: Поиск проблемных позиций

1. Найти критические уровни:
```bash
GET /api/aggregations?entityType=sku&status=red
```

2. Детализация по конкретному SKU через Dashboard
3. Просмотр распределения по локациям

### Сценарий 4: Анализ заполненности

1. Общий обзор складов:
```bash
GET /api/aggregations?entityType=warehouse
```

2. Детализация по зонам:
```bash
GET /api/aggregations?entityType=zone&warehouseId={id}
```

3. Анализ локаций с низкой заполненностью:
```bash
GET /api/aggregations?entityType=location&sortField=fillPercentage&sortOrder=asc
```

## Примечания

- Все даты должны быть в формате ISO 8601
- Коды должны быть уникальными в пределах своего типа
- Для составных кодов локаций используется формат: `{warehouse}-{zone}-{location}`
- После импорта данных система автоматически пересчитывает агрегации
- Рекомендуется использовать пагинацию при работе с большими объёмами данных
