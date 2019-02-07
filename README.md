# loader

**NB: this is a _mega_ work-in-progress.**

goal:

- learn stuff
- be able to use node_modules/naked imports normally in the source code
- have dependencies included automagically, with as little-to-minimal configuration as possible (for educational/simplicity sake)
-
## getting started

* the `mrs-tiny-server` referenced is the home-grown dev-server, which currently resides [here](https://github.com/aleph-naught2tog/tiny-server). (Also a WIP and currently locally included via the filesystem, etc.)

## todo

- [ ] better tests
- [ ] actually 'linking' the dependencies

## sketch

1. get dependency information
   1. read package.json
   2. get dependency list
      1. make a Set and remove duplicates while adding recursively
2. get dependencies somewhere
   1. copy every one of the `dependencies` to some known location
3. move source files to build folder
4. rewrite source file imports IN THE BUILD folder

### notes

* these are both sloooooooow ... and I believe equivalent to what I'm doing?
  * `npm ls --prod --json`: json tree of dependencies in prod env
  * `npm ls --prod --parseable`: deduped set of dependencies as paths to their folders
