const {entityFactory, entityManager} = require('./managers.js')
const ResolverSystem = require('./systems/resolver-system')
const LocatorSystem = require('./systems/locator-system')
const GetterSystem = require('./systems/getter-system')
const DroppingSystem = require('./systems/dropping-system')
const InventorySystem = require('./systems/inventory-system')
const OpenSystem = require('./systems/open-system')
const CloseSystem = require('./systems/close-system')
const MovementSystem = require('./systems/movement-system')
const BeginSystem = require('./systems/begin-system')
const LookSystem = require('./systems/look-system')

const GeneralInputProcess = require('./processes/general-input-process')

const {
    Descriptors,
    Container,
    Location,
    Appearance,
    ObjectProperties,
    Area,
} = require('./components.js')

let resolverSystem = new ResolverSystem()
let locatorSystem = new LocatorSystem()
let getterSystem = new GetterSystem()
let droppingSystem = new DroppingSystem()
let inventorySystem = new InventorySystem()
let openSystem = new OpenSystem()
let closeSystem = new CloseSystem()
let movementSystem = new MovementSystem()
let beginSystem = new BeginSystem()
let lookSystem = new LookSystem()

// resolverSystem.mutate(actionOutputChannel)
// locatorSystem.mutate(actionOutputChannel)
// getterSystem.mutate(actionOutputChannel)
// droppingSystem.mutate(actionOutputChannel)
// inventorySystem.mutate(actionOutputChannel)
// openSystem.mutate(actionOutputChannel)

// let systems = [
//     resolverSystem,
//     locatorSystem,
//     openSystem,
//     getterSystem,
//     droppingSystem,
//     inventorySystem,
// ]

let systems = {
    resolve: resolverSystem,
    locate: locatorSystem,
    open: openSystem,
    close: closeSystem,
    get: getterSystem,
    drop: droppingSystem,
    inventory: inventorySystem,
    move: movementSystem,
    begin: beginSystem,
    look: lookSystem,
}

const generalActionQueue = []
let generalInputProcess = new GeneralInputProcess(generalActionQueue)

let processes = [
    generalInputProcess,
]

// beginningProcess.linkToProcess(generalInputProcess,)

// TODO: pronouns
// TODO: disambiguation
// TODO: auto subject assertion
// TODO: ALL, EXCEPT
entityFactory.registerConstructor('room', (props = {}) => {
    let {
        parent,
        contents = [],
        open,
        appearance,
        visible = true,
        transparent = false,
        visited,
        title,
    } = props
    let room = entityManager.createEntity()
    entityManager.addComponent(new Appearance(appearance), room)
    entityManager.addComponent(new Location(parent), room)
    entityManager.addComponent(new Descriptors(['room']), room)
    entityManager.addComponent(new Container(contents, open), room)
    entityManager.addComponent(new ObjectProperties(visible, transparent), room)
    entityManager.addComponent(new Area(title, visited), room)
    return room
})

entityFactory.registerConstructor('container', (props = {}) => {
    let {
        parent,
        contents = [],
        open,
        labels,
        descriptors,
        appearance,
        visible = true,
        transparent = false,
    } = props
    let container = entityManager.createEntity()
    entityManager.addComponent(new Appearance(appearance), container)
    entityManager.addComponent(new Location(parent), container)
    entityManager.addComponent(new Descriptors(labels, descriptors), container)
    entityManager.addComponent(new Container(contents, open), container)
    entityManager.addComponent(new ObjectProperties(visible, transparent), container)
    return container
})

// Register a factory method for creating entities
entityFactory.registerConstructor('thing', (props = {}) => {
    let {
        parent,
        labels,
        descriptors,
        appearance,
        visible = true,
        transparent = false,
    } = props
    let thing = entityManager.createEntity()
    entityManager.addComponent(new Appearance(appearance), thing)
    entityManager.addComponent(new Location(parent), thing)
    entityManager.addComponent(new Descriptors(labels, descriptors), thing)
    entityManager.addComponent(new ObjectProperties(visible, transparent), thing)
    return thing
})

entityFactory.registerConstructor('player', (props = {}) => {
    let {
        parent,
        contents = [],
        open,
        appearance,
        visible = true,
        transparent = false,
    } = props
    let player = entityManager.createEntity()
    entityManager.addComponent(new Appearance(appearance), player)
    entityManager.addComponent(new Location(parent), player)
    entityManager.addComponent(new Descriptors(['self', 'me', 'myself'], []), player)
    entityManager.addComponent(new Container(contents, open), player)
    entityManager.addComponent(new ObjectProperties(visible, transparent), player)

    return player
})

let player

if (entityManager.lowestFreeId === 10) {
    // Great! This is where you create an entity 🤖
    let room = entityFactory.createRoom({
        title: 'Testing Chamber 00178',
        appearance: 'A bare and forgettable testing room.',
    })

    let stuff = []

    player = entityFactory.createPlayer({
        parent: room,
        appearance: 'You.',
    })
    stuff.push(player)

    entityManager.getComponent('Area', room).setVisited([player])

    let thing = entityFactory.createThing({
        parent: player,
        labels: ['THING', 'thing', 'thign'],
        appearance: 'An amorphous blob of greyish goop.',
    })
    entityManager.getComponent('Container', player).setContents([thing])

    let crate = entityFactory.createContainer({
        parent: room,
        open: false,
        labels: ['crate'],
        appearance: 'A weathered wooden crate.',
    })
    stuff.push(crate)

    let rock = entityFactory.createThing({
        parent: crate,
        labels: ['rock'],
        appearance: 'It\'s just a stone.',
    })
    // stuff.push(rock)

    let screw = entityFactory.createThing({
        parent: crate,
        labels: ['screw', 'fixture'],
        descriptors: ['red', 'rusty'],
        appearance: 'A rusty screw with flaking red paint on the head.',
    })
    // stuff.push(screw)
    entityManager.getComponent('Container', crate).setContents([rock, screw])

    let bolt = entityFactory.createThing({
        parent: room,
        labels: ['bolt', 'fixture'],
        descriptors: ['red'],
        appearance: 'A bolt with chpped red paint on the head.',
    })
    stuff.push(bolt)

    entityManager.getComponent('Container', room).setContents(stuff)

    let box = entityFactory.createContainer({
        labels: ['box'],
        open: false,
        appearance: 'A small vaguely mildewed shoe box.',
    })

    let wrench = entityFactory.createThing({
        parent: box,
        labels: ['wrench'],
        appearance: 'A wrench shaped like a gibbous moon.',
    })
    entityManager.getComponent('Container', box).setContents([wrench])

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
    console.log('')
    console.log('~~       reset       ~~')
    // console.log('skipped entities')
    // console.log('player: 11')
    player = 11
    // beginningProcess.setStartingPoint(10)
    //
    //     let entities = entityManager.getEntitiesWithComponent('Descriptors')
    //     console.log(entities)
    //     entities.forEach((entity) => {
    //         console.log(entityManager.getComponent('Descriptors', entity))
    //         //
    //     })

    //     entities = entityManager.getEntitiesWithComponent('Container')
    //     entities.forEach((entity) => {
    //         console.log(entityManager.getComponent('Container', entity))
    //     })

    //     entities = entityManager.getEntitiesWithComponent('Location')
    //     entities.forEach((entity) => {
    //         console.log(entityManager.getComponent('Location', entity))
    // //
    //     })
}

module.exports = {
    systems,
    player,
    generalInputProcess,
    processes,
}
