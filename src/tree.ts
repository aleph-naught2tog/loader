interface Json {
  [key: string]: string | number | boolean | Json | Array<Json>;
}

interface TreeJson {
  [key: string]: string | number | boolean | TreeJson;
}

/*
  ❗️❗️❗️Fair warning: ❗️❗️❗️

  This is a *very* destructive means of processing an object, as in, "we slowly
  permanently dereference things off it via `delete` and then add it to a stack
  which we then keep popping while passing the original object around as a
  trace"

  * 'reject' is an object, because it's faster to search for a specific value by
  checking keys than to search an array in the worst case

  * The label on the while loop helps us control the iteration more completely;
  it's only really necessary on the nested `for` loop where we want to jump
  all-the-way-out, but using the label consistently makes it more clear what's
  happening.
*/

export type optionType = {
  emitUpOneAndSkip?: { [key: string]: boolean };
  reject?: { [key: string]: boolean };
  descendAndSkipKeyEmit?: { [key: string]: boolean };
  fail?: ((item: any) => any)[];
};

export function unrollDepthFirst(dict: TreeJson, options: optionType = {}) {
  const {
    reject = {},
    fail = [],
    emitUpOneAndSkip = {},
    descendAndSkipKeyEmit = {}
  } = options;
  let counter = 0;
  const resultStack: string[] = [];
  const stack: TreeJson[] = [dict];

  outermost_while_loop: while (stack.length) {
    counter += 1;

    /*
      We can do the not null assertion, because `while (stack.length)` will only
      be true if stack.length is not 0; that is, there has to be SOMETHING
      inside it.

      We know what's inside isn't null or undefined, because either:
        1. We just started, in which case the object is what we just put in
           above in the declaration
        2. The object is the `firstChild` from our last iteration -- which we
           assert exists before we add it to the stack
    */
    const currentTree = stack.pop()!;

    for (const shouldFail of fail) {
      if (shouldFail(currentTree)) {
        // using a label here allows us to jump to the next iteration of our
        //    outermost (while) loop; otherwise, we would keep checking failure
        //    conditions or if we `break`, we would end up still adding the
        //    failing tree
        continue outermost_while_loop;
      }
    }

    const treeKeys = Object.keys(currentTree);

    if (treeKeys.length === 0) {
      continue outermost_while_loop;
    }

    const firstKey = treeKeys[0];

    let shouldEmitKey = true;
    if (firstKey in emitUpOneAndSkip) {
      /*
        Remember we're unshifting keys (adding them at 0) -- so the key at 0 is
        what we last saw -- which means it was the previous left child key, and
        since we are descending depth-first we know we are a child of it --
        e.g., currentTree is the child that was the firstChild last iteration
        through
      */

      // do NOT add the key *itself* to the stack
      shouldEmitKey = false;
      // get the VALUE at that key
      const currentValue = currentTree[firstKey];
      resultStack[0] += `=${currentValue}`;
    }

    // TODO: this and the reject branch look identical but aren't, because we are using the 'reject' keys later to delete off the tree before processing it further. That's totally unclear from here.
    if (firstKey in descendAndSkipKeyEmit) {
      // e.g., walk the dependency object but don't add 'dependencies'
      shouldEmitKey = false;
    }

    if (firstKey in reject) {
      // We need to still process things
      //    but no need to add this key.
      shouldEmitKey = false;
    }

    if (shouldEmitKey) {
      resultStack.unshift(firstKey);
    }

    // Since the tree is an object, however, we can't just pop things off and
    //    mutate it in place. As a result, we need to truly *delete* that key
    //    from the object (or start carrying around the key array as its own
    //    thing, etc, which means more tracking/timing of things)

    // As the name implies, the `delete` operator destroys that reference on the
    //    object, which means that since we *want* the child under that key --
    //    we need to store it into a variable before doing so or we'll lose
    //    anything there.
    const firstChild = currentTree[firstKey];

    // Here, we delete that reference; if we look at the object now, there will
    //    be *no* firstChildKey to be found, and thus certainly nothing stored
    //    under that key on the object.
    delete currentTree[firstKey];

    /*
      If we had more than one key, there is more object to process still
    */
    if (treeKeys.length > 1) {
      /*
        Remove unnecessary branches by removing the references under the keys we
        want to ignore off the whole currentTree -- which means they will never
        be processed, as they won't be present when added to the stack
      */
      for (const key in reject) {
        delete currentTree[key];
      }

      // We add it to the stack *before* the firstChild;
      //    as a result, the firstChild will be on top of the stack, and thus
      //    the next thing processed -- hence the "depth-first" nature
      stack[stack.length] = currentTree;
    }

    if (firstChild) {
      // don't want to add null -- and typeof null === 'object'
      if (typeof firstChild === 'object') {
        for (const key in reject) {
          delete firstChild[key];
        }

        stack[stack.length] = firstChild;
      }
    } else {
      throw new Error('No left child -- this should never happen.');
    }
  }

  // console.log(counter);
  return resultStack;
}
