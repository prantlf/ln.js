#!/usr/bin/env node

import { access, link, rm, stat, symlink } from 'fs/promises'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { basename, dirname, join } from 'path'

function getPackage() {
  const __dirname = dirname(fileURLToPath(import.meta.url))
  return JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'))
}

function help() {
  console.log(`${getPackage().description}

Usage: ln.js [-fjLnsv] [--] src... [dest]

Options:
  -c|--cwd <dir>              directory to start looking for the source files
  -D|--dry-run                only print paths of source files or directories
  -f|--force                  remove existing destination files
  -j|--junctions              use junctions on Windows (otherwise ignored)
  -L|--logical                dereference srcs that are symbolic links
  -n|--no-dereference         treat dests as a normal files if it is
                              a symbolic link to a directory
  -P|--physical               make hard links directly to symbolic links
  -s|--symbolic               make symbolic links instead of hard links
  -v|--verbose                print path of each copied file or directory
  -V|--version                print version number
  -h|--help                   print usage instructions

Examples:
  $ ln.js src/prog.js dist/prog.js
  $ ln.js -j jones smith /home/nick/clients`)
}

const { argv } = process
const args = []
let   force = false, dereferenceSrc, dereferenceDest = true, physical,
      verbose, dry, cwd, symbolic, junctions

function fail(message) {
  console.error(message)
  process.exit(1)
}

for (let i = 2, l = argv.length; i < l; ++i) {
  const arg = argv[i]
  const match = /^(-|--)(no-)?([a-zA-Z][-a-zA-Z]*)(?:=(.*))?$/.exec(arg)
  if (match) {
    const parseArg = (arg, flag) => {
      switch (arg) {
        case 'c': case 'cwd':
          cwd = match[4] || argv[++i]
          return
        case 'D': case 'dry-run':
          dry = flag
          return
        case 'f': case 'force':
          force = flag
          return
        case 'j': case 'junctions':
          junctions = flag
          return
        case 'L': case 'logical':
          dereferenceSrc = flag
          return
        case 'n':
          dereferenceDest = !flag
          return
        case 'dereference':
          dereferenceDest = flag
          return
        case 'P': case 'physical':
          physical = flag
          return
        case 's': case 'symbolic':
          symbolic = flag
          return
        case 'v': case 'verbose':
          verbose = flag
          return
        case 'V': case 'version':
          console.log(getPackage().version)
          process.exit(0)
          break
        case 'h': case 'help':
          help()
          process.exit(0)
      }
      fail(`unknown option: "${arg}"`)
    }
    if (match[1] === '-') {
      const flags = match[3].split('')
      for (const flag of flags) parseArg(flag, true)
    } else {
      parseArg(match[3], match[2] !== 'no-')
    }
    continue
  }
  if (arg === '--') {
    args.push(...argv.slice(i + 1, l))
    break
  }
  args.push(arg)
}

if (args.length < 1) {
  help()
  process.exit(1)
}
if (args.length === 1) args.push('.')

let arg
const formatMessage = ({ code, message }) => {
  /* c8 ignore next 2 */
  if (code === 'EISDIR' || code === 'ERR_FS_EISDIR') {
    message = `EISDIR: "${arg}" is a directory`
  } else if (code === 'EEXIST' || code === 'ERR_FS_CP_EEXIST') {
    message = `EEXIST: "${arg}" already exists`
  /* c8 ignore next 5 */
  } else if (code === 'EINVAL' || code === 'ERR_FS_CP_EINVAL') {
    message = `EINVAL: "${arg}" is invalid`
  } else if (code === 'ENOENT') {
    message = `ENOENT: "${arg}" does not exist`
  }
  return message
}

try {
  const paths = []
  const patterns = args
    .slice(0, args.length - 1)
    .filter(src => {
      if (src.includes('*') || src.includes('?')) return true
      paths.push(src)
    })
  if (patterns.length) {
    const glob = (await import('fast-glob')).default
    if (verbose) console.log(patterns.join('\n'))
    paths.push(...await glob(patterns, {
      cwd, extglob: true, dot: true, onlyFiles: false,
      followSymbolicLinks: !!dereferenceSrc
    }))
  }

  const dest = args[args.length - 1]
  if (paths.length > 2 && !(await stat(dest)).isDirectory()) {
    throw new Error('link name (dest) has to be a directory')
  }
  let destDir
  try {
    destDir = (await stat(dest)).isDirectory()
  } catch (err) {
    /* c8 ignore next */
    if (err.code !== 'ENOENT') throw err
  }

  const linkOne = async (srcPath, destPath) => {
    try {
      await access(destPath)
      if (!force) throw new Error(`EEXIST: "${destPath}" already exists`)
      await rm(destPath)
    } catch (err) {
      if (err.code !== 'ENOENT') throw err
    }
    arg = srcPath
    if (symbolic) {
      const type = junctions ? 'junction' : undefined
      await symlink(srcPath, destPath, type)
    } else {
      await link(srcPath, destPath)
    }
  }

  for (const path of paths) {
    if (verbose) console.log(path)
    if (dry) continue
    const srcReal = dereferenceSrc ? await realpath(path) : path
    const destPath = destDir && dereferenceDest && !physical ?
      join(dest, basename(path)) : dest
    await linkOne(srcReal, destPath)
  }
} catch(err) {
  console.error(formatMessage(err))
  process.exitCode = 1
}
