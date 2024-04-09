export { assert }
export { assertUsage }

function assert(condition: unknown): asserts condition {
  if (condition) return
  throw new Error('Assertion failed.')
}
function assertUsage(condition: unknown, msg: string): asserts condition {
  if (condition) return
  throw new Error(`[Wrong Usage] ${msg}`)
}
