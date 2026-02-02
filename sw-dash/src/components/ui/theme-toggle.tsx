'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
    const [mounted, setMounted] = useState(false)
    const { theme, setTheme } = useTheme()

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="bg-item-bg border-2 border-card-border-subtle rounded-2xl p-4 animate-pulse h-[100px]"></div>
        )
    }

    return (
        <div className="bg-item-bg border-2 border-card-border-subtle rounded-2xl p-4 relative">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <div className="text-text-body font-medium text-sm">appearance</div>
                    <div className="text-text-secondary text-xs mt-1">choose your aesthetic</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => setTheme('default')}
                    className={`px-3 py-2 rounded-xl font-mono text-sm border-2 transition-all ${theme === 'default'
                        ? 'bg-accent-active text-text-primary border-accent-border'
                        : 'bg-input-bg text-text-muted border-transparent hover:border-card-border-subtle'
                        }`}
                >
                    default
                </button>
                <button
                    onClick={() => setTheme('paper')}
                    className={`px-3 py-2 rounded-xl font-mono text-sm border-2 transition-all ${theme === 'paper'
                        ? 'bg-accent-active text-text-primary border-accent-border'
                        : 'bg-input-bg text-text-muted border-transparent hover:border-card-border-subtle'
                        }`}
                >
                    paper
                </button>
            </div>
        </div>
    )
}
