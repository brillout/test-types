// @ts-ignore
import 'source-map-support/register'
import { testTypes } from './testTypes'
import type { Filter } from './findTypescriptCode'

cli()

function cli() {
  const { filter, debug } = parseArgs()
  testTypes(filter)
}

function parseArgs(): { filter: null | Filter; debug: boolean } {
  let debug = false
  const terms: string[] = []
  let exclude = false
  process.argv.slice(2).forEach((arg) => {
    if (arg === '--debug') {
      debug = true
    } else if (arg === '--exclude') {
      exclude = true
    } else {
      terms.push(arg)
    }
  })

  const filter =
    terms.length === 0
      ? null
      : {
          terms,
          exclude
        }
  return {
    filter,
    debug
  }
}
