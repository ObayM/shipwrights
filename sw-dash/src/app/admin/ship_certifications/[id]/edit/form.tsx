'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { can, PERMS } from '@/lib/perms'
import { useShipCert } from '@/hooks/useShipCert'
import { AiSummary } from './ai-summary'

interface Props {
  shipId: string
}

export function Form({ shipId }: Props) {
  const {
    cert,
    setCert,
    file,
    loading,
    reason,
    setReason,
    note,
    setNote,
    uploading,
    url,
    user,
    show,
    setShow,
    err,
    dragging,
    setDragging,
    showPick,
    picks,
    fraudUrls,
    claimedBy,
    canEditClaim,
    isMyClaim,
    claimed,
    canEdit,
    canOverride,
    isViewOnly,
    submitting,
    startReview,
    unclaim,
    update,
    save,
    del,
    onChange,
    pick,
    fmt,
    upload,
    updateType,
    bounty,
    updateBounty,
    saveBounty,
    bountySaved,
  } = useShipCert(shipId)

  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null)

  useEffect(() => {
    if (!cert?.claimedAt) {
      setTimeLeft(null)
      return
    }

    const calc = () => {
      const claimed = new Date(cert.claimedAt!).getTime()
      const now = Date.now()
      const remaining = Math.max(0, 30 * 60 * 1000 - (now - claimed))
      setTimeLeft(Math.floor(remaining / 1000))
    }

    calc()
    const iv = setInterval(calc, 1000)
    return () => clearInterval(iv)
  }, [cert?.claimedAt])

  if (loading) {
    return (
      <main className="bg-grid min-h-screen w-full flex items-center justify-center" role="main">
        <div className="text-text-primary font-mono">loading...</div>
      </main>
    )
  }

  if (!cert) {
    return (
      <main className="bg-grid min-h-screen w-full flex items-center justify-center" role="main">
        <div className="text-role-syswright-text font-mono">ship not found</div>
      </main>
    )
  }

  const fmtDt = (d: string | null) => (d ? new Date(d).toLocaleString() : '-')
  const created = fmtDt(cert.createdAt)
  const updated = fmtDt(cert.updatedAt)

  return (
    <main
      className="bg-grid min-h-screen w-full p-4 md:p-8"
      role="main"
      onDragOver={(e) => {
        e.preventDefault()
        if (!uploading && canEdit) setDragging(true)
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDragging(false)
      }}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        if (uploading || !canEdit) return
        const f = e.dataTransfer.files?.[0]
        if (f && f.type.startsWith('video/')) upload(f)
      }}
    >
      {dragging && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center pointer-events-none backdrop-blur-sm">
          <div className="text-text-primary font-mono text-xl md:text-2xl drop-shadow-2xl">
            gimme videos
          </div>
        </div>
      )}
      <div className="w-full">
        <Link
          href="/admin/ship_certifications"
          className="text-text-primary font-mono text-sm hover:text-text-secondary transition-colors mb-4 md:mb-6 inline-flex items-center gap-2"
        >
          ← back
        </Link>

        <h1 className="text-2xl md:text-4xl font-mono text-text-primary mb-1 md:mb-2">Edit Cert</h1>
        <h2 className="text-lg md:text-2xl font-mono text-text-secondary mb-4 md:mb-8 truncate">
          {cert.project}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <AiSummary cert={cert} />

            <div className="bg-gradient-to-br from-card-bg-start to-card-bg-end border-4 border-card-border rounded-3xl p-4 md:p-6 shadow-xl shadow-shadow-color">
              <h3 className="text-text-primary font-mono text-sm font-bold mb-2 md:mb-3">
                Description
              </h3>
              <div className="bg-input-bg border-2 border-card-border-subtle rounded-2xl p-4">
                <pre className="text-text-body font-mono text-sm whitespace-pre-wrap">
                  {cert.desc}
                </pre>
              </div>
            </div>

            <div className="bg-gradient-to-br from-card-bg-start to-card-bg-end border-4 border-card-border rounded-3xl p-4 md:p-6 shadow-xl shadow-shadow-color">
              <h3 className="text-text-primary font-mono text-sm font-bold mb-2 md:mb-3">Links</h3>
              <div className="flex flex-wrap gap-3 md:gap-4">
                {cert.links?.demo && (
                  <a
                    href={cert.links.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-primary font-mono text-sm hover:text-text-secondary underline"
                  >
                    Play
                  </a>
                )}
                {cert.links?.repo && (
                  <a
                    href={cert.links.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-primary font-mono text-sm hover:text-text-secondary underline"
                  >
                    Repo
                  </a>
                )}
                {cert.links?.readme && (
                  <a
                    href={cert.links.readme}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-primary font-mono text-sm hover:text-text-secondary underline"
                  >
                    Readme
                  </a>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-card-bg-start to-card-bg-end border-4 border-card-border rounded-3xl p-4 md:p-6 shadow-xl shadow-shadow-color">
              <h3 className="text-text-primary font-mono text-sm font-bold mb-3 md:mb-4">Decision</h3>
              <div className="mb-2 text-text-muted font-mono text-xs md:text-sm">
                I <span className="text-text-primary">(approve/reject)</span>{' '}
                <span className="text-text-body truncate">{cert.project}</span> cuz:
              </div>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isViewOnly}
                className="w-full bg-input-bg border-2 border-card-border-subtle text-text-body font-mono text-sm p-3 rounded-2xl focus:outline-none focus:border-card-border min-h-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="enter your reasoning here..."
              />
            </div>

            <div className="bg-linear-to-br from-card-bg-start to-card-bg-end border-4 border-amber-900/40 rounded-3xl p-4 md:p-6 shadow-xl shadow-amber-950/20">
              <h3 className="text-amber-400 font-mono text-sm font-bold mb-3 md:mb-4">
                Proof Video
              </h3>
              <div className="mb-4">
                <label className="block mb-2">
                  <div
                    className={`bg-bg-highlight border-4 border-dashed border-border-dashed rounded-2xl p-4 text-center transition-all ${uploading || isViewOnly ? 'opacity-50 cursor-not-allowed' : 'hover:border-card-border cursor-pointer'}`}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (!uploading && canEdit) {
                        e.currentTarget.classList.add('border-text-primary', 'bg-accent-active')
                      }
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      e.currentTarget.classList.remove('border-text-primary', 'bg-accent-active')
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      e.currentTarget.classList.remove('border-text-primary', 'bg-accent-active')
                      if (uploading || !canEdit) return
                      const f = e.dataTransfer.files?.[0]
                      if (f && f.type.startsWith('video/')) upload(f)
                    }}
                  >
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) upload(f)
                      }}
                      disabled={uploading || isViewOnly}
                    />
                    <span className="text-text-primary font-mono text-sm">
                      {uploading
                        ? 'uploading video...'
                        : file
                          ? `✓ ${file.name}`
                          : 'drag & drop or click to upload'}
                    </span>
                  </div>
                </label>
                {uploading && (
                  <div className="mt-2 text-badge-warn-text font-mono text-xs text-center">
                    wait for upload to finish before submitting...
                  </div>
                )}
              </div>
              {(url || cert.proofVideo) && (
                <div className="mb-4">
                  <div className="text-text-muted font-mono text-xs mb-1">
                    {url ? 'New video:' : 'Current:'}
                  </div>
                  <a
                    href={url || cert.proofVideo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-primary font-mono text-sm hover:text-text-secondary underline break-all"
                  >
                    {url || cert.proofVideo}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 md:space-y-6">
            <div className="bg-gradient-to-br from-card-bg-start to-card-bg-end border-4 border-card-border rounded-3xl p-4 md:p-6 shadow-xl shadow-shadow-color">
              <div className="flex justify-between items-center mb-3 md:mb-4">
                <h3 className="text-text-primary font-mono text-sm font-bold">Details</h3>
                {user?.role && can(user.role, PERMS.certs_admin) && (
                  <button
                    onClick={() => setShow(!show)}
                    className="bg-button-primary-bg border border-dashed border-button-primary-border hover:border-button-primary-hover text-button-primary-text hover:text-text-secondary font-mono text-xs px-2 py-1 rounded transition-all"
                  >
                    inspect ship deets
                  </button>
                )}
              </div>
              <div className="space-y-3 text-sm font-mono">
                <div>
                  <span className="text-text-muted">Project:</span>{' '}
                  <a
                    href={`${process.env.NEXT_PUBLIC_FLAVORTOWN_URL}/projects/${cert.ftId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-primary hover:text-text-secondary underline"
                  >
                    {cert.project}
                  </a>{' '}
                  <span className="text-text-muted">({cert.ftId})</span>
                </div>
                <div>
                  <span className="text-text-muted">Submitter:</span>{' '}
                  <span className="text-text-body">{cert.submitter.username}</span>{' '}
                  <span className="text-text-muted">({cert.submitter.slackId})</span>
                  {fraudUrls &&
                    user?.role &&
                    (can(user.role, PERMS.billy_btn) || can(user.role, PERMS.joe_btn)) && (
                      <div className="flex gap-2 mt-2">
                        <a
                          href={fraudUrls.billy}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-card-info-bg text-text-info-body px-3 py-1.5 rounded-xl font-mono text-xs hover:bg-card-info-bg/70 hover:scale-[1.02] active:scale-[0.98] transition-all border-2 border-card-info-border"
                        >
                          Billy
                        </a>
                        <a
                          href={fraudUrls.joe}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-card-info-bg text-text-info-body px-3 py-1.5 rounded-xl font-mono text-xs hover:bg-card-info-bg/70 hover:scale-[1.02] active:scale-[0.98] transition-all border-2 border-card-info-border"
                        >
                          Joe
                        </a>
                      </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-text-muted">Type:</span>
                  {user?.role && can(user.role, PERMS.certs_edit) ? (
                    <div
                      className="relative"
                      tabIndex={0}
                      onBlur={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget)) {
                          const menu = e.currentTarget.querySelector('[data-menu]') as HTMLElement
                          menu?.classList.add('hidden')
                        }
                      }}
                    >
                      <button
                        onClick={(e) => {
                          const menu = e.currentTarget.nextElementSibling as HTMLElement
                          menu.classList.toggle('hidden')
                        }}
                        className="text-text-primary hover:text-text-secondary cursor-pointer underline decoration-dotted"
                      >
                        {cert.type || 'unknown'}
                      </button>
                      <div
                        data-menu
                        className="hidden absolute left-0 top-6 z-50 bg-card-bg-start border border-card-border rounded-lg shadow-xl py-1 min-w-[180px]"
                      >
                        {[
                          'CLI',
                          'Cargo',
                          'Web App',
                          'Chat Bot',
                          'Extension',
                          'Desktop App (Windows)',
                          'Desktop App (Linux)',
                          'Desktop App (macOS)',
                          'Minecraft Mods',
                          'Hardware',
                          'Android App',
                          'iOS App',
                          'Other',
                        ].map((t) => (
                          <button
                            key={t}
                            onClick={(e) => {
                              ; (e.currentTarget.parentElement as HTMLElement).classList.add(
                                'hidden'
                              )
                              updateType(t)
                            }}
                            className="block w-full text-left px-3 py-1.5 text-sm text-text-body hover:bg-input-bg hover:text-text-primary"
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <span className="text-text-body">{cert.type || 'unknown'}</span>
                  )}
                </div>
                <div>
                  <span className="text-text-muted">Dev Time:</span>{' '}
                  <span className="text-text-body">{cert.devTime || '-'}</span>
                </div>
                {user?.role && can(user.role, PERMS.certs_bounty) && (
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted">Bounty:</span>
                    <input
                      type="number"
                      value={bounty}
                      onChange={(e) => updateBounty(e.target.value)}
                      placeholder="cookies"
                      step="0.25"
                      min="0"
                      className="bg-input-bg border border-card-border-subtle text-text-body font-mono text-sm px-2 py-0.5 rounded w-24 focus:outline-none focus:border-card-border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      onClick={saveBounty}
                      className="bg-button-primary-bg text-button-primary-text px-2 py-0.5 font-mono text-xs hover:bg-button-primary-hover transition-all border border-button-primary-border rounded"
                    >
                      set
                    </button>
                  </div>
                )}
                <div>
                  <span className="text-text-muted">Created:</span>{' '}
                  <span className="text-text-body">{created}</span>
                </div>
                <div>
                  <span className="text-text-muted">Last Updated:</span>{' '}
                  <span className="text-text-body">{updated}</span>
                </div>
                {claimedBy && cert.status === 'pending' && (
                  <div className="pt-2 mt-2 border-t border-card-border-subtle">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-role-fraudster-text font-bold">
                        {timeLeft && timeLeft > 0 ? '🔒 Claimed' : '⏰ Claim expired'}
                      </span>
                      {timeLeft !== null && (
                        <span
                          className={`font-mono text-xs ${timeLeft > 0 ? 'text-role-fraudster-text' : 'text-role-syswright-text'}`}
                        >
                          {timeLeft > 0
                            ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`
                            : '0:00'}
                        </span>
                      )}
                    </div>
                    <div className="text-xs">
                      <span className="text-text-muted">by:</span>{' '}
                      <span className="text-text-body">@{claimedBy}</span>
                    </div>
                    {cert.claimedAt && (
                      <div className="text-xs text-text-muted">
                        {new Date(cert.claimedAt).toLocaleString()}
                      </div>
                    )}
                    {isMyClaim && (
                      <button
                        onClick={unclaim}
                        disabled={submitting}
                        className="mt-2 bg-badge-warn-bg text-badge-warn-text px-3 py-1 font-mono text-xs hover:bg-badge-warn-bg/70 transition-all border border-badge-warn-border rounded disabled:opacity-50"
                      >
                        unclaim
                      </button>
                    )}
                  </div>
                )}
                {cert.assignment && (
                  <div className="pt-2 mt-2 border-t border-card-border-subtle">
                    <div>
                      <span className="text-text-muted">Assigned to:</span>{' '}
                      <a
                        href={`/admin/assignments/${cert.assignment.id}/edit`}
                        className="text-text-primary hover:text-text-secondary underline"
                      >
                        {cert.assignment.assignee || 'nobody'} (#{cert.assignment.id})
                      </a>
                    </div>
                    <div>
                      <span className="text-text-muted">Status:</span>{' '}
                      <span
                        className={
                          cert.assignment.status === 'completed'
                            ? 'text-text-success-body'
                            : cert.assignment.status === 'in_progress'
                              ? 'text-text-info-body'
                              : 'text-badge-warn-text'
                        }
                      >
                        {cert.assignment.status}
                      </span>
                    </div>
                    <div className="text-text-muted text-xs mt-1">
                      be a good boy and dont steal it
                    </div>
                  </div>
                )}
              </div>

              {user?.role && can(user.role, PERMS.certs_admin) && show && (
                <div className="mt-4 pt-4 border-t-2 border-dashed border-border-dashed">
                  <div className="bg-input-bg border-2 border-dashed border-border-dashed p-3 rounded">
                    <pre className="text-text-body font-mono text-xs whitespace-pre-wrap break-all">
                      {JSON.stringify(cert, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-card-bg-start to-card-bg-end border-4 border-card-border rounded-3xl p-4 md:p-6 shadow-xl shadow-shadow-color">
              <h3 className="text-text-primary font-mono text-sm font-bold mb-3 md:mb-4">Notes</h3>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cert.notes && cert.notes.length > 0 ? (
                  cert.notes.map((n) => (
                    <div
                      key={n.id}
                      className="bg-input-bg border-2 border-card-border-subtle rounded-2xl p-3"
                    >
                      <div className="flex items-start gap-2">
                        {n.author.avatar && (
                          <Image
                            src={n.author.avatar}
                            alt={n.author.username}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full border-2 border-card-border shadow-lg shadow-shadow-color"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-text-primary font-mono text-xs font-bold">
                              {n.author.username}
                            </span>
                            <div className="flex gap-2 items-center">
                              <span className="text-text-muted font-mono text-xs">
                                {new Date(n.createdAt).toLocaleString()}
                              </span>
                              {user?.role && can(user.role, PERMS.certs_admin) && (
                                <button
                                  onClick={() => del(n.id)}
                                  className="text-role-syswright-text hover:text-role-syswright-text/80 font-mono text-xs"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-text-body font-mono text-sm whitespace-pre-wrap break-words">
                            {fmt(n.text)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-text-muted font-mono text-sm text-center py-4">
                    no notes...
                  </div>
                )}
              </div>
              <div className="relative">
                <textarea
                  value={note}
                  onChange={onChange}
                  disabled={isViewOnly}
                  className="w-full bg-input-bg border-2 border-card-border-subtle text-text-body font-mono text-sm p-3 rounded-2xl focus:outline-none focus:border-card-border min-h-[80px] mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder={
                    isViewOnly ? 'u can only view' : 'whats on ur mind? (use @username to tag)'
                  }
                />
                {showPick && picks.length > 0 && (
                  <div className="absolute z-10 w-full bg-card-bg-end border-2 border-card-border max-h-40 overflow-y-auto rounded-2xl shadow-2xl shadow-shadow-color">
                    {picks
                      .filter((u) => u)
                      .map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => pick(u.username)}
                          className="w-full text-left px-3 py-2 hover:bg-item-bg text-text-primary font-mono text-sm border-b border-card-border-subtle last:border-b-0 flex items-center gap-2 transition-colors"
                        >
                          <div className="w-6 h-6 bg-input-bg border border-card-border-subtle rounded flex items-center justify-center font-mono text-xs text-text-primary overflow-hidden flex-shrink-0">
                            {u.avatar ? (
                              <Image
                                src={u.avatar}
                                alt={u.username}
                                width={24}
                                height={24}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              u.username?.charAt(0).toUpperCase() || '?'
                            )}
                          </div>
                          <span>@{u.username}</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
              <button
                onClick={save}
                disabled={!note.trim() || isViewOnly}
                className="w-full bg-button-primary-bg text-button-primary-text px-4 py-2 font-mono text-sm hover:bg-button-primary-hover transition-all border-2 border-button-primary-border rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
              >
                post note
              </button>
            </div>

            {cert.history && cert.history.length > 0 && (
              <div className="bg-gradient-to-br from-card-bg-start to-card-bg-end border-4 border-card-border rounded-3xl p-4 md:p-6 shadow-xl shadow-shadow-color">
                <h3 className="text-text-primary font-mono text-sm font-bold mb-3 md:mb-4">
                  Cert history
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {cert.history.map((h, i) => (
                    <Link
                      key={i}
                      href={`/admin/ship_certifications/${h.id}/edit`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-input-bg border-2 border-card-border-subtle rounded-2xl p-3 hover:border-card-border transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded font-mono text-xs ${h.verdict === 'approved'
                              ? 'bg-card-success-bg text-text-success-body'
                              : 'bg-role-syswright-bg text-role-syswright-text'
                              }`}
                          >
                            {h.verdict}
                          </span>
                          <span className="text-text-muted font-mono text-xs">#{h.id}</span>
                        </div>
                        <span className="text-text-muted font-mono text-xs">
                          {h.completedAt ? new Date(h.completedAt).toLocaleDateString() : '-'}
                        </span>
                      </div>
                      <div className="text-text-body font-mono text-xs mb-1">by {h.certifier}</div>
                      {h.feedback && (
                        <div className="text-text-muted font-mono text-xs line-clamp-2">
                          {h.feedback}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-card-bg-start to-card-bg-end border-4 border-card-border rounded-3xl p-4 md:p-6 shadow-2xl shadow-shadow-color">
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center">
            {cert.status === 'pending' &&
              !isMyClaim &&
              (!claimedBy || (timeLeft !== null && timeLeft <= 0)) &&
              canEdit && (
                <button
                  onClick={startReview}
                  disabled={submitting}
                  className="bg-card-info-bg text-text-info-body border-2 border-card-info-border hover:bg-card-info-bg/70 font-mono text-sm px-4 md:px-8 py-3 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-shadow-color hover:scale-[1.02] active:scale-[0.98]"
                >
                  Claim cert
                </button>
              )}
            <button
              onClick={() => setConfirmAction('approve')}
              disabled={
                isViewOnly ||
                submitting ||
                (claimedBy !== null &&
                  timeLeft !== null &&
                  timeLeft > 0 &&
                  !isMyClaim &&
                  !canOverride)
              }
              className="bg-card-success-bg text-text-success-body border-2 border-card-success-border hover:bg-card-success-bg/70 font-mono text-sm px-4 md:px-8 py-3 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-shadow-color hover:scale-[1.02] active:scale-[0.98]"
            >
              Approve
            </button>
            <button
              onClick={() => setConfirmAction('reject')}
              disabled={
                isViewOnly ||
                submitting ||
                (claimedBy !== null &&
                  timeLeft !== null &&
                  timeLeft > 0 &&
                  !isMyClaim &&
                  !canOverride)
              }
              className="bg-role-syswright-bg text-role-syswright-text border-2 border-role-syswright-border hover:bg-role-syswright-bg/70 font-mono text-sm px-4 md:px-8 py-3 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-shadow-color hover:scale-[1.02] active:scale-[0.98]"
            >
              Reject
            </button>
            {(cert.status === 'approved' || cert.status === 'rejected') && (
              <button
                onClick={() => update('pending')}
                disabled={isViewOnly || submitting}
                className="bg-badge-warn-bg text-badge-warn-text border-2 border-badge-warn-border hover:bg-badge-warn-bg/70 font-mono text-sm px-4 md:px-8 py-3 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-shadow-color hover:scale-[1.02] active:scale-[0.98]"
              >
                Uncert
              </button>
            )}
          </div>
        </div>
      </div>

      {err && (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-6 md:max-w-sm bg-role-syswright-bg border-2 border-role-syswright-border text-role-syswright-text font-mono text-sm px-4 py-3 rounded-2xl shadow-2xl shadow-shadow-color z-50">
          {err}
        </div>
      )}

      {claimed && (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-6 md:max-w-sm bg-card-success-bg border-2 border-card-success-border text-text-success-body font-mono text-sm px-4 py-3 rounded-2xl shadow-2xl shadow-shadow-color z-50">
          I've locked it to you for 30 min!
        </div>
      )}

      {bountySaved && (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-6 md:max-w-sm bg-card-success-bg border-2 border-card-success-border text-text-success-body font-mono text-sm px-4 py-3 rounded-2xl shadow-2xl shadow-shadow-color z-50">
          bounty set!
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-card-bg-start to-card-bg-end border-4 border-card-border rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-text-primary font-mono text-xl font-bold mb-4">
              {confirmAction === 'approve'
                ? 'you sure u want to APPROVE!?!?!?!?'
                : 'you sure u want to REJECT!?!?!?!?'}
            </h3>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  update(confirmAction === 'approve' ? 'approved' : 'rejected')
                  setConfirmAction(null)
                }}
                className={`flex-1 font-mono text-sm px-6 py-3 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] ${confirmAction === 'approve'
                  ? 'bg-card-success-bg text-text-success-body border-2 border-card-success-border hover:bg-card-success-bg/70'
                  : 'bg-role-syswright-bg text-role-syswright-text border-2 border-role-syswright-border hover:bg-role-syswright-bg/70'
                  }`}
              >
                YES
              </button>
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 bg-input-bg text-text-muted border-2 border-card-border-subtle hover:bg-item-bg font-mono text-sm px-6 py-3 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                NOOOOOOOOOOOOOO
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
