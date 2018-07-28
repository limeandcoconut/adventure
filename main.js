const {entityManager} = require('./managers.js')
const {friendlyParse: parse, parser, lexer} = require('./parser.js')
const {friendlyInterpret: interpret} = require('./interpreter')
const {LexError, ParseError} = require('parser')

/* eslint-disable require-jsdoc */
const {actionOutputChannel, systems, player} = require('./setup.js')

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
    for (let action of actions) {
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

    // TODO: Change to reduce function. Maybe.
    actions.forEach((action) => {
        console.log('*********** EXECUTE **********')
        output += execute(action)
    })

    return output
}

function execute(action, defer = false) {

    //  If the action is a bifurcation.
    if (action.object && action.object.type === 'bifurcation') {
        // Split into two actions.
        let right = Object.create(action)
        right.object = action.object.right

        let left = Object.create(action)
        left.object = action.object.left

        // Defer the right side.
        execute(right, true)
        // Execute the left.
        let response = execute(left)
        return response
    }

    // Add properties to action.
    action.entity = {
        id: player,
    }
    action.steps = new Map()
    action.live = true

    // Add this action to the channel.
    actionOutputChannel.events.unshift(action)

    if (defer) {
        return
    }

    // Update all the systems.
    systems.forEach((system) => system.update())

    // Format a simple response.
    let response = ''
    // actionOutputChannel.events.forEach((action) => {
    //     let res = {}
    //     res.type = action.type
    //     res.object = action.object
    //     res.live = action.live
    //     res.steps = {}
    //     action.steps.forEach((step, name) => {
    //         res.steps[name] = step.success || step.reason
    //     })
    //     res.info = action.info
    //     response += JSON.stringify(res, null, 4)
    // })
    actionOutputChannel.events.forEach((action) => {
        let output = formatResponse(action)
        // if (action.live) {
        // }
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
    })

    // Clear channel.
    actionOutputChannel.events = []

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
        inventory({inventory}) {
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

                inventory.forEach(({id, inventory}) => {
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
        get({reason, container, id}) {
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
        drop({reason, container}) {
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
        console.log(step)
        console.log(handler)
        if (handler) {
            let info = Array.from(output.steps.values()).pop()
            return handler(info)
        }
    }
}
