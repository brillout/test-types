export { testTypes }

import { runCommand, FindFilter, logProgress } from './utils'
import { findTypescriptCode } from './findTypescriptCode'
import { isTTY } from './utils/isTTY'
import assert from 'assert'

async function testTypes(filter: null | FindFilter) {
  const typescriptCode = await findTypescriptCode(filter)

  const testPathsFailed: string[] = []
  for (const tsCode of typescriptCode) {
    const { tsProjectRootDir, isVueProject, tsFilePath } = tsCode
    const config = loadTestTypescriptConfig(tsProjectRootDir)
    if (config.disable) continue
    const testPath = tsCode.tsConfigFilePath ?? tsCode.tsFilePath
    const cmd = config.testCommand ?? getCmd(isVueProject, tsFilePath)
    const logMsg = `${testPath} (${cmd})`
    const done = logProgress(logMsg)
    let err: Error | undefined
    try {
      await runTypescriptCheck(cmd, tsProjectRootDir)
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

    // Ensure vue-tsc is more strict than tsc
    if (!err && isVueProject && !config.testCommand) {
      const cmd = getCmd(false, tsFilePath)
      try {
        await runTypescriptCheck(cmd, tsProjectRootDir)
      } catch (err) {
        console.error(err)
        assert(false)
      }
    }
  }

  if (testPathsFailed.length > 0) {
    throw new Error(
      ['Following TypeScript check failed:', ...testPathsFailed.map((testPath) => ` ❌ ${testPath}`)].join('\n'),
    )
  }
}

async function runTypescriptCheck(cmd: string, tsProjectRootDir: string) {
  await runCommand(cmd, {
    cwd: tsProjectRootDir,
    timeout: 120 * 1000,
  })
}

function getCmd(useVueTsc: boolean, tsFilePath?: string | null) {
  return `npx ${useVueTsc ? 'vue-tsc' : 'tsc'} --noEmit --emitDeclarationOnly false --skipLibCheck --esModuleInterop ${tsFilePath ?? ''}`.trim()
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
