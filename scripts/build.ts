import path from 'path'
import assert from 'assert'
import fs from 'fs'
import {execSync as exec} from 'child_process'
import consola from 'consola'
import {version} from '../package.json'

const rootDir = path.resolve(__dirname, '..')
const DistDir = path.resolve(__dirname, '../dist')

const FILES_COPY_LOCAL = [
  'README.md',
  'package.json',
]

assert(process.cwd() !== __dirname)

async function build() {
  consola.info('Start build')
  exec(`rimraf dist && tsup src/index.ts --dts --format cjs,esm`, {stdio: 'inherit'})

  consola.info('Start copy files')
  FILES_COPY_LOCAL.forEach(file => {
    fs.writeFileSync(path.resolve(DistDir, file),fs.readFileSync( path.resolve(rootDir, file)))
  })
}

async function cli() {
  try {
    await build()
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

export {
  build,
}

if (require.main === module)
  cli()
