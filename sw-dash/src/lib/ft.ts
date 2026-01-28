import { syslog } from './syslog'

interface FtMedia {
  url: string
  content_type: string
}

export interface FtDevlog {
  id: number
  body: string
  duration_seconds: number
  scrapbook_url: string | null
  created_at: string
  updated_at: string
  media: FtMedia[]
}

export async function fetchDevlogs(ftProjectId: string): Promise<FtDevlog[]> {
  const baseUrl = process.env.NEXT_PUBLIC_FLAVORTOWN_URL
  const apiKey = process.env.FLAVORTOWN_YSWS_API_KEY

  if (!baseUrl || !apiKey) {
    console.error('ft ysws config missing bruh')
    return []
  }

  const projectUrl = `${baseUrl}/api/v1/projects/${ftProjectId}`

  try {
    const projectRes = await fetch(projectUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (!projectRes.ok) {
      const txt = await projectRes.text()
      console.error(`ft project fetch borked: ${projectRes.status} ${txt}`)
      await syslog(
        'ft_project_fetch_fail',
        projectRes.status,
        null,
        `couldnt fetch project ${ftProjectId}`,
        undefined,
        { metadata: { ftProjectId, url: projectUrl, error: txt }, severity: 'error' }
      )
      return []
    }

    const project = await projectRes.json()
    const devlogIds = project.devlog_ids || []

    if (!devlogIds.length) {
      return []
    }

    const devlogs = await Promise.all(
      devlogIds.map(async (id: number) => {
        const devlogUrl = `${baseUrl}/api/v1/devlogs/${id}`
        try {
          const devlogRes = await fetch(devlogUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
          })

          if (!devlogRes.ok) {
            console.error(`ft devlog ${id} fetch borked: ${devlogRes.status}`)
            return null
          }

          return await devlogRes.json()
        } catch (e) {
          console.error(`ft devlog ${id} fetch exploded:`, e)
          return null
        }
      })
    )

    return devlogs.filter((d): d is FtDevlog => d !== null)
  } catch (e) {
    console.error('ft devlog fetch exploded:', e)
    await syslog(
      'ft_devlog_fetch_error',
      500,
      null,
      `devlog fetch crashed for ${ftProjectId}`,
      undefined,
      {
        metadata: { ftProjectId, error: e instanceof Error ? e.message : String(e) },
        severity: 'error',
      }
    )
    return []
  }
}
