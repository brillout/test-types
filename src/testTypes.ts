export { testTypes }

import { runCommand, FindFilter, logProgress } from './utils'
import { findTypescriptCode } from './findTypescriptCode'
import { isTTY } from './utils/isTTY'
import assert from 'assert'

async function testTypes(filter: null | FindFilter) {
  const typescriptCode = await findTypescriptCode(filter)

  for (const tsCode of typescriptCode) {
    const { tsProjectRootDir } = tsCode
    const config = loadTestTypescriptConfig(tsProjectRootDir)
    if (config.disable) continue
    const cmd =
      config.testCommand ?? `npx tsc --noEmit --skipLibCheck --esModuleInterop ${tsCode.tsFilePath ?? ''}`.trim()
    const logMsg = `[TypeScript Check] ${tsCode.tsConfigFilePath ?? tsCode.tsFilePath} (${cmd})`
    const done = logProgress(logMsg)
    await runCommand(cmd, {
      cwd: tsProjectRootDir,
      timeout: 120 * 1000,
    })
    done()
    if (!isTTY) {
      console.log(logMsg)
    }
  }
}

function loadTestTypescriptConfig(tsProjectRootDir: string): { testCommand?: string; disable?: boolean } {
  let config: Record<string, unknown>
  try {
    config = require(`${tsProjectRootDir}/.testTypes.json`)
  } catch (err) {
    if ((err as any).code === 'MODULE_NOT_FOUND') {
      return {}
    }
    throw err
  }
  assert(Object.keys(config).length === 1)
  const { testCommand, disable } = config
  assert(testCommand === undefined || typeof testCommand === 'string')
  assert(disable === undefined || typeof disable === 'boolean')
  return { testCommand, disable }
}
