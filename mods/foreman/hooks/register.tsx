import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { AgentRow, Lane, SessionFile } from '../types'

import { formatElapsed } from './elapsed'
import { LSOF_ARGV, PS_ARGV, sampleLanes } from './lane-resources'
import { isProgramName, isSessionFile, mergeSessions } from './program-view'
import { STAGES, parseReport } from './report-input'

const PANE = 'foreman'
const PANE_TITLE = 'Foreman'
const STALL_MS = 10 * 60 * 1000
const HEAVY_GB = 24
const TICK_MS = 5000
const SAMPLE_MS = 15000
const LIVE_STATUSES = new Set(['pending', 'running', 'waiting', 'idle'])
const DATA_FOLDER_ID = 'foreman-kodingdev'

const program = atom({ plugin: 'foreman', key: 'program' } as const, null)
const own = atom({ plugin: 'foreman', key: 'own' } as const, null)
const view = atom({ plugin: 'foreman', key: 'view' } as const, null)
const programs = atom({ plugin: 'foreman', key: 'programs' } as const, [])
const questions = atom({ plugin: 'foreman', key: 'questions' } as const, [])
const denials = atom({ plugin: 'foreman', key: 'denials' } as const, [])
const tracking = atom({ plugin: 'foreman', key: 'tracking' } as const, {
  lastSeen: {},
  tokens: {},
  stallToasted: [],
  heavyToasted: [],
  lastSampleAt: 0,
})

const LANE_SCHEMA = {
  type: 'object',
  properties: {
    lane: { type: 'string', description: 'Lane name, for example "rust-shader-port".' },
    ticket: { type: 'string', description: 'Ticket identifier, for example "PSY-412".' },
    title: { type: 'string', description: 'Ticket title.' },
    stage: { type: 'string', enum: STAGES },
    agent: { type: 'string', description: 'Name of the worker agent on this lane.' },
    branch: { type: 'string' },
    worktree: { type: 'string', description: 'Absolute path of the lane worktree. The mod measures memory and CPU under it.' },
    pr: { type: 'string', description: 'The PR as "repo #123: title".' },
    eta: { type: 'string', description: 'Estimate to done, for example "~40m".' },
    note: { type: 'string', description: 'One short line: what happens now.' },
  },
  required: ['lane', 'ticket', 'title', 'stage'],
}

const REPORT_SCHEMA = {
  type: 'object',
  properties: {
    program: { type: 'string', description: 'The program name from the playbook. One lower-case path segment.' },
    lanes: { type: 'array', items: LANE_SCHEMA, description: 'Every open lane, in priority order. Leave out lanes that are done.' },
    needs: { type: 'array', items: { type: 'string' }, description: 'Each decision or review that waits on the user, one line each.' },
    eta: { type: 'string', description: 'Estimate for the whole program.' },
  },
  required: ['program', 'lanes'],
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'lanes',
      description: 'Show a foreman program. Give a program name to switch, or "stop <lane>" to stop its worker.',
      argumentHint: '[program | stop <lane>]',
    })
    await $.tool.register({
      name: 'report',
      description:
        'Foreman status report. Send the full picture of your program after each stage change, PR, and decision that waits on the user. Each call replaces your last one.',
      inputSchema: REPORT_SCHEMA,
    })
    $.clock.every(TICK_MS, () => void tick($))

    return next(e)
  })

  on('session.end', async ($, e, next) => {
    const current = await read($, own)
    if (current !== null) {
      await writeSessionFile($, { ...current, updatedAt: 0 })
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

    return { text: selected === null ? 'Foreman pane opened. No program yet: foreman picks one with its first report.' : `Foreman pane opened on ${selected}.` }
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
    const lanes: Lane[] = report.lanes.map(lane => {
      const before = previous?.lanes.find(one => one.lane === lane.lane)
      const stageSince = before?.stage === lane.stage ? before.stageSince : now

      return { ...lane, stageSince }
    })

    const file: SessionFile = {
      sessionId,
      program: report.program,
      updatedAt: now,
      lanes,
      needs: report.needs,
      eta: report.eta,
      agents: previous?.agents ?? [],
      resources: previous?.resources ?? {},
      totalRssGb: previous?.totalRssGb ?? 0,
    }
    await update($, own, () => file)
    await writeSessionFile($, file)

    const selected = await read($, program)
    if (selected === null) {
      await update($, program, () => report.program)
    }
    await refreshView($, now)

    const text = `Recorded ${countOf(lanes.length, 'lane')} and ${countOf(report.needs.length, 'item')} that wait on the user for ${report.program}.`

    return { result: text, text }
  })

  on('tool.call', async ($, e, next) => {
    const agentId = e.agentId
    const now = await $.clock.now()
    if (agentId !== undefined) {
      await update($, tracking, before => ({ ...before, lastSeen: { ...before.lastSeen, [agentId]: now } }))
    }

    const question = e.tool === 'AskUserQuestion' && agentId !== undefined ? await describeQuestion($, agentId, e.questions) : null
    if (question !== null) {
      await update($, questions, list => [...list, question])
    }

    const ran = await next(e)

    if (question !== null) {
      await update($, questions, list => list.filter(one => one !== question))
    }
    if (ran.deny !== undefined) {
      const denial = { tool: String(e.tool), reason: ran.deny, at: now }
      await update($, denials, list => [...list, denial].slice(-20))
    }

    return ran
  })

  on('turn.complete', async ($, e, next) => {
    const { agentId, usage } = e
    if (agentId !== undefined && usage !== undefined) {
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
    const asked = await read($, questions)
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
      ...(lastDenial === undefined ? [] : [`${denied.length} permission denials (last: ${lastDenial.tool})`]),
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
          <Button key="open" label="Open foreman" onPress={() => void $.ui.open({ id: PANE, title: PANE_TITLE })} />
          {denied.length > 0 && <Button key="clear" label="Clear denials" onPress={() => update($, denials, () => [])} />}
        </Box>
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Button, Text } = $.ui.resolve(e)
    const now = await $.clock.now()
    const selected = await read($, program)
    const current = await read($, view)
    const known = await read($, programs)
    const asked = await read($, questions)
    const denied = await read($, denials)

    const others = known.filter(name => name !== selected)
    const lanes = current?.lanes ?? []
    const agents = current?.agents ?? []
    const laneAgents = new Set(lanes.map(lane => lane.agent))
    const looseAgents = agents.filter(agent => !laneAgents.has(agent.name))
    const needs = [...(current?.needs ?? []), ...asked]

    return (
      <Box flexDirection="column">
        <Text bold wrap="truncate-end">
          {selected ?? 'No program'}
          {current !== null && <Text dimColor> · {countOf(current.sessionCount, 'session')}</Text>}
          {current?.eta !== undefined && <Text> · ETA {current.eta}</Text>}
        </Text>
        {others.length > 0 && (
          <Box>
            <Text dimColor>Switch: </Text>
            {others.map(name => (
              <Button key={`program-${name}`} label={name} plain onPress={() => void selectProgram($, name)} />
            ))}
          </Box>
        )}

        {lanes.length === 0 && <Text dimColor>No lanes. Foreman sends them with the report tool.</Text>}
        {lanes.map(lane => {
          const worker = agents.find(agent => agent.name === lane.agent)
          const used = current?.resources[lane.lane]

          return (
            <Box flexDirection="column" marginTop={1}>
              <Text wrap="truncate-end">
                <Text color={stageColor(lane, worker)}>● </Text>
                <Text bold>{lane.lane}</Text> {lane.ticket}: {lane.title}
              </Text>
              <Text dimColor wrap="truncate-end">
                {'  '}
                {lane.stage} {formatElapsed(now, lane.stageSince)}
                {lane.eta !== undefined && ` · ETA ${lane.eta}`}
                {worker !== undefined && ` · ${worker.name} ${worker.isStalled ? 'STALLED' : worker.status}, active ${formatElapsed(now, worker.lastSeen)} ago`}
              </Text>
              {(used !== undefined || (worker?.tokenCount ?? 0) > 0) && (
                <Text dimColor wrap="truncate-end">
                  {'  '}
                  {used !== undefined && `${used.rssGb.toFixed(1)} GB · ${Math.round(used.cpuPercent)}% CPU · ${used.processCount} processes`}
                  {worker !== undefined && worker.tokenCount > 0 && ` · ${formatTokens(worker.tokenCount)} tokens`}
                </Text>
              )}
              {lane.pr !== undefined && <Text dimColor wrap="truncate-end">{'  '}PR {lane.pr}</Text>}
              {lane.note !== undefined && <Text dimColor wrap="truncate-end">{'  '}{lane.note}</Text>}
            </Box>
          )
        })}

        {needs.length > 0 && (
          <Box flexDirection="column" marginTop={1}>
            <Text bold>Needs you</Text>
            {needs.map(need => (
              <Text color="yellow" wrap="truncate-end">• {need}</Text>
            ))}
          </Box>
        )}

        {looseAgents.length > 0 && (
          <Box flexDirection="column" marginTop={1}>
            <Text bold>Other agents</Text>
            {looseAgents.map(agent => (
              <Text color={agent.isStalled ? 'red' : undefined} dimColor={!agent.isStalled} wrap="truncate-end">
                {agent.isStalled ? 'STALLED' : agent.status} {agent.name} · active {formatElapsed(now, agent.lastSeen)} ago
              </Text>
            ))}
          </Box>
        )}

        {denied.length > 0 && (
          <Box flexDirection="column" marginTop={1}>
            <Text bold>Permission denials</Text>
            {denied.slice(-5).map(denial => (
              <Text color="red" wrap="truncate-end">
                {denial.tool} {formatElapsed(now, denial.at)} ago: {denial.reason}
              </Text>
            ))}
          </Box>
        )}

        {current !== null && current.totalRssGb > 0 && (
          <Box marginTop={1}>
            <Text dimColor>Machine memory in use: {current.totalRssGb.toFixed(1)} GB</Text>
          </Box>
        )}
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

  const agents: AgentRow[] = live.map(agent => {
    const seen = lastSeen[agent.id] ?? now
    const isStalled = agent.status === 'running' && now - seen > STALL_MS
    const row: AgentRow = {
      id: agent.id,
      name: agent.name ?? agent.description,
      status: agent.status,
      lastSeen: seen,
      isStalled,
      tokenCount: before.tokens[agent.id] ?? 0,
    }

    return row
  })

  const newlyStalled = agents.filter(agent => agent.isStalled && !before.stallToasted.includes(agent.id))
  for (const agent of newlyStalled) {
    $.ui.toast(`foreman: ${agent.name} has made no tool call for ${formatElapsed(now, agent.lastSeen)}`)
  }
  const stallToasted = agents.filter(agent => agent.isStalled).map(agent => agent.id)

  const current = await read($, own)
  const shown = await read($, view)
  const isSampleDue = now - before.lastSampleAt >= SAMPLE_MS
  const sampled = isSampleDue ? await sampleResources($, shown?.lanes ?? current?.lanes ?? []) : null

  const heaviest = sampled?.heaviest ?? null
  const heavyKey = heaviest === null ? '' : `${heaviest.pid}`
  const isNewHeavy = heaviest !== null && heaviest.rssGb >= HEAVY_GB && !before.heavyToasted.includes(heavyKey)
  if (isNewHeavy) {
    const where = heaviest.lane === null ? `process ${heaviest.pid}` : `lane ${heaviest.lane} (process ${heaviest.pid})`
    $.ui.toast(`foreman: ${where} uses ${heaviest.rssGb.toFixed(0)} GB of memory`)
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
      resources: sampled?.lanes ?? current.resources,
      totalRssGb: sampled?.totalRssGb ?? current.totalRssGb,
    }
    await update($, own, () => file)
    await writeSessionFile($, file)
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
    await update($, view, () => (agents.length === 0 ? null : { program: '', sessionCount: 1, lanes: [], needs: [], agents, resources: {}, totalRssGb: 0 }))
    return
  }

  const files = await readProgramFiles($, selected)
  await update($, view, () => mergeSessions(selected, files, now))
}

const sampleResources = async ($: EngineInterface, lanes: Lane[]) => {
  const worktrees = Object.fromEntries(lanes.flatMap(lane => (lane.worktree === undefined ? [] : [[lane.lane, lane.worktree] as const])))
  const [ps, lsof] = await Promise.all([$.process.run(PS_ARGV), $.process.run(LSOF_ARGV)])
  if (ps.exitCode !== 0) {
    return null
  }

  return sampleLanes(ps.stdout, lsof.stdout, worktrees)
}

const selectProgram = async ($: EngineInterface, name: string) => {
  if (!isProgramName(name)) {
    return `"${name}" is not a program name. Program names are one lower-case path segment.`
  }

  const known = await listPrograms($)
  if (!known.includes(name)) {
    return `No program "${name}". Known programs: ${known.join(', ') || 'none yet'}.`
  }

  await update($, program, () => name)
  await refreshView($, await $.clock.now())

  return `Foreman pane now shows ${name}.`
}

const stopLane = async ($: EngineInterface, laneName: string) => {
  const current = await read($, view)
  const lane = current?.lanes.find(one => one.lane === laneName)
  if (lane === undefined) {
    return `No lane "${laneName}" in this program.`
  }
  if (lane.agent === undefined) {
    return `Lane ${laneName} reports no worker agent, so there is nothing to stop.`
  }

  const stopped = await $.tool.call({ tool: 'TaskStop', task_id: lane.agent })
  if (stopped.deny !== undefined) {
    return `Could not stop ${lane.agent}: ${stopped.deny}`
  }

  await $.session.append({
    message: { type: 'user', content: [{ type: 'text', text: `The user stopped worker ${lane.agent} on lane ${laneName} with /lanes stop.` }] },
  })

  return `Stopped ${lane.agent} on lane ${laneName}. Foreman knows.`
}

const statusLine = async ($: EngineInterface) => {
  const selected = await read($, program)
  const current = await read($, view)
  if (current === null) {
    return undefined
  }

  const stalledCount = current.agents.filter(agent => agent.isStalled).length
  const asked = await read($, questions)
  const needCount = current.needs.length + asked.length
  const parts = [
    selected ?? 'no program',
    countOf(current.lanes.length, 'lane'),
    countOf(current.agents.length, 'agent'),
    stalledCount > 0 ? `${stalledCount} stalled` : '',
    needCount > 0 ? `${needCount} need you` : '',
    current.eta === undefined ? '' : `ETA ${current.eta}`,
    current.totalRssGb > 0 ? `RAM ${current.totalRssGb.toFixed(0)}G` : '',
  ]

  return parts.filter(part => part.length > 0).join(' · ')
}

const describeQuestion = async ($: EngineInterface, agentId: string, asked: Array<{ question: string }>) => {
  const listed = await $.agent.list()
  const agent = listed.find(one => one.id === agentId)
  const who = agent?.name ?? agent?.description ?? 'a worker'
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

  const entries = await $.fs.list(root)

  return entries.filter(entry => entry.kind === 'dir' && isProgramName(entry.name)).map(entry => entry.name).sort()
}

const readProgramFiles = async ($: EngineInterface, name: string) => {
  const folder = `${await dataFolder($)}/programs/${name}`
  const hasFolder = await $.fs.exists(folder)
  if (!hasFolder) {
    return []
  }

  const entries = await $.fs.list(folder)
  const texts = await Promise.all(
    entries.filter(entry => entry.name.endsWith('.json')).map(entry => $.fs.read(`${folder}/${entry.name}`)),
  )

  return texts.flatMap(text => {
    const parsed = parseJson(text)
    return isSessionFile(parsed) ? [parsed] : []
  })
}

const writeSessionFile = async ($: EngineInterface, file: SessionFile) => {
  const folder = `${await dataFolder($)}/programs/${file.program}`
  await $.fs.write(`${folder}/${file.sessionId}.json`, JSON.stringify(file))
}

const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text)
  } catch {
    // Another session can be mid-write. Its file is read again on the next tick.
    return null
  }
}

const stageColor = (lane: Lane, worker: AgentRow | undefined) => {
  if (worker?.isStalled || lane.stage === 'blocked') {
    return 'red'
  }
  if (lane.stage === 'pr' || lane.stage === 'feedback') {
    return 'yellow'
  }

  return 'green'
}

const countOf = (count: number, noun: string) => `${count} ${noun}${count === 1 ? '' : 's'}`

const formatTokens = (count: number) => {
  return count >= 1_000_000 ? `${(count / 1_000_000).toFixed(1)}M` : `${Math.round(count / 1000)}k`
}

