import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { AgentRow, Denial, Lane, Memory, Report } from '../types'

const PANE = 'foreman'
const STALL_MS = 10 * 60 * 1000
const HEAVY_GB = 24
const TICK_MS = 5000
const MEMORY_EVERY_TICKS = 3
const LIVE = new Set(['pending', 'running', 'waiting', 'idle'])

const report = atom({ plugin: 'foreman', key: 'report' } as const, null)
const agents = atom({ plugin: 'foreman', key: 'agents' } as const, [])
const denials = atom({ plugin: 'foreman', key: 'denials' } as const, [])
const memory = atom({ plugin: 'foreman', key: 'memory' } as const, null)

type ReportInput = {
  lanes?: Omit<Lane, 'stageSince'>[]
  needs?: string[]
  eta?: string
}

const REPORT_SCHEMA = {
  type: 'object',
  properties: {
    lanes: {
      type: 'array',
      description: 'Every open lane, in priority order. Leave out lanes that are done.',
      items: {
        type: 'object',
        properties: {
          lane: { type: 'string', description: 'Lane name, e.g. "rust-shader-port"' },
          ticket: { type: 'string', description: 'Ticket identifier, e.g. "PSY-412"' },
          title: { type: 'string', description: 'Ticket title' },
          stage: {
            type: 'string',
            enum: ['pick', 'branch', 'brief', 'execute', 'self-review', 'pr', 'feedback', 'merge', 'blocked'],
          },
          agent: { type: 'string', description: 'Name of the worker agent on this lane' },
          branch: { type: 'string' },
          pr: { type: 'string', description: 'PR as "repo #123: title"' },
          eta: { type: 'string', description: 'Your estimate to done, e.g. "~40m"' },
          note: { type: 'string', description: 'One short line: what is happening now' },
        },
        required: ['lane', 'ticket', 'title', 'stage'],
      },
    },
    needs: {
      type: 'array',
      items: { type: 'string' },
      description: 'Each decision or review that waits on the user, one line each. Empty when nothing waits.',
    },
    eta: { type: 'string', description: 'Estimate for the whole program' },
  },
}

const lastSeen = new Map<string, number>()
const stallToasted = new Set<string>()
let heavyToasted = ''
let ticks = 0

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'lanes', description: 'Open the foreman lanes pane' })
    await $.tool.register({
      name: 'report',
      description:
        'Foreman status report. Send the full current picture of the program (every open lane and everything that waits on the user) after each stage change. Each call replaces the last one.',
      inputSchema: REPORT_SCHEMA,
    })

    const saved = await $.store.get(await storeKey($))
    if (saved !== undefined && (await read($, report)) === null) {
      await update($, report, () => saved as Report)
    }

    $.clock.every(TICK_MS, () => void tick($))

    return next(e)
  })

  on('command.run', { command: 'lanes' }, async $ => {
    await $.ui.open({ id: PANE, title: 'Foreman' })

    return { text: 'Foreman pane opened.' }
  })

  on('tool.call', { tool: 'mcp__foreman__report' }, async ($, e) => {
    const input = e as unknown as ReportInput
    const now = await $.clock.now()
    const previous = await read($, report)
    const lanes = (input.lanes ?? []).map(lane => {
      const before = previous?.lanes.find(one => one.lane === lane.lane)
      const stageSince = before?.stage === lane.stage ? before.stageSince : now

      return { ...lane, stageSince }
    })
    const next: Report = { lanes, needs: input.needs ?? [], eta: input.eta, reportedAt: now }
    await update($, report, () => next)
    await $.store.set(await storeKey($), next)

    return { result: 'Recorded.', text: `Recorded ${lanes.length} lanes, ${next.needs.length} waiting on the user.` }
  })

  on('tool.call', async ($, e, next) => {
    if (e.agentId !== undefined) {
      lastSeen.set(e.agentId, await $.clock.now())
    }
    const ran = await next(e)

    if (ran.deny !== undefined) {
      const denial: Denial = { tool: String(e.tool), reason: ran.deny, at: await $.clock.now() }
      await update($, denials, list => [...list, denial].slice(-20))
    }

    return ran
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const current = await read($, report)
    const rows = await read($, agents)
    const denied = await read($, denials)
    const needs = current?.needs ?? []
    const stalled = rows.filter(row => row.isStalled)

    if (e.props.hasSurvey || (needs.length === 0 && stalled.length === 0 && denied.length === 0)) {
      return next(e)
    }

    const { Box, Button, Text } = $.ui.resolve(e)
    const items = [
      ...needs.map(need => `needs you: ${need}`),
      ...stalled.map(row => `stalled: ${row.name}`),
      ...(denied.length > 0 ? [`${denied.length} permission denials (last: ${denied[denied.length - 1]?.tool})`] : []),
    ]

    return (
      <Box flexDirection="column">
        {items.slice(0, 3).map(item => (
          <Text color="yellow" wrap="truncate-end">
            {item}
          </Text>
        ))}
        <Box>
          {items.length > 3 && <Text dimColor>+{items.length - 3} more </Text>}
          <Button key="open" label="Open foreman" onPress={() => void $.ui.open({ id: PANE, title: 'Foreman' })} />
          {denied.length > 0 && (
            <Button key="clear" label="Clear denials" onPress={() => update($, denials, () => [])} />
          )}
        </Box>
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const now = await $.clock.now()
    const current = await read($, report)
    const rows = await read($, agents)
    const denied = await read($, denials)
    const mem = await read($, memory)
    const laneAgents = new Set((current?.lanes ?? []).map(lane => lane.agent).filter(Boolean))
    const loose = rows.filter(row => !laneAgents.has(row.name))

    return (
      <Box flexDirection="column">
        <Text bold>
          Lanes{current?.eta ? ` · program ETA ${current.eta}` : ''}
          {current ? <Text dimColor> · reported {ago(now, current.reportedAt)} ago</Text> : null}
        </Text>
        {(current?.lanes ?? []).length === 0 && <Text dimColor>No report yet. Foreman calls the report tool at each stage change.</Text>}
        {(current?.lanes ?? []).map(lane => {
          const worker = rows.find(row => row.name === lane.agent)

          return (
            <Box flexDirection="column" marginBottom={1}>
              <Text wrap="truncate-end">
                <Text color={stageColor(lane.stage, worker)}>● </Text>
                <Text bold>{lane.lane}</Text> {lane.ticket}: {lane.title}
              </Text>
              <Text dimColor wrap="truncate-end">
                {'  '}
                {lane.stage} {ago(now, lane.stageSince)}
                {lane.eta ? ` · ETA ${lane.eta}` : ''}
                {worker ? ` · ${worker.name} ${worker.isStalled ? 'STALLED' : worker.status}, active ${ago(now, worker.lastSeen)} ago` : ''}
              </Text>
              {lane.pr && <Text dimColor wrap="truncate-end">{'  '}PR {lane.pr}</Text>}
              {lane.note && <Text dimColor wrap="truncate-end">{'  '}{lane.note}</Text>}
            </Box>
          )
        })}

        {(current?.needs ?? []).length > 0 && <Text bold>Needs you</Text>}
        {(current?.needs ?? []).map(need => (
          <Text color="yellow" wrap="truncate-end">• {need}</Text>
        ))}

        {loose.length > 0 && <Text bold>Other agents</Text>}
        {loose.map(row => (
          <Text color={row.isStalled ? 'red' : undefined} dimColor={!row.isStalled} wrap="truncate-end">
            {row.isStalled ? 'STALLED' : row.status} {row.name} · active {ago(now, row.lastSeen)} ago
          </Text>
        ))}

        {denied.length > 0 && <Text bold>Permission denials</Text>}
        {denied.slice(-5).map(denial => (
          <Text color="red" wrap="truncate-end">
            {denial.tool} {ago(now, denial.at)} ago: {denial.reason}
          </Text>
        ))}

        {mem && (
          <Text dimColor wrap="truncate-end">
            Memory {mem.totalGb.toFixed(1)} GB in use · largest {mem.topName} {mem.topGb.toFixed(1)} GB
          </Text>
        )}
      </Box>
    )
  })
}

async function tick($: EngineInterface) {
  const now = await $.clock.now()
  const list = await $.agent.list()
  const rows: AgentRow[] = list
    .filter(agent => LIVE.has(agent.status))
    .map(agent => {
      if (!lastSeen.has(agent.id)) {
        lastSeen.set(agent.id, now)
      }
      const seen = lastSeen.get(agent.id) ?? now
      const isStalled = agent.status === 'running' && now - seen > STALL_MS

      return {
        id: agent.id,
        name: agent.name ?? agent.description,
        description: agent.description,
        status: agent.status,
        lastSeen: seen,
        isStalled,
      }
    })

  for (const row of rows) {
    if (row.isStalled && !stallToasted.has(row.id)) {
      stallToasted.add(row.id)
      $.ui.toast(`foreman: ${row.name} has done nothing for ${ago(now, row.lastSeen)}`)
    }
    if (!row.isStalled) {
      stallToasted.delete(row.id)
    }
  }
  await update($, agents, () => rows)

  ticks += 1
  if (ticks % MEMORY_EVERY_TICKS === 1) {
    const sample = await sampleMemory($)
    await update($, memory, () => sample)
    if (sample !== null && sample.topGb >= HEAVY_GB && heavyToasted !== sample.topName) {
      heavyToasted = sample.topName
      $.ui.toast(`foreman: ${sample.topName} uses ${sample.topGb.toFixed(0)} GB of memory`)
    }
  }

  $.ui.status(await statusLine($))
}

async function statusLine($: EngineInterface): Promise<string | undefined> {
  const current = await read($, report)
  const rows = await read($, agents)
  if (current === null && rows.length === 0) {
    return undefined
  }
  const stalled = rows.filter(row => row.isStalled).length
  const mem = await read($, memory)
  const parts = [
    `${current?.lanes.length ?? 0} lanes`,
    `${rows.length} agents`,
    stalled > 0 ? `${stalled} stalled` : '',
    (current?.needs.length ?? 0) > 0 ? `${current?.needs.length} need you` : '',
    current?.eta ? `ETA ${current.eta}` : '',
    mem ? `RAM ${mem.totalGb.toFixed(0)}G` : '',
  ]

  return parts.filter(Boolean).join(' · ')
}

async function storeKey($: EngineInterface): Promise<string> {
  return `report:${await $.session.root()}`
}

async function sampleMemory($: EngineInterface): Promise<Memory | null> {
  const ran = await $.process.run(['ps', '-A', '-o', 'rss=,comm='])
  if (ran.exitCode !== 0) {
    return null
  }
  let totalKb = 0
  let topKb = 0
  let topName = ''
  for (const line of ran.stdout.split('\n')) {
    const match = /^\s*(\d+)\s+(.+)$/.exec(line)
    if (match === null) {
      continue
    }
    const kb = Number(match[1])
    totalKb += kb
    if (kb > topKb) {
      topKb = kb
      topName = (match[2] ?? '').split('/').pop() ?? ''
    }
  }
  const gb = (kb: number) => kb / 1024 / 1024

  return { totalGb: gb(totalKb), topName, topGb: gb(topKb) }
}

function stageColor(stage: string, worker: AgentRow | undefined): string {
  if (worker?.isStalled || stage === 'blocked') {
    return 'red'
  }
  if (stage === 'pr' || stage === 'feedback') {
    return 'yellow'
  }

  return 'green'
}

function ago(now: number, then: number): string {
  const minutes = Math.max(0, Math.round((now - then) / 60000))
  if (minutes < 60) {
    return `${minutes}m`
  }

  return `${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, '0')}m`
}
