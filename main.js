const {friendlyParse: parse} = require('./parser')
const {friendlyInterpret: interpret} = require('./interpreter')
const bifurcate = require('./bifurcate')
const formatResponse = require('./format-response')
const {
    begin: Begin,
    // go: Go,
} = require('./actions')
/* eslint-disable require-jsdoc */
const {systems, player, processes} = require('./setup')
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
        beginGame(actions)
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
        action.initiative = 2

        if (action.object) {
            //  If the object is a bifurcation or need preresolution get all variants of this action.
            let variants = bifurcate(action)
            if (variants.length) {
                // Add the new variant actions to the list.
                actions = variants.concat(actions)
                // Set the current action to the first one
                action = actions.shift()
            }
        }

        output += execute(action)
    }
    return output + '\n'
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

