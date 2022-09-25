export { testTypes }

import { runCommand } from './utils'
import { findTypescriptCode, Filter } from './findTypescriptCode'

async function testTypes(filter: null | Filter) {
  const tsProjects = await findTypescriptCode(filter)

  for (const tsProject of tsProjects) {
    await runCommand('npx tsc --noEmit', { cwd: tsProject, timeout: 120 * 1000 })
    console.log(`[TypeScript Checked] ${tsProject}`)
  }
}
