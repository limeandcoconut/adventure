const {preresolve} = require('./preresolve.js')
/* eslint-disable require-jsdoc */
function bifurcate(action) {
  let actions = []

  if (!action.bifurcated) {
    //  If the object is a bifurcation or need preresolution get all variants of this action.
    let variants = getVariants(action.object, (object) => {
      const objects = []
      if (object.type === 'bifurcation') {
        let left = object
        do {
          objects.unshift(left.right)
          left = left.left
        } while (left.type === 'bifurcation')
        objects.unshift(left)
      } else {
        objects.push(object)
      }
      return objects
    })

    // If there are variations create a new action for each one.
    if (variants.length > 1) {
      variants = variants.map((object) => {
        // Create new action.
        let newAction = action.clone()
        // Add properties to action.
        newAction.object = object
        action.bifurcated = true
        return newAction
      })
      // Add the new variant actions to the list.
      actions = variants
      action = variants.shift()
    } else {
      action.bifurcated = true
    }
  }

  // If there are multiple nouns or pronouns preresolve them, recursively.
  let variants = getVariants(action.object, (object, context) => {
    let objects
    if (object.type === 'noun-multiple' || object.type === 'pronoun') {
      objects = preresolve(object, action.entity, context)
    } else {
      objects = [object]
    }
    return objects
  }, action)

  // If there are variants create a new action for each one.
  if (variants.length) {
    variants = variants.map((object) => {
      // Create new action.
      const newAction = action.clone()
      newAction.object = object
      // Add properties to action.
      // If the resolution failed at any point, fail this action.
      if (object.result) {
        newAction.steps.preresolve = object.result
        newAction.live = false
        newAction.fault = 'preresolve'
      } else {
        newAction.steps.preresolve = {
          success: true,
        }
      }
      return newAction
    })

    // Add the new actions to the list.
    actions = variants.concat(actions)
  }

  // throw 'asdf'
  return actions
}

function getVariants(object, method, context) {
  // Flatten any the tree structure using the provided method.
  const objects = method(object, context)
  // If there was no infix involved, pass the direct objects along.
  let indirect = object.object
  if (!indirect) {
    return objects
  }
  // Flatten any indirect objects recursively.
  let indirectObjects = []
  indirectObjects = indirectObjects.concat(getVariants(indirect, method))
  // Create a new variant of this object for each indirect object child it has.
  let variants = []
  for (const indirect of indirectObjects) {
    for (let variant of objects) {
      variant = Object.create(variant)
      // If the direct object resolved properly but the indirect didn't pass the message up.
      if (!variant.result && indirect.result) {
        variant.result = indirect.result
      }
      variant.object = indirect
      variants.push(variant)
    }
  }

  return variants
}

module.exports = bifurcate
