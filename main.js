const {entityFactory, entityManager} = require('./managers.js')
const {friendlyParse: parse, parser, lexer} = require('./parser.js')
const {friendlyInterpret: interpret} = require('./interpreter')
const {LexError, ParseError} = require('parser')
const ResolverSystem = require('./systems/resolver-system')
const LocatorSystem = require('./systems/locator-system')
const GetterSystem = require('./systems/getter-system')
const DroppingSystem = require('./systems/dropping-system')
const InventorySystem = require('./systems/inventory-system')
/* eslint-disable require-jsdoc */
const {
    ObjectDescriptorComponent,
    ContainerComponent,
    LocationComponent,
} = require('./components.js')

let actionOutputChannel = {events: []}

let resolverSystem = new ResolverSystem()
let locatorSystem = new LocatorSystem()
let getterSystem = new GetterSystem()
let droppingSystem = new DroppingSystem()
let inventorySystem = new InventorySystem()

resolverSystem.mutate(actionOutputChannel)
locatorSystem.mutate(actionOutputChannel)
getterSystem.mutate(actionOutputChannel)
droppingSystem.mutate(actionOutputChannel)
inventorySystem.mutate(actionOutputChannel)

let systems = [
    resolverSystem,
    locatorSystem,
    getterSystem,
    droppingSystem,
    inventorySystem,
]

// TODO: pronouns
// TODO: disambiguation
// TODO: auto subject assertion
// TODO: ALL, EXCEPT
entityFactory.registerConstructor('room', ({parent, contents = [], open} = {}) => {
    let room = entityManager.createEntity()
    entityManager.addComponent(new LocationComponent(parent), room)
    entityManager.addComponent(new ContainerComponent(contents, open), room)
    return room
})

entityFactory.registerConstructor('container', ({parent, contents = [], open, labels, descriptors} = {}) => {
    let container = entityManager.createEntity()
    entityManager.addComponent(new LocationComponent(parent), container)
    entityManager.addComponent(new ObjectDescriptorComponent(labels, descriptors), container)
    entityManager.addComponent(new ContainerComponent(contents, open), container)
    return container
})

// Register a factory method for creating entities
entityFactory.registerConstructor('thing', ({parent, labels, descriptors} = {}) => {
    let thing = entityManager.createEntity()
    entityManager.addComponent(new LocationComponent(parent), thing)
    entityManager.addComponent(new ObjectDescriptorComponent(labels, descriptors), thing)
    return thing
})

entityFactory.registerConstructor('player', ({parent, contents = [], open} = {}) => {
    let player = entityManager.createEntity()
    entityManager.addComponent(new LocationComponent(parent), player)
    entityManager.addComponent(new ObjectDescriptorComponent(['self', 'me', 'myself'], []), player)
    entityManager.addComponent(new ContainerComponent(contents, open), player)
    return player
})

let player

if (entityManager.lowestFreeId === 10) {
    // Great! This is where you create an entity 🤖
    let room = entityFactory.createRoom()

    let stuff = []

    player = entityFactory.createPlayer({
        parent: room,
    })
    stuff.push(player)

    let thing = entityFactory.createThing({
        parent: player,
        labels: ['THING', 'thing', 'thign'],
    })
    entityManager.getComponent('ContainerComponent', player).setContents([thing])

    let crate = entityFactory.createContainer({
        parent: room,
        open: false,
        labels: ['crate'],
    })
    stuff.push(crate)

    let rock = entityFactory.createThing({
        parent: crate,
        labels: ['rock'],
    })
    entityManager.getComponent('ContainerComponent', crate).setContents([rock])

    // stuff.push(rock)
    let screw = entityFactory.createThing({
        parent: room,
        labels: ['screw', 'fixture'],
        descriptors: ['red', 'rusty'],
    })
    stuff.push(screw)
    let bolt = entityFactory.createThing({
        parent: room,
        labels: ['bolt', 'fixture'],
        descriptors: ['red'],
    })
    stuff.push(bolt)

    entityManager.getComponent('ContainerComponent', room).setContents(stuff)

    let box = entityFactory.createContainer({
        labels: ['box'],
        open: false,
    })

    let wrench = entityFactory.createThing({
        parent: box,
        labels: ['wrench'],
    })
    entityManager.getComponent('ContainerComponent', box).setContents([wrench])

    console.log(JSON.stringify({
        room,
        player,
        thing,
        rock,
        screw,
        bolt,
        box,
        crate,
    }, null, 4))

    console.log(JSON.stringify({
        player: ['thing'],
        room: [
            'player',
            // 'rock',
            'screw',
            'bolt',
            'crate',
        ],
        crate: [
            'rock',
        ],
        box: [
            'wrench',
        ],
        offscreen: [
            'box',
            'room',
        ],
    }, null, 4))

} else {
    console.log('skipped entities')
    console.log('player: 11')
    player = 11
    //
//     let entities = entityManager.getEntitiesWithComponent('ObjectDescriptorComponent')
//     console.log(entities)
//     entities.forEach((entity) => {
//         console.log(entityManager.getComponent('ObjectDescriptorComponent', entity))
//         //
//     })

//     entities = entityManager.getEntitiesWithComponent('ContainerComponent')
//     entities.forEach((entity) => {
//         console.log(entityManager.getComponent('ContainerComponent', entity))
//     })

//     entities = entityManager.getEntitiesWithComponent('LocationComponent')
//     entities.forEach((entity) => {
//         console.log(entityManager.getComponent('LocationComponent', entity))
// //
//     })
}

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
                return `You don't have antying`
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
        get({reason, container}) {
            if (/have/i.test(reason)) {
                return 'You already have that'
            }
            if (/inaccessible/i.test(reason)) {
                let name = entityManager.getComponent('ObjectDescriptorComponent', container).getName()
                return `The ${name} is closed.`
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
