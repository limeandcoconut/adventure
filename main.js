const {entityManager} = require('./managers.js')
const {friendlyParse: parse, parser, lexer} = require('./parser.js')
const {friendlyInterpret: interpret} = require('./interpreter')
const {LexError, ParseError} = require('parser')
const {preresolve, ResolveError} = require('./preresolve.js')

/* eslint-disable require-jsdoc */
const {systems, player} = require('./setup.js')

let actionQueue = []

module.exports = function(line) {
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
    let iLen = actions.length
    for (let i = 0; i < iLen; i++) {
        let action = actions[i]
        console.log('*********** ACTION **********')
        console.log(JSON.stringify(action, null, 4))
        console.log(action)
        if (action instanceof Error) {
            return formatResponse(action)
        }
        filteredActions.push(action)
    }

    actions = filteredActions

    // Construct response from executing actions.
    let output = ''

    // Add properties to action.
    // if (!action.entity) {
    // }
    let deferred = []
    let i = 0
    // let j = 0
    while (i < actions.length) {
        let action = actions[i]
        // action.entity = {
        //     id: player,
        // }
        console.log('*********** EXECUTE i **********')

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

                // Defer the right side.
                // execute(right, true)
                right.steps = new Map()
                right.live = true
                deferred.push(right)
                // Execute the left.
                // actions[i] = left
                action = left
                // let response = execute(left)
                // return response
                // continue
            }

            //  If the action is targeting a generic object preresolve the object id(s).
            let label = action.object.word
            if (label === 'all' || label === 'everything') {
                // Fail this action if there are descriptors attached to "all".
                if (action.object.descriptors.length) {
                    output += formatResponse(new ResolveError(`Cannot resolve descriptors on "${action.word}."`))
                    continue
                }

                let objects

                objects = preresolve(action)
                if (objects instanceof Error) {
                    output += formatResponse(objects)
                    continue
                }

                let objectCount = objects.length
                let l = 0
                let newAction
                do {
                    newAction = Object.create(action)
                    newAction.object = objects[l]
                    if (l === objectCount - 1) {
                        break
                    }
                    newAction.steps = new Map()
                    newAction.live = true
                    deferred.push(newAction)
                    // execute(newAction, true)
                } while (++l)

                // let response = execute(newAction)
                // return response
                action = newAction
            }
        }

        action.steps = new Map()
        action.live = true
        output += execute(action)

        let j = 0
        while (j < deferred.length) {
            console.log('*********** EXECUTE j **********')
            output += execute(deferred[j])
            j++
        }
        deferred = []
        i++


    return output
}

function execute(action, defer = false) {

    // if (action.object) {
    //     //  If the action is a bifurcation.
    //     if (action.object.type === 'bifurcation') {
    //         // Split into two actions.
    //         let right = Object.create(action)
    //         right.object = action.object.right

    //         let left = Object.create(action)
    //         left.object = action.object.left

    //         // Defer the right side.
    //         execute(right, true)
    //         // Execute the left.
    //         let response = execute(left)
    //         return response
    //     }

    //     //  If the action is targeting a generic object preresolve the object id(s).
    //     let label = action.object.word
    //     if (label === 'all' || label === 'everything') {
    //         // Fail this action if there are descriptors attached to "all".
    //         if (action.object.descriptors.length) {
    //             return formatResponse(new ResolveError(`Cannot resolve descriptors on "${action.word}."`))
    //         }

    //         let objects

    //         objects = preresolve(action)
    //         if (objects instanceof Error) {
    //             return formatResponse(objects)
    //         }

    //         let objectCount = objects.length
    //         let i = 0
    //         let newAction
    //         do {
    //             newAction = Object.create(action)
    //             newAction.object = objects[i]
    //             if (i === objectCount - 1) {
    //                 break
    //             }
    //             execute(newAction, true)
    //         } while (++i)

    //         let response = execute(newAction)
    //         return response
    //     }
    // }

    // action.steps = new Map()
    // // if (typeof action.live === 'undefined') {
    // action.live = true
    // }

    // Add this action to the queue.
    // actionQueue.unshift(action)

    // if (defer) {
    //     return
    // }

    // console.log('--------------------QUEUE----------------')
    // console.log(JSON.stringify(actionQueue, null, 4))

    // Update all the systems.
    // systems.forEach((system) => system.update())

    // Format a simple response.
    let response = ''
    // actionQueue.events.forEach((action) => {
    // for (let action of actionQueue) {
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
    // }

    // Clear channel.
    // actionQueue = []

    return response
}

let responses = {
    errors: {
        unknownWord(word) {
            return `I'm sorry, I don't know the word "${word}".`
        },
        unknownChar(char) {
            return `I'm sorry, I don't know what "${char}" means.`
        },
        missingPart(missing) {
            return `There seems to be an ${missing} missing from that sentence.`
        },
        understandWord(word) {
            return `I don't understand how you used the word "${word}".`
        },
        understandSentence() {
            return `That sentence isn't one I recognize`
        },
        fatal() {
            return `Well it looks like this one is on me. ` +
                `Something terrible just happened and it doesn't look like we can fix it.`
        },
    },
    success: {
        get() {
            return 'Taken.'
        },
        drop() {
            return 'Dropped.'
        },
        inventory({
            inventory,
        }) {
            if (!inventory.length) {
                return `You don't have antying.`
            }

            function describeInventory(inventory, level = 0) {
                let tab = '    '
                let indent = tab.repeat(level)
                let output
                if (level) {
                    output = `${indent}It contains:\n`
                } else {
                    output = `You are carrying:\n`
                }

                inventory.forEach(({
                    id,
                    inventory,
                }) => {
                    let name = entityManager.getComponent('ObjectDescriptorComponent', id).getName()
                    output += `${tab}${indent}${name}\n`
                    if (inventory) {
                        output += describeInventory(inventory, level + 1)
                    }
                })

                return output
            }

            return describeInventory(inventory)
        },
    },
    failure: {
        get({
            reason,
            container,
            id,
        }) {
            console.log(reason, container, id)
            if (/have/i.test(reason)) {
                return 'You already have that'
            }
            if (/inaccessible/i.test(reason)) {
                let name = entityManager.getComponent('ObjectDescriptorComponent', container).getName()
                return `The ${name} is closed.`
            }
            if (/inapparent/i.test(reason)) {
                let name = entityManager.getComponent('ObjectDescriptorComponent', id).getName()
                return responses.general.inapparent(name)
            }
            return reason
        },
        drop({
            reason,
            container,
        }) {
            console.log(reason)
            if (/don.?t/i.test(reason)) {
                return `You don't have that`
            }
            if (/inaccessible/i.test(reason)) {
                let name = entityManager.getComponent('ObjectDescriptorComponent', container).getName()
                return `The ${name} is closed.`
            }
            return reason
        },
    },
    general: {
        inapparent(object) {
            return `You don't see any ${object} here.`
        },
    },
}

let missingParseParts = {
    'conjunction': 'noun',
    'verb': 'noun',
    'adverb': 'verb',
    'preposition-adverb-postfix': 'verb',
    'preposition-phrase-infix': 'noun',
}

function formatResponse(output) {
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

    if ((typeof output === 'string' || Array.isArray(output)) && !output.length) {
        return 'Beg your pardon?'
    }

    if (output.live) {
        let hander = responses.success[output.type]
        if (hander) {
            return hander(output.info)
        }
    } else if (output.live === false) {
        let step = Array.from(output.steps.keys()).pop()
        let handler = responses.failure[step]
        // console.log(step)
        // console.log(handler)
        if (handler) {
            let info = Array.from(output.steps.values()).pop()
            return handler(info)
        }
    }
}
