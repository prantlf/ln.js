#!/usr/bin/env node

import { access, link, realpath, rm, stat, symlink } from 'fs/promises'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { basename, dirname, join } from 'path'

function getPackage() {
  const __dirname = dirname(fileURLToPath(import.meta.url))
  return JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'))
}

function help() {
  console.log(`${getPackage().description}

Usage: ln-j [-fjLnsv] [--] src... [dest]

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
  $ ln-j src/prog.js dist/prog.js
  $ ln-j -j jones smith /home/nick/clients`)
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
        /* c8 ignore next 3 */
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

try {
  const dest = args[args.length - 1]
  if (args.length > 2 && !(await stat(dest)).isDirectory()) {
    throw new Error('link name (dest) has to be a directory')
  }
  let destDir
  try {
    destDir = (await stat(dest)).isDirectory()
  } catch (err) {
    /* c8 ignore next */
    if (err.code !== 'ENOENT') throw err
  }

  const paths = []
  const files = []
  const patterns = args
    .slice(0, args.length - 1)
    .filter(src => {
      if (src.includes('*') || src.includes('?')) return true
      files.push(src)
    })
  if (patterns.length) {
    const glob = (await import('fast-glob')).default
    if (verbose) console.log(patterns.join('\n'))
    paths.push(...await glob(patterns, {
      cwd, extglob: true, dot: true, onlyFiles: false,
      followSymbolicLinks: !!dereferenceSrc
    }))
  }

  const linkOne = async (srcPath, destPath) => {
    try {
      await access(destPath)
      if (!force) throw new Error(`EEXIST: "${destPath}" already exists`)
      await rm(destPath)
    } catch (err) {
      if (err.code !== 'ENOENT') throw err
    }
    if (symbolic) {
      const type = junctions ? 'junction' : undefined
      await symlink(srcPath, destPath, type)
    } else {
      await link(srcPath, destPath)
    }
  }

  const linkAll = async (paths, keepPath) => {
    for (const path of paths) {
      if (verbose) console.log(path)
      if (dry) continue
      const srcPath = cwd ? join(cwd, path) : path
      const srcReal = dereferenceSrc ? await realpath(srcPath) : srcPath
      const destPath = keepPath ? join(dest, path) :
        destDir && dereferenceDest && !physical ?
        join(dest, basename(path)) : dest
      await linkOne(srcReal, destPath)
    }
  }

  await linkAll(files, false)
  await linkAll(paths, true)
} catch({ message }) {
  console.error(message)
  process.exitCode = 1
}
