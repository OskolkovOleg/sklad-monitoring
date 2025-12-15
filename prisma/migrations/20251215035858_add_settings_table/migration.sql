-- CreateTable
CREATE TABLE "Norm" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityName" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "minLevel" REAL NOT NULL,
    "targetLevel" REAL NOT NULL,
    "maxLevel" REAL NOT NULL,
    "capacity" REAL NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'шт',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ReportExport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "entityType" TEXT,
    "recordCount" INTEGER NOT NULL DEFAULT 0,
    "filters" TEXT,
    "exportedBy" TEXT,
    "exportedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyName" TEXT NOT NULL DEFAULT 'ООО ТехноСклад',
    "systemLanguage" TEXT NOT NULL DEFAULT 'ru',
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Moscow',
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "lowStockAlerts" BOOLEAN NOT NULL DEFAULT true,
    "criticalStockAlerts" BOOLEAN NOT NULL DEFAULT true,
    "alertThreshold" INTEGER NOT NULL DEFAULT 10,
    "defaultView" TEXT NOT NULL DEFAULT 'quantity',
    "showPercentages" BOOLEAN NOT NULL DEFAULT true,
    "chartAnimations" BOOLEAN NOT NULL DEFAULT true,
    "compactMode" BOOLEAN NOT NULL DEFAULT false,
    "redThreshold" INTEGER NOT NULL DEFAULT 90,
    "yellowThreshold" INTEGER NOT NULL DEFAULT 75,
    "autoRefresh" BOOLEAN NOT NULL DEFAULT true,
    "refreshInterval" INTEGER NOT NULL DEFAULT 30,
    "enableBackups" BOOLEAN NOT NULL DEFAULT true,
    "backupFrequency" TEXT NOT NULL DEFAULT 'daily',
    "updatedAt" DATETIME NOT NULL,
    "updatedBy" TEXT
);

-- CreateIndex
CREATE INDEX "Norm_entityType_idx" ON "Norm"("entityType");

-- CreateIndex
CREATE INDEX "Norm_entityId_idx" ON "Norm"("entityId");

-- CreateIndex
CREATE INDEX "ReportExport_reportType_idx" ON "ReportExport"("reportType");

-- CreateIndex
CREATE INDEX "ReportExport_exportedAt_idx" ON "ReportExport"("exportedAt");

-- CreateIndex
CREATE INDEX "ReportExport_exportedBy_idx" ON "ReportExport"("exportedBy");
