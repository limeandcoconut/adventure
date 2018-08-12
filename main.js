const {friendlyParse: parse, parser, lexer} = require('./parser.js')
const {friendlyInterpret: interpret} = require('./interpreter')
const {preresolve} = require('./preresolve.js')
const {responses, missingParseParts} = require('./responses.js')
const {begin: Begin, go: Go} = require('./actions')
/* eslint-disable require-jsdoc, max-depth, no-loop-func */
const {systems, player, processes} = require('./setup.js')
const {logAction} = require('./helpers')

let gameStarted = false

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

    if (!parseTree.length && gameStarted) {
        return formatResponse(parseTree)
    }

    // Interpret actions
    let actions = interpret(parseTree)
    // Filter null actions/nodes.
    let filteredActions = []
    for (let i = 0; i < actions.length; i++) {
        let action = actions[i]
        console.log('*********** ACTION **********')
        logAction(action)
        console.log('')
        if (action instanceof Error) {
            return formatResponse(action)
        }
        filteredActions.push(action)
    }

    actions = filteredActions

    if (!gameStarted) {
        gameStarted = true

        if (!actions.length || actions[0].type !== 'begin') {
            console.log(`It doesn't look like you've begun yet. Lets do that.`)

            // let lookAction = Object.create(look)
            // lookAction.word = 'look'
            // lookAction.object = {
            //     word: 'room',
            //     descriptors: [],
            // }
            // actions.unshift(lookAction)

            // let goAction = Object.create(go)
            // goAction.word = 'go'
            // goAction.object = {
            //     id: 10,
            //     // word: 'room',
            //     descriptors: [],
            // }
            // actions.unshift(goAction)

            // let beginningAction = Object.create(begin)
            // beginningAction.word = 'begin'
            // actions.unshift(beginningAction)
            let beginningAction = new Begin('begin')
            // beginningAction.word = 'begin'
            actions.unshift(beginningAction)

            console.log(actions)
        }
    }

    // Construct response from executing actions.
    let output = ''

    while (actions.length) {
        let action = actions.shift()
        console.log('*********** EXECUTE MAIN **********')

        // Add properties to action.
        action.entity = {
            id: player,
        }

        if (action.object) {

            if (!action.bifurcated) {
                //  If the action is a bifurcation get all variants of this objects action.
                let variants = bifurcate(action.object, (object) => {
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
                if (variants.length) {
                    variants = variants.map((object) => {
                        // Create new action.

                        let newAction = action.clone()
                        // let newAction = Object.create(action)
                        newAction.object = object
                        action.bifurcated = true
                        // Add properties to action.
                        // newAction.steps = new Map()
                        // newAction.steps = {}
                        // newAction.live = true
                        return newAction
                    })
                    // Add the new variant actions to the list.
                    actions = variants.concat(actions)

                    // logVariants(actions)
                    // Set the current action to the first one
                    action = actions.shift()
                }
            }

            // If there are multiple nouns or pronouns preresolve them, recursively.
            let variants = bifurcate(action.object, (object, context) => {
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
                    // let newAction = Object.create(action)
                    const newAction = action.clone()
                    newAction.object = object
                    // If the resolution failed at any point, fail this action.
                    // Add properties to action.
                    // newAction.steps = {}
                    if (object.result) {
                        // newAction.steps.set('preresolve', object.result)
                        newAction.steps.preresolve = object.result
                        newAction.live = false
                        newAction.fault = 'preresolve'
                    } else {
                        newAction.steps.preresolve = {success: true}
                        // newAction.live = true
                    }
                    // console.log(newAction.object)
                    return newAction
                })

                // Add the new actions to the list.
                actions = variants.concat(actions)
                // logVariants(actions)
                // Set the current action.
                action = actions.shift()
            }
        }

        // Add properties to action.
        // if (!action.steps) {
        //     // action.steps = new Map()
        //     action.steps = {}
        //     action.live = true
        // }
        action.initiative = 2
        // action.info = {}
        output += execute(action)
    }
    return output + '\n'
}

function execute(action) {

    // Format a simple response.
    let response = ''
    // All simultaneous actions.
    let actions = [action]
    // Run all processes.

    // logAction(action)

    for (let i = 0; i < processes.length; i++) {
        let processActions = processes[i].update(action)
        // If any actions were generated add them to the list.
        if (typeof processActions !== 'undefined') {
            actions = actions.concat(processActions)
        }
    }

    // Sort actions by initiative.
    actions = actions.sort((a, b) => {
        if (a.initiative < b.initiative) {
            return -1
        }
        if (b.initiative < a.initiative) {
            return 1
        }
        return 0
    })

    for (let i = 0; i < actions.length; i++) {
        const action = actions[i]

        // Do each step listed by that action.
        let procedure = action.procedure
        let j = 0
        // action.live = false
        // action.steps.set('foo', {})
        do {
            if (!action.live) {
                break
            }
            systems[procedure[j]].update(action)
            j++
        } while (j < procedure.length)

        // logAction(action)
        // TODO: Adjust this to account for the acting entity.
        let output = ` \n${formatResponse(action)}`

        if (typeof action.info !== 'undefined') {
            output += ` \ninfo: ${JSON.stringify(action.info, null, 4)}`
        }

        if (!output) {
            // let res = {}
            // res.type = action.type
            // res.object = action.object
            // res.live = action.live
            // res.steps = action.steps
            // res.steps = {}
            // action.steps.forEach((step, name) => {
            //     res.steps[name] = step.success || step.reason
            // })
            // res.info = action.info
            // output += JSON.stringify(res, null, 4)
            // console.log(action)
            output += console.log(JSON.stringify(action, null, 4))
        }
        response += output

    }
    console.log('\n \n')
    return response
}

function bifurcate(object, method, context) {
    // Flatten any the tree structure using the provided method.
    const objects = method(object, context)
    // If there was no infix involved, pass the direct objects along.
    let indirect = object.object
    if (!indirect) {
        return objects
    }
    // Flatten any indirect objects recursively.
    let indirectObjects = []
    indirectObjects = indirectObjects.concat(bifurcate(indirect, method))
    // Create a new variant of this object for each indirect object child it has.
    let variants = []
    for (let i = 0; i < indirectObjects.length; i++) {
        for (let j = 0; j < objects.length; j++) {
            let variant = Object.create(objects[j])
            let indirect = indirectObjects[i]
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
        return responses.noInput()
    }

    // If the action succeeded.
    if (output.live) {
        // let [step, stepInfo] = Array.from(output.steps.entries()).pop()
        const handler = responses.success[output.reporter]
        if (handler) {
            const response = handler(output.steps)
            if (response) {
                return response
            }
        }
        // console.log(output)
        return responses.general(output)
    // If the action failed.
    } else if (output.live === false) {
        // let [step] = Array.from(output.steps.keys()).pop()
        const fault = output.fault
        const handler = responses.failure[fault]
        if (handler) {
            const response = handler(output.steps, fault)
            if (response) {
                return response
            }
        }
        return responses.general(output)
    }
}

function logVariants(actions) {
    // console.log('---------- PRERESOLVE ---------')
    // let n = 0
    // actions.forEach((v) => {
    //     n++
    //     console.log(n)
    //     let result = '{\n'
    //     result += JSON.stringify(v.type, null, 4) + ', \n"object": {\n    "id": '
    //     // result += JSON.stringify(v.type, null, 4) + ', \n"object": {\n    "type": '
    //     if (!v.object) {
    //         console.log(result)
    //         return
    //     }
    //     result += JSON.stringify(v.object.id, null, 4) + ', \n    "result":'
    //     result += JSON.stringify(v.object.result, null, 4) + ','
    //     // result += JSON.stringify(v.object.word, null, 4) + ','
    //     if (!v.object.object) {
    //         console.log(result)
    //         return
    //     }
    //     result += ' \n    "object":' + JSON.stringify(v.object.object, null, 8).slice(0, -2) + '\n    }, \n}'
    //     console.log(result)
    // })
    // console.log(JSON.stringify(actions, null, 4))

    let n = 0
    actions.forEach((v) => {
        n++
        console.log(n)
        let result = '{\n'
        result += JSON.stringify(v.type, null, 4) + ', \n"object": {\n    '
        if (!v.object) {
            console.log(result)
            return
        }
        if (v.object.id) {
            result += '"id": '
            result += JSON.stringify(v.object.id, null, 4) + ', \n    "result":'
            result += JSON.stringify(v.object.result, null, 4) + ', \n    "word":'
            result += JSON.stringify(v.object.word, null, 4) + ','
        } else {
            result += '"type": '
            result += JSON.stringify(v.object.type, null, 4) + ', \n    "word":'
            result += JSON.stringify(v.object.word, null, 4) + ','
        }
        if (!v.object.object) {
            console.log(result)
            return
        }
        result += ' \n    "object":' + JSON.stringify(v.object.object, null, 8).slice(0, -2) + '\n    }, \n}'
        console.log(result)
    })
}

