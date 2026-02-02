'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Cert, Stats, TypeCount, Reviewer } from '@/types'
import { CertSearch } from './cert-search'

interface Props {
  initial: {
    certs: Cert[]
    stats: Stats
    leaderboard: Reviewer[]
    types: TypeCount[]
  }
}

const vColor = (v: string) => {
  switch (v.toLowerCase()) {
    case 'approved':
      return 'bg-card-success-bg text-text-success-body border-card-success-border'
    case 'rejected':
      return 'bg-badge-warn-bg text-badge-warn-text border-badge-warn-border'
    case 'pending':
      return 'bg-card-accent-active text-text-accent border-border-accent'
    default:
      return 'bg-item-bg text-text-muted border-card-border-subtle'
  }
}

const fmtTime = (secs: number) => {
  if (secs <= 0) return 'unlocked'
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const ago = (date: string) => {
  if (!date || date === '-') return '-'
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return `${Math.floor(diff / 604800)}w ago`
}

const fmtDate = (date: string) => {
  if (!date || date === '-') return '-'
  return new Date(date).toLocaleDateString()
}

export function CertsView({ initial }: Props) {
  const params = useSearchParams()
  const [type, setType] = useState('all')
  const [status, setStatus] = useState('pending')
  const [sortBy, setSortBy] = useState('oldest')
  const [certs, setCerts] = useState(initial.certs)
  const [stats, setStats] = useState(initial.stats)
  const [leaderboard, setLeaderboard] = useState(initial.leaderboard)
  const [types, setTypes] = useState(initial.types)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [now, setNow] = useState(Date.now())
  const [lbMode, setLbMode] = useState('weekly')
  const [searchMode, setSearchMode] = useState(false)

  const handleSearch = (results: Cert[] | null) => {
    if (results === null) {
      setSearchMode(false)
      load()
    } else {
      setSearchMode(true)
      setCerts(results)
    }
  }

  useEffect(() => {
    if (params.get('success')) {
      setMsg('cert updated')
      setTimeout(() => setMsg(null), 5000)
    }
  }, [params])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams()
      if (type !== 'all') p.set('type', type)
      if (status !== 'all') p.set('status', status)
      p.set('sortBy', sortBy)
      p.set('lbMode', lbMode)
      const res = await fetch(`/api/admin/ship_certifications?${p}`)
      if (!res.ok) return
      const data = await res.json()
      setCerts(data.certifications)
      setStats(data.stats)
      setLeaderboard(data.leaderboard || [])
      setTypes(data.typeCounts || [])
    } catch {
    } finally {
      setLoading(false)
    }
  }, [type, status, sortBy, lbMode])

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (!mounted) {
      setMounted(true)
      return
    }
    load()
  }, [type, status, sortBy, lbMode, mounted, load])
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(iv)
  }, [])

  const FilterBtn = ({
    val,
    cur,
    set,
    label,
    count,
    color,
  }: {
    val: string
    cur: string
    set: (v: string) => void
    label: string
    count?: number
    color?: string
  }) => (
    <button
      onClick={() => set(val)}
      className={`font-mono text-xs px-3 py-2 rounded-2xl border-2 transition-all ${cur === val ? (color || 'bg-accent-active text-accent-text border-accent-border') + ' shadow-lg' : 'bg-item-bg text-text-muted border-card-border-subtle hover:bg-input-bg'}`}
    >
      {label}
      {count !== undefined ? ` (${count})` : ''}
    </button>
  )

  return (
    <>
      {msg && (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-card-success-bg border-2 border-card-success-border text-text-success-header px-4 py-3 rounded-2xl font-mono text-sm z-50 shadow-xl">
          ✓ {msg}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 md:mb-8 min-h-[48px]">
        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          <h1 className="text-2xl md:text-4xl font-mono text-text-primary">Ship Certs</h1>
          <span
            className={`px-2 py-1 rounded font-mono text-xs border ${status === 'pending' ? 'bg-accent-active text-accent-text border-accent-border' : status === 'approved' ? 'bg-card-success-bg text-text-success-body border-card-success-border' : status === 'rejected' ? 'bg-badge-warn-bg text-badge-warn-text border-badge-warn-border' : 'bg-item-bg text-text-muted border-card-border-subtle'}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
          {loading && <span className="text-text-muted font-mono text-xs">loading...</span>}
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/ship_certifications/mystats"
            className="bg-item-bg text-text-primary px-3 py-2 font-mono text-xs hover:bg-input-bg transition-all border-2 border-card-border-subtle rounded-2xl shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            My Stats
          </Link>
          <Link
            href="/admin/ship_certifications/logs"
            className="bg-item-bg text-text-primary px-3 py-2 font-mono text-xs hover:bg-input-bg transition-all border-2 border-card-border-subtle rounded-2xl shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            Logs
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-linear-to-br from-card-bg-start to-card-bg-end border-4 border-card-border rounded-3xl p-4 md:p-6 shadow-xl shadow-shadow-color min-h-[280px]">
          <h2 className="text-text-primary font-mono text-base md:text-lg mb-4">The Stats</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-text-muted font-mono text-sm">Total Judged:</span>
              <span className="text-text-body font-mono font-bold">{stats.totalJudged}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted font-mono text-sm">Approved:</span>
              <span className="bg-card-success-bg text-text-success-body px-2 py-1 rounded font-mono text-sm">
                {stats.approved}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted font-mono text-sm">Rejected:</span>
              <span className="bg-badge-warn-bg text-badge-warn-text px-2 py-1 rounded font-mono text-sm">
                {stats.rejected}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted font-mono text-sm">Pending:</span>
              <span className="bg-accent-active text-accent-text px-2 py-1 rounded font-mono text-sm">
                {stats.pending}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-card-border-subtle">
              <span className="text-text-muted font-mono text-sm">Approval Rate:</span>
              <span className="text-text-body font-mono font-bold">{stats.approvalRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted font-mono text-sm">Avg Queue Time:</span>
              <span className="text-text-body font-mono">{stats.avgQueueTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted font-mono text-sm">decisions today:</span>
              <span className="text-text-body font-mono">{stats.decisionsToday}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted font-mono text-sm">new ships today:</span>
              <span className="text-text-body font-mono">{stats.newShipsToday}</span>
            </div>
          </div>
        </div>
        <div className="bg-linear-to-br from-card-bg-start to-card-bg-end border-4 border-card-border rounded-3xl p-4 md:p-6 shadow-xl shadow-shadow-color min-h-[280px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-text-primary font-mono text-base md:text-lg">Leaderboard</h2>
            <div className="flex gap-1">
              <button
                onClick={() => setLbMode('weekly')}
                className={`font-mono text-xs px-2 py-1 rounded-xl border transition-all ${lbMode === 'weekly' ? 'bg-role-shipwright-bg text-role-shipwright-text border-role-shipwright-border' : 'bg-input-bg text-text-muted border-card-border-subtle hover:bg-item-bg'}`}
              >
                Weekly
              </button>
              <button
                onClick={() => setLbMode('alltime')}
                className={`font-mono text-xs px-2 py-1 rounded-xl border transition-all ${lbMode === 'alltime' ? 'bg-role-megawright-bg text-role-megawright-text border-role-megawright-border' : 'bg-input-bg text-text-muted border-card-border-subtle hover:bg-item-bg'}`}
              >
                All Time
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {leaderboard.length > 0 ? (
              leaderboard.map((r, i) => (
                <div key={r.name} className="flex justify-between items-center text-sm font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted">{i + 1}.</span>
                    <span className="text-text-body truncate max-w-[120px] md:max-w-none">
                      {r.name}
                    </span>
                  </div>
                  <span className="text-text-primary">{r.count}</span>
                </div>
              ))
            ) : (
              <div className="text-text-muted font-mono text-sm min-h-[20px]">no reviews yet...</div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-4 md:mb-6">
        <div className="space-y-3 flex-1">
          <div>
            <h3 className="text-text-body font-mono text-xs mb-2">Filter by type</h3>
            <div className="flex flex-wrap gap-2">
              <FilterBtn val="all" cur={type} set={setType} label="All" count={stats.totalJudged} />
              {types.map((t) => (
                <FilterBtn
                  key={t.type}
                  val={t.type}
                  cur={type}
                  set={setType}
                  label={t.type}
                  count={t.count}
                />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-text-primary font-mono text-xs mb-2">Status</h3>
            <div className="flex flex-wrap gap-2">
              <FilterBtn
                val="pending"
                cur={status}
                set={setStatus}
                label="Pending"
                count={stats.pending}
                color="bg-card-warn-bg text-text-warn-body border-card-warn-border"
              />
              <FilterBtn
                val="approved"
                cur={status}
                set={setStatus}
                label="Approved"
                count={stats.approved}
                color="bg-card-success-bg text-text-success-body border-card-success-border"
              />
              <FilterBtn
                val="rejected"
                cur={status}
                set={setStatus}
                label="Rejected"
                count={stats.rejected}
                color="bg-badge-warn-bg text-badge-warn-text border-badge-warn-border"
              />
              <FilterBtn
                val="all"
                cur={status}
                set={setStatus}
                label="All"
                count={stats.totalJudged}
              />
            </div>
          </div>
          <div>
            <h3 className="text-text-primary font-mono text-xs mb-2">Sort</h3>
            <div className="flex flex-wrap gap-2">
              <FilterBtn val="oldest" cur={sortBy} set={setSortBy} label="Oldest in Queue" />
              <FilterBtn val="newest" cur={sortBy} set={setSortBy} label="Newest in Queue" />
            </div>
          </div>
        </div>
        <CertSearch
          onResults={handleSearch}
          onLoading={setLoading}
          resultCount={searchMode ? certs.length : null}
          init={params.get('search') || ''}
        />
      </div>

      <div className="md:hidden space-y-3">
        {certs.map((c) => (
          <Link
            key={c.id}
            href={`/admin/ship_certifications/${c.id}/edit`}
            className="block bg-linear-to-br from-card-bg-start to-card-bg-end border-2 border-card-border-subtle rounded-2xl p-4 hover:bg-item-bg transition-all hover:border-card-border shadow-lg hover:scale-[1.01]"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0">
                <div className="text-text-primary font-mono text-sm font-bold truncate">
                  {c.project}
                </div>
                <div className="text-text-muted font-mono text-xs">
                  #{c.id} • FT #{c.ftProjectId}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 ml-2">
                {c.customBounty && (
                  <span className="bg-role-fraudster-bg text-role-fraudster-text px-2 py-0.5 rounded font-mono text-xs border border-role-fraudster-border">
                    +{c.customBounty} 🍪
                  </span>
                )}
                {c.yswsReturned ? (
                  <span className="bg-role-megawright-bg text-role-megawright-text px-2 py-0.5 rounded font-mono text-xs">
                    RETURNED
                  </span>
                ) : (
                  <span
                    className={`px-2 py-1 rounded font-mono text-xs border ${vColor(c.verdict)}`}
                  >
                    {c.verdict}
                  </span>
                )}
              </div>
            </div>
            {c.yswsReturned && (
              <div className="text-role-megawright-text font-mono text-xs mb-2 opacity-80">
                <div>{c.yswsReturnReason}</div>
                <div className="text-text-muted">by {c.yswsReturnedBy}</div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div>
                <span className="text-text-muted">type:</span>{' '}
                <span className="text-text-body">{c.type}</span>
              </div>
              <div>
                <span className="text-text-muted">dev:</span>{' '}
                <span className="text-text-body">{c.devTime}</span>
              </div>
              <div>
                <span className="text-text-muted">by:</span>{' '}
                <span className="text-text-body truncate">{c.certifier || '-'}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="hidden md:block bg-linear-to-br from-card-bg-start to-card-bg-end border-4 border-card-border rounded-3xl overflow-hidden shadow-2xl shadow-shadow-color">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-card-border-subtle">
                <th className="text-left p-4 text-text-primary font-mono text-sm">Ship ID</th>
                <th className="text-left p-4 text-text-primary font-mono text-sm">Project</th>
                <th className="text-left p-4 text-text-primary font-mono text-sm">Verdict</th>
                <th className="text-left p-4 text-text-primary font-mono text-sm">Claimed By</th>
                <th className="text-left p-4 text-text-primary font-mono text-sm">Certifier</th>
                <th className="text-left p-4 text-text-primary font-mono text-sm">Submitter</th>
                <th className="text-left p-4 text-text-primary font-mono text-sm">Created At</th>
                <th className="text-left p-4 text-text-primary font-mono text-sm">Dev Time</th>
              </tr>
            </thead>
            <tbody>
              {certs.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-card-border-subtle hover:bg-item-bg transition-colors"
                >
                  <td className="p-4">
                    <Link
                      href={`/admin/ship_certifications/${c.id}/edit`}
                      className="text-text-primary font-mono text-sm hover:text-text-secondary underline"
                    >
                      {c.id}
                    </Link>
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/admin/ship_certifications/${c.id}/edit`}
                      className="text-text-primary font-mono text-sm hover:text-text-secondary underline"
                    >
                      {c.project}
                    </Link>
                    <div className="text-text-muted font-mono text-xs">FT #{c.ftProjectId}</div>
                    <div className="text-text-muted font-mono text-xs">Type: {c.type}</div>
                    {c.customBounty && (
                      <div className="mt-1">
                        <span className="bg-role-fraudster-bg text-role-fraudster-text px-2 py-0.5 rounded font-mono text-xs border border-role-fraudster-border">
                          +{c.customBounty} 🍪
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    {c.yswsReturned ? (
                      <div>
                        <span className="bg-role-megawright-bg text-role-megawright-text px-2 py-0.5 rounded font-mono text-xs">
                          RETURNED BY ADMIN
                        </span>
                        <div className="text-role-megawright-text font-mono text-xs mt-1 opacity-80">
                          {c.yswsReturnReason}
                        </div>
                        <div className="text-text-muted font-mono text-xs">by {c.yswsReturnedBy}</div>
                      </div>
                    ) : (
                      <span
                        className={`inline-block px-2 py-1 rounded font-mono text-xs border ${vColor(c.verdict)}`}
                      >
                        {c.verdict}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {c.claimedBy ? (
                      <div>
                        <div className="text-role-fraudster-text font-mono text-sm flex items-center gap-1">
                          🔒 {c.claimedBy}
                        </div>
                        <div className="text-text-muted font-mono text-xs">
                          {c.unlocksAt ? fmtTime(Math.floor((c.unlocksAt - now) / 1000)) : '-'}
                        </div>
                      </div>
                    ) : (
                      <span className="text-text-muted font-mono text-sm">-</span>
                    )}
                  </td>
                  <td className="p-4 text-text-body font-mono text-sm">{c.certifier}</td>
                  <td className="p-4 text-text-secondary font-mono text-sm">{c.submitter}</td>
                  <td className="p-4">
                    <div className="text-text-body font-mono text-sm">{fmtDate(c.createdAt)}</div>
                    <div className="text-text-muted font-mono text-xs">{ago(c.createdAt)}</div>
                  </td>
                  <td className="p-4 text-text-body font-mono text-sm">{c.devTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
