export { findTypescriptCode }

import path from 'path'
import { findFiles, FindFilter } from './utils/findFiles'

type TsCode = {
  tsRoot: string
} & (
  | {
      tsConfig: string
      tsFile: null
    }
  | {
      tsConfig: null
      tsFile: string
    }
)

async function findTypescriptCode(filter: null | FindFilter): Promise<TsCode[]> {
  const tsCode: TsCode[] = []

  // Add all `tsconfig.json` directories
  const tsConfigFiles = await findFiles('**/tsconfig.json', filter)
  const tsRoots = tsConfigFiles.map((tsConfig) => {
    const tsRoot = path.dirname(tsConfig)
    tsCode.push({
      tsRoot,
      tsConfig,
      tsFile: null
    })
    return tsRoot
  })

  // Add all `*.ts` files that don't have a `tsconfig.json`
  const tsFiles = await findFiles('**/*.ts', filter)
  const tsFilesWithoutTsConfig = tsFiles.filter((tsFile) => !tsRoots.some((tsRoot) => tsFile.startsWith(tsRoot)))
  tsFilesWithoutTsConfig.forEach((tsFile) => {
    const tsRoot = path.dirname(tsFile)
    tsCode.push({
      tsRoot,
      tsConfig: null,
      tsFile
    })
  })

  return tsCode
}
