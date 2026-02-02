import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/server-auth'
import { can, PERMS } from '@/lib/perms'
import Wip from '@/components/ui/wip'
import { Crew } from '@/components/admin/crew'
import { ErrorBanner } from '@/components/admin/error-banner'
import { ProfileCard } from '@/components/admin/profile-card'
import { prisma } from '@/lib/db'

export default async function Admin() {
  const user = await getUser()
  if (!user) redirect('/')

  const [pendingCerts, pendingYsws] = await Promise.all([
    prisma.shipCert.count({ where: { status: 'pending' } }),
    prisma.yswsReview.count({ where: { status: 'pending' } }),
  ])

  return (
    <main
      className="bg-grid min-h-screen w-full flex flex-col items-center justify-center overflow-hidden p-4 md:p-8"
      role="main"
      aria-label="admin dashboard"
    >
      <Crew />
      <ErrorBanner />

      <div className="max-w-4xl w-full">
        <div className="mb-8 md:mb-16">
          <ProfileCard
            user={{ id: user.id, username: user.username, avatar: user.avatar, role: user.role }}
          />
        </div>

        {(can(user.role, PERMS.users_view) ||
          can(user.role, PERMS.eng_full) ||
          can(user.role, PERMS.logs_full)) && (
            <div className="mb-6 md:mb-8 max-w-2xl mx-auto">
              <h3 className="text-text-secondary font-mono text-xs uppercase tracking-wider mb-3 px-2">
                admin stuff
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {can(user.role, PERMS.users_view) && (
                  <Link
                    href="/admin/users"
                    className="bg-role-fraudster-bg border-2 border-dashed border-role-fraudster-border hover:border-role-fraudster-text text-role-fraudster-text font-mono text-sm px-4 md:px-6 py-3 rounded-2xl transition-all duration-200 hover:bg-role-fraudster-border text-center hover:scale-[1.02] active:scale-[0.98]"
                  >
                    🔨 manage users
                  </Link>
                )}

                {can(user.role, PERMS.logs_full) && (
                  <Link
                    href="/admin/logs"
                    className="bg-role-syswright-bg border-2 border-dashed border-role-syswright-border hover:border-role-syswright-text text-role-syswright-text font-mono text-sm px-4 md:px-6 py-3 rounded-2xl transition-all duration-200 hover:bg-role-syswright-border text-center hover:scale-[1.02] active:scale-[0.98]"
                  >
                    📊 system logs
                  </Link>
                )}
                {can(user.role, PERMS.payouts_view) && (
                  <Link
                    href="/admin/payouts"
                    className="bg-role-shipwright-bg border-2 border-dashed border-role-shipwright-border hover:border-role-shipwright-text text-role-shipwright-text font-mono text-sm px-4 md:px-6 py-3 rounded-2xl transition-all duration-200 hover:bg-role-shipwright-border text-center hover:scale-[1.02] active:scale-[0.98]"
                  >
                    🍪 payouts
                  </Link>
                )}
              </div>
            </div>
          )}

        <div className="mb-6 md:mb-8 max-w-2xl mx-auto">
          <h3 className="text-text-secondary font-mono text-xs uppercase tracking-wider mb-3 px-2">
            my stuff
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <Link
              href={`/user/${user.id}`}
              className="bg-role-megawright-bg border-2 border-dashed border-role-megawright-border hover:border-role-megawright-text text-role-megawright-text font-mono text-sm px-4 md:px-6 py-3 rounded-2xl transition-all duration-200 hover:bg-role-megawright-border text-center hover:scale-[1.02] active:scale-[0.98]"
            >
              Settings
            </Link>
            {can(user.role, PERMS.certs_edit) && (
              <Link
                href="/admin/ship_certifications/mystats"
                className="bg-role-shipwright-bg border-2 border-dashed border-role-shipwright-border hover:border-role-shipwright-text text-role-shipwright-text font-mono text-sm px-4 md:px-6 py-3 rounded-2xl transition-all duration-200 hover:bg-role-shipwright-border text-center hover:scale-[1.02] active:scale-[0.98]"
              >
                Certs Stats
              </Link>
            )}
          </div>
        </div>

        <div className="mb-6 md:mb-8 max-w-2xl mx-auto">
          <h3 className="text-text-secondary font-mono text-xs uppercase tracking-wider mb-3 px-2">
            certifications stuff
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {can(user.role, PERMS.certs_view) && (
              <div className="relative">
                <Link
                  href="/admin/ship_certifications"
                  className="block w-full bg-item-bg border-2 border-card-border-subtle hover:border-card-border text-text-primary font-mono text-sm px-4 md:px-6 py-3 rounded-2xl transition-all duration-200 hover:bg-card-bg-start text-center hover:scale-[1.02] active:scale-[0.98]"
                >
                  Ship Certifications
                </Link>
                {pendingCerts > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                    {pendingCerts}
                  </span>
                )}
              </div>
            )}
            {can(user.role, PERMS.ysws_view) && (
              <div className="relative">
                <Link
                  href="/admin/ysws_reviews"
                  className="block w-full bg-item-bg border-2 border-card-border-subtle hover:border-card-border text-text-primary font-mono text-sm px-4 md:px-6 py-3 rounded-2xl transition-all duration-200 hover:bg-card-bg-start text-center hover:scale-[1.02] active:scale-[0.98]"
                >
                  YSWS Reviews
                </Link>
                {pendingYsws > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                    {pendingYsws}
                  </span>
                )}
              </div>
            )}
            {can(user.role, PERMS.assign_view) && (
              <div className="relative">
                <Link
                  href="/admin/assignments"
                  className="block w-full bg-item-bg border-2 border-card-border-subtle hover:border-card-border text-text-primary font-mono text-sm px-4 md:px-6 py-3 rounded-2xl transition-all duration-200 hover:bg-card-bg-start text-center hover:scale-[1.02] active:scale-[0.98]"
                >
                  Assignments
                </Link>
                <Wip />
              </div>
            )}
            {can(user.role, PERMS.support_view) && (
              <div className="relative">
                <Link
                  href="/admin/tickets"
                  className="block w-full bg-item-bg border-2 border-card-border-subtle hover:border-card-border text-text-primary font-mono text-sm px-4 md:px-6 py-3 rounded-2xl transition-all duration-200 hover:bg-card-bg-start text-center hover:scale-[1.02] active:scale-[0.98]"
                >
                  Support Tickets
                </Link>
                <Wip />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
