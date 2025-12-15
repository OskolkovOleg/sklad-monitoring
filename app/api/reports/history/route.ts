import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'

// POST - Save export history
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    
    const body = await request.json()
    const { filename, reportType, entityType, recordCount, filters } = body

    // Create export record
    const exportRecord = await prisma.reportExport.create({
      data: {
        filename,
        reportType,
        entityType,
        recordCount: parseInt(recordCount) || 0,
        filters,
        exportedBy: session?.user?.email || 'anonymous',
      },
    })

    return NextResponse.json({
      success: true,
      data: exportRecord,
    })
  } catch (error) {
    console.error('Error saving export history:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save export history' },
      { status: 500 }
    )
  }
}

// GET - Retrieve export history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const reportType = searchParams.get('reportType')

    const where: any = {}
    if (reportType) {
      where.reportType = reportType
    }

    const exports = await prisma.reportExport.findMany({
      where,
      orderBy: { exportedAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({
      success: true,
      data: exports,
      total: exports.length,
    })
  } catch (error) {
    console.error('Error fetching export history:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch export history' },
      { status: 500 }
    )
  }
}
