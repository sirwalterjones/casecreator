import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check global store directly
    const globalLogsCount = global.accessLogs ? global.accessLogs.length : 0
    const globalLogs = global.accessLogs ? global.accessLogs.slice(0, 5) : []
    
    console.log(`🔍 [DEBUG] Global logs count: ${globalLogsCount}`)
    console.log(`🔍 [DEBUG] Sample logs:`, JSON.stringify(globalLogs, null, 2))
    
    return NextResponse.json({
      globalLogsCount,
      sampleLogs: globalLogs,
      timestamp: new Date().toISOString(),
      functionId: process.env.VERCEL_FUNCTION_REGION || 'unknown'
    })
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json(
      { 
        error: 'Debug failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}