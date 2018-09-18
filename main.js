// const {friendlyParse: parse} = require('./parser')
// const {friendlyInterpret: interpret} = require('./interpreter')
// const bifurcate = require('./bifurcate')
const nearley = require('nearley')
let grammar = require('./knights-of')
grammar = nearley.Grammar.fromCompiled(grammar)
const resolve = require('./resolve')
const {ResolveError} = require('./resolve-helpers')

// const formatResponse = require('./responses')
// const {
//     begin: Begin,
//     // go: Go,
// } = require('./actions')
const actionTypes = require('./actions')
/* eslint-disable require-jsdoc */
const {systems, player, processes} = require('./setup')
// let debugMode = null
// const debugTest = /^\s*debug:\s*(.*)/i
// const {logAction} = require('./helpers')

// let gameStarted = false

module.exports = adventure
function adventure(line) {
    if (!adventure.silent) {
        console.log('')
        console.log('################################')
        console.log('########### NEW INPUT ##########')
    }

    // if (debugMode === null) {
    //     console.log(adventure.debug)
    //     debugMode = debugTest.test(line)
    //     if (debugMode) {
    //         line = line.match(debugTest)[1]
    //     }
    // }
    // Create a Parser object from our grammar
    const parser = new nearley.Parser(grammar)
    // Lex and parse.
    try {
        parser.feed(line)
    } catch (error) {
        // console.log(JSON.stringify(error, null, 4))
        // console.log(error.offset)
        // if (error.token) {
        console.log(error.code)
        throw error
        return formatResponse(error)
        // }
    }

    if (parser.results.length > 1) {
        throw new Error('Can\'t parse reliably')
    }

    let actions = parser.results[0].map((verb) => {
        // console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&')
        // console.log(verb)
        // console.log(JSON.stringify(verb, null, 4))
        if (verb.type !== 'verb') {
            return new ResolveError('Noun only.', 'acn1')
        }

        const constructor = actionTypes[verb.value]
        if (!constructor) {
            throw new ResolveError('No such action', 'act1')
        }
        const action = !verb.modifiers.length ? new constructor(verb) : constructor.delegate(verb)
        action.entity = player
        return action
    })

    resolve(actions)
    // console.log(actions)
    if (adventure.debugMode === 'resolve') {
        // console.log(actions)
        // console.log('*')
        // console.log('*')
        return actions
    }
    // console.log(JSON.stringify(actions, null, 4))
    return

    // // Parser errors.
    // if (parseTree instanceof Error) {
    //     return formatResponse(parseTree)
    // }
    // Remove empty nodes
    // parseTree = parseTree.filter((node) => node)
    // console.log('*********** PARSE TREE **********')
    // console.log(JSON.stringify(parseTree, null, 1))

    // if (!parseTree.length && gameStarted) {
    //     return formatResponse(parseTree)
    // }

    // ###########
    // Interpret actions
    // let actions = interpret(parseTree)
    // // Filter null actions/nodes.
    // let filteredActions = []
    // for (let i = 0; i < actions.length; i++) {
    //     let action = actions[i]
    //     console.log('*********** ACTION **********')
    //     logAction(action)
    //     console.log('')
    //     if (action instanceof Error) {
    //         return formatResponse(action)
    //     }
    //     filteredActions.push(action)
    // }

    // actions = filteredActions

    // if (!gameStarted) {
    //     beginGame(actions)
    // }

    // // Construct response from executing actions.
    // let output = ''

    // while (actions.length) {
    //     let action = actions.shift()
    //     console.log('*********** EXECUTE MAIN **********')

    //     // Add properties to action.
    //     action.entity = {
    //         id: player,
    //     }
    //     action.initiative = 2

    //     if (action.object) {
    //         //  If the object is a bifurcation or need preresolution get all variants of this action.
    //         let variants = bifurcate(action)

    //         if (variants.length) {
    //             // Add the new variant actions to the list.
    //             actions = variants.concat(actions)
    //             // Set the current action to the first one
    //             action = actions.shift()
    //         }
    //     }

    //     output += execute(action)
    // }
    // return output + '\n'
}

function execute(action) {

    // Format a simple response.
    let response = ''
    // All simultaneous actions by all actors.
    let actions = [action]

    // Run all processes
    for (let i = 0; i < processes.length; i++) {
        let processActions = processes[i].update(action)
        // If any actions were generated add them to the list.
        if (typeof processActions !== 'undefined') {
            actions = actions.concat(processActions)
        }
    }

    // Sort actions by initiative.
    actions = actions.sort(byInitiative)

    for (let i = 0; i < actions.length; i++) {
        const action = actions[i]

        // Do each step listed by that action.
        let procedure = action.procedure
        let j = 0
        do {
            if (!action.live) {
                break
            }
            systems[procedure[j]].update(action)
            j++
        } while (j < procedure.length)

        // TODO: Adjust this to account for the acting entity.
        let output = ` \n${formatResponse(action)}`

        if (!output) {
            output += console.log(JSON.stringify(action, null, 4))
        }
        response += output

    }
    console.log('\n \n')
    return response
}

function beginGame(actions) {
    gameStarted = true

    if (!actions.length || actions[0].type !== 'begin') {
        console.log(`It doesn't look like you've begun yet. Lets do that.`)
        // lookAction.object = {
        //     word: 'room',
        //     descriptors: [],
        // }
        // actions.unshift(lookAction)

        // goAction.object = {
        //     id: 10,
        //     // word: 'room',
        //     descriptors: [],
        // }
        // actions.unshift(goAction)

        // actions.unshift(beginningAction)
        let beginningAction = new Begin('begin')
        actions.unshift(beginningAction)
    }

}

function byInitiative(a, b) {
    if (a.initiative < b.initiative) {
        return -1
    }
    if (b.initiative < a.initiative) {
        return 1
    }
    return 0
}

