import { getUser } from '@/lib/server-auth'
import { can, PERMS } from '@/lib/perms'
import { prisma } from '@/lib/db'
import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'

interface Params {
  params: Promise<{ id: string }>
}

export async function POST(req: Request, { params }: Params) {
  const { id } = await params

  const currentUser = await getUser()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = parseInt(id, 10)
  if (isNaN(userId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  if (!can(currentUser.role, PERMS.users_edit)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const key = `sw_live_${randomBytes(24).toString('hex')}`

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { swApiKey: key },
    })
    return NextResponse.json({ key })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to generate key' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: Params) {
  const { id } = await params
  const currentUser = await getUser()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = parseInt(id, 10)
  if (isNaN(userId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  if (!can(currentUser.role, PERMS.users_edit)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { swApiKey: null },
    })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to revoke key' }, { status: 500 })
  }
}
