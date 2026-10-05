/**
 * One step a lane's agent plans, with its own rough estimate.
 */
export type Todo = {
  text: string
  state: 'pending' | 'active' | 'done'
  eta?: string
}

/**
 * Something a lane owns, labeled by its agent or found by the mod: a dev server, a port, a PR, a log.
 */
export type LaneResource = {
  label: string
  value: string
  isObserved?: boolean
}

/**
 * One lane as its agent reports it, plus the time its status last changed.
 */
export type Lane = {
  lane: string
  title: string
  status: string
  statusSince: number
  agent?: string
  worktree?: string
  summary?: string
  eta?: string
  todos: Todo[]
  resources: LaneResource[]
}

/**
 * One live agent of a session, with the time of its last tool call.
 */
export type AgentRow = {
  id: string
  name: string
  status: string
  lastSeen: number
  isStalled: boolean
  tokenCount: number
}

/**
 * What the mod measures for the processes that run inside one lane's worktree.
 */
export type LaneUsage = {
  rssGb: number
  cpuPercent: number
  processCount: number
  ports: LaneResource[]
}

/**
 * What one session writes for its program, at `programs/<program>/<sessionId>.json` in the plugin data folder.
 */
export type SessionFile = {
  sessionId: string
  program: string
  updatedAt: number
  lanes: Lane[]
  needs: string[]
  eta?: string
  agents: AgentRow[]
  usage: Record<string, LaneUsage>
  totalRssGb: number
}

/**
 * The merged view of every live session on one program.
 */
export type ProgramView = {
  program: string
  sessionCount: number
  lanes: Lane[]
  needs: string[]
  eta?: string
  agents: AgentRow[]
  usage: Record<string, LaneUsage>
  totalRssGb: number
}

/**
 * A tool call that a hook refused.
 */
export type Denial = {
  tool: string
  reason: string
  at: number
}

/**
 * Per-agent bookkeeping that must survive a hot reload.
 */
export type Tracking = {
  lastSeen: Record<string, number>
  tokens: Record<string, number>
  stallToasted: string[]
  heavyToasted: string[]
  lastSampleAt: number
}

declare module 'claude-code' {
  interface PluginState {
    foreman: {
      program: string | null
      own: SessionFile | null
      view: ProgramView | null
      programs: string[]
      waiting: string[]
      denials: Denial[]
      tracking: Tracking
    }
  }
}
