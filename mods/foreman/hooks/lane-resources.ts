import type { LaneResources } from '../types'

type Process = {
  pid: number
  ppid: number
  rssKb: number
  cpuPercent: number
}

/**
 * Per-lane totals, the machine total, and the single largest process.
 */
export type ResourceSample = {
  lanes: Record<string, LaneResources>
  totalRssGb: number
  heaviest: { pid: number; rssGb: number; lane: string | null } | null
}

const PS_LINE = /^\s*(\d+)\s+(\d+)\s+(\d+)\s+([\d.]+)/
const KB_PER_GB = 1024 * 1024

/**
 * The `ps` arguments whose output `sampleLanes` reads.
 */
export const PS_ARGV = ['ps', '-A', '-o', 'pid=,ppid=,rss=,%cpu='] as const

/**
 * The `lsof` arguments whose output `sampleLanes` reads: the working folder of every process.
 */
export const LSOF_ARGV = ['lsof', '-n', '-d', 'cwd', '-Fpn'] as const

const parseProcesses = (psOutput: string) => {
  const processes: Process[] = []

  for (const line of psOutput.split('\n')) {
    const match = PS_LINE.exec(line)
    if (match === null) {
      continue
    }

    processes.push({
      pid: Number(match[1]),
      ppid: Number(match[2]),
      rssKb: Number(match[3]),
      cpuPercent: Number(match[4]),
    })
  }

  return processes
}

const parseWorkingFolders = (lsofOutput: string) => {
  const folders = new Map<number, string>()
  let pid = 0

  for (const line of lsofOutput.split('\n')) {
    if (line.startsWith('p')) {
      pid = Number(line.slice(1))
      continue
    }
    if (line.startsWith('n') && pid > 0) {
      folders.set(pid, line.slice(1))
    }
  }

  return folders
}

const isInside = (folder: string, root: string) => folder === root || folder.startsWith(`${root}/`)

/**
 * Assign each process to the lane whose worktree holds its working folder, and every descendant of
 * that process to the same lane, then total memory and CPU per lane.
 *
 * @param worktrees lane name to absolute worktree path
 */
export const sampleLanes = (psOutput: string, lsofOutput: string, worktrees: Record<string, string>) => {
  const processes = parseProcesses(psOutput)
  const folders = parseWorkingFolders(lsofOutput)
  const roots = Object.entries(worktrees)

  const laneOfPid = new Map<number, string>()
  for (const process of processes) {
    const folder = folders.get(process.pid)
    const owner = folder === undefined ? undefined : roots.find(([, root]) => isInside(folder, root))
    if (owner !== undefined) {
      laneOfPid.set(process.pid, owner[0])
    }
  }

  // A child inherits its parent's lane, so a bake that changes folder still counts. Repeat until stable.
  let hasChanged = true
  while (hasChanged) {
    hasChanged = false
    for (const process of processes) {
      const parentLane = laneOfPid.get(process.ppid)
      if (parentLane !== undefined && !laneOfPid.has(process.pid)) {
        laneOfPid.set(process.pid, parentLane)
        hasChanged = true
      }
    }
  }

  const lanes: Record<string, LaneResources> = {}
  let totalKb = 0
  let heaviest: ResourceSample['heaviest'] = null

  for (const process of processes) {
    totalKb += process.rssKb

    const rssGb = process.rssKb / KB_PER_GB
    const lane = laneOfPid.get(process.pid) ?? null
    if (heaviest === null || rssGb > heaviest.rssGb) {
      heaviest = { pid: process.pid, rssGb, lane }
    }
    if (lane === null) {
      continue
    }

    const before = lanes[lane] ?? { rssGb: 0, cpuPercent: 0, processCount: 0 }
    lanes[lane] = {
      rssGb: before.rssGb + rssGb,
      cpuPercent: before.cpuPercent + process.cpuPercent,
      processCount: before.processCount + 1,
    }
  }

  const sample: ResourceSample = { lanes, totalRssGb: totalKb / KB_PER_GB, heaviest }

  return sample
}
