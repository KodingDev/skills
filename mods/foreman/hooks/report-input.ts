import type { Lane, Stage } from '../types'

import { isProgramName } from './program-view'

/**
 * The stages in loop order. The report tool's schema and its parser share this list.
 */
export const STAGES = ['pick', 'branch', 'brief', 'execute', 'self-review', 'pr', 'feedback', 'merge', 'blocked'] as const satisfies readonly Stage[]

/**
 * A report as foreman sends it: lanes without their stage start time.
 */
export type Report = {
  program: string
  lanes: Omit<Lane, 'stageSince'>[]
  needs: string[]
  eta?: string
}

/**
 * The result of reading a report call's arguments.
 */
export type ReportParse = { isValid: true; report: Report } | { isValid: false; reason: string }

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

const isStage = (value: unknown): value is Stage => STAGES.some(stage => stage === value)

const optionalText = (value: unknown) => (typeof value === 'string' && value.length > 0 ? value : undefined)

const readLane = (value: unknown) => {
  if (!isRecord(value)) {
    return null
  }

  const { lane, ticket, title, stage } = value
  const hasRequired = typeof lane === 'string' && typeof ticket === 'string' && typeof title === 'string'
  if (!hasRequired || !isStage(stage)) {
    return null
  }

  const read: Omit<Lane, 'stageSince'> = {
    lane,
    ticket,
    title,
    stage,
    agent: optionalText(value.agent),
    branch: optionalText(value.branch),
    worktree: optionalText(value.worktree),
    pr: optionalText(value.pr),
    eta: optionalText(value.eta),
    note: optionalText(value.note),
  }

  return read
}

/**
 * Read the arguments of a `report` call. Returns the reason when a field is missing or wrong.
 */
export const parseReport = (input: Record<string, unknown>): ReportParse => {
  const { program, lanes, needs, eta } = input

  if (typeof program !== 'string' || !isProgramName(program)) {
    return { isValid: false, reason: 'program must be one lower-case path segment, for example "niagara-consolidation".' }
  }
  if (!Array.isArray(lanes)) {
    return { isValid: false, reason: 'lanes must be an array. Send an empty array when no lane is open.' }
  }

  const read = lanes.map(readLane)
  const badIndex = read.findIndex(lane => lane === null)
  if (badIndex >= 0) {
    return { isValid: false, reason: `lanes[${badIndex}] needs lane, ticket, title, and a stage from: ${STAGES.join(', ')}.` }
  }

  const report: Report = {
    program,
    lanes: read.filter(lane => lane !== null),
    needs: Array.isArray(needs) ? needs.filter(need => typeof need === 'string') : [],
    eta: optionalText(eta),
  }

  return { isValid: true, report }
}
