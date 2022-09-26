export { findTypescriptCode }

import path from 'path'
import { findFiles, FindFilter } from './utils/findFiles'

type TsCode = {
  tsRoot: string
  tsFile?: string
}

async function findTypescriptCode(filter: null | FindFilter): Promise<{ tsRoot: string; tsFile?: string }[]> {
  const tsCode: TsCode[] = []

  // Add all `tsconfig.json` directories
  const tsconfigFiles = await findFiles('**/tsconfig.json', filter)
  const tsRoots = tsconfigFiles.map((tsconfigFile) => {
    const tsRoot = path.dirname(tsconfigFile)
    return tsRoot
  })
  tsRoots.forEach((tsRoot) => tsCode.push({ tsRoot }))

  // Add all `*.ts` files that don't have a `tsconfig.json`
  const tsFiles = await findFiles('**/*.ts', filter)
  const tsFilesWithoutTsConfig = tsFiles.filter((tsFile) => !tsRoots.some((tsRoot) => tsFile.startsWith(tsRoot)))
  tsFilesWithoutTsConfig.forEach((tsFile) => {
    const tsRoot = path.dirname(tsFile)
    tsCode.push({
      tsFile,
      tsRoot
    })
  })

  return tsCode
}
