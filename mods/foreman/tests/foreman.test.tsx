import { expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'

import type { SessionFile } from '../types'

const HOME = '/home/test'
const PROGRAMS = `${HOME}/.claude/plugins/data/foreman-kodingdev/programs`
const SESSION_ID = 'session-a'
const START = 1_000_000

const LANE = { lane: 'rust-port', title: 'PSY-1: Port the shader', status: 'porting', agent: 'rusty' } as const
const SITE = { bodyColumns: 80, scroll: { offset: 0, bodyRows: 40 }, view: {} }
const PANE = {
  component: 'Pane',
  requestId: 'foreman',
  props: { ...SITE, title: 'Foreman', isFocused: false, placement: 'dock' },
} as const
const BAND = {
  component: 'AbovePrompt',
  props: { ...SITE, hasSurvey: false, isWorking: false, maxRows: 6 },
} as const

const PEER_FILE: SessionFile = {
  sessionId: 'session-b',
  program: 'niagara',
  updatedAt: START,
  lanes: [{ lane: 'webgl-runtime', title: 'PSY-2: WebGL runtime', status: 'in review', statusSince: START, todos: [], resources: [] }],
  needs: ['Review frontend #12: WebGL runtime'],
  agents: [],
  usage: {},
  totalRssGb: 0,
}

/**
 * The world beneath the mod: a clock, an in-memory file system, a home folder, one session id, no agents.
 */
const world = (on: On, seed: Record<string, string> = {}) => {
  const files = new Map(Object.entries(seed))
  const isFolder = (path: string) => [...files.keys()].some(file => file.startsWith(`${path}/`))

  const clock = mock.clock(on, { now: START })
  mock.env(on, { HOME })
  on('session.id', () => ({ value: SESSION_ID }))
  on('agent.list', () => ({ value: [] }))
  on('fs.exists', (_$, e) => ({ value: files.has(e.path) || isFolder(e.path) }))
  on('fs.write', (_$, e) => {
    files.set(e.path, e.text)
    return { value: undefined }
  })
  on('fs.read', (_$, e) => ({ value: files.get(e.path) ?? '' }))
  on('fs.list', (_$, e) => {
    const names = new Set([...files.keys()].filter(file => file.startsWith(`${e.path}/`)).map(file => file.slice(e.path.length + 1).split('/')[0] ?? ''))
    const entries = [...names].map(name => ({
      name,
      kind: files.has(`${e.path}/${name}`) ? ('file' as const) : ('dir' as const),
      size: 0,
      mtimeMs: 0,
      isLink: false,
    }))
    return { value: entries }
  })
  on('process.run', () => ({ value: { exitCode: 1, stdout: '', stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }))

  return { clock, files }
}

test('a report joins the lanes of every live session on the same program', async ($, on) => {
  world(on, { [`${PROGRAMS}/niagara/session-b.json`]: JSON.stringify(PEER_FILE) })
  await $.tool.call({ tool: 'mcp__foreman__report', program: 'niagara', lanes: [LANE] })

  const pane = await $.ui.mount({ plugin: 'foreman', surface: 'terminal', ...PANE })
  expect(await pane.find({ type: 'Text', text: /2 sessions/ })).toBeDefined()
  expect(await pane.find({ type: 'Text', text: /PSY-1: Port the shader/ })).toBeDefined()
  expect(await pane.find({ type: 'Text', text: /PSY-2: WebGL runtime/ })).toBeDefined()
  await pane.unmount()
})

test('a lane keeps its status age across reports with the same status', async ($, on) => {
  const { clock } = world(on)
  await $.tool.call({ tool: 'mcp__foreman__report', program: 'niagara', lanes: [LANE] })
  await clock.advance(30 * 60 * 1000)
  await $.tool.call({ tool: 'mcp__foreman__report', program: 'niagara', lanes: [{ ...LANE, summary: 'Tests **green** on the port.' }] })

  for (const surface of ['terminal', 'desktop'] as const) {
    const pane = await $.ui.mount({ plugin: 'foreman', surface, ...PANE })
    expect(await pane.find({ type: 'Text', text: /for 30m/ })).toBeDefined()
    expect(await pane.find({ type: 'Markdown', key: 'summary-rust-port' })).toBeDefined()
    await pane.unmount()
  }
})

test('the pane switches to another program and shows only that program', async ($, on) => {
  const other: SessionFile = { ...PEER_FILE, program: 'billing' }
  world(on, { [`${PROGRAMS}/billing/session-b.json`]: JSON.stringify(other) })
  await $.tool.call({ tool: 'mcp__foreman__report', program: 'niagara', lanes: [LANE] })

  const pane = await $.ui.mount({ plugin: 'foreman', surface: 'terminal', ...PANE })
  await pane.press({ key: 'program-billing' })
  expect(await pane.find({ type: 'Text', text: /PSY-2: WebGL runtime/ })).toBeDefined()
  expect(await pane.find({ type: 'Text', text: /PSY-1: Port the shader/ })).toBeUndefined()
  await pane.unmount()
})

test('a report with a lane that has no status is refused with the reason', async ($, on) => {
  world(on)
  const answer = await $.tool.call({ tool: 'mcp__foreman__report', program: 'niagara', lanes: [{ lane: 'rust-port', title: 'PSY-1: Port the shader' }] })

  expect(answer.text).toMatch(/lanes\[0\] needs lane, title, and status/)
})

test('a lane shows its todos with progress and the resources its agent labeled', async ($, on) => {
  world(on)
  const todos = [
    { text: 'Write the failing test', state: 'done' },
    { text: 'Port the bloom pass', state: 'active', eta: '~20m' },
    { text: 'Open the PR', state: 'pending' },
  ]
  const resources = [{ label: 'dev server', value: 'http://localhost:5173' }]
  await $.tool.call({ tool: 'mcp__foreman__report', program: 'niagara', lanes: [{ ...LANE, todos, resources }] })

  const pane = await $.ui.mount({ plugin: 'foreman', surface: 'terminal', ...PANE })
  expect(await pane.find({ type: 'Text', text: /1\/3 done/ })).toBeDefined()
  expect(await pane.find({ type: 'Text', text: /> Port the bloom pass/ })).toBeDefined()
  expect(await pane.find({ type: 'Text', text: /~20m/ })).toBeDefined()
  expect(await pane.find({ type: 'Text', text: /dev server\s+http:\/\/localhost:5173/ })).toBeDefined()
  await pane.unmount()
})

test('the band lists what needs the user and hides when nothing does', async ($, on) => {
  world(on)
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
    const { Text } = $.ui.resolve(e)

    return <Text>engine band</Text>
  })
  await $.tool.call({ tool: 'mcp__foreman__report', program: 'niagara', lanes: [LANE], needs: ['Approve PR #12'] })

  for (const surface of ['terminal', 'desktop'] as const) {
    const band = await $.ui.mount({ plugin: 'foreman', surface, ...BAND })
    expect(await band.find({ type: 'Text', text: /needs you: Approve PR #12/ })).toBeDefined()
    await band.unmount()
  }

  await $.tool.call({ tool: 'mcp__foreman__report', program: 'niagara', lanes: [LANE], needs: [] })
  const band = await $.ui.mount({ plugin: 'foreman', surface: 'terminal', ...BAND })
  expect(await band.find({ type: 'Text', text: /engine band/ })).toBeDefined()
  await band.unmount()
})

test('a denied tool call shows in the band', async ($, on) => {
  world(on)
  on('tool.call', { tool: 'Bash' }, () => ({ deny: 'not allowed here' }))
  await $.tool.call({ tool: 'Bash', command: 'rm -rf build' })

  const band = await $.ui.mount({ plugin: 'foreman', surface: 'terminal', ...BAND })
  expect(await band.find({ type: 'Text', text: /1 permission denial \(last: Bash\)/ })).toBeDefined()
  await band.unmount()
})
