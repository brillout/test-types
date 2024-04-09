export { findTypescriptCode }

import path from 'path'
import fs from 'fs'
import { findFiles, FindFilter, assert, isObject, hasProp, assertUsage } from './utils'
import pc from '@brillout/picocolors'

type TsCode = {
  tsProjectRootDir: string
  isVueProject: boolean
} & (
  | {
      tsConfigFilePath: string
      tsFilePath: null
    }
  | {
      tsConfigFilePath: null
      tsFilePath: string
    }
)

async function findTypescriptCode(filter: null | FindFilter): Promise<TsCode[]> {
  const tsCode: TsCode[] = []

  // Add all `tsconfig.json` directories
  const tsConfigFiles = await findFiles('**/tsconfig.json', filter)
  const tsRoots = tsConfigFiles.map((tsConfigFilePath) => {
    const tsProjectRootDir = path.dirname(tsConfigFilePath)
    const isVueProject = getIsVueProject(tsProjectRootDir)
    tsCode.push({
      tsProjectRootDir,
      tsConfigFilePath,
      isVueProject,
      tsFilePath: null,
    })
    return tsProjectRootDir
  })

  /* Turns out to be more annoying than helpful
  // Add all `*.ts` files that don't have a `tsconfig.json`
  const tsFiles = await findFiles(['**', '*.ts'].join('/'), filter)
  const tsFilesWithoutTsConfig = tsFiles.filter(
    (tsFilePath) => !tsRoots.some((tsProjectRootDir) => tsFilePath.startsWith(tsProjectRootDir))
  )
  tsFilesWithoutTsConfig.forEach((tsFilePath) => {
    const tsProjectRootDir = path.dirname(tsFilePath)
    tsCode.push({
      tsProjectRootDir,
      tsConfigFilePath: null,
      tsFilePath,
    })
  })
  //*/

  return tsCode
}

function getIsVueProject(tsProjectRootDir: string): boolean {
  const packageJsonFilePath = require.resolve(path.join(tsProjectRootDir, './package.json'))
  const packageJson: unknown = JSON.parse(String(fs.readFileSync(packageJsonFilePath)))
  assert(isObject(packageJson))

  assert(hasProp(packageJson, 'dependencies', 'string{}') || hasProp(packageJson, 'dependencies', 'undefined'))
  assert(hasProp(packageJson, 'devDependencies', 'string{}') || hasProp(packageJson, 'devDependencies', 'undefined'))
  const deps = [...Object.keys(packageJson.dependencies || {}), ...Object.keys(packageJson.devDependencies || {})]

  const depMissing = (dep: 'typescript' | 'vue' | 'vue-tsc') =>
    `${packageJsonFilePath} doesn't declare the ${pc.cyan(dep)} dependency. Make sure to add the ${pc.cyan(
      dep,
    )} dependency to ${pc.cyan('package.json#dependencies')} or ${pc.cyan('packageJson.devDependencies')}.`
  assertUsage(deps.includes('typescript'), depMissing('typescript'))

  const isVueProject = deps.includes('vue') || deps.includes('vue-tsc')
  if (isVueProject) {
    assertUsage(deps.includes('vue'), depMissing('vue'))
    assertUsage(deps.includes('vue-tsc'), depMissing('vue-tsc'))
  }

  return isVueProject
}
