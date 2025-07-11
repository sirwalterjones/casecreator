import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

export interface AccessLogEntry {
  timestamp: string
  ip: string
  userAgent: string
  url: string
  allowed: boolean
  headers: Record<string, string>
}

const LOG_FILE = join(process.cwd(), 'access.log')

export function logAccess(entry: AccessLogEntry): void {
  try {
    const logLine = JSON.stringify(entry) + '\n'
    
    // Append to log file
    if (existsSync(LOG_FILE)) {
      const existingLogs = readFileSync(LOG_FILE, 'utf-8')
      writeFileSync(LOG_FILE, existingLogs + logLine, 'utf-8')
    } else {
      writeFileSync(LOG_FILE, logLine, 'utf-8')
    }
    
    console.log(`📝 [ACCESS LOG] ${entry.allowed ? 'ALLOWED' : 'BLOCKED'} - ${entry.ip} - ${entry.url}`)
  } catch (error) {
    console.error('Failed to write access log:', error)
  }
}

export function getAccessLogs(limit: number = 100): AccessLogEntry[] {
  try {
    if (!existsSync(LOG_FILE)) {
      return []
    }
    
    const logs = readFileSync(LOG_FILE, 'utf-8')
    const lines = logs.trim().split('\n').filter(line => line.length > 0)
    
    // Get the most recent entries
    const recentLines = lines.slice(-limit).reverse()
    
    return recentLines.map(line => {
      try {
        return JSON.parse(line) as AccessLogEntry
      } catch {
        return null
      }
    }).filter(entry => entry !== null) as AccessLogEntry[]
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
  const logs = getAccessLogs(1000) // Get more logs for stats
  
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