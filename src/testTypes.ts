export { testTypes }

import { runCommand, FindFilter, logProgress } from './utils'
import { findTypescriptCode } from './findTypescriptCode'
import { isTTY } from './utils/isTTY'
import assert from 'assert'

async function testTypes(filter: null | FindFilter) {
  const typescriptCode = await findTypescriptCode(filter)

  const testPathsFailed: string[] = []
  for (const tsCode of typescriptCode) {
    const { tsProjectRootDir } = tsCode
    const config = loadTestTypescriptConfig(tsProjectRootDir)
    if (config.disable) continue
    const testPath = tsCode.tsConfigFilePath ?? tsCode.tsFilePath
    const cmd =
      config.testCommand ??
      `npx tsc --noEmit --emitDeclarationOnly false --skipLibCheck --esModuleInterop ${tsCode.tsFilePath ?? ''}`.trim()
    const logMsg = `${testPath} (${cmd})`
    const done = logProgress(logMsg)
    let err: Error | undefined
    try {
      await runCommand(cmd, {
        cwd: tsProjectRootDir,
        timeout: 120 * 1000,
      })
    } catch (err_: any) {
      err = err_
      testPathsFailed.push(testPath)
    }
    if (isTTY) {
      done(!!err)
    } else {
      console.log(`${err ? '❌' : '✅'} ${logMsg}`)
    }
    if (err) {
      console.error(err.message)
    }
  }

  if (testPathsFailed.length > 0) {
    throw new Error(
      ['Following TypeScript projects/files failed:', ...testPathsFailed.map((testPath) => ` ❌ ${testPath}`)].join(
        '\n'
      )
    )
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
