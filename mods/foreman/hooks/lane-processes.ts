import type { LaneResource, LaneUsage } from '../types'

type Process = {
  pid: number
  ppid: number
  rssKb: number
  cpuPercent: number
  command: string
}

/**
 * Per-lane usage, the machine total, and the single largest process.
 */
export type ProcessSample = {
  lanes: Record<string, LaneUsage>
  totalRssGb: number
  heaviest: { pid: number; rssGb: number; lane: string | null } | null
}

const PS_LINE = /^\s*(\d+)\s+(\d+)\s+(\d+)\s+([\d.]+)\s+(.*)$/
const LISTEN_PORT = /:(\d+)$/
const KB_PER_GB = 1024 * 1024

/**
 * The `ps` arguments whose output `sampleLanes` reads.
 */
export const PS_ARGV = ['ps', '-A', '-o', 'pid=,ppid=,rss=,%cpu=,comm='] as const

/**
 * The `lsof` arguments for the working folder of every process.
 */
export const CWD_ARGV = ['lsof', '-n', '-d', 'cwd', '-Fpn'] as const

/**
 * The `lsof` arguments for every listening TCP socket.
 */
export const LISTEN_ARGV = ['lsof', '-nP', '-iTCP', '-sTCP:LISTEN', '-Fpn'] as const

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
      command: (match[5] ?? '').split('/').pop() ?? '',
    })
  }

  return processes
}

/**
 * Read `lsof -F pn` output into the name lines of each process.
 */
const parseNamesByPid = (lsofOutput: string) => {
  const names = new Map<number, string[]>()
  let pid = 0

  for (const line of lsofOutput.split('\n')) {
    if (line.startsWith('p')) {
      pid = Number(line.slice(1))
      continue
    }
    if (line.startsWith('n') && pid > 0) {
      names.set(pid, [...(names.get(pid) ?? []), line.slice(1)])
    }
  }

  return names
}

const isInside = (folder: string, root: string) => folder === root || folder.startsWith(`${root}/`)

/**
 * The pids of the session that runs the sample: every ancestor of the `ps` process. The session
 * often starts inside a worktree, and its own memory and ports must not count for that lane.
 */
const sessionPids = (processes: Process[]) => {
  const parentOf = new Map(processes.map(process => [process.pid, process.ppid]))
  const pids = new Set<number>()

  for (const sampler of processes.filter(process => process.command === 'ps')) {
    let pid = sampler.pid
    while (pid > 1 && !pids.has(pid)) {
      pids.add(pid)
      pid = parentOf.get(pid) ?? 0
    }
  }

  return pids
}

const assignLanes = (processes: Process[], cwdOutput: string, worktrees: Record<string, string>) => {
  const folders = parseNamesByPid(cwdOutput)
  const roots = Object.entries(worktrees)
  const skipped = sessionPids(processes)
  const laneOfPid = new Map<number, string>()

  for (const process of processes.filter(one => !skipped.has(one.pid))) {
    const folder = folders.get(process.pid)?.[0]
    const owner = folder === undefined ? undefined : roots.find(([, root]) => isInside(folder, root))
    if (owner !== undefined) {
      laneOfPid.set(process.pid, owner[0])
    }
  }

  // A child inherits its parent's lane, so a server that changes folder still counts. Repeat until stable.
  let hasChanged = true
  while (hasChanged) {
    hasChanged = false
    for (const process of processes) {
      const parentLane = laneOfPid.get(process.ppid)
      if (parentLane !== undefined && !laneOfPid.has(process.pid) && !skipped.has(process.pid)) {
        laneOfPid.set(process.pid, parentLane)
        hasChanged = true
      }
    }
  }

  return laneOfPid
}

/**
 * Assign each process to the lane whose worktree holds its working folder, with every descendant of
 * that process, then total memory and CPU per lane and list the ports each lane listens on.
 *
 * @param worktrees lane name to absolute worktree path
 */
export const sampleLanes = (psOutput: string, cwdOutput: string, listenOutput: string, worktrees: Record<string, string>) => {
  const processes = parseProcesses(psOutput)
  const laneOfPid = assignLanes(processes, cwdOutput, worktrees)
  const listening = parseNamesByPid(listenOutput)

  const lanes: Record<string, LaneUsage> = {}
  let totalKb = 0
  let heaviest: ProcessSample['heaviest'] = null

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

    const ports = [...new Set((listening.get(process.pid) ?? []).map(name => LISTEN_PORT.exec(name)?.[1]).filter(port => port !== undefined))]
    const found: LaneResource[] = ports.map(port => ({ label: process.command, value: `localhost:${port}`, isObserved: true }))
    const before = lanes[lane] ?? { rssGb: 0, cpuPercent: 0, processCount: 0, ports: [] }

    lanes[lane] = {
      rssGb: before.rssGb + rssGb,
      cpuPercent: before.cpuPercent + process.cpuPercent,
      processCount: before.processCount + 1,
      ports: [...before.ports, ...found],
    }
  }

  const sample: ProcessSample = { lanes, totalRssGb: totalKb / KB_PER_GB, heaviest }

  return sample
}
