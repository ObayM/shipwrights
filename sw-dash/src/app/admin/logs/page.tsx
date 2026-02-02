'use client'

import { useState, useEffect, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface Log {
  id: number
  userId: number | null
  slackId: string | null
  username: string | null
  role: string | null
  action: string
  context: string | null
  statusCode: number
  ip: string | null
  userAgent: string | null
  email: string | null
  avatar: string | null
  targetId: number | null
  targetType: string | null
  metadata: Record<string, unknown> | null
  severity: string | null
  createdAt: string
}

export default function Logs() {
  const router = useRouter()
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')
  const [targetTypeFilter, setTargetTypeFilter] = useState('')
  const [expandedMeta, setExpandedMeta] = useState<Set<number>>(new Set())
  const [hideSens, setHideSens] = useState(true)
  const [sevOpen, setSevOpen] = useState(false)
  const [targetOpen, setTargetOpen] = useState(false)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      const res = await fetch('/api/admin/logs')
      if (!res.ok) {
        if (res.status === 403) {
          router.push('/')
          return
        }
        throw new Error('fetch fucked up')
      }
      const data = await res.json()
      setLogs(data.logs)
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const statusColor = (code: number) => {
    if (code >= 200 && code < 300) return 'text-text-success-icon'
    if (code >= 400 && code < 500) return 'text-badge-warn-border'
    if (code >= 500) return 'text-role-syswright-text'
    return 'text-text-muted'
  }

  const roleColor = (role: string | null) => {
    if (!role) return 'text-text-muted'
    if (role === 'megawright') return 'text-role-megawright-text'
    if (role === 'hq') return 'text-role-hq-text'
    if (role === 'captain') return 'text-role-captain-text'
    if (role === 'shipwright') return 'text-role-shipwright-text'
    if (role === 'observer') return 'text-text-secondary'
    return 'text-text-muted'
  }

  const severityColor = (severity: string | null) => {
    if (!severity || severity === 'info') return 'text-text-info-icon'
    if (severity === 'debug') return 'text-text-muted'
    if (severity === 'warn') return 'text-badge-warn-border'
    if (severity === 'error') return 'text-role-syswright-text'
    if (severity === 'critical') return 'text-role-syswright-text font-bold'
    return 'text-text-muted'
  }

  const toggleMeta = (id: number) => {
    setExpandedMeta((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const filtered = logs.filter((l) => {
    if (actionFilter && !l.action.toLowerCase().includes(actionFilter.toLowerCase())) return false
    if (severityFilter && l.severity !== severityFilter) return false
    if (targetTypeFilter && l.targetType !== targetTypeFilter) return false
    return true
  })

  const uniqueSeverities = Array.from(new Set(logs.map((l) => l.severity).filter(Boolean)))
  const uniqueTargetTypes = Array.from(new Set(logs.map((l) => l.targetType).filter(Boolean)))

  if (loading) {
    return (
      <main className="bg-grid min-h-screen w-full flex items-center justify-center" role="main">
        <div className="text-text-primary font-mono">loading...</div>
      </main>
    )
  }

  return (
    <main className="bg-grid min-h-screen w-full p-4 md:p-8" role="main">
      <div className="w-full px-2 md:px-4">
        <Link
          href="/admin"
          className="text-text-secondary hover:text-text-primary font-mono text-sm transition-colors mb-4 md:mb-6 inline-flex items-center gap-2"
        >
          ← back to admin
        </Link>
        <div className="bg-gradient-to-br from-card-bg-start to-card-bg-end border-4 border-card-border rounded-3xl p-4 backdrop-blur-sm shadow-2xl shadow-shadow-color mb-6 overflow-visible relative z-20">
          <div className="flex gap-3 flex-wrap items-center">
            <input
              type="text"
              placeholder="hi"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-input-bg border-2 border-card-border-subtle text-text-primary font-mono text-sm px-4 py-2 rounded-xl focus:outline-none focus:border-card-border transition-colors placeholder:text-text-muted"
            />
            <div className="relative">
              <button
                onClick={() => {
                  setSevOpen(!sevOpen)
                  setTargetOpen(false)
                }}
                className="bg-input-bg border-2 border-card-border-subtle text-text-primary font-mono text-sm px-4 py-2 rounded-xl hover:border-card-border transition-colors flex items-center gap-2"
              >
                {severityFilter || 'all severity'}
              </button>
              {sevOpen && (
                <div className="absolute top-full left-0 mt-1 bg-card-bg-start border-2 border-card-border rounded-xl overflow-hidden z-50 min-w-full">
                  <button
                    onClick={() => {
                      setSeverityFilter('')
                      setSevOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2 font-mono text-sm hover:bg-item-bg transition-colors ${!severityFilter ? 'text-text-primary' : 'text-text-secondary'}`}
                  >
                    all severity
                  </button>
                  {uniqueSeverities.map((s) => (
                    <button
                      key={s ?? ''}
                      onClick={() => {
                        setSeverityFilter(s ?? '')
                        setSevOpen(false)
                      }}
                      className={`w-full text-left px-4 py-2 font-mono text-sm hover:bg-item-bg transition-colors ${severityFilter === s ? 'text-text-primary' : 'text-text-secondary'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => {
                  setTargetOpen(!targetOpen)
                  setSevOpen(false)
                }}
                className="bg-input-bg border-2 border-card-border-subtle text-text-primary font-mono text-sm px-4 py-2 rounded-xl hover:border-card-border transition-colors flex items-center gap-2"
              >
                {targetTypeFilter || 'all targets'}
              </button>
              {targetOpen && (
                <div className="absolute top-full left-0 mt-1 bg-card-bg-start border-2 border-card-border rounded-xl overflow-hidden z-50 min-w-full">
                  <button
                    onClick={() => {
                      setTargetTypeFilter('')
                      setTargetOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2 font-mono text-sm hover:bg-item-bg transition-colors ${!targetTypeFilter ? 'text-text-primary' : 'text-text-secondary'}`}
                  >
                    all targets
                  </button>
                  {uniqueTargetTypes.map((t) => (
                    <button
                      key={t ?? ''}
                      onClick={() => {
                        setTargetTypeFilter(t ?? '')
                        setTargetOpen(false)
                      }}
                      className={`w-full text-left px-4 py-2 font-mono text-sm hover:bg-item-bg transition-colors ${targetTypeFilter === t ? 'text-text-primary' : 'text-text-secondary'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setHideSens(!hideSens)}
              className="flex items-center gap-2 text-text-secondary font-mono text-sm py-2"
            >
              <div
                className={`w-10 h-5 rounded-full transition-colors relative ${hideSens ? 'bg-item-bg border border-text-secondary' : 'bg-input-bg border border-card-border-subtle'}`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-text-primary transition-all ${hideSens ? 'left-5' : 'left-0.5'}`}
                />
              </div>
              blur sens data
            </button>
            <span className="ml-auto text-text-muted font-mono text-sm">
              {filtered.length} logs (ask eric if needed for older ones)
            </span>
          </div>
        </div>

        <div className="hidden lg:block bg-gradient-to-br from-card-bg-start to-card-bg-end border-4 border-card-border rounded-3xl overflow-hidden backdrop-blur-sm shadow-2xl shadow-shadow-color">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b-2 border-card-border">
                <tr className="bg-item-bg">
                  <th className="text-left p-3 text-text-primary font-mono text-sm">ID</th>
                  <th className="text-left p-3 text-text-primary font-mono text-sm">Severity</th>
                  <th className="text-left p-3 text-text-primary font-mono text-sm">User</th>
                  <th className="text-left p-3 text-text-primary font-mono text-sm">Slack ID</th>
                  <th className="text-left p-3 text-text-primary font-mono text-sm">Email</th>
                  <th className="text-left p-3 text-text-primary font-mono text-sm">Role</th>
                  <th className="text-left p-3 text-text-primary font-mono text-sm">Action</th>
                  <th className="text-left p-3 text-text-primary font-mono text-sm">Target</th>
                  <th className="text-left p-3 text-text-primary font-mono text-sm">Context</th>
                  <th className="text-left p-3 text-text-primary font-mono text-sm">Status</th>
                  <th className="text-left p-3 text-text-primary font-mono text-sm">IP</th>
                  <th className="text-left p-3 text-text-primary font-mono text-sm">User Agent</th>
                  <th className="text-left p-3 text-text-primary font-mono text-sm">When</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={13}
                      className="text-center p-8 text-text-muted font-mono text-sm"
                    >
                      no logs found
                    </td>
                  </tr>
                ) : (
                  filtered.map((log) => (
                    <Fragment key={log.id}>
                      <tr className="border-b border-card-border-subtle hover:bg-item-bg transition-colors">
                        <td className="p-3 text-text-secondary font-mono text-xs">#{log.id}</td>
                        <td className="p-3 font-mono text-xs">
                          <span className={severityColor(log.severity)}>
                            {log.severity || 'info'}
                          </span>
                        </td>
                        <td className="p-3 text-text-primary font-mono text-xs">
                          <div className="flex items-center gap-2">
                            {log.avatar && (
                              <Image
                                src={log.avatar}
                                alt=""
                                width={20}
                                height={20}
                                className="rounded-full"
                              />
                            )}
                            {log.username || '-'}
                          </div>
                        </td>
                        <td className="p-3 text-text-secondary font-mono text-xs">
                          {log.slackId || '-'}
                        </td>
                        <td className="p-3 text-text-secondary font-mono text-xs">
                          <span className={hideSens ? 'blur-sm select-none' : ''}>
                            {log.email || '-'}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-xs">
                          <span className={roleColor(log.role)}>{log.role || '-'}</span>
                        </td>
                        <td className="p-3 text-text-primary font-mono text-xs">{log.action}</td>
                        <td className="p-3 text-text-info-header font-mono text-xs">
                          {log.targetType && log.targetId
                            ? `${log.targetType}#${log.targetId}`
                            : '-'}
                        </td>
                        <td className="p-3 text-text-body font-mono text-xs max-w-xs truncate">
                          {log.context || '-'}
                        </td>
                        <td className="p-3 font-mono text-xs">
                          <span className={statusColor(log.statusCode)}>{log.statusCode}</span>
                        </td>
                        <td className="p-3 text-role-syswright-text font-mono text-xs">
                          <span className={hideSens ? 'blur-sm select-none' : ''}>
                            {log.ip || '-'}
                          </span>
                        </td>
                        <td
                          className="p-3 text-text-muted font-mono text-xs max-w-[200px] truncate"
                          title={hideSens ? '' : log.userAgent || ''}
                        >
                          <span className={hideSens ? 'blur-sm select-none' : ''}>
                            {log.userAgent || '-'}
                          </span>
                        </td>
                        <td className="p-3 text-text-secondary font-mono text-xs whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                      </tr>
                      {log.metadata && (
                        <tr key={`${log.id}-meta`} className="border-b border-card-border-subtle">
                          <td colSpan={13} className="p-0">
                            <button
                              onClick={() => toggleMeta(log.id)}
                              className="w-full text-left px-3 py-2 text-xs font-mono text-text-secondary hover:text-text-primary hover:bg-item-bg transition-colors"
                            >
                              {expandedMeta.has(log.id) ? '▼' : '▶'} metadata
                            </button>
                            {expandedMeta.has(log.id) && (
                              <pre className="px-6 pb-3 text-xs text-text-body font-mono overflow-x-auto bg-input-bg">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:hidden space-y-4">
          {filtered.length === 0 ? (
            <div className="bg-linear-to-br from-card-bg-start to-card-bg-end border-4 border-card-border rounded-3xl p-6 backdrop-blur-sm shadow-2xl shadow-shadow-color text-center">
              <div className="text-text-muted font-mono text-sm">no logs found</div>
            </div>
          ) : (
            filtered.map((log) => (
              <div
                key={log.id}
                className="bg-linear-to-br from-card-bg-start to-card-bg-end border-4 border-card-border rounded-3xl p-4 backdrop-blur-sm shadow-2xl shadow-shadow-color"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {log.avatar && (
                      <Image
                        src={log.avatar}
                        alt=""
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    )}
                    <span className="text-text-primary font-mono text-sm">
                      {log.username || 'anon'}
                    </span>
                    <span className={`font-mono text-xs ${roleColor(log.role)}`}>{log.role}</span>
                  </div>
                  <span
                    className={`font-mono text-xs px-2 py-1 rounded-lg border ${log.statusCode >= 200 && log.statusCode < 300
                      ? 'bg-card-success-bg text-text-success-icon border-card-success-border'
                      : log.statusCode >= 400 && log.statusCode < 500
                        ? 'bg-badge-warn-bg text-badge-warn-text border-badge-warn-border'
                        : log.statusCode >= 500
                          ? 'bg-role-syswright-bg text-role-syswright-text border-role-syswright-border'
                          : 'bg-item-bg text-text-muted border-card-border-subtle'
                      }`}
                  >
                    {log.statusCode}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="text-text-primary font-mono text-sm mb-1">{log.action}</div>
                  {log.context && (
                    <div className="text-text-secondary font-mono text-xs">{log.context}</div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="bg-item-bg border border-card-border-subtle rounded-xl p-2">
                    <div className="text-text-muted font-mono mb-1">severity</div>
                    <span className={severityColor(log.severity)}>{log.severity || 'info'}</span>
                  </div>
                  <div className="bg-item-bg border border-card-border-subtle rounded-xl p-2">
                    <div className="text-text-muted font-mono mb-1">target</div>
                    <span className="text-text-info-header font-mono">
                      {log.targetType && log.targetId ? `${log.targetType}#${log.targetId}` : '-'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-muted font-mono">ip</span>
                    <span
                      className={`text-role-syswright-text font-mono ${hideSens ? 'blur-sm select-none' : ''}`}
                    >
                      {log.ip || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted font-mono">when</span>
                    <span className="text-text-secondary font-mono">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {log.metadata && (
                  <div className="mt-3 pt-3 border-t border-card-border-subtle">
                    <button
                      onClick={() => toggleMeta(log.id)}
                      className="text-text-secondary hover:text-text-primary font-mono text-xs py-2"
                    >
                      {expandedMeta.has(log.id) ? '▼' : '▶'} metadata
                    </button>
                    {expandedMeta.has(log.id) && (
                      <pre className="mt-2 p-2 text-xs text-text-body font-mono overflow-x-auto bg-input-bg rounded-lg">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
