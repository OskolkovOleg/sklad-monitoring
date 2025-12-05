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
            ],
          },
          {
            code: 'ZONE-B',
            name: 'Зона B - Крепеж',
            locations: [
              { code: 'B-01', name: 'Ящик B-01', capacity: 10000, unit: 'шт' },
              { code: 'B-02', name: 'Ящик B-02', capacity: 10000, unit: 'шт' },
              { code: 'B-03', name: 'Ящик B-03', capacity: 8000, unit: 'шт' },
            ],
          },
          {
            code: 'ZONE-C',
            name: 'Зона C - Инструменты',
            locations: [
              { code: 'C-01', name: 'Шкаф C-01', capacity: 100, unit: 'шт' },
              { code: 'C-02', name: 'Шкаф C-02', capacity: 100, unit: 'шт' },
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
    { code: 'PIPE-50', name: 'Труба 50мм', category: 'Металлопрокат', supplier: 'Трубопрокат', abcClass: 'B', unit: 'кг' },
    
    // Крепеж
    { code: 'BOLT-M8', name: 'Болт М8х40', category: 'Крепеж', supplier: 'ТехКрепеж', abcClass: 'A', unit: 'шт' },
    { code: 'BOLT-M10', name: 'Болт М10х50', category: 'Крепеж', supplier: 'ТехКрепеж', abcClass: 'A', unit: 'шт' },
    { code: 'NUT-M8', name: 'Гайка М8', category: 'Крепеж', supplier: 'ТехКрепеж', abcClass: 'B', unit: 'шт' },
    { code: 'WASHER-M8', name: 'Шайба М8', category: 'Крепеж', supplier: 'ТехКрепеж', abcClass: 'C', unit: 'шт' },
    
    // Инструменты
    { code: 'DRILL-10', name: 'Сверло 10мм', category: 'Инструменты', supplier: 'ИнструментПро', abcClass: 'B', unit: 'шт' },
    { code: 'WRENCH-17', name: 'Ключ гаечный 17мм', category: 'Инструменты', supplier: 'ИнструментПро', abcClass: 'C', unit: 'шт' },
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
      { skuCode: 'STEEL-3MM', minLevel: 500, targetLevel: 2000, maxLevel: 5000 },
      { skuCode: 'STEEL-5MM', minLevel: 300, targetLevel: 1500, maxLevel: 3000 },
      { skuCode: 'PIPE-50', minLevel: 200, targetLevel: 1000, maxLevel: 2000 },
      { skuCode: 'BOLT-M8', minLevel: 1000, targetLevel: 5000, maxLevel: 10000 },
      { skuCode: 'BOLT-M10', minLevel: 500, targetLevel: 3000, maxLevel: 8000 },
      { skuCode: 'NUT-M8', minLevel: 1000, targetLevel: 5000, maxLevel: 10000 },
      { skuCode: 'WASHER-M8', minLevel: 2000, targetLevel: 8000, maxLevel: 15000 },
      { skuCode: 'DRILL-10', minLevel: 10, targetLevel: 30, maxLevel: 50 },
      { skuCode: 'WRENCH-17', minLevel: 5, targetLevel: 20, maxLevel: 40 },
    ],
  })

  console.log('✅ Нормы установлены')
}

// 4. Импорт остатков
async function importInventory() {
  console.log('\n📦 Импорт остатков...')

  const inventoryData = [
    // Металлопрокат - критически низкие остатки
    { skuCode: 'STEEL-3MM', locationCode: 'WH-MAIN-ZONE-A-A-01', quantity: 300, reservedQty: 50 },
    
    // Металлопрокат - нормальные уровни
    { skuCode: 'STEEL-5MM', locationCode: 'WH-MAIN-ZONE-A-A-01', quantity: 1800, reservedQty: 200 },
    { skuCode: 'PIPE-50', locationCode: 'WH-MAIN-ZONE-A-A-02', quantity: 1200, reservedQty: 100 },
    
    // Крепеж - разные уровни для демонстрации
    { skuCode: 'BOLT-M8', locationCode: 'WH-MAIN-ZONE-B-B-01', quantity: 4500, reservedQty: 500 }, // Норма
    { skuCode: 'BOLT-M10', locationCode: 'WH-MAIN-ZONE-B-B-01', quantity: 2000, reservedQty: 300 }, // Требует внимания
    { skuCode: 'NUT-M8', locationCode: 'WH-MAIN-ZONE-B-B-02', quantity: 800, reservedQty: 100 }, // Критический
    { skuCode: 'WASHER-M8', locationCode: 'WH-MAIN-ZONE-B-B-03', quantity: 9000, reservedQty: 500 }, // Норма
    
    // Инструменты
    { skuCode: 'DRILL-10', locationCode: 'WH-MAIN-ZONE-C-C-01', quantity: 25, reservedQty: 5 },
    { skuCode: 'WRENCH-17', locationCode: 'WH-MAIN-ZONE-C-C-02', quantity: 8, reservedQty: 2 }, // Требует внимания
    
    // Резервный склад
    { skuCode: 'BOLT-M8', locationCode: 'WH-RESERVE-ZONE-R1-R1-01', quantity: 1500, reservedQty: 0 },
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
