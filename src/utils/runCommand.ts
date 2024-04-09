import pc from '@brillout/picocolors'
import { exec } from 'child_process'

export { runCommand }

function runCommand(
  cmd: string,
  { swallowError, timeout = 5000, cwd }: { swallowError?: true; timeout?: number; cwd?: string } = {},
): Promise<string> {
  const { promise, resolvePromise, rejectPromise } = genPromise<string>()

  const t = setTimeout(() => {
    console.error(`Command call \`${cmd}\` timeout [${timeout / 1000} seconds][${cwd}].`)
    process.exit(1)
  }, timeout)

  const options = { cwd }
  exec(cmd, options, (err, stdout, stderr) => {
    clearTimeout(t)
    if (err || stderr) {
      if (swallowError) {
        resolvePromise('SWALLOWED_ERROR')
      } else {
        if (stdout) {
          console.log(stdout)
        }
        if (stderr) {
          console.error(stderr)
        }
        if (err) {
          console.error(err)
        }
        rejectPromise(new Error(`Command \`${pc.bold(cmd)}\` failed [cwd: ${pc.bold(String(cwd))}]`))
      }
    } else {
      resolvePromise(stdout)
    }
  })

  return promise
}

function genPromise<T>() {
  let resolvePromise!: (value: T) => void
  let rejectPromise!: (value?: Error) => void
  const promise: Promise<T> = new Promise((resolve, reject) => {
    resolvePromise = resolve
    rejectPromise = reject
  })
  return { promise, resolvePromise, rejectPromise }
}
