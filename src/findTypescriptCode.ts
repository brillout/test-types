export { findTypescriptCode }

import path from 'path'
import { findFiles, FindFilter } from './utils/findFiles'

async function findTypescriptCode(filter: null | FindFilter): Promise<string[]> {
  //const typescriptFiles = await findFiles('**/*.ts', filter)
  const tsconfigFiles = await findFiles('**/tsconfig.json', filter)
  const typescriptProjectRoots = tsconfigFiles.map((tsconfigFilePath) => path.dirname(tsconfigFilePath))
  return typescriptProjectRoots
}
