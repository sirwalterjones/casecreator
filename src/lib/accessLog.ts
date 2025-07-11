export interface AccessLogEntry {
  timestamp: string
  ip: string
  userAgent: string
  url: string
  allowed: boolean
  headers: Record<string, string>
}

// Global storage that persists across function calls
declare global {
  var accessLogs: AccessLogEntry[] | undefined
}

// Initialize global storage
if (!global.accessLogs) {
  global.accessLogs = []
}

const MAX_LOGS = 500 // Keep last 500 entries

export function logAccess(entry: AccessLogEntry): void {
  try {
    if (!global.accessLogs) {
      global.accessLogs = []
    }
    
    // Add to global storage
    global.accessLogs.unshift(entry) // Add to beginning for newest first
    
    // Keep only the most recent entries
    if (global.accessLogs.length > MAX_LOGS) {
      global.accessLogs.splice(MAX_LOGS)
    }
    
    console.log(`📝 [ACCESS LOG] ${entry.allowed ? 'ALLOWED' : 'BLOCKED'} - ${entry.ip} - ${entry.url}`)
    console.log(`📝 [ACCESS LOG] Total logged entries: ${global.accessLogs.length}`)
  } catch (error) {
    console.error('Failed to write access log:', error)
  }
}

export function getAccessLogs(limit: number = 100): AccessLogEntry[] {
  try {
    if (!global.accessLogs) {
      global.accessLogs = []
    }
    
    // Return the most recent entries (already sorted newest first)
    return global.accessLogs.slice(0, Math.min(limit, global.accessLogs.length))
  } catch (error) {
    console.error('Failed to read access logs:', error)
    return []
  }
}

export function getLogStats(): {
  totalAttempts: number
  allowedAttempts: number
  blockedAttempts: number
  uniqueIPs: number
  recentBlocked: AccessLogEntry[]
} {
  if (!global.accessLogs) {
    global.accessLogs = []
  }
  
  const logs = global.accessLogs // Use all global logs
  
  const totalAttempts = logs.length
  const allowedAttempts = logs.filter(log => log.allowed).length
  const blockedAttempts = logs.filter(log => !log.allowed).length
  const uniqueIPs = new Set(logs.map(log => log.ip)).size
  const recentBlocked = logs.filter(log => !log.allowed).slice(0, 20)
  
  return {
    totalAttempts,
    allowedAttempts,
    blockedAttempts,
    uniqueIPs,
    recentBlocked
  }
}

// Helper function to add logs manually (for testing or manual entry)
export function addManualLog(ip: string, allowed: boolean, url: string = '/', userAgent: string = 'Manual Entry'): void {
  const entry: AccessLogEntry = {
    timestamp: new Date().toISOString(),
    ip,
    userAgent,
    url,
    allowed,
    headers: {}
  }
  logAccess(entry)
}