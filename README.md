# ln.js

[![Latest version](https://img.shields.io/npm/v/@unixcompat/ln.js)
 ![Dependency status](https://img.shields.io/librariesio/release/npm/@unixcompat/ln.js)
](https://www.npmjs.com/package/@unixcompat/ln.js)
[![Coverage](https://codecov.io/gh/prantlf/ln.js/branch/master/graph/badge.svg)](https://codecov.io/gh/prantlf/ln.js)

Makes hard or symbolic links (symlinks) between files or directories like the `ln` command.

There are multi-platform file-system commands compatible with `ln` from UN*X implemented for Node.js in JavaScript, like [symlink-dir] or [ln-cli], but they have different interface and different behaviour than the `ln` command. Instead of reusing the knowledge of the `ln` command, you would have to learn their new interface. This project aims to provide the well-known interface of the `ln` command.

This package offers only command-line interface, because programmatic interface is provided by [`link`] and [`symlink`] from [node:fs]. See also other commands compatible with their counterparts from UN*X - [cat.js], [cp.js], [mkdir.js] and [rm.js].

## Synopsis

The following scripts from `package.json` won't work on Windows:

    rm -rf dist
    mkdir -p dist
    cat src/umd-prolog.txt src/code.js src/umd-epilog.txt > dist/index.umd.js
    cp src/index.d.ts dist
    ln -s ../src src

Replace them with the following ones, which run on any operating system which is supported by Node.js:

    rm.js -rf dist
    mkdir.js -p dist
    cat.js src/umd-prolog.txt src/code.js src/umd-epilog.txt > dist/index.umd.js
    ln.js src/index.d.ts dist
    ln.js -s ../src src

Notice that the only difference is the suffix `.js` behind the command names.

## Installation

This module can be installed in your project using [NPM], [PNPM] or [Yarn]. Make sure, that you use [Node.js] version 16.15 or newer.

```sh
$ npm i -D @unixcompat/ln.js
$ pnpm i -D @unixcompat/ln.js
$ yarn add -D @unixcompat/ln.js
```

## Command-line Interface

See also `man ln` for the original [POSIX documentation] or for the extended [Linux implementation].

    Usage: ln.js [-fjLnsv] [--] src... dest

    Options:
      -c|--cwd <dir>              directory to start looking for the source files
      -D|--dry-run                only print paths of source files or directories
      -f|--force                  remove existing destination files
      -j|--junctions              use junctions on Windows (otherwise ignored)
      -L|--logical                dereference srcs that are symbolic links
      -n|--no-dereference         treat dests as a normal files if it is
                                    a symbolic link to a directory
      -P|--physical              make hard links directly to symbolic links
      -s|--symbolic               make symbolic links instead of hard links
      -v|--verbose                print path of each copied file or directory
      -V|--version                print version number
      -h|--help                   print usage instructions

    Examples:
      $ ln.js src/prog.js dist/prog.js
      $ ln.js -j jones smith /home/nick/clients

## Differences

The following options are specific to this command:

    -D|--dry-run    only print path of each file or directory
    -c|--cwd <dir>  directory to start looking for the source files
    -j|--junctions  use junctions on Windows (otherwise ignored)

Also, the arguments may be [BASH patterns]. The pattern matching will ignore symbolic links. The argument `-c|--cwd` will be used only as a base directory to expand the BASH patterns in.

The following options from the Linux version are not supported:

    --backup[=CONTROL]
           make a backup of each existing destination file
    -b     like --backup but does not accept an argument
    -d, -F, --directory
           allow the superuser to attempt to hard link directories
           (note: will probably fail due to system restrictions, even
           for the superuser)
    -i, --interactive
           prompt whether to remove destinations
    -P, --physical
           make hard links directly to symbolic links

    -r, --relative
           with -s, create links relative to link location

    -s, --symbolic
           make symbolic links instead of hard links

    -S, --suffix=SUFFIX
           override the usual backup suffix

    -t, --target-directory=DIRECTORY
           specify the DIRECTORY in which to create the links

    -T, --no-target-directory
           treat LINK_NAME as a normal file always

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.  Add unit tests for any new or changed functionality. Lint and test your code using `npm test`.

## License

Copyright (c) 2023 Ferdinand Prantl

Licensed under the MIT license.

[Node.js]: http://nodejs.org/
[NPM]: https://www.npmjs.com/
[PNPM]: https://pnpm.io/
[Yarn]: https://yarnpkg.com/
[symlink-dir]: https://www.npmjs.com/package/symlink-dir
[ln-cli]: https://www.npmjs.com/package/ln-cli
[mkdir.js]: https://www.npmjs.com/package/@unixcompat/mkdir.js
[rm.js]: https://www.npmjs.com/package/@unixcompat/rm.js
[cat.js]: https://www.npmjs.com/package/@unixcompat/cat.js
[cp.js]: https://www.npmjs.com/package/@unixcompat/cp.js
[POSIX documentation]: https://man7.org/linux/man-pages/man1/ln.1p.html
[Linux implementation]: https://man7.org/linux/man-pages/man1/ln.1.html
[`link`]: https://nodejs.org/api/fs.html#fslinkexistingpath-newpath-callback
[`symlink`]: https://nodejs.org/api/fs.html#fssymlinktarget-path-type-callback
[node:fs]: https://nodejs.org/api/fs.html
[BASH patterns]: https://www.linuxjournal.com/content/pattern-matching-bash
