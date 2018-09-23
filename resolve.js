'use strict'
/* eslint-disable require-jsdoc */

const {
    // deep,
    deepChildrenOf,
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

// TODO: Visibility/accessibility tagging

const multipleNoun = /^all|everything$/i
const generalNoun = /^anything|something|somethign$/i
const generalDeterminer = /^a|an$/i
const multipleDeterminer = /^some$/i
const passthrough = /^n|s|e|w|ne|se|sw|nw|u|d|north|south|east|west|northeast|southeast|southwest|northwest|up|down$/i

module.exports = function(actions) {
    for (let i = 0; i < actions.length; i++) {
        const action = actions[i]
        const contexts = action.context
        // Evidently the fastest map loop: https://jsperf.com/array-object-set-map-iterate
        for (let type of contexts.keys()) {
            const context = contexts.get(type)
            let object = action[type]
            // If there isn't an object.
            if (!object) {
                // If one isn't required, return.
                if (!context || context.optional) {
                    return
                }
                // If one is, and there's no way to resolve, throw.
                if (!context.resolve) {
                    throw new ResolveError(`Action can't auto resolve: ${type}`, 'aor3')
                }
                // This will resolve properly or throw.
                const target = context.resolve(action)
                action[type] = target
                return
            }
            // There's an object:
            // If there is an unaccepted object, throw.
            if (!context) {
                throw new ResolveError(`Action can't accept object type: ${type}`, 'aor1', {
                    verb: action.word,
                    type,
                })
            }
            // If there are multiple objects used in an indirect way, throw.
            if (type !== 'object' && object.objects) {
                throw new ResolveError('Cannot use more than one object as an indirect object', 'aor4', {verb: action.word})
            }

            // If the object should not be resolved return early.
            if (context.acceptsPassthrough && passthrough.test(object.value)) {
                action[type] = object
                return
            }
            if (context.acceptsWordLiteral && object.type === 'string') {
                action[type] = object
                return
            }

            // Get the search context for manual object resolution.
            let from
            // If there is a specified search context resolve it.
            if (object.from) {
                // Search for specified context within the default context.
                object.from = findObjects({
                    object: object.from,
                    type: `from ${type}`,
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
                    type: `except ${type}`,
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
            action[type] = findObjects({
                object,
                type,
                from,
                except,
                context,
                action,
            })
        }
    }
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
    // Refine candidates using descriptors and labels.
    candidates = scoreCandidates(candidates, descriptors, object)

    // If there are no matches this is an error.
    if (candidates.length === 0) {
        const error = new ResolveError(`Cannot resolve "${type}" object`, 'aor5', {noun: object})
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
    // TODO: Should this be an && ?
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
    // TODO: There might not be a default 'from' context.
    if (!described && (object.multiple || object.general)) {
        if (!context.all) {
            let type = object.multiple ? 'multiple' : 'general'
            throw new ResolveError(`Cannot use a ${type} noun with the verb "${action.word}"`, 'aor7', {type, verb: action.word})
        }
        candidates = context.all
    } else {
        candidates = appropriate(deepChildrenOf(from))
    }

    if (except) {
        candidates = exclude(except, candidates)
    }
    return candidates(action)
}

function scoreCandidates(candidates, descriptors, object) {
    let entities = []
    // Make 0 not count
    let score = 1

    // Check to see how well each candidate matches our search.
    while (candidates.length) {
        let entity = candidates.shift()
        // If this is not the item we're looking for skip it.
        if (!object.general && !object.multiple && !entity.descriptors.labels.includes(object.value)) {
            continue
        }
        // If there are no descriptors this entity is a label match.
        if (!descriptors.length) {
            entities.push(entity)
            continue
        }
        // If we have descriptors to match, score this entity.
        const entityDescriptors = entity.descriptors.descriptors
        let entityScore = descriptors.filter(({value}) => entityDescriptors.includes(value))
        entityScore = entityScore.length
        if (entityScore > score) {
            // New best.
            score = entityScore
            entities = [entity]
        } else if (entityScore === score) {
            // Add a tie.
            entities.push(entity)
        }
    }

    return entities
}
