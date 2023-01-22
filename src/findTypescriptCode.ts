export { findTypescriptCode }

import path from 'path'
import { findFiles, FindFilter } from './utils/findFiles'

type TsCode = {
  tsProjectRootDir: string
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
    tsCode.push({
      tsProjectRootDir,
      tsConfigFilePath,
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
