const MS_PER_MINUTE = 60 * 1000

/**
 * Format the time from `then` to `now` as `12m` or `3h05m`.
 */
export const formatElapsed = (now: number, then: number) => {
  const minutes = Math.max(0, Math.round((now - then) / MS_PER_MINUTE))
  if (minutes < 60) {
    return `${minutes}m`
  }

  return `${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, '0')}m`
}
