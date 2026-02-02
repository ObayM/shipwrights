'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Pwa from '@/components/ui/pwa'

interface User {
  id: number
  username: string
  avatar: string | null
  role: string
}

const roleStyle = (r: string) => {
  switch (r) {
    case 'megawright':
      return 'bg-role-megawright-bg text-role-megawright-text border-role-megawright-border'
    case 'captain':
      return 'bg-role-captain-bg text-role-captain-text border-role-captain-border'
    case 'shipwright':
      return 'bg-role-shipwright-bg text-role-shipwright-text border-role-shipwright-border'
    case 'observer':
      return 'bg-item-bg text-text-secondary border-card-border-subtle'
    case 'syswright':
      return 'bg-role-syswright-bg text-role-syswright-text border-role-syswright-border'
    default:
      return 'bg-badge-warn-bg text-badge-warn-text border-badge-warn-border'
  }
}

export function ProfileCard({ user }: { user: User }) {
  const router = useRouter()

  const logout = async () => {
    localStorage.removeItem('sw_auth')
    await fetch('/api/logout', { method: 'POST' }).catch(() => {})
    router.push('/')
  }

  return (
    <div className="bg-linear-to-br from-card-bg-start to-card-bg-end border-4 border-card-border rounded-3xl p-4 md:p-8 max-w-md mx-auto backdrop-blur-md shadow-2xl shadow-shadow-color relative">
      <Image
        src="/logo_nobg_notext.png"
        alt="shipso"
        width={160}
        height={160}
        priority
        className="absolute -top-2 -right-2 w-24 h-24 md:w-32 md:h-32 rotate-12 pointer-events-none z-10"
      />
      <div className="flex items-center mb-4">
        {user.avatar && (
          <Image
            src={user.avatar}
            alt="profile"
            width={64}
            height={64}
            className="w-12 h-12 md:w-16 md:h-16 rounded-full border-3 border-amber-700/50 mr-3 md:mr-4 shadow-lg shadow-amber-900/30"
          />
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-text-primary text-lg md:text-xl font-mono font-bold truncate mb-1">
            {user.username}
          </h2>
          <p className="text-text-secondary font-mono text-sm mb-2">shipwright legend fr</p>
          <div className="flex gap-2 items-center">
            <span
              className={`inline-block font-mono text-xs px-2 py-1 rounded border ${roleStyle(user.role)}`}
            >
              {user.role}
            </span>
          </div>
        </div>
      </div>
      <button
        onClick={logout}
        className="w-full mt-4 bg-role-captain-bg border-2 border-role-captain-border text-role-captain-text hover:bg-role-captain-border font-mono text-sm px-4 py-2 rounded-2xl transition-all hover:border-role-captain-text hover:scale-[1.02] active:scale-[0.98]"
      >
        logout
      </button>
      <div className="mt-4">
        <Pwa />
      </div>
    </div>
  )
}
