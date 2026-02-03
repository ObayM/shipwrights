import { NextResponse } from 'next/server'
import { yswsApiWithParams } from '@/lib/api'
import { prisma } from '@/lib/db'
import { fetchDevlogs } from '@/lib/ft'
import { parseRepo, fetchCommits } from '@/lib/gh'
import { grab, upload } from '@/lib/r2'
import { PERMS } from '@/lib/perms'

const ftBase = process.env.NEXT_PUBLIC_FLAVORTOWN_URL || ''

async function pullMedia(ftMedia: any[]) {
  const out = []
  for (const m of ftMedia || []) {
    const url = m.url.startsWith('/') ? ftBase + m.url : m.url
    const file = await grab(url)
    if (!file) {
      console.error(`failed to grab media from ${url}`)
      continue
    }

    const ext = m.content_type.split('/')[1] || 'bin'
    const name = `${Date.now()}.${ext}`
    const r2Url = await upload('ysws-devlog-media', name, file.data, file.type)
    out.push({ url: r2Url, type: m.content_type })
  }
  return out
}

export const POST = yswsApiWithParams(PERMS.ysws_edit)(async ({ params }) => {
  const yswsId = parseInt(params.id)
  if (!yswsId) return NextResponse.json({ error: 'invalid id' }, { status: 400 })

  const review = await prisma.yswsReview.findUnique({
    where: { id: yswsId },
    include: { shipCert: { select: { ftProjectId: true, repoUrl: true } } },
  })

  if (!review || !review.shipCert.ftProjectId) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  console.log(`refreshing ysws ${yswsId} for project ${review.shipCert.ftProjectId}`)

  const ftDevlogs = await fetchDevlogs(review.shipCert.ftProjectId)
  console.log(`fetched ${ftDevlogs.length} devlogs from FT`)

  const repo = review.shipCert.repoUrl ? parseRepo(review.shipCert.repoUrl) : null

  const sorted = ftDevlogs
    .filter((d) => d.created_at)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  const devlogs = []
  const commits = []
  const decisions = []

  if (sorted.length > 0 && repo) {
    const oldest = new Date(sorted[0].created_at)
    let prevTs = new Date(oldest.getTime() - 30 * 24 * 60 * 60 * 1000)

    for (const d of sorted) {
      const until = new Date(d.created_at)
      const ftDevlogId = String(d.id)

      console.log(`devlog ${ftDevlogId}: has ${d.media?.length || 0} media items`)

      const [fetched, media] = await Promise.all([
        fetchCommits(repo.owner, repo.repo, prevTs, until),
        pullMedia(d.media),
      ])

      console.log(`devlog ${ftDevlogId}: pulled ${media.length} media to r2`)

      devlogs.push({
        ftDevlogId,
        desc: d.body,
        media,
        origSecs: d.duration_seconds || 0,
        ftCreatedAt: d.created_at,
      })

      commits.push({
        ftDevlogId,
        commits: fetched.map((c) => ({
          sha: c.sha,
          msg: c.msg,
          author: c.author,
          adds: c.adds,
          dels: c.dels,
          ts: c.ts.toISOString(),
        })),
      })

      decisions.push({
        ftDevlogId,
        status: 'pending',
        approvedMins: null,
        notes: null,
      })

      prevTs = until
    }
  } else {
    console.log('no repo or no sorted devlogs, using simple path')
    for (const d of ftDevlogs) {
      console.log(`devlog ${d.id}: has ${d.media?.length || 0} media items`)
      const media = await pullMedia(d.media)
      console.log(`devlog ${d.id}: pulled ${media.length} media to r2`)
      const ftDevlogId = String(d.id)

      devlogs.push({
        ftDevlogId,
        desc: d.body,
        media,
        origSecs: d.duration_seconds || 0,
        ftCreatedAt: d.created_at || null,
      })

      commits.push({ ftDevlogId, commits: [] })

      decisions.push({
        ftDevlogId,
        status: 'pending',
        approvedMins: null,
        notes: null,
      })
    }
  }

  console.log(`updating db with ${devlogs.length} devlogs`)

  await prisma.yswsReview.update({
    where: { id: yswsId },
    data: {
      devlogs: JSON.parse(JSON.stringify(devlogs)),
      commits: JSON.parse(JSON.stringify(commits)),
      decisions: JSON.parse(JSON.stringify(decisions)),
    },
  })

  console.log('refresh done')

  return NextResponse.json({ success: true })
})
