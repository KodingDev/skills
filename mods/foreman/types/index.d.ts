/**
 * The lane stages that foreman reports, in loop order.
 */
export type Stage = 'pick' | 'branch' | 'brief' | 'execute' | 'self-review' | 'pr' | 'feedback' | 'merge' | 'blocked'

/**
 * One lane as foreman reports it, plus the time its current stage started.
 */
export type Lane = {
  lane: string
  ticket: string
  title: string
  stage: Stage
  agent?: string
  branch?: string
  worktree?: string
  pr?: string
  eta?: string
  note?: string
  stageSince: number
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
 * Memory and CPU of the processes that run inside one lane's worktree.
 */
export type LaneResources = {
  rssGb: number
  cpuPercent: number
  processCount: number
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
  resources: Record<string, LaneResources>
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
  resources: Record<string, LaneResources>
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
      questions: string[]
      denials: Denial[]
      tracking: Tracking
    }
  }
}
