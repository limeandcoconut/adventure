// const {friendlyParse: parse} = require('./parser')
// const {friendlyInterpret: interpret} = require('./interpreter')
// const bifurcate = require('./bifurcate')
const nearley = require('nearley')
let grammar = require('./knights-of')
grammar = nearley.Grammar.fromCompiled(grammar)
const resolve = require('./resolve')
const {ResolveError} = require('./resolve-helpers')

const formatResponse = require('./responses')
const {
    begin: Begin,
    // go: Go,
} = require('./actions')
const actionTypes = require('./actions')
/* eslint-disable require-jsdoc */
const {systems, player, processes} = require('./setup')
let gameStarted = false
adventure.debugMode = {}
function log() {
    if (adventure.silent) {
        return
    }
    console.log(...arguments)
}

// function debug() {
//     console.log(...arguments)
// }

module.exports = adventure
function adventure(line) {
    log('')
    log('################################')
    log('########### NEW INPUT ##########')

    // Create a Parser object from our grammar
    const parser = new nearley.Parser(grammar)
    // Lex and parse.
    try {
        parser.feed(line)
    } catch (error) {
        error.code = codify(error)
        // log(error.code)
        // throw error
        return respond(error)
    }

    if (parser.results.length > 1) {
        throw new Error('Can\'t parse reliably. This is not an expected error.')
    }

    let actions = parser.results[0].map(createAction)

    // Resolve objects on actions
    try {
        resolve(actions)
    } catch (error) {
        log(error.code)
        // throw error
        return respond(error)
    }

    if (!gameStarted && !adventure.debugMode.begun) {
        beginGame(actions)
    }

    if (adventure.debugMode.resolve) {
        return actions
    }

    // Construct response from executing actions.
    let output = ''

    while (actions.length) {
        let action = actions.shift()
        log('*********** EXECUTE MAIN **********')

        // Split actions.
        if (action.object && action.object.length) {
            const objects = action.object
            let newAction
            while (objects.length) {
                if (newAction) {
                    actions.unshift(newAction)
                }
                newAction = action.clone()
                newAction.object = objects.shift()
            }
            action = newAction
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
        // if (adventure.debugMode.codes) {
        //     output
        // } else {
        let output = ` \n${respond(action)}`
        // }

        if (!output || adventure.debugMode.codes) {
            let {type, steps, info, success, fault, reporter} = action
            output = {
                type,
                steps,
                info,
                success,
                fault,
                reporter,
            }
            output = JSON.stringify(output, null, 4) + '\n'
        }
        response += output
    }
    log('\n \n')
    return response
}

// These are ordered, most to least specific.
const codeTests = [
    [/unexpected\sword\stoken/i, 'lis2'],
    [/unexpected.*?token/i, 'lis3'],
    [/invalid\ssyntax/i, 'lis1'],
    // [/invalid\s+syntax.*(?!unexpected\s+token)/i, 'lis1'],
]
function codify({message}) {
    for (let i = 0; i < codeTests.length; i++) {
        const [test, code] = codeTests[i]
        if (test.test(message)) {
            console.log(message)
            return code
        }
    }
}

function beginGame(actions) {
    gameStarted = true

    if (!actions.length || actions[0].type !== 'begin') {
        log(`It doesn't look like you've begun yet. Lets do that.`)
        let beginningAction = new Begin({word: 'begin'})
        beginningAction.entity = player
        beginningAction.initiative = player.actor.initiative
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

function createAction(verb) {
    if (verb.type !== 'verb') {
        return new ResolveError('Noun only.', 'acn1')
    }

    const constructor = actionTypes[verb.value]
    if (!constructor) {
        throw new ResolveError('No such action', 'act1')
    }
    const action = !verb.modifiers.length ? new constructor(verb) : constructor.delegate(verb)
    action.entity = player
    action.initiative = player.actor.initiative
    if (adventure.debugMode.verbs) {
        action.verb = verb
    }
    return action
}

function respond(output) {
    if (adventure.debugMode.codes) {
        return output
    }
    return formatResponse(output)
}
