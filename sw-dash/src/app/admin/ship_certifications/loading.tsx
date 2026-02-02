import Link from 'next/link'

export default function Loading() {
  return (
    <main className="bg-grid min-h-screen w-full p-4 md:p-8" role="main">
      <div className="w-full">
        <Link
          href="/admin"
          className="text-text-primary font-mono text-sm hover:text-text-secondary transition-colors mb-4 md:mb-6 inline-flex items-center gap-2"
        >
          ← back
        </Link>

        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 md:mb-8 min-h-[48px]">
          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            <h1 className="text-2xl md:text-4xl font-mono text-text-primary">Ship Certs</h1>
            <span className="px-2 py-1 rounded font-mono text-xs border bg-item-bg text-text-muted border-card-border-subtle min-w-[70px] h-6"></span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-linear-to-br from-card-bg-start to-card-bg-end border-4 border-card-border rounded-3xl p-4 md:p-6 shadow-xl shadow-shadow-color min-h-[280px]">
            <div className="h-5 w-20 bg-item-bg rounded mb-4 animate-pulse"></div>
            <div className="space-y-3">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-24 bg-item-bg rounded animate-pulse"></div>
                  <div className="h-4 w-12 bg-item-bg rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-linear-to-br from-card-bg-start to-card-bg-end border-4 border-card-border rounded-3xl p-4 md:p-6 shadow-xl shadow-shadow-color min-h-[280px]">
            <div className="h-5 w-24 bg-item-bg rounded mb-4 animate-pulse"></div>
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-32 bg-item-bg rounded animate-pulse"></div>
                  <div className="h-4 w-8 bg-item-bg rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-9 w-20 bg-item-bg rounded-2xl border-2 border-card-border-subtle animate-pulse"
              ></div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-9 w-24 bg-item-bg rounded-2xl border-2 border-card-border-subtle animate-pulse"
              ></div>
            ))}
          </div>
        </div>

        <div className="hidden md:block bg-linear-to-br from-card-bg-start to-card-bg-end border-4 border-card-border rounded-3xl overflow-hidden shadow-2xl shadow-shadow-color">
          <table className="w-full">
            <thead>
              <tr className="border-b border-card-border-subtle">
                {[
                  'Ship ID',
                  'Project',
                  'Verdict',
                  'Claimed',
                  'Certifier',
                  'Submitter',
                  'Created',
                  'Dev',
                ].map((h) => (
                  <th key={h} className="text-left p-4 text-text-primary font-mono text-sm">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-card-border-subtle">
                  <td className="p-4">
                    <div className="h-4 w-8 bg-item-bg rounded animate-pulse"></div>
                  </td>
                  <td className="p-4">
                    <div className="h-4 w-32 bg-item-bg rounded animate-pulse"></div>
                  </td>
                  <td className="p-4">
                    <div className="h-6 w-16 bg-item-bg rounded animate-pulse"></div>
                  </td>
                  <td className="p-4">
                    <div className="h-4 w-20 bg-item-bg rounded animate-pulse"></div>
                  </td>
                  <td className="p-4">
                    <div className="h-4 w-20 bg-item-bg rounded animate-pulse"></div>
                  </td>
                  <td className="p-4">
                    <div className="h-4 w-20 bg-item-bg rounded animate-pulse"></div>
                  </td>
                  <td className="p-4">
                    <div className="h-4 w-24 bg-item-bg rounded animate-pulse"></div>
                  </td>
                  <td className="p-4">
                    <div className="h-4 w-12 bg-item-bg rounded animate-pulse"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
