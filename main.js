// const {entityManager} = require('./managers.js')
const {friendlyParse: parse, parser, lexer} = require('./parser.js')
const {friendlyInterpret: interpret} = require('./interpreter')
// const {LexError, ParseError} = require('parser')
const {preresolve, ResolveError} = require('./preresolve.js')
const {responses, missingParseParts} = require('./responses.js')

/* eslint-disable require-jsdoc */
const {systems, player} = require('./setup.js')

module.exports = function(line) {
    console.log('')
    console.log('################################')
    console.log('########### NEW INPUT ##########')
    // Lex and parse.
    let parseTree = parse(line)
    // Parser errors.
    if (parseTree instanceof Error) {
        return formatResponse(parseTree)
    }
    // Remove empty nodes
    parseTree = parseTree.filter((node) => node)
    console.log('*********** PARSE TREE **********')
    console.log(JSON.stringify(parseTree, null, 1))

    if (!parseTree.length) {
        return formatResponse(parseTree)
    }

    // Interpret actions
    let actions = interpret(parseTree)
    // Filter null actions/nodes.
    let filteredActions = []
    for (let i = 0; i < actions.length; i++) {
        let action = actions[i]
        console.log('*********** ACTION **********')
        console.log(JSON.stringify(action, null, 4))
        if (action instanceof Error) {
            return formatResponse(action)
        }
        filteredActions.push(action)
    }

    actions = filteredActions

    // Construct response from executing actions.
    let output = ''

    let deferred = []
    let i = 0
    while (i < actions.length) {
        let action = actions[i]
        console.log('*********** EXECUTE MAIN **********')

        // Add properties to action.
        action.entity = {
            id: player,
        }

        if (action.object) {
            //  If the action is a bifurcation.
            if (action.object.type === 'bifurcation') {
                // Split into two actions.
                let right = Object.create(action)
                right.object = action.object.right

                let left = Object.create(action)
                left.object = action.object.left

                // Add properties to action.
                right.steps = new Map()
                right.live = true
                // Defer the right side.
                deferred.push(right)
                // Execute the left.
                action = left
            }

            //  If the action is targeting a generic object preresolve the object id(s).
            let label = action.object.word
            if (label === 'all' || label === 'everything') {
                // Fail this action if there are descriptors attached to "all".
                if (action.object.descriptors.length) {
                    output += formatResponse(new ResolveError(`Cannot resolve descriptors on "${action.word}."`))
                    i++
                    continue
                }

                let objects
                objects = preresolve(action)
                if (objects instanceof Error) {
                    output += formatResponse(objects)
                    i++
                    continue
                }

                if (!objects.length) {
                    action.steps = new Map([
                        ['preresolve', {
                            success: false,
                            reason: 'Cannot preresolve entity.',
                        }],
                    ])
                    action.live = false
                    output += formatResponse(action)
                    i++
                    continue
                }

                let objectCount = objects.length
                let l = 0
                let newAction
                do {
                    newAction = Object.create(action)
                    newAction.object = objects[l]
                    if (l >= objectCount - 1) {
                        break
                    }
                    // Add properties to action.
                    newAction.steps = new Map()
                    newAction.live = true
                    deferred.push(newAction)
                } while (++l)

                action = newAction
            }
        }

        // Add properties to action.
        action.steps = new Map()
        action.live = true
        output += execute(action) + '\n'

        let j = 0
        while (j < deferred.length) {
            console.log('*********** EXECUTE DEFERRED **********')
            output += execute(deferred[j]) + '\n'
            j++
        }
        deferred = []
        i++
    }
    return output
}

function execute(action) {

    // Format a simple response.
    let response = ''
    // Do each step listed by that action.
    let procedure = action.procedure
    procedure.every((step) => {
        if (!action.live) {
            return false
        }
        systems[step].update(action)
        return true
    })

    let output = formatResponse(action)

    if (!output) {
        let res = {}
        res.type = action.type
        res.object = action.object
        res.live = action.live
        res.steps = {}
        action.steps.forEach((step, name) => {
            res.steps[name] = step.success || step.reason
        })
        res.info = action.info
        output += JSON.stringify(res, null, 4)
        console.log(action)
    }
    response += output
    return response
}

function formatResponse(output) {
    // Errors:
    if (output instanceof Error) {
        if (output.isLexError) {
            let word = lexer.errorMeta.word
            let char = lexer.errorMeta.char
            if (word) {
                return responses.errors.unknownWord(word)
            } else if (char) {
                return responses.errors.unknownChar(char)
            }
        } else if (output.isParseError) {
            let binder = parser.errorMeta.binder
            let token = parser.errorMeta.token
            let missing = missingParseParts[binder ? binder.type : token.type]
            if (missing) {
                return responses.errors.missingPart(missing)
            }
            if (token.type !== parser.endToken) {
                return responses.errors.understandWord(token.word)
            }
            return responses.errors.understandSentence()
        } else if (output.isResolutionError) {
            return responses.errors.understandSentence()
        }
        return responses.errors.fatal()
    }

    // If there was no recognized input.
    if ((typeof output === 'string' || Array.isArray(output)) && !output.length) {
        return 'Beg your pardon?'
    }

    // If the action succeeded.
    if (output.live) {
        let handler = responses.success[output.type]
        if (handler) {
            let response = handler(output.info)
            if (response) {
                return response
            }
        }
        return responses.general(output.info)
    // If the action failed.
    } else if (output.live === false) {
        let [step, info] = Array.from(output.steps.entries()).pop()
        console.log(Array.from(output.steps.entries()).pop())
        let handler = responses.failure[step]
        if (handler) {
            let response = handler(info)
            if (response) {
                return response
            }
        }
        return responses.general(info)
    }
}
