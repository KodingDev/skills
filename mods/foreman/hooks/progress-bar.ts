/**
 * Draw `done` of `total` as an ASCII bar, for example `#####.....` for 5 of 10.
 *
 * @param width the bar length in cells, at least 1
 */
export const progressBar = (done: number, total: number, width: number) => {
  const filled = total === 0 ? 0 : Math.round((Math.min(done, total) / total) * width)

  return `${'#'.repeat(filled)}${'.'.repeat(width - filled)}`
}
