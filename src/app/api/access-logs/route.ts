import { NextRequest, NextResponse } from 'next/server'
import { getAccessLogs } from '@/lib/accessLog'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    
    const logs = getAccessLogs(limit)
    
    return NextResponse.json(logs)
  } catch (error) {
    console.error('Failed to fetch access logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch access logs' },
      { status: 500 }
    )
  }
}