import { expect, test } from 'claude-code/testing'

import { sampleLanes } from './lane-processes'

const GB_IN_KB = 1024 * 1024

const PS_OUTPUT = [
  `  100     1 ${2 * GB_IN_KB}  50.0 /usr/local/bin/pnpm`,
  `  200   100 ${8 * GB_IN_KB} 150.0 /usr/local/bin/node`,
  `  300     1 ${1 * GB_IN_KB}  10.0 zsh`,
  `  400     1 ${4 * GB_IN_KB}   5.0 cargo`,
].join('\n')

const CWD_OUTPUT = ['p100', 'n/work/rust-port', 'p200', 'n/tmp', 'p300', 'n/work/rust-port-old', 'p400', 'n/work/webgl/src'].join('\n')

const LISTEN_OUTPUT = ['p200', 'f21', 'n*:5173', 'f22', 'n[::1]:5173', 'p300', 'f9', 'n127.0.0.1:9000'].join('\n')

const WORKTREES = { 'rust-port': '/work/rust-port', webgl: '/work/webgl' }

test('a lane counts the processes in its worktree and their children, and nothing in a sibling folder', () => {
  const sample = sampleLanes(PS_OUTPUT, CWD_OUTPUT, LISTEN_OUTPUT, WORKTREES)

  expect(sample.lanes['rust-port']).toEqual({
    rssGb: 10,
    cpuPercent: 200,
    processCount: 2,
    ports: [{ label: 'node', value: 'localhost:5173', isObserved: true }],
  })
  expect(sample.lanes.webgl).toEqual({ rssGb: 4, cpuPercent: 5, processCount: 1, ports: [] })
  expect(sample.totalRssGb).toBe(15)
  expect(sample.heaviest).toEqual({ pid: 200, rssGb: 8, lane: 'rust-port' })
})
