import { NextResponse } from 'next/server'
import { addManualLog } from '@/lib/accessLog'

export async function POST() {
  try {
    // Add some sample logs based on the Vercel console output you shared
    addManualLog('172.56.70.159', false, '/', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
    addManualLog('172.56.70.159', false, '/', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
    addManualLog('172.56.70.159', false, '/', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
    addManualLog('50.146.14.50', true, '/', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')
    addManualLog('50.146.14.50', true, '/access-logs', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')
    addManualLog('64.23.136.205', false, '/', 'Mozilla/5.0 (compatible; DatadomeBot/1.0)')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Sample logs populated based on Vercel console output' 
    })
  } catch (error) {
    console.error('Failed to populate logs:', error)
    return NextResponse.json(
      { error: 'Failed to populate logs' },
      { status: 500 }
    )
  }
}