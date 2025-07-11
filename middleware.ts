import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 🔒 PRODUCTION IP ALLOWLIST - CMANS Case File Generator
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

export function middleware(request: NextRequest) {
  // IMMEDIATE IP CHECK - Block unauthorized IPs first
  const clientIP = getClientIP(request)
  const cleanIP = clientIP.replace(/^::ffff:/, '').split(':')[0]
  
  console.log(`🔍 [MIDDLEWARE EXECUTING] IP Check: ${cleanIP} (from ${clientIP})`)
  console.log(`🔍 [MIDDLEWARE EXECUTING] URL: ${request.url}`)
  console.log(`🔍 [MIDDLEWARE EXECUTING] Allowed IPs: ${ALLOWED_IPS.join(', ')}`)
  console.log(`🔍 [MIDDLEWARE EXECUTING] Headers: ${JSON.stringify(Object.fromEntries(request.headers.entries()))}`)
  
  // STRICT IP CHECK - Block if not in whitelist
  if (!ALLOWED_IPS.includes(cleanIP)) {
    console.log(`❌ [BLOCKED] ACCESS DENIED for IP: ${cleanIP}`)
    console.log(`❌ [BLOCKED] This should show a 403 error page immediately`)
    
    // Return professional 403 error page
    return new NextResponse(
      `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Access Denied - CMANS</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        .container {
            text-align: center;
            max-width: 500px;
            padding: 40px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .shield {
            font-size: 4rem;
            margin-bottom: 20px;
        }
        h1 {
            font-size: 2rem;
            margin-bottom: 10px;
            font-weight: 700;
        }
        .subtitle {
            font-size: 1.1rem;
            margin-bottom: 30px;
            opacity: 0.9;
        }
        .error-code {
            font-size: 0.9rem;
            font-family: monospace;
            background: rgba(0, 0, 0, 0.3);
            padding: 10px 15px;
            border-radius: 10px;
            margin-top: 30px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="shield">🛡️</div>
        <h1>Access Denied</h1>
        <p class="subtitle">
            Cherokee Multi-Agency Narcotics Squad<br>
            Authorized Access Only
        </p>
        <p>Your IP address is not authorized to access this system.<br>This incident has been logged.</p>
        <div class="error-code">
            Error Code: 403 - Forbidden<br>
            IP: ${cleanIP}<br>
            Time: ${new Date().toISOString()}
        </div>
    </div>
</body>
</html>`,
      {
        status: 403,
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    )
  }
  
  // Log successful access
  console.log(`✅ [ALLOWED] ACCESS GRANTED for IP: ${cleanIP}`)
  console.log(`✅ [ALLOWED] Proceeding to application`)
  
  // Allow the request to proceed
  return NextResponse.next()
}

// Configure which routes this middleware applies to - BLOCK ALL ROUTES
export const config = {
  matcher: [
    '/(.*)',  // Match ALL routes including root
  ],
} 