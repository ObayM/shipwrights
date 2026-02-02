'use client'

import { useState, useEffect } from 'react'
import { Cert } from '@/types'

interface Props {
  onResults: (certs: Cert[] | null) => void
  onLoading: (loading: boolean) => void
  resultCount?: number | null
  init?: string
}

export function CertSearch({ onResults, onLoading, resultCount, init }: Props) {
  const [q, setQ] = useState(init || '')

  useEffect(() => {
    if (init) search(init)
  }, [])

  const search = async (val: string) => {
    const v = val.trim()
    if (!v) {
      onResults(null)
      return
    }
    onLoading(true)
    try {
      const res = await fetch(`/api/admin/ship_certifications?search=${encodeURIComponent(v)}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      onResults(data.certifications || [])
    } catch {
      onResults([])
    } finally {
      onLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQ(val)
    if (!val.trim()) onResults(null)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') search(q)
    if (e.key === 'Escape') {
      setQ('')
      onResults(null)
    }
  }

  return (
    <div className="bg-linear-to-br from-card-bg-start to-card-bg-end border-2 border-card-border rounded-2xl p-3 w-full md:w-72 h-fit self-end shadow-xl shadow-shadow-color">
      <input
        type="text"
        value={q}
        onChange={handleChange}
        onKeyDown={handleKey}
        placeholder="Slack ID or FT ID"
        className="w-full bg-input-bg border-2 border-card-border-subtle text-text-primary rounded-xl p-2 font-mono text-sm focus:outline-none focus:border-card-border transition-colors placeholder:text-text-muted"
      />
      {resultCount !== null && resultCount !== undefined && (
        <div className="text-text-info-icon font-mono text-xs mt-2">
          {resultCount} result{resultCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
