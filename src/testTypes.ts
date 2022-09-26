export { testTypes }

import { runCommand, FindFilter } from './utils'
import { findTypescriptCode } from './findTypescriptCode'

async function testTypes(filter: null | FindFilter) {
  const tsCode = await findTypescriptCode(filter)

  for (const tsProject of tsCode) {
    const { tsRoot, tsFile } = tsProject
    await runCommand(`npx tsc --noEmit ${tsFile ?? ''}`, { cwd: tsRoot, timeout: 120 * 1000 })
    console.log(`[TypeScript Checked] ${tsProject}`)
  }
}
