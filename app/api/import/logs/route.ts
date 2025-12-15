import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  try {
    const logs = await prisma.importLog.findMany({
      orderBy: { startedAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ data: logs })
  } catch (error) {
    console.error('Error fetching import logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    )
  }
}
