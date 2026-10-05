import type { ElementTable } from 'claude-code'

import type { AgentRow, Lane, LaneUsage, Todo } from '../types'

import { formatElapsed } from './elapsed'
import { progressBar } from './progress-bar'

/**
 * The elements a card draws with. Every surface has them.
 */
export type CardElements = Pick<ElementTable, 'Box' | 'Markdown' | 'Text'>

const PROGRESS_WIDTH = 20
const TODO_MARKS = { done: '[x]', active: '>', pending: '-' } as const satisfies Record<Todo['state'], string>

/**
 * Format a count with its noun, singular for one.
 */
export const countOf = (count: number, noun: string, plural = `${noun}s`) => `${count} ${count === 1 ? noun : plural}`

const formatTokens = (count: number) => (count >= 1_000_000 ? `${(count / 1_000_000).toFixed(1)}M` : `${Math.round(count / 1000)}k`)

/**
 * Draw one lane as a bordered card: header, status, progress, summary, open todos, resources, and a
 * usage footer. The border is red while the lane's agent is stalled.
 *
 * @param labelWidth the width that aligns resource labels across every card
 */
export const laneCard = (
  { Box, Markdown, Text }: CardElements,
  lane: Lane,
  worker: AgentRow | undefined,
  used: LaneUsage | undefined,
  labelWidth: number,
  now: number,
) => {
  const doneCount = lane.todos.filter(todo => todo.state === 'done').length
  const openTodos = lane.todos.filter(todo => todo.state !== 'done')
  const resources = [...lane.resources, ...(used?.ports ?? [])]
  const isStalled = worker?.isStalled === true
  const footer = [
    worker === undefined ? '' : `${worker.name} ${isStalled ? 'stalled' : worker.status}, active ${formatElapsed(now, worker.lastSeen)} ago`,
    used === undefined ? '' : `${used.rssGb.toFixed(1)} GB  ${Math.round(used.cpuPercent)}% CPU  ${countOf(used.processCount, 'process', 'processes')}`,
    worker === undefined || worker.tokenCount === 0 ? '' : `${formatTokens(worker.tokenCount)} tokens`,
  ].filter(part => part.length > 0)

  return (
    <Box key={`lane-${lane.lane}`} flexDirection="column" borderStyle="round" borderColor={isStalled ? 'red' : 'gray'} paddingX={1}>
      <Box justifyContent="space-between">
        <Text wrap="truncate-end">
          <Text bold>{lane.lane}</Text>
          <Text dimColor>  {lane.title}</Text>
        </Text>
        {lane.eta !== undefined && <Text color="cyan">{lane.eta}</Text>}
      </Box>
      <Text wrap="truncate-end">
        <Text color={isStalled ? 'red' : 'green'}>{lane.status}</Text>
        <Text dimColor>  for {formatElapsed(now, lane.statusSince)}</Text>
      </Text>
      {lane.todos.length > 0 && (
        <Text>
          <Text color="green">{progressBar(doneCount, lane.todos.length, PROGRESS_WIDTH)}</Text>
          <Text dimColor>
            {'  '}
            {doneCount}/{lane.todos.length} done
          </Text>
        </Text>
      )}
      {lane.summary !== undefined && (
        <Box marginTop={1}>
          <Markdown key={`summary-${lane.lane}`} text={lane.summary} />
        </Box>
      )}
      {openTodos.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          {openTodos.map(todo => (
            <Box justifyContent="space-between">
              <Text dimColor={todo.state === 'pending'} wrap="truncate-end">
                <Text color={todo.state === 'active' ? 'cyan' : undefined}>{TODO_MARKS[todo.state]}</Text> {todo.text}
              </Text>
              {todo.eta !== undefined && <Text dimColor>{todo.eta}</Text>}
            </Box>
          ))}
        </Box>
      )}
      {resources.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          {resources.map(resource => (
            <Text wrap="truncate-end">
              <Text dimColor>{resource.label.padEnd(labelWidth)}  </Text>
              {resource.value}
              {resource.isObserved === true && <Text dimColor>  seen</Text>}
            </Text>
          ))}
        </Box>
      )}
      {footer.length > 0 && (
        <Box marginTop={1}>
          <Text dimColor wrap="truncate-end">
            {footer.join('  |  ')}
          </Text>
        </Box>
      )}
    </Box>
  )
}
