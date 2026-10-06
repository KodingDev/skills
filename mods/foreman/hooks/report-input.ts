import type { Lane, LaneResource, Todo } from '../types'

import { isProgramName } from './program-view'

/**
 * A lane as an agent reports it, before the mod adds when its status changed and when it was sent.
 */
export type ReportedLane = Omit<Lane, 'statusSince' | 'reportedAt'>

/**
 * A report as an agent sends it.
 */
export type Report = {
  program: string
  lanes: ReportedLane[]
  closed: string[]
  needs?: string[]
  eta?: string
}

/**
 * The result of reading a report call's arguments.
 */
export type ReportParse = { isValid: true; report: Report } | { isValid: false; reason: string }

const TODO_STATES = ['pending', 'active', 'done'] as const satisfies readonly Todo['state'][]

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

const optionalText = (value: unknown) => (typeof value === 'string' && value.length > 0 ? value : undefined)

const listOf = <T,>(value: unknown, read: (item: unknown) => T | null) => (Array.isArray(value) ? value.map(read).filter(item => item !== null) : [])

const readTodo = (value: unknown) => {
  if (!isRecord(value) || typeof value.text !== 'string') {
    return null
  }

  const todo: Todo = {
    text: value.text,
    state: TODO_STATES.find(state => state === value.state) ?? 'pending',
    eta: optionalText(value.eta),
  }

  return todo
}

const readResource = (value: unknown) => {
  if (!isRecord(value) || typeof value.label !== 'string' || typeof value.value !== 'string') {
    return null
  }

  const resource: LaneResource = { label: value.label, value: value.value }

  return resource
}

const readLane = (value: unknown) => {
  if (!isRecord(value)) {
    return null
  }

  const { lane, title, status } = value
  if (typeof lane !== 'string' || typeof title !== 'string' || typeof status !== 'string') {
    return null
  }

  const read: ReportedLane = {
    lane,
    title,
    status,
    agent: optionalText(value.agent),
    worktree: optionalText(value.worktree),
    summary: optionalText(value.summary),
    eta: optionalText(value.eta),
    todos: listOf(value.todos, readTodo),
    resources: listOf(value.resources, readResource),
  }

  return read
}

/**
 * Read the arguments of a `report` call. Returns the reason when a required field is missing.
 */
export const parseReport = (input: Record<string, unknown>): ReportParse => {
  const { program, lanes = [], closed, needs, eta } = input

  if (typeof program !== 'string' || !isProgramName(program)) {
    return { isValid: false, reason: 'program must be one lower-case path segment, for example "niagara-consolidation".' }
  }
  if (!Array.isArray(lanes)) {
    return { isValid: false, reason: 'lanes must be an array of the lanes that changed.' }
  }

  const read = lanes.map(readLane)
  const badIndex = read.findIndex(lane => lane === null)
  if (badIndex >= 0) {
    return { isValid: false, reason: `lanes[${badIndex}] needs lane, title, and status as strings.` }
  }

  const report: Report = {
    program,
    lanes: read.filter(lane => lane !== null),
    closed: Array.isArray(closed) ? closed.filter(name => typeof name === 'string') : [],
    needs: Array.isArray(needs) ? needs.filter(need => typeof need === 'string') : undefined,
    eta: optionalText(eta),
  }

  return { isValid: true, report }
}
