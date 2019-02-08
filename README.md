# loader

**NB: this is a _mega_ work-in-progress.**

## todo

- [ ] better tests
  - [ ] set up some fixtures etc
- [ ] actually 'linking' the dependencies
- [ ] config file (prefer real JS to json)
- [ ] get typescript to dead tree shake I guess

## about

goal:

- learn stuff
- be able to use node_modules/naked imports normally in the source code
- have dependencies included automagically, with as little-to-minimal configuration as possible (for educational/simplicity sake)
-
### getting started

* the `mrs-tiny-server` referenced is the home-grown dev-server, which currently resides [here](https://github.com/aleph-naught2tog/tiny-server). (Also a WIP and currently locally included via the filesystem, etc.)

### sketch

1. get dependency information
   1. read package.json
   2. get dependency list
      1. make a Set and remove duplicates while adding recursively
2. get dependencies somewhere
   1. copy every one of the `dependencies` to some known location
3. move source files to build folder
4. rewrite source file imports IN THE BUILD folder

## notes

* these are both sloooooooow ... and I believe equivalent to what I'm doing?
  * `npm ls --prod --json`: json tree of dependencies in prod env
  * `npm ls --prod --parseable`: deduped set of dependencies as paths to their folders

## package-lock

* a `requires` is a `"module-name": "0.1.2"` (some semver) pair
* a `dependencies` is a whole nother tree, which may itself have `requires`, etc etc
* kinds of `requires`/`dependencies` relationships:
  * 0 `requires`,   0 `dependencies`
    * => no dependencies
  * 0 `requires`,   1+ `dependencies`
    * => ??? what the heck? this *DOES* happen
  * 1+ `requires`,  0 `dependencies`
    * => `dependencies` are already somewhere above us in the tree with the version that we want
  * 1+ `requires`,  1+ `dependencies`
    * => `requires` that are not also in the dependencies of this object
      * => these `requires` are listd somewhere higher in the tree w/ right version
    * => `dependencies`
      * => these are a version that DIFFERS from what is needed above -- so we
        are including it here as a dependency because it is more specific and
        local to this dependency tree
      * e.g., the top module needs `fast-parser v12.0.1` but *this* module
        requires `fast-parser v2.0.4` -- 12.0.1 should exist elsewhere up higher
        probs at the top level, but since we need a DIFFERENT version, it becomes
        a dependency of *this* subtree
* top level module = the actual project
* instead of semvers, say we map "recipe-name": "recipe-version"
* and for kicks a fake key of, idk, people invited
* `dependencies`:
  * eg:
      ```json
      // ...
      {
        "name": "holidays",
        "requires": true,
        "dependencies": {
          "kids-table": {
            // ... version, integrity, resolved
            "requires": {
              "pumpkin-pie": "moms-recipe",
              "potatoes": "baked",
              "party-hats": "festive"
            }
            /*
              The lack of kids-table.dependencies means that each of these
              required packages exists in the level above us (e.g.,
              top-module.dependencies)
            */
          },
          "big-kids-table": {
            "dependencies": {
              "potatoes": {
                // 'potatoes' is a dependency here because what we need
                //    is THIS kind of potato -- which does NOT match the top level
                "version": "mashed"
              }
            }
          },
          "party-hats": {
            "version": "festive"
          },
          "pumpkin-pie": {
            "version": "brothers-recipe"
          },
          "potatoes": {
            "version": "baked"
            // ... integrity, resolved
          }
        }
      }
      ```
  * from above -- `thanksgiving-dinner` is the dependency name
  * `version`
  * `integrity`
  * `resolved`
  * `optional` -> should still be included apparently
  * `requires`:
    * "hey, I require these things to function"
    * mapping of `"module-name": "0.0.0semver`
    * version should match either in our `dependencies` (this object), or in one *higher*
