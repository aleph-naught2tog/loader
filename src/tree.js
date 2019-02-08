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
function unrollDepthFirst(dict, { reject = {}, fail = [] }) {
  const resultStack = [];

  // Initialize our stack by adding the object itself
  const stack = [dict];

  outermost_while_loop: while (stack.length) {
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
    if (leftChildKey in reject) {
      continue outermost_while_loop; // <- label
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
      // Remove unnecessary branches by removing the references under the keys
      //    we want to ignore; by doing so here, we can prevent adding them to
      //    the stack at all
      for (const key in reject) {
        // TODO: so, um, if I *remove* this `for` loop, but leave in the
        //    condition to continue on (above) without adding when a 'reject'
        //    key is found, we ... lose the whole tree I guess. which is not
        //    great? or might not b a problem but not happy that I don't
        //    understant *why* that happens
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
      continue outermost_while_loop; // <-- label
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
