import { expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'

const LANE = { lane: 'rust-port', ticket: 'PSY-1', title: 'Port the shader', stage: 'execute', agent: 'rusty' }
const SITE = { bodyColumns: 80, scroll: { offset: 0, bodyRows: 30 }, view: {} }
const PANE = {
  component: 'Pane',
  requestId: 'foreman',
  props: { ...SITE, title: 'Foreman', isFocused: false, placement: 'dock' },
} as const
const BAND = {
  component: 'AbovePrompt',
  props: { ...SITE, hasSurvey: false, isWorking: false, maxRows: 6 },
} as const

function world(on: On) {
  const clock = mock.clock(on, { now: 0 })
  mock.store(on)
  on('session.root', () => ({ value: '/repo' }))

  return clock
}

test('the pane shows a reported lane, and its stage age holds across reports in the same stage', async ($, on) => {
  const clock = world(on)
  await $.tool.call({ tool: 'mcp__foreman__report', lanes: [LANE] })
  await clock.advance(30 * 60 * 1000)
  await $.tool.call({ tool: 'mcp__foreman__report', lanes: [{ ...LANE, note: 'tests green' }] })

  for (const surface of ['terminal', 'desktop'] as const) {
    const pane = await $.ui.mount({ plugin: 'foreman', surface, ...PANE })
    expect(await pane.find({ type: 'Text', text: /PSY-1: Port the shader/ })).toBeDefined()
    expect(await pane.find({ type: 'Text', text: /execute 30m/ })).toBeDefined()
    expect(await pane.find({ type: 'Text', text: /tests green/ })).toBeDefined()
    await pane.unmount()
  }
})

test('the band lists what needs the user and hides when nothing does', async ($, on) => {
  world(on)
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
    const { Text } = $.ui.resolve(e)

    return <Text>engine band</Text>
  })
  await $.tool.call({ tool: 'mcp__foreman__report', lanes: [LANE], needs: ['Approve PR #12'] })

  for (const surface of ['terminal', 'desktop'] as const) {
    const band = await $.ui.mount({ plugin: 'foreman', surface, ...BAND })
    expect(await band.find({ type: 'Text', text: /needs you: Approve PR #12/ })).toBeDefined()
    await band.unmount()
  }

  await $.tool.call({ tool: 'mcp__foreman__report', lanes: [LANE], needs: [] })
  const band = await $.ui.mount({ plugin: 'foreman', surface: 'terminal', ...BAND })
  expect(await band.find({ type: 'Text', text: /engine band/ })).toBeDefined()
  expect(await band.find({ type: 'Text', text: /needs you/ })).toBeUndefined()
  await band.unmount()
})

test('a denied tool call shows in the band', async ($, on) => {
  world(on)
  on('tool.call', { tool: 'Bash' }, () => ({ deny: 'not allowed here' }))
  await $.tool.call({ tool: 'Bash', command: 'rm -rf build' })

  const band = await $.ui.mount({ plugin: 'foreman', surface: 'terminal', ...BAND })
  expect(await band.find({ type: 'Text', text: /1 permission denials \(last: Bash\)/ })).toBeDefined()
  await band.unmount()
})
