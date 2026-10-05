export type Lane = {
  lane: string
  ticket: string
  title: string
  stage: string
  agent?: string
  branch?: string
  pr?: string
  eta?: string
  note?: string
  stageSince: number
}

export type Report = {
  lanes: Lane[]
  needs: string[]
  eta?: string
  reportedAt: number
}

export type AgentRow = {
  id: string
  name: string
  description: string
  status: string
  lastSeen: number
  isStalled: boolean
}

export type Denial = {
  tool: string
  reason: string
  at: number
}

export type Memory = {
  totalGb: number
  topName: string
  topGb: number
}

declare module 'claude-code' {
  interface PluginState {
    foreman: {
      report: Report | null
      agents: AgentRow[]
      denials: Denial[]
      memory: Memory | null
    }
  }
}
