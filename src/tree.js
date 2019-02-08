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

  TODO: this should deduplicate as we go? (I have an Idea about how to do so
  rapidly and while preserving order I am just not confident yet...)

  TODO: we are currently adding 'requires' and 'dependencies' a million times
  which we can certainly filter out at the end but ehhhhh?
*/
exports.unrollDepthFirst = unrollDepthFirst;
function unrollDepthFirst(dict, options = {}) {
  // console.log('------');
  let counter = 0;
  const {
    reject = {},
    fail = [],
    capture = {},
    emitUpOneAndSkip = {},
    descendAndSkipKeyEmit = {}
  } = options;

  const resultStack = [];

  // Initialize our stack by adding the object itself
  const stack = [dict];

  outermost_while_loop: while (stack.length) {
    counter += 1;

    // 0 is falsy -- meaning, if we have gotten in here, there is at LEAST on
    //    object on the stack; as a result, we can safely pop and know that we
    //    receive *something*
    const currentTree = stack.pop();

    if (typeof currentTree !== 'object') {
      continue outermost_while_loop; // <-- label
    }

    for (const shouldFail of fail) {
      if (shouldFail(currentTree)) {
        // using a label here allows us to jump to the next iteration of our
        //    outermost (while) loop; otherwise, we would keep checking failure
        //    conditions or if we `break`, we would end up still adding the
        //    failing tree
        continue outermost_while_loop; // <-- label
      }
    }

    // leftChildKey is the first key; if there is one, our leftChild is there.
    //    We don't need to worry about the key order; objects are unordered
    //    anyways, and in our case, dependencies are processed alphabetically
    //    *at a given level*.

    // The next destructures the second key from the array. If there isn't one
    //    -- say, we had const [one, two] = ['apples']; we'd get: one ->
    //    'apples', two => undefined

    // (If you're familiar with left-child-right-sibling, this is where we are
    //    grabbing some indicator as to whether the leftChild of our currentTree
    //    has a rightSibling at all to visit.)
    const [leftChildKey, restObjectExists] = Object.keys(currentTree);
    let shouldEmitLeftChildKey = true;
    if (!leftChildKey) {
      // If there's no leftChildKey, then the object is empty; we can keep on
      continue outermost_while_loop;
    }

    if (leftChildKey in emitUpOneAndSkip) {
      // Remember we're unshifting keys (adding them at 0)
      // so the key at 0 is what we last saw -- which means it was the previous
      // left child key, and since we are descending depth-first
      // we know we are a child of it -- e.g., currentTree is the child that was
      // the leftChild last iteration through
      // ...unless this depends on WHERE we are as a key
      // if we are the first key; awesome
      // if there was something before us
      // either it was descendable; in which case it has done so already
      // or it wasn't descendable, so moot point
      // either way I thiiiiiiink we can conclude that the most recent leftChildKey is always the key that got us and is our "entry"
      const keyMostRecentlyEmitted = resultStack[0];
      console.log(resultStack);
      // do NOT add the key *itself* to the stack
      shouldEmitLeftChildKey = false;
      // get the VALUE at that key
      const currentValue = currentTree[leftChildKey];
      console.assert(currentValue);
      // this should be always stringable, because we're gonna concat it on
      // in place. I guess?
      resultStack[0] = `${keyMostRecentlyEmitted}=${currentValue}`;

      // e.g., associate the version # with the parent key
    }

    if (leftChildKey in descendAndSkipKeyEmit) {
      // do NOT emit that key
      // but go ahead and do everything else normally
      // e.g., walk the dependency object but don't add 'dependencies'
      shouldEmitLeftChildKey = false;
    }

    if (leftChildKey in reject) {
      // We need to still process things
      //    but no need to add this key.
      shouldEmitLeftChildKey = false;
    }

    if (leftChildKey in capture) {
      console.assert(currentTree[leftChildKey]);

      // I don't like this.
      // because we are emitting a different one here
      shouldEmitLeftChildKey = false;
      resultStack.unshift(`${leftChildKey}=${currentTree[leftChildKey]}`);
    }

    if (shouldEmitLeftChildKey) {
      resultStack.unshift(leftChildKey);
    }

    // Since the tree is an object, however, we can't just pop things off and
    //    mutate it in place. As a result, we need to truly *delete* that key
    //    from the object (or start carrying around the key array as its own
    //    thing, etc, which means more tracking/timing of things)

    // As the name implies, the `delete` operator destroys that reference on the
    //    object, which means that since we *want* the child under that key --
    //    we need to store it into a variable before doing so or we'll lose
    //    anything there.
    const leftChild = currentTree[leftChildKey];

    // Here, we delete that reference; if we look at the object now, there will
    //    be *no* leftChildKey to be found, and thus certainly nothing stored
    //    under that key on the object.
    delete currentTree[leftChildKey];

    // Remember, this key we grabbed above *only* exists if there were keys
    //    other than the one we just deleted -- meaning we can use its existence
    //    as the measure of whether or not the rest of the tree is worth
    //    investigating
    if (restObjectExists) {
      // Remove unnecessary branches by removing the references under the keys
      //    we want to ignore; by doing so here, we can prevent adding them to
      //    the stack at all
      for (const key in reject) {
        delete leftChild[key];
        delete currentTree[key];
      }

      // We add it to the stack *before* the leftChild;
      //    as a result, the leftChild will be on top of the stack, and thus
      //    the next thing processed -- hence the "depth-first" nature
      stack[stack.length] = currentTree;

      // TODO: We need to maybe preserve version information? Although, I
      //    believe npm's own system solves that for us -- e.g., if something is
      //    listed as a dependency, we *have* to have that version.

      // Similarly, since 'moreObjectToCheck' was the key AFTER, we *know*
      //    that leftChild exists; therefore, we can skip the branch below
      //    and add it here for certain, `continue`ing to progress early
      typeof leftChild === 'object' && (stack[stack.length] = leftChild);

      // and we continue on!
      continue outermost_while_loop; // <-- label
    }

    // This last condition is the case of our very last key on an object
    //    Honestly this has some sort of implication/meaning I think, but
    //    I'm not sure what. They're like the... extrema? or something
    if (leftChild) {
      // No need to add the rest of this current tree -- we know it's finished
      stack[stack.length] = leftChild;
    } else {
      throw new Error('No left child -- this should never happen.');
    }
  }

  // console.log(counter);
  return resultStack;
}
