import { NextResponse } from 'next/server'
import { getLogStats } from '@/lib/accessLog'

export async function GET() {
  try {
    const stats = getLogStats()
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Failed to fetch log stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch log stats' },
      { status: 500 }
    )
  }
}