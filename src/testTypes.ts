export { testTypes }

import { runCommand, FindFilter, logProgress } from './utils'
import { findTypescriptCode } from './findTypescriptCode'
import { isTTY } from './utils/isTTY'

async function testTypes(filter: null | FindFilter) {
  const typescriptCode = await findTypescriptCode(filter)

  for (const tsCode of typescriptCode) {
    const { tsProjectRootDir } = tsCode
    const logMsg = `[TypeScript Check] ${tsCode.tsConfigFilePath ?? tsCode.tsFilePath}`
    const done = logProgress(logMsg)
    await runCommand(`npx tsc --noEmit --skipLibCheck --esModuleInterop ${tsCode.tsFilePath ?? ''}`, {
      cwd: tsProjectRootDir,
      timeout: 120 * 1000,
    })
    done()
    if (!isTTY) {
      console.log(logMsg)
    }
  }
}
