export interface AccessLogEntry {
  timestamp: string
  ip: string
  userAgent: string
  url: string
  allowed: boolean
  headers: Record<string, string>
}

// In-memory storage for serverless environment
const accessLogs: AccessLogEntry[] = []
const MAX_LOGS = 500 // Keep last 500 entries

export function logAccess(entry: AccessLogEntry): void {
  try {
    // Add to in-memory storage
    accessLogs.unshift(entry) // Add to beginning for newest first
    
    // Keep only the most recent entries
    if (accessLogs.length > MAX_LOGS) {
      accessLogs.splice(MAX_LOGS)
    }
    
    console.log(`📝 [ACCESS LOG] ${entry.allowed ? 'ALLOWED' : 'BLOCKED'} - ${entry.ip} - ${entry.url}`)
    console.log(`📝 [ACCESS LOG] Total logged entries: ${accessLogs.length}`)
  } catch (error) {
    console.error('Failed to write access log:', error)
  }
}

export function getAccessLogs(limit: number = 100): AccessLogEntry[] {
  try {
    // Return the most recent entries (already sorted newest first)
    return accessLogs.slice(0, Math.min(limit, accessLogs.length))
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
  const logs = accessLogs // Use all in-memory logs
  
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