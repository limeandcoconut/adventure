'use strict'
/* eslint-disable require-jsdoc, complexity */

const {
  // deep,
  // deepChildrenOf,
  deepConstituentsOf,
  ResolveError,
  exclude,
  appropriate,
} = require('./resolve-helpers')

// Steps:
// Check for required and surplus objects
//      Auto resolve if required
// Resolve labeled objects
//      exceptions
//      Disambiguate pronouns
//          Fail on indirect objects
//          Disambiguate historical pronouns **
//          Filter pronouns using except and adjecives
// determiners e.g. some

// TODO: [>=0.1.0] Visibility/accessibility tagging

const multipleNoun = /^all|everything$/i
const generalNoun = /^anything|something|somethign$/i
const generalDeterminer = /^a|an$/i
const multipleDeterminer = /^some$/i
// TODO: [>=0.1.0] Consider moving passthrough tests to actions
const passthrough = /^n|s|e|w|ne|se|sw|nw|u|d|north|south|east|west|northeast|southeast|southwest|northwest|up|down$/i

module.exports = function(action) {
  const contexts = action.context
  // Evidently the fastest map loop: https://jsperf.com/array-object-set-map-iterate
  for (let contextType of contexts.keys()) {
    // This is the contextual information necessary to resolve object of this type for actions of this type.
    const context = contexts.get(contextType)
    // This is the object specific to the current action.
    // This will not skip any objects because all context types types must defined on the action or handled explicitly.
    let object = action[contextType]
    // If there isn't an object.
    if (!object) {
      // If one isn't required, return.
      // TODO: [>=0.1.0] .optional flag is never used. Consider removing it.
      if (!context || context.optional) {
        continue
      }
      // If one is, and there's no way to autoresovle, throw.
      if (!context.resolve) {
        throw new ResolveError(`Action can't auto resolve: ${contextType}`, 'aor3')
      }
      // This will resolve properly or throw.
      const target = context.resolve(action)
      action[contextType] = target
      continue
    }
    // There's an object:
    // If there is an unaccepted object, throw.
    if (!context) {
      throw new ResolveError(`Action can't accept object type: ${contextType}`, 'aor1', {
        verb: action.word,
        contextType,
      })
    }
    // If there are multiple objects used in an indirect way, throw.
    if (contextType !== 'object' && object.objects) {
      throw new ResolveError('Cannot use more than one object as an indirect object', 'aor4', {verb: action.word})
    }

    // If the object should not be resolved return early.
    if (context.acceptsPassthrough && passthrough.test(object.value)) {
      action[contextType] = object
      continue
    }
    if (context.acceptsWordLiteral && object.type === 'string') {
      action[contextType] = object
      continue
    }
    // Get the search context for manual object resolution.
    let from
    // If there is a specified search context resolve it.
    if (object.from) {
      // Search for specified context within the default context.
      object.from = findObjects({
        object: object.from,
        type: `from ${contextType}`,
        from: context.from,
        // The context must be visible and accessible.
        // context: {},
        action,
      })
      // Create function to return the set of possible candidates.
      from = () => object.from
    } else {
      from = context.from
    }
    // Get exceptions for manual object resolution.
    // If there is a specified set of exceptions resolve them.
    let except
    if (object.except) {
      // Search for exceptions within the default context.
      object.except = findObjects({
        object: object.except,
        type: `except ${contextType}`,
        from: context.from,
        // The context must be visible and accessible.
        // context: {},
        action,
      })
      // Create function to return the set of resolved exceptions.
      except = () => object.except
    } else {
      except = context.except
    }

    // Resolve the object using search context, exceptions, etc.
    let result = findObjects({
      object,
      contextType,
      from,
      except,
      context,
      action,
    })

    if (result.objects) {
      let i = 0
      do {
        result.objects[i] = checkAccessibility(result.objects[i], action, contextType)
        i++
      } while (i < result.objects.length)
    } else {
      result = checkAccessibility(result, action, contextType)
    }

    action[contextType] = result
  }
}

function checkAccessibility(object, action, type) {
  if (typeof object.id !== 'undefined' && action.accessibleRequired && !action.accessible[object.id]) {
    const error = new ResolveError('Target is inaccessible', 'aor8', {object})
    if (type !== 'object') {
      throw error
    }
    return error
  }
  return object
}

function findObjects(args) {
  // If this is a list of objects return a list.
  if (args.object.objects) {
    let resolved = []
    const {type, from, except, context, action} = args
    while (args.object.objects.length) {
      resolved.push(findObject({
        object: args.object.objects.shift(),
        type,
        from,
        except,
        context,
        action,
      }))
    }
    return resolved
  }

  // Otherwise return a single object.
  return findObject(args)

}

function findObject(args) {
  let {object, type} = args
  // Set the multiple flag.
  object.multiple = multipleNoun.test(object.value)
  // If it's a multiple indirect, throw.
  if (type !== 'object' && object.multiple) {
    throw new ResolveError('Cannot use multiple nouns as indirect objects', 'aor2', {noun: object})
  }
  // Set general flag.
  object.general = generalNoun.test(object.value)
  // Get candidates.
  const descriptors = object.descriptors.slice()

  let candidates = resolveCandidates(args, descriptors.length)
  if (!descriptors.length) {
    // If it's a multiple noun and there's no descriptors return everything.
    if (object.multiple) {
      return candidates
    }
    // If it's a general noun and there's no descriptors return a random thing. 🎉
    if (object.general) {
      return candidates[Math.floor(candidates.length * Math.random())]
    }
  }
  // candidates.forEach((obj) => {
  //     console.log(obj.toString())
  // })
  // console.log(JSON.stringify(candidates, null, 2))
  // Refine candidates using descriptors and labels.
  candidates = scoreCandidates(candidates, descriptors, object, args.action)

  // If there are no matches this is an error.
  if (candidates.length === 0) {
    const error = new ResolveError(`Cannot resolve "${type}" object`, 'aor5', {
      noun: object,
      action: args.action,
      type,
    })
    //  TODO: Why throw here?
    if (type !== 'object') {
      throw error
    }
    return error
  }

  // If there is a single exact match return it.
  if (candidates.length === 1) {
    return candidates[0]
  }

  // Multiple entites found:
  const determiner = object.determiner
  // If the noun was multiple return all.
  if (object.multiple || (determiner && multipleDeterminer.test(determiner.value))) {
    return candidates
  }
  // If the noun was general return a random one. 🎉
  if (determiner && generalDeterminer.test(determiner.value)) {
    return candidates[Math.floor(candidates.length * Math.random())]
  }
  // If the noun was specific it will have to be disambiguated.
  const error = new ResolveError(`Resolved multiple "${type}" objects`, 'aor6', {candidates})
  if (type !== 'object') {
    throw error
  }
  return error
}

function resolveCandidates({object, from, except, context = {}, action}, described) {
  // If it's a multiple noun and there's no descriptors return everything.
  let candidates
  // TODO: [>=0.1.0] There might not be a default 'from' context.
  if (!described && !object.from && (object.multiple || object.general)) {
    if (!context.all) {
      let type = object.multiple ? 'multiple' : 'general'
      throw new ResolveError(`Cannot use a ${type} noun with the verb "${action.word}"`, 'aor7', {type, verb: action.word})
    }
    candidates = context.all
  } else {
    candidates = appropriate(deepConstituentsOf(from))
  }

  if (except) {
    // TODO: Name this function like a set getter
    candidates = exclude(except, candidates)
  }
  return candidates(action)
}

function scoreCandidates(candidates, descriptors, object, {accessible, accessibleRequired}) {
  let entities = []
  // Make 0 not count
  let score = 0.5
  let accessibleFound

  // Check to see how well each candidate matches our search.
  while (candidates.length) {
    let entity = candidates.shift()
    // If this is not the item we're looking for skip it.
    if (!object.general && !object.multiple && !entity.descriptors.labels.includes(object.value)) {
      continue
    }
    // console.log(object.value)
    // console.log(entity.descriptors.labels)
    // TODO: Consider splitting processes
    // If there are no descriptors this entity is a label match.
    if (!descriptors.length) {
      // If it doesn't have to be accessible, then don't check.
      if (!accessibleRequired) {
        entities.push(entity)
        continue
      }
      // If it does need to be accessible:
      // If it isn't and something else is, skip.
      if (accessibleFound && !accessible[entity.id]) {
        continue
      }
      // *Could perhaps* be simplified if accessible[entity.id] === undefined is impossible
      // if (!accessibleFound) {
      //   accessibleFound = accessible[entity.id]
      //   if (accessibleFound) {
      //     entities = []
      //   }
      // }
      if (accessibleFound === false && accessible[entity.id]) {
        accessibleFound = accessible[entity.id]
        entities = []
      } else if (typeof accessibleFound === 'undefined') {
        accessibleFound = accessible[entity.id]
      }
      entities.push(entity)
      continue
    }
    // If we have descriptors to match, score this entity.
    const entityDescriptors = entity.descriptors.descriptors
    let entityScore = descriptors.filter(({value}) => entityDescriptors.includes(value))
    entityScore = entityScore.length
    if (accessibleRequired && !accessible[entity.id]) {
      entityScore -= 0.5
    }
    if (entityScore > score) {
      // New best.
      score = entityScore
      entities = [entity]
    } else if (entityScore === score) {
      // Add a tie.
      entities.push(entity)
    }
  }
  // console.log(entities)
  // console.log(score)
  return entities
}
