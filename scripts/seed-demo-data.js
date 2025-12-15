/**
 * Демо-данные для АС "Визуализация складской заполненности"
 * Этот скрипт заполняет систему тестовыми данными для демонстрации
 */

const API_BASE = 'http://localhost:3000/api'

// Вспомогательная функция для HTTP запросов
async function apiRequest(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  }

  if (data) {
    options.body = JSON.stringify(data)
  }

  const response = await fetch(`${API_BASE}${endpoint}`, options)
  return response.json()
}

// 1. Создание складской структуры
async function createWarehouses() {
  console.log('📦 Создание складской структуры...')
  
  const result = await apiRequest('/warehouses', 'POST', {
    warehouses: [
      {
        code: 'WH-MAIN',
        name: 'Главный склад',
        description: 'Основное хранилище материалов',
        zones: [
          {
            code: 'ZONE-A',
            name: 'Зона А - Металлопрокат',
            locations: [
              { code: 'A-01', name: 'Стеллаж A-01', capacity: 5000, unit: 'кг' },
              { code: 'A-02', name: 'Стеллаж A-02', capacity: 5000, unit: 'кг' },
              { code: 'A-03', name: 'Стеллаж A-03', capacity: 3000, unit: 'кг' },
              { code: 'A-04', name: 'Стеллаж A-04', capacity: 4000, unit: 'кг' },
              { code: 'A-05', name: 'Стеллаж A-05', capacity: 4500, unit: 'кг' },
            ],
          },
          {
            code: 'ZONE-B',
            name: 'Зона B - Крепеж',
            locations: [
              { code: 'B-01', name: 'Ящик B-01', capacity: 10000, unit: 'шт' },
              { code: 'B-02', name: 'Ящик B-02', capacity: 10000, unit: 'шт' },
              { code: 'B-03', name: 'Ящик B-03', capacity: 8000, unit: 'шт' },
              { code: 'B-04', name: 'Ящик B-04', capacity: 12000, unit: 'шт' },
              { code: 'B-05', name: 'Ящик B-05', capacity: 9000, unit: 'шт' },
            ],
          },
          {
            code: 'ZONE-C',
            name: 'Зона C - Инструменты',
            locations: [
              { code: 'C-01', name: 'Шкаф C-01', capacity: 100, unit: 'шт' },
              { code: 'C-02', name: 'Шкаф C-02', capacity: 100, unit: 'шт' },
              { code: 'C-03', name: 'Шкаф C-03', capacity: 150, unit: 'шт' },
              { code: 'C-04', name: 'Шкаф C-04', capacity: 80, unit: 'шт' },
            ],
          },
          {
            code: 'ZONE-D',
            name: 'Зона D - Электрокомпоненты',
            locations: [
              { code: 'D-01', name: 'Стеллаж D-01', capacity: 5000, unit: 'шт' },
              { code: 'D-02', name: 'Стеллаж D-02', capacity: 5000, unit: 'шт' },
              { code: 'D-03', name: 'Стеллаж D-03', capacity: 4000, unit: 'шт' },
            ],
          },
        ],
      },
      {
        code: 'WH-NORTH',
        name: 'Северный склад',
        description: 'Склад для северного региона',
        zones: [
          {
            code: 'ZONE-N1',
            name: 'Северная зона 1 - Сырье',
            locations: [
              { code: 'N1-01', name: 'Стеллаж N1-01', capacity: 3000, unit: 'кг' },
              { code: 'N1-02', name: 'Стеллаж N1-02', capacity: 3000, unit: 'кг' },
              { code: 'N1-03', name: 'Стеллаж N1-03', capacity: 2500, unit: 'кг' },
            ],
          },
          {
            code: 'ZONE-N2',
            name: 'Северная зона 2 - Готовая продукция',
            locations: [
              { code: 'N2-01', name: 'Паллет N2-01', capacity: 500, unit: 'шт' },
              { code: 'N2-02', name: 'Паллет N2-02', capacity: 500, unit: 'шт' },
              { code: 'N2-03', name: 'Паллет N2-03', capacity: 600, unit: 'шт' },
            ],
          },
        ],
      },
      {
        code: 'WH-SOUTH',
        name: 'Южный склад',
        description: 'Склад для южного региона',
        zones: [
          {
            code: 'ZONE-S1',
            name: 'Южная зона 1 - Комплектующие',
            locations: [
              { code: 'S1-01', name: 'Ящик S1-01', capacity: 8000, unit: 'шт' },
              { code: 'S1-02', name: 'Ящик S1-02', capacity: 8000, unit: 'шт' },
              { code: 'S1-03', name: 'Ящик S1-03', capacity: 7000, unit: 'шт' },
            ],
          },
          {
            code: 'ZONE-S2',
            name: 'Южная зона 2 - Хим. материалы',
            locations: [
              { code: 'S2-01', name: 'Контейнер S2-01', capacity: 1000, unit: 'л' },
              { code: 'S2-02', name: 'Контейнер S2-02', capacity: 1000, unit: 'л' },
            ],
          },
        ],
      },
      {
        code: 'WH-RESERVE',
        name: 'Резервный склад',
        description: 'Запасное хранилище',
        zones: [
          {
            code: 'ZONE-R1',
            name: 'Резервная зона 1',
            locations: [
              { code: 'R1-01', name: 'Стеллаж R1-01', capacity: 2000, unit: 'шт' },
              { code: 'R1-02', name: 'Стеллаж R1-02', capacity: 2000, unit: 'шт' },
            ],
          },
        ],
      },
    ],
  })

  console.log('✅ Создано складов:', result.warehousesCreated)
  console.log('✅ Создано зон:', result.zonesCreated)
  console.log('✅ Создано локаций:', result.locationsCreated)
}

// 2. Создание SKU
async function createSKUs() {
  console.log('\n📋 Создание SKU...')

  const skus = [
    // Металлопрокат
    { code: 'STEEL-3MM', name: 'Лист стальной 3мм', category: 'Металлопрокат', supplier: 'МеталлТорг', abcClass: 'A', unit: 'кг' },
    { code: 'STEEL-5MM', name: 'Лист стальной 5мм', category: 'Металлопрокат', supplier: 'МеталлТорг', abcClass: 'A', unit: 'кг' },
    { code: 'STEEL-8MM', name: 'Лист стальной 8мм', category: 'Металлопрокат', supplier: 'МеталлТорг', abcClass: 'B', unit: 'кг' },
    { code: 'PIPE-50', name: 'Труба 50мм', category: 'Металлопрокат', supplier: 'Трубопрокат', abcClass: 'B', unit: 'кг' },
    { code: 'PIPE-100', name: 'Труба 100мм', category: 'Металлопрокат', supplier: 'Трубопрокат', abcClass: 'B', unit: 'кг' },
    { code: 'ANGLE-50', name: 'Уголок 50х50', category: 'Металлопрокат', supplier: 'МеталлПрофиль', abcClass: 'C', unit: 'кг' },
    { code: 'CHANNEL-100', name: 'Швеллер 100', category: 'Металлопрокат', supplier: 'МеталлПрофиль', abcClass: 'C', unit: 'кг' },
    
    // Крепеж
    { code: 'BOLT-M8', name: 'Болт М8х40', category: 'Крепеж', supplier: 'ТехКрепеж', abcClass: 'A', unit: 'шт' },
    { code: 'BOLT-M10', name: 'Болт М10х50', category: 'Крепеж', supplier: 'ТехКрепеж', abcClass: 'A', unit: 'шт' },
    { code: 'BOLT-M12', name: 'Болт М12х60', category: 'Крепеж', supplier: 'ТехКрепеж', abcClass: 'B', unit: 'шт' },
    { code: 'NUT-M8', name: 'Гайка М8', category: 'Крепеж', supplier: 'ТехКрепеж', abcClass: 'B', unit: 'шт' },
    { code: 'NUT-M10', name: 'Гайка М10', category: 'Крепеж', supplier: 'ТехКрепеж', abcClass: 'B', unit: 'шт' },
    { code: 'WASHER-M8', name: 'Шайба М8', category: 'Крепеж', supplier: 'ТехКрепеж', abcClass: 'C', unit: 'шт' },
    { code: 'WASHER-M10', name: 'Шайба М10', category: 'Крепеж', supplier: 'ТехКрепеж', abcClass: 'C', unit: 'шт' },
    { code: 'SCREW-4X40', name: 'Саморез 4х40', category: 'Крепеж', supplier: 'КрепежМастер', abcClass: 'B', unit: 'шт' },
    { code: 'SCREW-5X50', name: 'Саморез 5х50', category: 'Крепеж', supplier: 'КрепежМастер', abcClass: 'B', unit: 'шт' },
    
    // Инструменты
    { code: 'DRILL-10', name: 'Сверло 10мм', category: 'Инструменты', supplier: 'ИнструментПро', abcClass: 'B', unit: 'шт' },
    { code: 'DRILL-12', name: 'Сверло 12мм', category: 'Инструменты', supplier: 'ИнструментПро', abcClass: 'B', unit: 'шт' },
    { code: 'DRILL-16', name: 'Сверло 16мм', category: 'Инструменты', supplier: 'ИнструментПро', abcClass: 'C', unit: 'шт' },
    { code: 'WRENCH-17', name: 'Ключ гаечный 17мм', category: 'Инструменты', supplier: 'ИнструментПро', abcClass: 'C', unit: 'шт' },
    { code: 'WRENCH-19', name: 'Ключ гаечный 19мм', category: 'Инструменты', supplier: 'ИнструментПро', abcClass: 'C', unit: 'шт' },
    { code: 'HAMMER-500', name: 'Молоток 500г', category: 'Инструменты', supplier: 'ТулСервис', abcClass: 'C', unit: 'шт' },
    { code: 'PLIERS-200', name: 'Плоскогубцы 200мм', category: 'Инструменты', supplier: 'ТулСервис', abcClass: 'C', unit: 'шт' },
    
    // Электрокомпоненты
    { code: 'CABLE-2X2.5', name: 'Кабель 2х2.5', category: 'Электрокомпоненты', supplier: 'ЭлектроСнаб', abcClass: 'A', unit: 'м' },
    { code: 'CABLE-3X1.5', name: 'Кабель 3х1.5', category: 'Электрокомпоненты', supplier: 'ЭлектроСнаб', abcClass: 'A', unit: 'м' },
    { code: 'SWITCH-10A', name: 'Выключатель 10А', category: 'Электрокомпоненты', supplier: 'ЭлектроМаркет', abcClass: 'B', unit: 'шт' },
    { code: 'SOCKET-16A', name: 'Розетка 16А', category: 'Электрокомпоненты', supplier: 'ЭлектроМаркет', abcClass: 'B', unit: 'шт' },
    { code: 'BREAKER-25A', name: 'Автомат 25А', category: 'Электрокомпоненты', supplier: 'ЭлектроПрофи', abcClass: 'B', unit: 'шт' },
    { code: 'LED-LAMP-10W', name: 'Лампа LED 10Вт', category: 'Электрокомпоненты', supplier: 'СветТехника', abcClass: 'C', unit: 'шт' },
    
    // Химические материалы
    { code: 'PAINT-WHITE', name: 'Краска белая', category: 'Лакокрасочные', supplier: 'ХимПром', abcClass: 'B', unit: 'л' },
    { code: 'PAINT-BLACK', name: 'Краска черная', category: 'Лакокрасочные', supplier: 'ХимПром', abcClass: 'C', unit: 'л' },
    { code: 'SOLVENT', name: 'Растворитель', category: 'Лакокрасочные', supplier: 'ХимСервис', abcClass: 'B', unit: 'л' },
    { code: 'PRIMER', name: 'Грунтовка', category: 'Лакокрасочные', supplier: 'ХимПром', abcClass: 'C', unit: 'л' },
    
    // Готовая продукция
    { code: 'PRODUCT-A1', name: 'Изделие А1', category: 'Готовая продукция', supplier: 'Собственное', abcClass: 'A', unit: 'шт' },
    { code: 'PRODUCT-A2', name: 'Изделие А2', category: 'Готовая продукция', supplier: 'Собственное', abcClass: 'A', unit: 'шт' },
    { code: 'PRODUCT-B1', name: 'Изделие Б1', category: 'Готовая продукция', supplier: 'Собственное', abcClass: 'B', unit: 'шт' },
    
    // Комплектующие
    { code: 'BEARING-6205', name: 'Подшипник 6205', category: 'Комплектующие', supplier: 'ПодшипникТорг', abcClass: 'B', unit: 'шт' },
    { code: 'BEARING-6206', name: 'Подшипник 6206', category: 'Комплектующие', supplier: 'ПодшипникТорг', abcClass: 'B', unit: 'шт' },
    { code: 'SEAL-40X60', name: 'Сальник 40х60', category: 'Комплектующие', supplier: 'УплотнителиПро', abcClass: 'C', unit: 'шт' },
    { code: 'GASKET-100', name: 'Прокладка 100мм', category: 'Комплектующие', supplier: 'УплотнителиПро', abcClass: 'C', unit: 'шт' },
  ]

  for (const sku of skus) {
    await apiRequest('/sku', 'POST', sku)
  }

  console.log(`✅ Создано ${skus.length} SKU`)
}

// 3. Установка норм
async function setNorms() {
  console.log('\n📊 Установка норм запасов...')

  await apiRequest('/inventory/norms', 'POST', {
    skuNorms: [
      // Металлопрокат
      { skuCode: 'STEEL-3MM', minLevel: 500, targetLevel: 2000, maxLevel: 5000 },
      { skuCode: 'STEEL-5MM', minLevel: 300, targetLevel: 1500, maxLevel: 3000 },
      { skuCode: 'STEEL-8MM', minLevel: 200, targetLevel: 1000, maxLevel: 2500 },
      { skuCode: 'PIPE-50', minLevel: 200, targetLevel: 1000, maxLevel: 2000 },
      { skuCode: 'PIPE-100', minLevel: 150, targetLevel: 800, maxLevel: 1500 },
      { skuCode: 'ANGLE-50', minLevel: 100, targetLevel: 500, maxLevel: 1000 },
      { skuCode: 'CHANNEL-100', minLevel: 100, targetLevel: 400, maxLevel: 800 },
      
      // Крепеж
      { skuCode: 'BOLT-M8', minLevel: 1000, targetLevel: 5000, maxLevel: 10000 },
      { skuCode: 'BOLT-M10', minLevel: 500, targetLevel: 3000, maxLevel: 8000 },
      { skuCode: 'BOLT-M12', minLevel: 300, targetLevel: 2000, maxLevel: 5000 },
      { skuCode: 'NUT-M8', minLevel: 1000, targetLevel: 5000, maxLevel: 10000 },
      { skuCode: 'NUT-M10', minLevel: 800, targetLevel: 4000, maxLevel: 8000 },
      { skuCode: 'WASHER-M8', minLevel: 2000, targetLevel: 8000, maxLevel: 15000 },
      { skuCode: 'WASHER-M10', minLevel: 1500, targetLevel: 6000, maxLevel: 12000 },
      { skuCode: 'SCREW-4X40', minLevel: 1000, targetLevel: 4000, maxLevel: 8000 },
      { skuCode: 'SCREW-5X50', minLevel: 800, targetLevel: 3500, maxLevel: 7000 },
      
      // Инструменты
      { skuCode: 'DRILL-10', minLevel: 10, targetLevel: 30, maxLevel: 50 },
      { skuCode: 'DRILL-12', minLevel: 8, targetLevel: 25, maxLevel: 40 },
      { skuCode: 'DRILL-16', minLevel: 5, targetLevel: 20, maxLevel: 35 },
      { skuCode: 'WRENCH-17', minLevel: 5, targetLevel: 20, maxLevel: 40 },
      { skuCode: 'WRENCH-19', minLevel: 5, targetLevel: 18, maxLevel: 35 },
      { skuCode: 'HAMMER-500', minLevel: 3, targetLevel: 10, maxLevel: 20 },
      { skuCode: 'PLIERS-200', minLevel: 4, targetLevel: 15, maxLevel: 25 },
      
      // Электрокомпоненты
      { skuCode: 'CABLE-2X2.5', minLevel: 100, targetLevel: 500, maxLevel: 1000 },
      { skuCode: 'CABLE-3X1.5', minLevel: 150, targetLevel: 600, maxLevel: 1200 },
      { skuCode: 'SWITCH-10A', minLevel: 50, targetLevel: 200, maxLevel: 400 },
      { skuCode: 'SOCKET-16A', minLevel: 50, targetLevel: 250, maxLevel: 500 },
      { skuCode: 'BREAKER-25A', minLevel: 30, targetLevel: 150, maxLevel: 300 },
      { skuCode: 'LED-LAMP-10W', minLevel: 40, targetLevel: 200, maxLevel: 400 },
      
      // Химические материалы
      { skuCode: 'PAINT-WHITE', minLevel: 50, targetLevel: 200, maxLevel: 500 },
      { skuCode: 'PAINT-BLACK', minLevel: 30, targetLevel: 150, maxLevel: 300 },
      { skuCode: 'SOLVENT', minLevel: 40, targetLevel: 180, maxLevel: 400 },
      { skuCode: 'PRIMER', minLevel: 30, targetLevel: 120, maxLevel: 250 },
      
      // Готовая продукция
      { skuCode: 'PRODUCT-A1', minLevel: 20, targetLevel: 100, maxLevel: 200 },
      { skuCode: 'PRODUCT-A2', minLevel: 15, targetLevel: 80, maxLevel: 150 },
      { skuCode: 'PRODUCT-B1', minLevel: 10, targetLevel: 50, maxLevel: 100 },
      
      // Комплектующие
      { skuCode: 'BEARING-6205', minLevel: 20, targetLevel: 100, maxLevel: 200 },
      { skuCode: 'BEARING-6206', minLevel: 15, targetLevel: 80, maxLevel: 150 },
      { skuCode: 'SEAL-40X60', minLevel: 30, targetLevel: 120, maxLevel: 250 },
      { skuCode: 'GASKET-100', minLevel: 25, targetLevel: 100, maxLevel: 200 },
    ],
  })

  console.log('✅ Нормы установлены')
}

// 4. Импорт остатков
async function importInventory() {
  console.log('\n📦 Импорт остатков...')

  const inventoryData = [
    // === ГЛАВНЫЙ СКЛАД - Зона А (Металлопрокат) ===
    // Критически низкие остатки
    { skuCode: 'STEEL-3MM', locationCode: 'A-01', quantity: 300, reservedQty: 50 },
    { skuCode: 'ANGLE-50', locationCode: 'A-02', quantity: 80, reservedQty: 20 },
    
    // Нормальные уровни
    { skuCode: 'STEEL-5MM', locationCode: 'A-01', quantity: 1800, reservedQty: 200 },
    { skuCode: 'STEEL-8MM', locationCode: 'A-03', quantity: 1200, reservedQty: 150 },
    { skuCode: 'PIPE-50', locationCode: 'A-02', quantity: 1200, reservedQty: 100 },
    { skuCode: 'PIPE-100', locationCode: 'A-04', quantity: 900, reservedQty: 80 },
    { skuCode: 'CHANNEL-100', locationCode: 'A-05', quantity: 450, reservedQty: 50 },
    
    // === ГЛАВНЫЙ СКЛАД - Зона B (Крепеж) ===
    // Разные уровни для демонстрации
    { skuCode: 'BOLT-M8', locationCode: 'B-01', quantity: 4500, reservedQty: 500 },
    { skuCode: 'BOLT-M10', locationCode: 'B-01', quantity: 2000, reservedQty: 300 },
    { skuCode: 'BOLT-M12', locationCode: 'B-02', quantity: 1800, reservedQty: 200 },
    { skuCode: 'NUT-M8', locationCode: 'B-02', quantity: 800, reservedQty: 100 }, // Критический
    { skuCode: 'NUT-M10', locationCode: 'B-03', quantity: 3500, reservedQty: 400 },
    { skuCode: 'WASHER-M8', locationCode: 'B-03', quantity: 9000, reservedQty: 500 },
    { skuCode: 'WASHER-M10', locationCode: 'B-04', quantity: 5500, reservedQty: 600 },
    { skuCode: 'SCREW-4X40', locationCode: 'B-04', quantity: 3800, reservedQty: 300 },
    { skuCode: 'SCREW-5X50', locationCode: 'B-05', quantity: 3200, reservedQty: 350 },
    
    // === ГЛАВНЫЙ СКЛАД - Зона C (Инструменты) ===
    { skuCode: 'DRILL-10', locationCode: 'C-01', quantity: 25, reservedQty: 5 },
    { skuCode: 'DRILL-12', locationCode: 'C-01', quantity: 20, reservedQty: 3 },
    { skuCode: 'DRILL-16', locationCode: 'C-02', quantity: 15, reservedQty: 2 },
    { skuCode: 'WRENCH-17', locationCode: 'C-02', quantity: 8, reservedQty: 2 }, // Требует внимания
    { skuCode: 'WRENCH-19', locationCode: 'C-03', quantity: 16, reservedQty: 3 },
    { skuCode: 'HAMMER-500', locationCode: 'C-03', quantity: 9, reservedQty: 1 },
    { skuCode: 'PLIERS-200', locationCode: 'C-04', quantity: 12, reservedQty: 2 },
    
    // === ГЛАВНЫЙ СКЛАД - Зона D (Электрокомпоненты) ===
    { skuCode: 'CABLE-2X2.5', locationCode: 'D-01', quantity: 450, reservedQty: 50 },
    { skuCode: 'CABLE-3X1.5', locationCode: 'D-01', quantity: 550, reservedQty: 60 },
    { skuCode: 'SWITCH-10A', locationCode: 'D-02', quantity: 180, reservedQty: 20 },
    { skuCode: 'SOCKET-16A', locationCode: 'D-02', quantity: 220, reservedQty: 30 },
    { skuCode: 'BREAKER-25A', locationCode: 'D-03', quantity: 120, reservedQty: 15 },
    { skuCode: 'LED-LAMP-10W', locationCode: 'D-03', quantity: 180, reservedQty: 20 },
    
    // === СЕВЕРНЫЙ СКЛАД - Зона N1 (Сырье) ===
    { skuCode: 'STEEL-3MM', locationCode: 'N1-01', quantity: 1500, reservedQty: 100 },
    { skuCode: 'STEEL-5MM', locationCode: 'N1-02', quantity: 1200, reservedQty: 150 },
    { skuCode: 'PIPE-50', locationCode: 'N1-03', quantity: 800, reservedQty: 80 },
    { skuCode: 'STEEL-8MM', locationCode: 'N1-01', quantity: 900, reservedQty: 100 },
    
    // === СЕВЕРНЫЙ СКЛАД - Зона N2 (Готовая продукция) ===
    { skuCode: 'PRODUCT-A1', locationCode: 'N2-01', quantity: 85, reservedQty: 10 },
    { skuCode: 'PRODUCT-A2', locationCode: 'N2-02', quantity: 70, reservedQty: 8 },
    { skuCode: 'PRODUCT-B1', locationCode: 'N2-03', quantity: 45, reservedQty: 5 },
    
    // === ЮЖНЫЙ СКЛАД - Зона S1 (Комплектующие) ===
    { skuCode: 'BEARING-6205', locationCode: 'S1-01', quantity: 90, reservedQty: 10 },
    { skuCode: 'BEARING-6206', locationCode: 'S1-01', quantity: 75, reservedQty: 8 },
    { skuCode: 'SEAL-40X60', locationCode: 'S1-02', quantity: 110, reservedQty: 15 },
    { skuCode: 'GASKET-100', locationCode: 'S1-03', quantity: 95, reservedQty: 10 },
    { skuCode: 'BOLT-M8', locationCode: 'S1-02', quantity: 4200, reservedQty: 400 },
    { skuCode: 'NUT-M8', locationCode: 'S1-03', quantity: 4500, reservedQty: 500 },
    
    // === ЮЖНЫЙ СКЛАД - Зона S2 (Химические материалы) ===
    { skuCode: 'PAINT-WHITE', locationCode: 'S2-01', quantity: 180, reservedQty: 20 },
    { skuCode: 'PAINT-BLACK', locationCode: 'S2-01', quantity: 120, reservedQty: 15 },
    { skuCode: 'SOLVENT', locationCode: 'S2-02', quantity: 160, reservedQty: 20 },
    { skuCode: 'PRIMER', locationCode: 'S2-02', quantity: 110, reservedQty: 10 },
    
    // === РЕЗЕРВНЫЙ СКЛАД ===
    { skuCode: 'BOLT-M8', locationCode: 'R1-01', quantity: 1500, reservedQty: 0 },
    { skuCode: 'BOLT-M10', locationCode: 'R1-01', quantity: 1200, reservedQty: 0 },
    { skuCode: 'STEEL-3MM', locationCode: 'R1-02', quantity: 800, reservedQty: 0 },
    { skuCode: 'CABLE-2X2.5', locationCode: 'R1-02', quantity: 200, reservedQty: 0 },
  ]

  const result = await apiRequest('/inventory', 'POST', { data: inventoryData })

  console.log('✅ Импортировано остатков:', result.imported)
  if (result.errors.length > 0) {
    console.log('⚠️ Ошибки:', result.errors)
  }
}

// Главная функция
async function main() {
  console.log('🚀 Запуск загрузки демо-данных...\n')
  
  try {
    await createWarehouses()
    await createSKUs()
    await setNorms()
    await importInventory()
    
    console.log('\n✅ Демо-данные успешно загружены!')
    console.log('\n📊 Откройте Dashboard: http://localhost:3000/dashboard')
    console.log('\n💡 Вы увидите:')
    console.log('   - 🟢 Зелёные столбцы — нормальный уровень запасов')
    console.log('   - 🟡 Жёлтые столбцы — требуют внимания')
    console.log('   - 🔴 Красные столбцы — критический уровень')
    console.log('\n👆 Кликните по столбцу для детализации!')
  } catch (error) {
    console.error('❌ Ошибка:', error)
  }
}

// Запуск если вызван напрямую
if (typeof window === 'undefined') {
  main()
}

module.exports = { main }
