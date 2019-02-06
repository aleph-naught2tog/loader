# loader

goal:
* be able to use node_modules/naked imports normally in code
* have those automagically be where i need them when we load up

need to be able to bootstrap...

## attempt 1

## sketch

1. get dependency information
   1. read package.json
   2. get dependency list
      1. make a Set and remove duplicates while adding recursively
2. get dependencies somewhere
   1. copy every one of the `dependencies` to some known location
4. move source files to build folder
3. rewrite source file imports IN THE BUILD folder

