import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Allowed IP addresses for CMANS Case File Generator
const ALLOWED_IPS = [
  '137.184.215.216',
  '50.146.14.50'
]

export function middleware(request: NextRequest) {
  // Get the client's IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || request.ip || 'unknown'
  
  // Clean the IP address (remove port if present)
  const cleanIp = ip.split(':')[0]
  
  // Check if the IP is in the allowed list
  if (!ALLOWED_IPS.includes(cleanIp)) {
    console.log(`Access denied for IP: ${cleanIp}`)
    
    // Return a 403 Forbidden response with a professional error page
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
        <p>Your IP address is not authorized to access this system. This incident has been logged.</p>
        <div class="error-code">
            Error Code: 403 - Forbidden<br>
            IP: ${cleanIp}
        </div>
    </div>
</body>
</html>`,
      {
        status: 403,
        headers: {
          'Content-Type': 'text/html',
        },
      }
    )
  }
  
  // Log successful access
  console.log(`Access granted for IP: ${cleanIp}`)
  
  // Allow the request to proceed
  return NextResponse.next()
}

// Configure which routes this middleware applies to
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 