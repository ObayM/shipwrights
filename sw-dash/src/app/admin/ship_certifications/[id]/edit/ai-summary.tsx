'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { generateProjectSummary } from '@/app/actions/ai-summary'

import { ShipCert } from '@/types'

interface Props {
  cert: ShipCert
}

export function AiSummary({ cert }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [localSummary, setLocalSummary] = useState(cert.aiSummary)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await generateProjectSummary(cert.id, {
        projectName: cert.project,
        projectType: cert.type,
        readmeUrl: cert.links?.readme,
        demoUrl: cert.links?.demo,
        repoUrl: cert.links?.repo,
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate summary :(')
      }

      if (result.summary) {
        setLocalSummary(result.summary)
      }
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error ;/')
    } finally {
      setLoading(false)
    }
  }

  const displaySummary = localSummary || cert.aiSummary

  return (
    <div className="bg-linear-to-br from-card-bg-start to-card-bg-end border-4 border-card-border rounded-3xl p-4 md:p-6 shadow-xl shadow-shadow-color mb-4 md:mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-text-primary font-mono text-sm font-bold uppercase tracking-wider">
          AI Summary
        </h3>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-button-primary-bg text-button-primary-text px-4 py-1.5 font-mono text-xs hover:bg-button-primary-hover transition-all border border-button-primary-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
        >
          {loading ? 'generating...' : 'generate'}
        </button>
      </div>

      {error && (
        <div className="text-role-syswright-text font-mono text-xs mb-4 bg-role-syswright-bg p-3 rounded-xl border border-role-syswright-border">
          <span className="font-bold">Error:</span> {error}
        </div>
      )}

      {displaySummary ? (
        <div className="bg-input-bg border-2 border-card-border-subtle rounded-2xl p-5 shadow-inner">
          <div className="prose prose-invert prose-sm max-w-none font-mono text-text-markdown leading-relaxed">
            <ReactMarkdown>{displaySummary}</ReactMarkdown>
          </div>
        </div>
      ) : (
        <div className="text-text-muted font-mono text-sm text-center py-8 border-2 border-dashed border-card-border-subtle rounded-2xl">
          no summary generated yet...
        </div>
      )}
    </div>
  )
}
