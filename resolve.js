'use strict'

const actions = require('./actions')
const {
    deep,
    childrenOf,
    parentOf,
    entity,
    ResolveError,
    exclude,
} = require('./resolve-helpers')

// Check for required and surplus objects
// Auto resolve if required

// Disambiguate pronouns
// Fail on indirect objects

// Disambiguate historical pronouns

// Filter pronouns using except and adjecives

// exceptions
// historicals
// determiners e.g. some

// Resolve labeled objects
// Split actions
/* eslint-disable require-jsdoc, complexity */
const multipleNoun = /^all|everything$/i
const generalNoun = /^anything|something|somethign$/i
const generalDeterminer = /^a|an$/i
const multipleDeterminer = /^some$/i

// function resolve(verb) {

// }
module.exports = function(actions) {
    for (let i = 0; i < actions.length; i++) {
        const action = actions[i]
        // console.log(action)
        // console.log(typeof action)
        // console.log(JSON.stringify(Object.keys(action), null, 4))
        // function explore(parent) {
        //     return (key) => {
        //         // console.log(key)
        //         // console.log(typeof parent[key])
        //         if (typeof parent[key] === 'object') {
        //             if (parent[key] === action.entity) {
        //                 console.log('found', key)
        //             }
        //             Object.keys(parent[key]).forEach(explore(parent[key]))
        //         }
        //     }
        // }
        // Object.keys(action.entity).forEach(explore(action.entity))

        // console.log(JSON.stringify(action, null, 4))
        // console.log(action.entity)
        // console.log(JSON.stringify(action.entity, null, 4))
        action.context.forEach((context, type) => {
            const object = action[type]
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
                throw new ResolveError(`Action can't accept object type: ${type}`, 'aor1')
            }
            // If there are multiple objects used in an indirect way, throw.
            if (type !== 'object' && object.objects) {
                throw new ResolveError('Cannot use more than one object as an indirect objects', 'aor4')
            }
            // Get the search context for manual object resolution.
            let from
            if (object.from) {
                // Search from the parent, your context must be visible and accessible.
                let fromObject = findObject({
                    object: object.from,
                    type: `from ${type}`,
                    from: context.from,
                    context: {},
                    action,
                })
                from = () => fromObject
            }
            from = from || context.from
            // Get exceptions for manual object resolution.
            let except
            if (object.except) {
                // Search except the parent, your context must be visible and accessible.
                let exceptObject = findObject({
                    object: object.except,
                    type: `except ${type}`,
                    from: context.from,
                    context: {},
                    action,
                })
                except = () => exceptObject
            }
            except = except || context.except
            let resolved
            if (object.objects) {
                resolved = []
                while (object.objects.length) {
                    // This will throw or resolve.
                    // If it returns an error object then that will be handled when the action is split.
                    resolved.push(findObject({
                        object: object.objects.shift(),
                        type,
                        from,
                        except,
                        context,
                        action,
                    }))
                }
                // action[type] = resolved
            } else {
                resolved = findObject({
                    object,
                    type,
                    from,
                    context,
                    action,
                })
            }
            action[type] = resolved
        })
    }
}

/* eslint-disable require-jsdoc, max-params */
function findObject({object, type, from, except, context, action}) {
    // Set the multiple flag.
    // console.log(object)
    object.multiple = multipleNoun.test(object.value)
    // console.log(object)
    // If it's a multiple indirect, throw.
    if (type !== 'object' && object.multiple) {
        throw new ResolveError('Cannot use multiple nouns as indirect objects', 'aor2')
    }
    // Set general flag.
    object.general = generalNoun.test(object.value)
    // Get candidates.
    // console.log(typeof from)
    // console.log(typeof (from(action))(action))
    // console.log(from(action)(action))
    let candidates = deep(childrenOf(from, !context.inaccessible, !context.inapparent))
    if (except) {
        candidates = exclude(except, candidates)
    }
    candidates = candidates(action)
    // console.log()
    // console.log('here')
    // console.log(candidates)
    // console.log(parentOf(entity())(action).container.contents)

    // console.log(candidates)

    const descriptors = object.descriptors.slice()
    // If it's a multiple noun and there's no descriptors return everything.
    if (object.multiple && !descriptors.length) {
        return candidates
    }
    // If it's a general noun and there's no descriptors return a random thing. 🎉
    if (object.general && !descriptors.length) {
        return candidates[Math.floor(candidates.length * Math.random())]
    }

    // console.log(descriptors)

    const best = {
        entities: [],
        // Make 0 not count
        score: 1,
    }
    /* eslint-disable require-jsdoc, no-loop-func */
    // Check to see how well each candidate matches our search.
    candidates.forEach((entity) => {
        // If this is not the item we're looking for skip it.
        if (!object.general && !object.multiple && !entity.descriptors.labels.includes(object.value)) {
            return
        }
        // If we have descriptors to match, score this entity.
        if (descriptors.length) {
            let entityDescriptors = entity.descriptor.descriptors
            let score = descriptors.filter((descriptor) => entityDescriptors.includes(descriptor))
            score = score.length
            if (score > best.score) {
                // New best.
                best.score = score
                best.entities = [entity]
            } else if (score === best.score) {
                // Add a tie.
                best.entities.push(entity)
            }
            // If there are no descriptors this entity is a label match.
        } else {
            best.entities.push(entity)
        }
    })

    let entities = best.entities
    if (entities.length === 0) {
        const error = new ResolveError(`Cannot resolve "${type}" object`, 'aor5')
        if (!type !== 'object') {
            throw error
        }
        return error
    }

    if (entities.length === 1) {
        return entities[0]
    }

    // Multiple entites found:
    const determiner = object.determiner

    // If the noun was multiple return all.
    if (object.multiple && (determiner && multipleDeterminer.test(determiner.value))) {
        return entities
    }
    // If the noun was general return a random one. 🎉
    if (determiner && generalDeterminer.test(determiner.value)) {
        return entities[Math.floor(entities.length * Math.random())]
    }
    // If the noun was specific:
    const error = new ResolveError(`Resolved multiple "${type}" objects`, 'aor6')
    if (!type !== 'object') {
        throw error
    }
    return error
}
