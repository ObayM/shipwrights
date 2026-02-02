'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AddUser } from '@/components/admin/add-user'

interface User {
  id: number
  username: string
  slackId: string
  isActive: boolean
  role: string
  createdAt: string
  avatar?: string | null
}

interface Props {
  users: User[]
  canEdit: boolean
  canAdd: boolean
  myName: string
  mySlackId: string
}

const roleColor = (r: string) => {
  switch (r) {
    case 'megawright':
      return 'text-role-megawright-text bg-role-megawright-bg border-role-megawright-border'
    case 'hq':
      return 'text-role-hq-text bg-role-hq-bg border-role-hq-border'
    case 'captain':
      return 'text-role-captain-text bg-role-captain-bg border-role-captain-border'
    case 'shipwright':
      return 'text-role-shipwright-text bg-role-shipwright-bg border-role-shipwright-border'
    case 'fraudster':
      return 'text-role-fraudster-text bg-role-fraudster-bg border-role-fraudster-border'
    case 'syswright':
      return 'text-role-syswright-text bg-role-syswright-bg border-role-syswright-border'
    default:
      return 'text-text-muted bg-item-bg border-card-border-subtle'
  }
}

export function UsersView({ users, canEdit, canAdd, myName, mySlackId }: Props) {
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return users
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.id.toString().includes(q)
    )
  }, [users, search])

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="bg-gradient-to-br from-card-bg-start to-card-bg-end border-2 border-card-border rounded-2xl p-3 w-full md:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search name, role, id..."
            className="w-full bg-input-bg border-2 border-card-border-subtle text-text-primary rounded-xl p-2 font-mono text-sm focus:outline-none focus:border-card-border transition-colors placeholder:text-text-muted"
          />
          <div className="text-text-muted font-mono text-xs mt-2">
            {filtered.length} / {users.length} shown
          </div>
        </div>
        {canAdd && (
          <button
            onClick={() => setShowAdd(true)}
            className="bg-button-primary-bg hover:bg-button-primary-hover text-button-primary-text font-mono text-sm px-6 py-3 rounded-2xl transition-all border-2 border-button-primary-border hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-shadow-color"
          >
            + add user
          </button>
        )}
      </div>

      <AddUser
        open={showAdd}
        onClose={() => setShowAdd(false)}
        myName={myName}
        mySlackId={mySlackId}
      />

      {/* desktop */}
      <div className="hidden lg:block bg-gradient-to-br from-card-bg-start to-card-bg-end border-4 border-card-border rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full table-fixed">
          <colgroup>
            <col style={{ width: '5%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '13%' }} />
          </colgroup>
          <thead className="border-b-2 border-card-border">
            <tr className="bg-item-bg">
              <th className="text-left text-text-primary font-mono text-sm px-4 py-3">ID</th>
              <th className="text-left text-text-primary font-mono text-sm px-4 py-3">USER</th>
              <th className="text-left text-text-primary font-mono text-sm px-4 py-3">SLACK</th>
              <th className="text-left text-text-primary font-mono text-sm px-4 py-3">ROLE</th>
              <th className="text-left text-text-primary font-mono text-sm px-4 py-3">STATUS</th>
              <th className="text-left text-text-primary font-mono text-sm px-4 py-3">JOINED</th>
              <th className="text-left text-text-primary font-mono text-sm px-4 py-3">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr
                key={u.id}
                className="border-b border-card-border-subtle hover:bg-item-bg transition-colors"
              >
                <td className="text-text-secondary font-mono text-sm px-4 py-3">#{u.id}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {u.avatar && (
                      <Image
                        src={u.avatar}
                        alt=""
                        width={28}
                        height={28}
                        className="w-7 h-7 rounded"
                      />
                    )}
                    <span className="text-text-primary font-mono text-sm truncate">{u.username}</span>
                  </div>
                </td>
                <td className="text-text-secondary font-mono text-xs px-4 py-3">{u.slackId}</td>
                <td className="px-4 py-3">
                  <span
                    className={`font-mono text-xs px-2 py-1 rounded-lg border ${roleColor(u.role)}`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`font-mono text-xs px-2 py-1 rounded-lg border ${u.isActive ? 'bg-card-success-bg text-text-success-icon border-card-success-border' : 'bg-role-syswright-bg text-role-syswright-text border-role-syswright-border'}`}
                  >
                    {u.isActive ? 'active' : 'inactive'}
                  </span>
                </td>
                <td className="text-text-secondary font-mono text-sm px-4 py-3">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  {canEdit ? (
                    <Link
                      href={`/admin/users/${u.id}`}
                      className="px-4 py-1.5 bg-input-bg hover:bg-item-bg border-2 border-card-border text-text-primary font-mono text-xs rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      manage
                    </Link>
                  ) : (
                    <span className="text-text-muted font-mono text-xs">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && search && (
          <div className="text-center py-12 text-text-muted font-mono text-sm">
            no matches for &quot;{search}&quot;
          </div>
        )}
        {users.length === 0 && (
          <div className="text-center py-12 text-text-muted font-mono text-sm">no users yet</div>
        )}
      </div>

      {/* mobile */}
      <div className="lg:hidden space-y-4">
        {filtered.map((u) => (
          <Link
            key={u.id}
            href={canEdit ? `/admin/users/${u.id}` : '#'}
            className={`block bg-gradient-to-br from-card-bg-start to-card-bg-end border-4 border-card-border rounded-3xl p-4 shadow-2xl ${canEdit ? 'active:scale-[0.98] transition-transform' : ''}`}
          >
            <div className="flex items-center gap-3 mb-3">
              {u.avatar && (
                <Image
                  src={u.avatar}
                  alt=""
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-lg"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-text-primary font-mono text-sm truncate">{u.username}</div>
                <div className="text-text-secondary font-mono text-xs">#{u.id}</div>
              </div>
              <span
                className={`font-mono text-xs px-2 py-1 rounded-lg border ${u.isActive ? 'bg-card-success-bg text-text-success-icon border-card-success-border' : 'bg-role-syswright-bg text-role-syswright-text border-role-syswright-border'}`}
              >
                {u.isActive ? 'active' : 'inactive'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-item-bg border border-card-border-subtle rounded-xl p-2">
                <div className="text-text-muted font-mono text-xs mb-1">role</div>
                <span
                  className={`font-mono text-xs px-2 py-0.5 rounded-lg border inline-block ${roleColor(u.role)}`}
                >
                  {u.role}
                </span>
              </div>
              <div className="bg-item-bg border border-card-border-subtle rounded-xl p-2">
                <div className="text-text-muted font-mono text-xs mb-1">joined</div>
                <div className="text-text-primary font-mono text-xs">
                  {new Date(u.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="mt-2 text-text-secondary font-mono text-xs truncate">{u.slackId}</div>
          </Link>
        ))}
        {filtered.length === 0 && search && (
          <div className="bg-gradient-to-br from-card-bg-start to-card-bg-end border-4 border-card-border rounded-3xl p-6 text-center text-text-muted font-mono text-sm">
            no matches for &quot;{search}&quot;
          </div>
        )}
        {users.length === 0 && (
          <div className="bg-linear-to-br from-card-bg-start to-card-bg-end border-4 border-card-border rounded-3xl p-6 text-center text-text-muted font-mono text-sm">
            no users yet
          </div>
        )}
      </div>
    </>
  )
}
