/*

  Fair warning: this is a *very* destructive means of processing an object, as
  in, "we slowly permanently dereference things off it via `delete` and then add
  it to a stack which we then keep popping while passing the original object
  around as a trace"

  (Its eventual destination is processing very-nested-and-numerous-dependency
  structures, which are codified in a file that is parsed, so.)
*/
exports.unrollDepthFirst = unrollDepthFirst;
function unrollDepthFirst(dict, { keep = [], reject = {}, fail = [] }) {
  const stack = [];

  stack[0] = dict;
  const resultStack = [];
  let stackCounter = 0;

  loop: while (stack.length) {
    stackCounter += 1;

    console.log(stackCounter);
    // 0 is falsy -- meaning, if we have gotten in here, there is at LEAST on
    //    object on the stack; as a result, we can safely pop and know that we
    //    receive *something*
    const currentTree = stack.pop();

    if (typeof currentTree !== 'object') {
      continue;
    }

    for (const failureCondition of fail) {
      if (failureCondition(currentTree)) {
        continue loop;
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
    if (leftChildKey in reject) {
      continue loop;
    }

    // Since the tree is an object, however, we can't just pop things off and
    //    mutate it in place. As a result, we need to truly *delete* that key
    //    from the object (or start carrying around the key array as its own
    //    thing, etc, which means more tracking/timing of things)

    // As the name implies, the `delete` operator destroys that reference on the
    //    object, which means that since we *want* the child under that key (if
    //    it's there at all, but since you can delete things that aren't there
    //    with no issue we don't need to check first), we need to store it into
    //    a variable before doing so or we'll lose anything there.
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
      // Remove unnecessary branches
      for (const key in reject) {
        delete leftChild[key];
        delete currentTree[key];
      }

      // We add it to the stack *before* the leftChild;
      //    as a result, the leftChild will be on top of the stack, and thus
      //    the next thing processed -- hence the "depth-first" nature
      stack[stack.length] = currentTree;

      // Similarly, since 'moreObjectToCheck' was the key AFTER, we *know*
      //    that leftChild exists; therefore, we can skip the branch below
      //    and add it here for certain, `continue`ing to progress early
      typeof leftChild === 'object' && (stack[stack.length] = leftChild);

      // Finally, we add that key -- leftChildKey -- to the *start* of our
      //    resultStack, which ensures it is placed *before* its parents
      //    meaning it will 'load' first.
      // if we were a generator, we'd `yield` the key here to emit it
      resultStack.unshift(leftChildKey);
      continue;
    }

    // This last condition is the case of our very last key on an object
    //    Honestly this has some sort of implication/meaning I think, but
    //    I'm not sure what. They're like the... extrema? or something
    if (leftChild) {
      // No need to add the rest of the tree -- we know it's finished
      stack[stack.length] = leftChild;

      // And as above in the other branch, we go ahead and add that key
      resultStack.unshift(leftChildKey);
    }
  }

  return resultStack;
}
