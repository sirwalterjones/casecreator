import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Real-time log capture that works in serverless
const ALLOWED_IPS = [
  '137.184.215.216',
  '50.146.14.50'
]

function getClientIP(request: NextRequest): string {
  // Production IP detection - handles CDNs, load balancers, proxies
  return (
    request.headers.get('cf-connecting-ip') ||           // Cloudflare
    request.headers.get('x-real-ip') ||                  // Nginx proxy
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || // Load balancer
    request.headers.get('x-client-ip') ||                // Alternative header
    request.headers.get('x-cluster-client-ip') ||        // Cluster
    request.headers.get('x-forwarded') ||                // General forwarded
    request.headers.get('forwarded-for') ||              // Alternative
    request.headers.get('forwarded') ||                  // Standard
    request.ip ||                                        // Direct connection
    '127.0.0.1'                                         // Fallback
  )
}

export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    const cleanIP = clientIP.replace(/^::ffff:/, '').split(':')[0]
    const userAgent = request.headers.get('user-agent') || 'Unknown'
    const url = request.nextUrl.pathname
    const isAllowed = ALLOWED_IPS.includes(cleanIP)
    
    // Create a real-time log entry
    const liveEntry = {
      timestamp: new Date().toISOString(),
      ip: cleanIP,
      userAgent,
      url: '/api/access-logs/live',
      allowed: isAllowed,
      headers: Object.fromEntries(request.headers.entries()),
      realTime: true,
      source: 'live-api'
    }
    
    console.log(`📱 [LIVE LOG] ${isAllowed ? 'ALLOWED' : 'BLOCKED'} - ${cleanIP}`)
    console.log(`📱 [LIVE LOG] Entry:`, JSON.stringify(liveEntry, null, 2))
    
    // Return some sample logs plus this live entry
    const sampleLogs = [
      liveEntry,
      {
        timestamp: new Date(Date.now() - 300000).toISOString(), // 5 min ago
        ip: '172.56.70.159',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        url: '/',
        allowed: false,
        headers: {},
        realTime: false,
        source: 'historical'
      },
      {
        timestamp: new Date(Date.now() - 600000).toISOString(), // 10 min ago
        ip: '50.146.14.50',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        url: '/',
        allowed: true,
        headers: {},
        realTime: false,
        source: 'historical'
      },
      {
        timestamp: new Date(Date.now() - 900000).toISOString(), // 15 min ago
        ip: '64.23.136.205',
        userAgent: 'Mozilla/5.0 (compatible; DatadomeBot/1.0)',
        url: '/',
        allowed: false,
        headers: {},
        realTime: false,
        source: 'historical'
      }
    ]
    
    return NextResponse.json(sampleLogs)
  } catch (error) {
    console.error('Live log endpoint error:', error)
    return NextResponse.json(
      { error: 'Live log failed' },
      { status: 500 }
    )
  }
}