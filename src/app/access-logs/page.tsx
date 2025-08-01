'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Shield, RefreshCw, AlertTriangle, CheckCircle, Clock, Globe, User } from 'lucide-react'

interface AccessLogEntry {
  timestamp: string
  ip: string
  userAgent: string
  url: string
  allowed: boolean
  headers: Record<string, string>
}

interface LogStats {
  totalAttempts: number
  allowedAttempts: number
  blockedAttempts: number
  uniqueIPs: number
  recentBlocked: AccessLogEntry[]
}

export default function AccessLogsPage() {
  const [logs, setLogs] = useState<AccessLogEntry[]>([])
  const [stats, setStats] = useState<LogStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const fetchLogs = async () => {
    setLoading(true)
    try {
      // Try live endpoint first, fall back to regular
      const [liveResponse, statsResponse] = await Promise.all([
        fetch('/api/access-logs/live'),
        fetch('/api/access-logs/stats')
      ])
      
      if (liveResponse.ok) {
        const liveData = await liveResponse.json()
        setLogs(liveData)
        
        // Calculate stats from live data
        const totalAttempts = liveData.length
        const allowedAttempts = liveData.filter((log: AccessLogEntry) => log.allowed).length
        const blockedAttempts = liveData.filter((log: AccessLogEntry) => !log.allowed).length
        const uniqueIPs = new Set(liveData.map((log: AccessLogEntry) => log.ip)).size
        const recentBlocked = liveData.filter((log: AccessLogEntry) => !log.allowed).slice(0, 20)
        
        setStats({
          totalAttempts,
          allowedAttempts,
          blockedAttempts,
          uniqueIPs,
          recentBlocked
        })
      } else if (statsResponse.ok) {
        // Fallback to original endpoint
        const [logsResponse] = await Promise.all([
          fetch('/api/access-logs')
        ])
        
        if (logsResponse.ok) {
          const logsData = await logsResponse.json()
          const statsData = await statsResponse.json()
          setLogs(logsData)
          setStats(statsData)
        }
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
      setLastRefresh(new Date())
    }
  }

  useEffect(() => {
    fetchLogs()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchLogs, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const getUserAgentInfo = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    if (userAgent.includes('bot') || userAgent.includes('Bot')) return 'Bot'
    return 'Unknown'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-400" />
            <div>
              <h1 className="text-3xl font-bold">CMANS Access Logs</h1>
              <p className="text-gray-400">Security monitoring dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
            <Button 
              onClick={fetchLogs} 
              disabled={loading}
              variant="outline"
              size="sm"
              className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Attempts</p>
                    <p className="text-2xl font-bold">{stats.totalAttempts}</p>
                  </div>
                  <Clock className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Allowed</p>
                    <p className="text-2xl font-bold text-green-400">{stats.allowedAttempts}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Blocked</p>
                    <p className="text-2xl font-bold text-red-400">{stats.blockedAttempts}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Unique IPs</p>
                    <p className="text-2xl font-bold text-blue-400">{stats.uniqueIPs}</p>
                  </div>
                  <Globe className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Access Logs Table */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Recent Access Attempts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-400" />
                <p className="text-gray-400">Loading access logs...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No access logs found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-400">Timestamp</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-400">IP Address</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-400">URL</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-400">Browser</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, index) => (
                      <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50">
                        <td className="py-3 px-4">
                          <Badge
                            variant={log.allowed ? "default" : "destructive"}
                            className={log.allowed ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                          >
                            {log.allowed ? (
                              <><CheckCircle className="h-3 w-3 mr-1" /> ALLOWED</>
                            ) : (
                              <><AlertTriangle className="h-3 w-3 mr-1" /> BLOCKED</>
                            )}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-300">
                          {formatTimestamp(log.timestamp)}
                        </td>
                        <td className="py-3 px-4 font-mono text-sm">
                          {log.ip}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-300">
                          {log.url}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-300">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {getUserAgentInfo(log.userAgent)}
                            {(log as any).realTime && (
                              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-400">
                                LIVE
                              </Badge>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}