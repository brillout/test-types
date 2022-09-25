export { findTypescriptCode }
export type { Filter }

import glob from 'fast-glob'
import path from 'path'

type Filter = {
  terms: string[]
  exclude: boolean
}

async function findTypescriptCode(filter: null | Filter): Promise<string[]> {
  //const typescriptFiles = await find('**/*.ts', filter)
  const tsconfigFiles = await find('**/tsconfig.json', filter)
  const typescriptProjectRoots = tsconfigFiles.map((tsconfigFilePath) => path.dirname(tsconfigFilePath))
  return typescriptProjectRoots
}

async function find(pattern: string, filter: null | Filter) {
  const cwd = process.cwd()
  const files = (await glob([pattern], { ignore: ['**/node_modules/**', '**/.git/**'], cwd, dot: true }))
    .filter((filePathRelative) => applyFilter(filePathRelative, filter))
    .map((filePathRelative) => path.join(cwd, filePathRelative))
  return files
}

function applyFilter(filePathRelative: string, filter: null | Filter) {
  if (!filter) {
    return true
  }
  const { terms, exclude } = filter
  for (const term of terms) {
    if (!filePathRelative.includes(term) && !exclude) {
      return false
    }
    if (filePathRelative.includes(term) && exclude) {
      return false
    }
  }
  return true
}
