const {entityFactory, entityManager} = require('./managers.js')
const {friendlyParse: parse} = require('./parser.js')
const {friendlyInterpret: interpret} = require('./interpreter')
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

class InterpretorError extends Error {
}

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

entityFactory.registerConstructor('container', ({parent, contents = [], open, names, descriptors} = {}) => {
    let container = entityManager.createEntity()
    entityManager.addComponent(new LocationComponent(parent), container)
    entityManager.addComponent(new ObjectDescriptorComponent(names, descriptors), container)
    entityManager.addComponent(new ContainerComponent(contents, open), container)
    return container
})

// Register a factory method for creating entities
entityFactory.registerConstructor('thing', ({parent, names, descriptors} = {}) => {
    let thing = entityManager.createEntity()
    entityManager.addComponent(new LocationComponent(parent), thing)
    entityManager.addComponent(new ObjectDescriptorComponent(names, descriptors), thing)
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
        names: ['THING', 'thing', 'thign'],
    })
    entityManager.getComponent('ContainerComponent', player).setContents([thing])

    let crate = entityFactory.createContainer({
        parent: room,
        open: false,
        names: ['crate'],
    })
    stuff.push(crate)

    let rock = entityFactory.createThing({
        parent: crate,
        names: ['rock'],
    })
    entityManager.getComponent('ContainerComponent', crate).setContents([rock])

    // stuff.push(rock)
    let screw = entityFactory.createThing({
        parent: room,
        names: ['screw', 'fixture'],
        descriptors: ['red', 'rusty'],
    })
    stuff.push(screw)
    let bolt = entityFactory.createThing({
        parent: room,
        names: ['bolt', 'fixture'],
        descriptors: ['red'],
    })
    stuff.push(bolt)

    entityManager.getComponent('ContainerComponent', room).setContents(stuff)

    let box = entityFactory.createContainer({
        names: ['box'],
        open: false,
    })

    let wrench = entityFactory.createThing({
        parent: box,
        names: ['wrench'],
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
}

module.exports = function(line) {
    // Lex and parse.
    let parseTree = parse(line)
    console.log('*********** PARSE TREE **********')
    console.log(JSON.stringify(parseTree, null, 1))

    // Parser errors.
    if (parseTree instanceof Error) {
        return parseTree.toString()
    }

    // Interpret actions
    let actions = interpret(parseTree)
    actions.filter((action) => action)
    for (let action of actions) {
        console.log('*********** ACTION **********')
        console.log(JSON.stringify(action, null, 4))
        if (action instanceof Error) {
            return action.toString()
        }
    }

    // Construct response from executing actions.
    let output = ''
    actions.forEach((action) => {
        let response
        try {
            response = execute(action)
        } catch (error) {
            console.log(error)
            // if (!(error instanceof InterpretorError)) {
            //     throw error
            // }
            response = error.toString()
        }
        output += response
    })

    if (!output.length) {
        output = 'Beg your pardon?'
    }

    return output
}

function execute(action) {

    //  If the action is a bifurcation
    if (action.object && action.object.type === 'bifurcation') {
        let actionBase = action
        let actions = []
        let left = action.object.left
        let right = action.object.right
        let newAction

        newAction = Object.create(actionBase)
        newAction.object = right
        actions.push(newAction)

        while (left.type === 'bifurcation') {
            right = left.right
            newAction = Object.create(actionBase)
            newAction.object = right
            actions.push(newAction)
            left = left.left
        }
        // TODO: fix ordering of commands here

        newAction = Object.create(actionBase)
        newAction.object = left
        actions.push(newAction)

        let response = ''

        actions.reverse()

        console.log(actions)

        return actions.reduce((response, action) => {
            try {
                response += execute(action)
            } catch (error) {
                // if (!(error instanceof InterpretorError)) {
                //     throw error
                // }
                response += error.toString()
            }
            return response
        },
        response)
    }

    action.entity = {
        id: player,
    }
    action.steps = new Map()
    action.live = true

    actionOutputChannel.events.push(action)

    systems.forEach((system) => system.update())

    let res = {}
    actionOutputChannel.events.forEach((action) => {
        // let stepsArray = [...action.steps]
        res.type = action.type
        res.object = action.object
        res.live = action.live
        res.steps = {}
        action.steps.forEach((step, name) => {
            res.steps[name] = step.success || step.reason
        })

        // let stepsString = JSON.stringify(stepsArray)
    })

    res = JSON.stringify(res, null, 4)

    // let res = JSON.stringify(actionOutputChannel.events, null, 1) + '\n'

    actionOutputChannel.events = []

    return res
}

