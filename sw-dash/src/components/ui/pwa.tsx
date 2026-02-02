'use client'

import { useState, useEffect } from 'react'

interface InstallEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function Pwa() {
  const [prompt, setPrompt] = useState<InstallEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const [ios, setIos] = useState(false)
  const [showGuide, setShowGuide] = useState(false)

  useEffect(() => {
    setIos(/iPad|iPhone|iPod/.test(navigator.userAgent))
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
      return
    }
    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as InstallEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setPrompt(null)
  }

  if (installed) return null

  if (ios) {
    return (
      <div className="bg-card-info-bg border border-card-info-border rounded-lg p-3">
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="flex items-center gap-2 w-full text-left"
        >
          <span className="text-xl">📱</span>
          <div className="flex-1">
            <p className="text-text-info-header font-mono text-sm font-bold">install as app</p>
            <p className="text-text-info-body font-mono text-xs">tap for instructions</p>
          </div>
          <span className="text-text-info-icon">{showGuide ? '▼' : '▶'}</span>
        </button>
        {showGuide && (
          <div className="mt-3 pt-3 border-t border-card-info-border text-text-info-header font-mono text-xs space-y-2">
            <p>1. tap the share button ⬆️</p>
            <p>2. scroll down &amp; tap &quot;Add to Home Screen&quot;</p>
            <p>3. tap &quot;Add&quot; in the top right</p>
          </div>
        )}
      </div>
    )
  }

  if (!prompt) return null

  return (
    <button
      onClick={install}
      className="w-full bg-card-success-bg border border-card-success-border hover:opacity-90 rounded-lg p-3 flex items-center gap-2 transition-all group"
    >
      <span className="text-xl group-hover:scale-110 transition-transform">📲</span>
      <div className="text-left flex-1">
        <p className="text-text-success-header font-mono text-sm font-bold">install as app</p>
        <p className="text-text-success-body font-mono text-xs">get notifs &amp; quick access</p>
      </div>
      <span className="text-text-success-icon group-hover:translate-x-1 transition-transform">→</span>
    </button>
  )
}
