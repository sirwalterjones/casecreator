import { headers } from 'next/headers'
import { logAccess } from '@/lib/accessLog'

// 🔒 PRODUCTION IP ALLOWLIST - CMANS Case File Generator
const ALLOWED_IPS = [
  '137.184.215.216',
  '50.146.14.50'
]

function getClientIP(): string {
  const headersList = headers()
  
  // Production IP detection - handles CDNs, load balancers, proxies
  const clientIP = (
    headersList.get('cf-connecting-ip') ||           // Cloudflare
    headersList.get('x-real-ip') ||                  // Nginx proxy
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || // Load balancer
    headersList.get('x-client-ip') ||                // Alternative header
    headersList.get('x-cluster-client-ip') ||        // Cluster
    headersList.get('x-forwarded') ||                // General forwarded
    headersList.get('forwarded-for') ||              // Alternative
    headersList.get('forwarded') ||                  // Standard
    '127.0.0.1'                                      // Fallback
  )
  
  return clientIP
}

export default function IPGuard({ children }: { children: React.ReactNode }) {
  const headersList = headers()
  const clientIP = getClientIP()
  const cleanIP = clientIP.replace(/^::ffff:/, '').split(':')[0]
  
  // Get request info for logging
  const url = headersList.get('x-pathname') || '/'
  const userAgent = headersList.get('user-agent') || 'Unknown'
  const allHeaders = Object.fromEntries(headersList.entries())
  
  console.log(`🔍 [IP GUARD] Checking IP: ${cleanIP} (from ${clientIP})`)
  console.log(`🔍 [IP GUARD] Allowed IPs: ${ALLOWED_IPS.join(', ')}`)
  
  // Check if the IP is in the allowed list
  const isAllowed = ALLOWED_IPS.includes(cleanIP)
  
  // Log the access attempt
  const logEntry = {
    timestamp: new Date().toISOString(),
    ip: cleanIP,
    userAgent,
    url,
    allowed: isAllowed,
    headers: allHeaders
  }
  
  console.log(`🔍 [IP GUARD] About to log entry:`, JSON.stringify(logEntry, null, 2))
  logAccess(logEntry)
  console.log(`🔍 [IP GUARD] Log entry saved successfully`)
  
  if (!isAllowed) {
    console.log(`❌ [IP GUARD] ACCESS DENIED for IP: ${cleanIP}`)
    
    return (
      <html lang="en">
        <head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Access Denied - CMANS</title>
          <style dangerouslySetInnerHTML={{
            __html: `
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
            `
          }} />
        </head>
        <body>
          <div className="container">
            <div className="shield">🛡️</div>
            <h1>Access Denied</h1>
            <p className="subtitle">
              Cherokee Multi-Agency Narcotics Squad<br />
              Authorized Access Only
            </p>
            <p>Your IP address is not authorized to access this system.<br />This incident has been logged.</p>
            <div className="error-code">
              Error Code: 403 - Forbidden<br />
              IP: {cleanIP}<br />
              Time: {new Date().toISOString()}
            </div>
          </div>
        </body>
      </html>
    )
  }
  
  console.log(`✅ [IP GUARD] ACCESS GRANTED for IP: ${cleanIP}`)
  return <>{children}</>
}