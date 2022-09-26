// @ts-ignore
import 'source-map-support/register'
import { testTypes } from './testTypes'
import { findFilesParseCliArgs } from './utils'

initPromiseRejectionHandler()
cli()

function cli() {
  const { filter } = findFilesParseCliArgs()
  testTypes(filter)
}

function initPromiseRejectionHandler() {
  process.on('unhandledRejection', function (err) {
    console.error(err)
    process.exit(1)
  })
}
