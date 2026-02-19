export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUser } from '@/lib/server-auth'
import { can, PERMS } from '@/lib/perms'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const authHeader = req.headers.get('Authorization')

  let user = null

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const key = authHeader.replace('Bearer ', '')
    user = await prisma.user.findUnique({
      where: { swApiKey: key },
      select: { id: true, role: true, username: true },
    })
  }

  if (!user) {
    user = await getUser()
  }

  if (!user || !can(user.role, PERMS.certs_view)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const status = searchParams.get('status')
  const type = searchParams.get('type')
  const since = searchParams.get('since')
  const limitParam = searchParams.get('limit')

  let take: number | undefined = undefined
  if (limitParam) {
    const parsed = parseInt(limitParam, 10)
    if (!isNaN(parsed) && parsed > 0) {
      take = parsed
    }
  }

  const where: any = {}

  if (status) {
    where.status = status
  }
  if (type) {
    where.projectType = type
  }
  if (since) {
    const date = new Date(since)
    if (!isNaN(date.getTime())) {
      where.updatedAt = { gt: date }
    }
  }

  try {
    const logs = await prisma.shipCert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      include: {
        reviewer: {
          select: {
            id: true,
            username: true,
            avatar: true,
            slackId: true,
          },
        },
        claimer: {
          select: {
            id: true,
            username: true,
            avatar: true,
            slackId: true,
          },
        },
        assignments: {
          select: {
            id: true,
            repoUrl: true,
            demoUrl: true,
          },
        },
      },
    })

    return NextResponse.json(logs)
  } catch (error) {
    console.error('Error fetching ship cert logs:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
