import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { AgentRow, Lane, SessionFile } from '../types'

import { formatElapsed } from './elapsed'
import { countOf, laneCard } from './lane-card'
import { CWD_ARGV, LISTEN_ARGV, PS_ARGV, sampleLanes } from './lane-processes'
import { isProgramName, isSessionFile, mergeSessions } from './program-view'
import { parseReport } from './report-input'

const PANE = 'foreman'
const PANE_TITLE = 'Foreman'
const STALL_MS = 10 * 60 * 1000
const HEAVY_GB = 24
const TICK_MS = 5000
const SAMPLE_MS = 15000
const LIVE_STATUSES = new Set(['pending', 'running', 'waiting', 'idle'])
const DATA_FOLDER_ID = 'foreman-kodingdev'
const HEARTBEAT_MS = 60 * 1000
const SEEN_THROTTLE_MS = 1000
const PROGRAM_STALE_MS = 24 * 60 * 60 * 1000
const MAIN_ID = 'main'

const program = atom({ plugin: 'foreman', key: 'program' } as const, null)
const own = atom({ plugin: 'foreman', key: 'own' } as const, null)
const view = atom({ plugin: 'foreman', key: 'view' } as const, null)
const programs = atom({ plugin: 'foreman', key: 'programs' } as const, [])
const waiting = atom({ plugin: 'foreman', key: 'waiting' } as const, [])
const denials = atom({ plugin: 'foreman', key: 'denials' } as const, [])
const tracking = atom({ plugin: 'foreman', key: 'tracking' } as const, {
  lastSeen: {},
  tokens: {},
  stallToasted: [],
  heavyToasted: [],
  lastSampleAt: 0,
  lastWriteAt: 0,
  lastWriteKey: '',
})

const LANE_SCHEMA = {
  type: 'object',
  properties: {
    lane: { type: 'string', description: 'Short lane name, for example "rust-shader-port".' },
    title: { type: 'string', description: 'What the lane delivers, for example "PSY-412: battle-pass logos".' },
    status: { type: 'string', description: 'A few words on where the lane stands now, in your own terms.' },
    agent: { type: 'string', description: 'Name of the agent that works the lane.' },
    worktree: { type: 'string', description: 'Absolute path the lane works in. The mod measures memory, CPU, and listening ports under it.' },
    summary: { type: 'string', description: 'One or two sentences of markdown: what the lane does now and why.' },
    eta: { type: 'string', description: 'Rough estimate to done, for example "~40m".' },
    todos: {
      type: 'array',
      description: 'The lane plan as small steps.',
      items: {
        type: 'object',
        properties: {
          text: { type: 'string' },
          state: { type: 'string', enum: ['pending', 'active', 'done'] },
          eta: { type: 'string', description: 'Rough estimate for this step.' },
        },
        required: ['text', 'state'],
      },
    },
    resources: {
      type: 'array',
      description: 'Things the lane owns that the user may want to open: a dev server, a preview URL, a PR, a log file.',
      items: {
        type: 'object',
        properties: { label: { type: 'string' }, value: { type: 'string' } },
        required: ['label', 'value'],
      },
    },
  },
  required: ['lane', 'title', 'status'],
}

const REPORT_SCHEMA = {
  type: 'object',
  properties: {
    program: { type: 'string', description: 'The program id. Every session on one program sends the same id. One lower-case path segment.' },
    lanes: { type: 'array', items: LANE_SCHEMA, description: 'Only the lanes that changed. Each one replaces the lane of the same name; other lanes stay.' },
    closed: { type: 'array', items: { type: 'string' }, description: 'Names of lanes that are done. They leave the view.' },
    needs: { type: 'array', items: { type: 'string' }, description: 'Each decision or review that waits on the user now, one line each. Replaces the last list; leave it out to keep it, send [] when nothing waits. Put later plans in a todo.' },
    eta: { type: 'string', description: 'Rough estimate for the whole program.' },
  },
  required: ['program'],
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'lanes',
      description: 'Show the lanes of a program. Give a program id to switch, or "stop <lane>" to stop its agent.',
      argumentHint: '[program | stop <lane>]',
    })
    await $.tool.register({
      name: 'report',
      description:
        'Report the lanes of your program so the user can see them. Send only what changed: changed lanes, closed lanes, and needs or eta when they change.',
      inputSchema: REPORT_SCHEMA,
    })
    await pruneSessionFiles($)
    $.clock.every(TICK_MS, () => void tick($))

    return next(e)
  })

  on('session.end', async ($, e, next) => {
    const current = await read($, own)
    if (current !== null) {
      await saveSessionFile($, { ...current, updatedAt: 0 }, true)
    }

    return next(e)
  })

  on('command.run', { command: 'lanes' }, async ($, e) => {
    const [verb = '', ...rest] = e.args.trim().split(/\s+/)

    if (verb === 'stop') {
      return { text: await stopLane($, rest.join(' ')) }
    }
    if (verb.length > 0) {
      const answer = await selectProgram($, verb)
      await $.ui.open({ id: PANE, title: PANE_TITLE })

      return { text: answer }
    }

    await $.ui.open({ id: PANE, title: PANE_TITLE })
    const selected = await read($, program)

    return { text: selected === null ? 'Lanes pane opened. No program yet: the first report picks one.' : `Lanes pane opened on ${selected}.` }
  })

  on('tool.call', { tool: 'mcp__foreman__report' }, async ($, e) => {
    const parsed = parseReport({ ...e })
    if (!parsed.isValid) {
      return { result: parsed.reason, text: parsed.reason, isError: true }
    }

    const { report } = parsed
    const now = await $.clock.now()
    const sessionId = await $.session.id()
    const previous = await read($, own)
    const isSameProgram = previous?.program === report.program
    const kept = (isSameProgram ? previous.lanes : []).filter(lane => !report.closed.includes(lane.lane))
    const sent: Lane[] = report.lanes.map(lane => {
      const before = previous?.lanes.find(one => one.lane === lane.lane)
      const statusSince = before?.status === lane.status ? before.statusSince : now

      return { ...lane, statusSince }
    })
    const sentNames = new Set(sent.map(lane => lane.lane))
    const lanes = [...kept.filter(lane => !sentNames.has(lane.lane)), ...sent]

    const file: SessionFile = {
      sessionId,
      program: report.program,
      updatedAt: now,
      lanes,
      needs: report.needs ?? (isSameProgram ? previous.needs : []),
      eta: report.eta ?? (isSameProgram ? previous.eta : undefined),
      agents: previous?.agents ?? [],
      usage: previous?.usage ?? {},
      totalRssGb: previous?.totalRssGb ?? 0,
    }
    await saveSessionFile($, file, true)

    const selected = await read($, program)
    if (selected === null) {
      await update($, program, () => report.program)
    }
    await refreshView($, now)

    const text = `${report.program}: ${countOf(lanes.length, 'open lane')}, ${countOf(file.needs.length, 'need')}.`

    return { result: text, text }
  })

  on('tool.call', async ($, e, next) => {
    const agentId = e.agentId ?? MAIN_ID
    const now = await $.clock.now()
    const before = await read($, tracking)
    const isSeenStale = now - (before.lastSeen[agentId] ?? 0) >= SEEN_THROTTLE_MS
    if (isSeenStale) {
      await update($, tracking, latest => ({ ...latest, lastSeen: { ...latest.lastSeen, [agentId]: now } }))
    }

    const isSubagentQuestion = e.tool === 'AskUserQuestion' && e.agentId !== undefined
    const question = isSubagentQuestion ? await describeQuestion($, agentId, e.questions) : null
    if (question !== null) {
      await update($, waiting, list => [...list, question])
    }

    const ran = await next(e)

    if (question !== null) {
      await update($, waiting, list => list.filter(one => one !== question))
    }
    if (ran.deny !== undefined) {
      const denial = { tool: String(e.tool), reason: ran.deny, at: now }
      await update($, denials, list => [...list, denial].slice(-20))
    }

    return ran
  })

  on('turn.complete', async ($, e, next) => {
    const agentId = e.agentId ?? MAIN_ID
    const { usage } = e
    if (usage !== undefined) {
      const spent = usage.input_tokens + usage.output_tokens + usage.cache_creation_input_tokens
      await update($, tracking, before => ({
        ...before,
        tokens: { ...before.tokens, [agentId]: (before.tokens[agentId] ?? 0) + spent },
      }))
    }

    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const current = await read($, view)
    const asked = await read($, waiting)
    const denied = await read($, denials)
    const needs = [...(current?.needs ?? []), ...asked]
    const stalled = (current?.agents ?? []).filter(agent => agent.isStalled)
    const isQuiet = needs.length === 0 && stalled.length === 0 && denied.length === 0

    if (e.props.hasSurvey || isQuiet) {
      return next(e)
    }

    const { Box, Button, Text } = $.ui.resolve(e)
    const lastDenial = denied.at(-1)
    const items = [
      ...needs.map(need => `needs you: ${need}`),
      ...stalled.map(agent => `stalled: ${agent.name}`),
      ...(lastDenial === undefined ? [] : [`${countOf(denied.length, 'permission denial')} (last: ${lastDenial.tool})`]),
    ]
    const hiddenCount = items.length - 3

    return (
      <Box flexDirection="column">
        {items.slice(0, 3).map(item => (
          <Text color="yellow" wrap="truncate-end">
            {item}
          </Text>
        ))}
        <Box>
          {hiddenCount > 0 && <Text dimColor>+{hiddenCount} more </Text>}
          <Button key="open" label="Open lanes" onPress={() => void $.ui.open({ id: PANE, title: PANE_TITLE })} />
          {denied.length > 0 && <Button key="clear" label="Clear denials" onPress={() => update($, denials, () => [])} />}
        </Box>
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const elements = $.ui.resolve(e)
    const { Box, Button, Text } = elements
    const now = await $.clock.now()
    const selected = await read($, program)
    const current = await read($, view)
    const known = await read($, programs)
    const asked = await read($, waiting)
    const denied = await read($, denials)

    const others = known.filter(name => name !== selected)
    const lanes = current?.lanes ?? []
    const agents = current?.agents ?? []
    const laneAgents = new Set(lanes.map(lane => lane.agent))
    const looseAgents = agents.filter(agent => agent.id !== MAIN_ID && !laneAgents.has(agent.name))
    const needs = [...(current?.needs ?? []), ...asked]
    const labelWidth = Math.max(0, ...lanes.flatMap(lane => [...lane.resources, ...(current?.usage[lane.lane]?.ports ?? [])].map(resource => resource.label.length)))

    return (
      <Box flexDirection="column" gap={1}>
        <Box justifyContent="space-between">
          <Text bold wrap="truncate-end">
            {selected ?? 'No program'}
          </Text>
          <Text dimColor>
            {current !== null && countOf(current.sessionCount, 'session')}
            {current?.eta !== undefined && <Text color="cyan">  ETA {current.eta}</Text>}
          </Text>
        </Box>
        {others.length > 0 && (
          <Box gap={1}>
            <Text dimColor>switch</Text>
            {others.map(name => (
              <Button key={`program-${name}`} label={name} plain onPress={() => void selectProgram($, name)} />
            ))}
          </Box>
        )}

        {needs.length > 0 && (
          <Box flexDirection="column" borderStyle="round" borderColor="yellow" paddingX={1}>
            <Text bold color="yellow">
              Needs you
            </Text>
            {needs.map(need => (
              <Text wrap="truncate-end">{need}</Text>
            ))}
          </Box>
        )}

        {lanes.length === 0 && <Text dimColor>No lanes yet. Agents send them with the report tool.</Text>}
        {lanes.map(lane => {
          const worker = agents.find(agent => agent.name === lane.agent)

          return laneCard(elements, lane, worker, current?.usage[lane.lane], labelWidth, now)
        })}

        {looseAgents.length > 0 && (
          <Box flexDirection="column">
            <Text bold>Other agents</Text>
            {looseAgents.map(agent => (
              <Text color={agent.isStalled ? 'red' : undefined} dimColor={!agent.isStalled} wrap="truncate-end">
                {agent.name}  {agent.isStalled ? 'stalled' : agent.status}, active {formatElapsed(now, agent.lastSeen)} ago
              </Text>
            ))}
          </Box>
        )}

        {denied.length > 0 && (
          <Box flexDirection="column">
            <Text bold color="red">
              Permission denials
            </Text>
            {denied.slice(-5).map(denial => (
              <Text wrap="truncate-end">
                <Text color="red">{denial.tool}</Text>
                <Text dimColor>
                  {'  '}
                  {formatElapsed(now, denial.at)} ago  {denial.reason}
                </Text>
              </Text>
            ))}
          </Box>
        )}

        {current !== null && current.totalRssGb > 0 && <Text dimColor>Machine memory in use: {current.totalRssGb.toFixed(1)} GB</Text>}
      </Box>
    )
  })
}

const tick = async ($: EngineInterface) => {
  const now = await $.clock.now()
  const before = await read($, tracking)
  const listed = await $.agent.list()

  const live = listed.filter(agent => LIVE_STATUSES.has(agent.status))
  const lastSeen = { ...before.lastSeen }
  for (const agent of live) {
    lastSeen[agent.id] = lastSeen[agent.id] ?? now
  }

  const mainRow: AgentRow = {
    id: MAIN_ID,
    name: MAIN_ID,
    status: 'running',
    lastSeen: lastSeen[MAIN_ID] ?? now,
    isStalled: false,
    tokenCount: before.tokens[MAIN_ID] ?? 0,
  }
  const subagents: AgentRow[] = live.map(agent => {
    const seen = lastSeen[agent.id] ?? now
    const row: AgentRow = {
      id: agent.id,
      name: agent.name ?? agent.description,
      status: agent.status,
      lastSeen: seen,
      isStalled: agent.status === 'running' && now - seen > STALL_MS,
      tokenCount: before.tokens[agent.id] ?? 0,
    }

    return row
  })

  const agents = [mainRow, ...subagents]
  const newlyStalled = agents.filter(agent => agent.isStalled && !before.stallToasted.includes(agent.id))
  for (const agent of newlyStalled) {
    $.ui.toast(`lanes: ${agent.name} has made no tool call for ${formatElapsed(now, agent.lastSeen)}`)
  }
  const stallToasted = agents.filter(agent => agent.isStalled).map(agent => agent.id)

  const current = await read($, own)
  const shown = await read($, view)
  const isSampleDue = now - before.lastSampleAt >= SAMPLE_MS
  const sampled = isSampleDue ? await sampleProcesses($, shown?.lanes ?? current?.lanes ?? []) : null

  const heaviest = sampled?.heaviest ?? null
  const heavyKey = heaviest === null ? '' : `${heaviest.pid}`
  const isNewHeavy = heaviest !== null && heaviest.rssGb >= HEAVY_GB && !before.heavyToasted.includes(heavyKey)
  if (isNewHeavy) {
    const where = heaviest.lane === null ? `process ${heaviest.pid}` : `lane ${heaviest.lane} (process ${heaviest.pid})`
    $.ui.toast(`lanes: ${where} uses ${heaviest.rssGb.toFixed(0)} GB of memory`)
  }

  await update($, tracking, latest => ({
    ...latest,
    lastSeen,
    stallToasted,
    heavyToasted: isNewHeavy ? [...latest.heavyToasted, heavyKey].slice(-50) : latest.heavyToasted,
    lastSampleAt: isSampleDue ? now : latest.lastSampleAt,
  }))

  if (current !== null) {
    const file: SessionFile = {
      ...current,
      updatedAt: now,
      agents,
      usage: sampled?.lanes ?? current.usage,
      totalRssGb: sampled?.totalRssGb ?? current.totalRssGb,
    }
    await saveSessionFile($, file, false)
  }

  await refreshView($, now, agents)
  $.ui.status(await statusLine($))
}

const refreshView = async ($: EngineInterface, now: number, ownAgents?: AgentRow[]) => {
  const selected = await read($, program)
  const known = await listPrograms($)
  await update($, programs, () => known)

  if (selected === null) {
    const agents = ownAgents ?? []
    await update($, view, () => (agents.length === 0 ? null : { program: '', sessionCount: 1, lanes: [], needs: [], agents, usage: {}, totalRssGb: 0 }))
    return
  }

  const files = await readProgramFiles($, selected)
  await update($, view, () => mergeSessions(selected, files, now))
}

const sampleProcesses = async ($: EngineInterface, lanes: Lane[]) => {
  const worktrees = Object.fromEntries(lanes.flatMap(lane => (lane.worktree === undefined ? [] : [[lane.lane, lane.worktree] as const])))
  const runs = await Promise.all([$.process.run(PS_ARGV), $.process.run(CWD_ARGV), $.process.run(LISTEN_ARGV)]).catch(() => {
    // A host without ps or lsof (Windows) cannot start them. The pane then shows no usage lines.
    return null
  })
  if (runs === null || runs[0].exitCode !== 0) {
    return null
  }

  return sampleLanes(runs[0].stdout, runs[1].stdout, runs[2].stdout, worktrees)
}

const selectProgram = async ($: EngineInterface, name: string) => {
  if (!isProgramName(name)) {
    return `"${name}" is not a program id. Program ids are one lower-case path segment.`
  }

  const known = await listPrograms($)
  if (!known.includes(name)) {
    return `No program "${name}". Known programs: ${known.join(', ') || 'none yet'}.`
  }

  await update($, program, () => name)
  await refreshView($, await $.clock.now())

  return `Lanes pane now shows ${name}.`
}

const stopLane = async ($: EngineInterface, laneName: string) => {
  const current = await read($, view)
  const lane = current?.lanes.find(one => one.lane === laneName)
  if (lane === undefined) {
    return `No lane "${laneName}" in this program.`
  }
  if (lane.agent === undefined) {
    return `Lane ${laneName} reports no agent, so there is nothing to stop.`
  }

  const stopped = await $.tool.call({ tool: 'TaskStop', task_id: lane.agent })
  if (stopped.deny !== undefined) {
    return `Could not stop ${lane.agent}: ${stopped.deny}`
  }

  return `The user stopped agent ${lane.agent} on lane ${laneName}. Re-plan that lane.`
}

const statusLine = async ($: EngineInterface) => {
  const selected = await read($, program)
  const current = await read($, view)
  const asked = await read($, waiting)
  const hasSubagents = current?.agents.some(agent => agent.id !== MAIN_ID) === true
  const isIdle = current === null || (current.lanes.length === 0 && !hasSubagents && current.needs.length === 0 && asked.length === 0)
  if (isIdle) {
    return undefined
  }

  const stalledCount = current.agents.filter(agent => agent.isStalled).length
  const needCount = current.needs.length + asked.length
  const parts = [
    `${selected ?? 'no program'}: ${countOf(current.lanes.length, 'lane')}`,
    stalledCount > 0 ? `${stalledCount} stalled` : '',
    needCount > 0 ? `${needCount} need you` : '',
    current.eta === undefined ? '' : `ETA ${current.eta}`,
  ]

  return parts.filter(part => part.length > 0).join(', ')
}

const describeQuestion = async ($: EngineInterface, agentId: string, asked: Array<{ question: string }>) => {
  const listed = await $.agent.list()
  const agent = listed.find(one => one.id === agentId)
  const who = agent?.name ?? agent?.description ?? 'an agent'
  const first = asked[0]?.question ?? 'a question'

  return `${who} asks: ${first}`
}

const dataFolder = async ($: EngineInterface) => {
  const fromPlugin = await $.env.get('CLAUDE_PLUGIN_DATA')
  if (fromPlugin !== undefined) {
    return fromPlugin
  }

  const config = (await $.env.get('CLAUDE_CONFIG_DIR')) ?? `${await $.env.get('HOME')}/.claude`

  return `${config}/plugins/data/${DATA_FOLDER_ID}`
}

const listPrograms = async ($: EngineInterface) => {
  const root = `${await dataFolder($)}/programs`
  const hasRoot = await $.fs.exists(root)
  if (!hasRoot) {
    return []
  }

  const now = await $.clock.now()
  const entries = await $.fs.list(root)
  const folders = entries.filter(entry => entry.kind === 'dir' && isProgramName(entry.name))
  const active = await Promise.all(
    folders.map(async folder => {
      const files = await $.fs.list(`${root}/${folder.name}`)
      const isActive = files.some(file => now - file.mtimeMs < PROGRAM_STALE_MS)

      return isActive ? [folder.name] : []
    }),
  )

  return active.flat().sort()
}

const pruneSessionFiles = async ($: EngineInterface) => {
  const root = `${await dataFolder($)}/programs`
  const hasRoot = await $.fs.exists(root)
  if (!hasRoot) {
    return
  }

  const now = await $.clock.now()
  const folders = (await $.fs.list(root)).filter(entry => entry.kind === 'dir')
  const listed = await Promise.all(
    folders.map(async folder => {
      const files = await $.fs.list(`${root}/${folder.name}`)

      return files.filter(file => file.name.endsWith('.json') && now - file.mtimeMs >= PROGRAM_STALE_MS).map(file => `${root}/${folder.name}/${file.name}`)
    }),
  )
  const stale = listed.flat()
  if (stale.length === 0) {
    return
  }

  // $.fs cannot delete. A host without rm keeps the files, and listPrograms still hides them.
  await $.process.run(['rm', '-f', ...stale]).catch(() => null)
}

const readProgramFiles = async ($: EngineInterface, name: string) => {
  const folder = `${await dataFolder($)}/programs/${name}`
  const hasFolder = await $.fs.exists(folder)
  if (!hasFolder) {
    return []
  }

  const entries = await $.fs.list(folder)
  const texts = await Promise.all(entries.filter(entry => entry.name.endsWith('.json')).map(entry => $.fs.read(`${folder}/${entry.name}`)))

  return texts.flatMap(text => {
    const parsed = parseJson(text)
    return isSessionFile(parsed) ? [parsed] : []
  })
}

/**
 * Keep the session's report in state and on disk. Unforced, the disk write happens only when the
 * content changed or the heartbeat is due, so other sessions see this one as live.
 */
const saveSessionFile = async ($: EngineInterface, file: SessionFile, isForced: boolean) => {
  await update($, own, () => file)

  const key = JSON.stringify({ ...file, updatedAt: 0 })
  const before = await read($, tracking)
  const isDue = isForced || key !== before.lastWriteKey || file.updatedAt - before.lastWriteAt >= HEARTBEAT_MS
  if (!isDue) {
    return
  }

  const folder = `${await dataFolder($)}/programs/${file.program}`
  await $.fs.write(`${folder}/${file.sessionId}.json`, JSON.stringify(file))
  await update($, tracking, latest => ({ ...latest, lastWriteAt: file.updatedAt, lastWriteKey: key }))
}

const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text)
  } catch {
    // Another session can be mid-write. Its file is read again on the next tick.
    return null
  }
}
