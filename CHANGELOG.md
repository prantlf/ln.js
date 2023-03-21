## [2.0.2](https://github.com/prantlf/ln.js/compare/v2.0.1...v2.0.2) (2023-03-21)


### Bug Fixes

* Use .mjs extension to enforce the module type ([b4cd809](https://github.com/prantlf/ln.js/commit/b4cd80951fd2a30bcb6911cc481a929a396b4077))

## [2.0.1](https://github.com/prantlf/ln.js/compare/v2.0.0...v2.0.1) (2023-03-21)


### Bug Fixes

* Fix the generation of the bin script ([4214d92](https://github.com/prantlf/ln.js/commit/4214d923824876139bd6790ea19ca63718116985))

# [2.0.0](https://github.com/prantlf/ln.js/compare/v1.0.0...v2.0.0) (2023-03-21)


### Bug Fixes

* Rename the bin script to ln-j ([d9cf972](https://github.com/prantlf/ln.js/commit/d9cf972fe4a7210c479d73ada2521826f5a2ecc4))


### BREAKING CHANGES

* The name of the executable changed from "ln.js" to "ln-j". I'm sorry
for that, but Windows mistake the suffix ".js" to a file extension and try execute it.
NPM creates the original file name too, probably to support Cygwin.

## 1.0.0

Initial release.
