import type { ProgramView, SessionFile } from '../types'

/**
 * A session that has not written its file for this long no longer counts toward its program.
 */
export const SESSION_STALE_MS = 2 * 60 * 1000

const PROGRAM_NAME = /^[a-z0-9][a-z0-9._-]{0,63}$/

/**
 * Whether `name` is a usable program name. Must be one path segment in lower case.
 */
export const isProgramName = (name: string) => PROGRAM_NAME.test(name)

/**
 * Whether a parsed session file has the fields the view reads. Files from other sessions are untrusted JSON.
 */
export const isSessionFile = (value: unknown): value is SessionFile => {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const file: Record<string, unknown> = { ...value }

  return (
    typeof file.sessionId === 'string' &&
    typeof file.program === 'string' &&
    typeof file.updatedAt === 'number' &&
    Array.isArray(file.lanes) &&
    Array.isArray(file.needs) &&
    Array.isArray(file.agents)
  )
}

/**
 * Merge the files of every live session on one program into one view. When two sessions report the
 * same lane, the newer report wins.
 */
export const mergeSessions = (program: string, files: SessionFile[], now: number) => {
  const live = files
    .filter(file => file.program === program && now - file.updatedAt < SESSION_STALE_MS)
    .sort((a, b) => a.updatedAt - b.updatedAt)

  const lanesByName = new Map(live.flatMap(file => file.lanes.map(lane => [lane.lane, lane] as const)))
  const newest = live.at(-1)

  const view: ProgramView = {
    program,
    sessionCount: live.length,
    lanes: [...lanesByName.values()],
    needs: live.flatMap(file => file.needs),
    eta: newest?.eta,
    agents: live.flatMap(file => file.agents),
    resources: newest?.resources ?? {},
    totalRssGb: newest?.totalRssGb ?? 0,
  }

  return view
}
