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
const PutSystem = require('./systems/put-system')

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
let putSystem = new PutSystem()

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
    put: putSystem,
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
        volume,
        maxLoad,
        freeVolume,
        contents = [],
        open,
        appearance,
        size,
        baseWeight,
        weight,
        visible = true,
        transparent = false,
        visited,
        title,
        doors,
    } = props

    console.log(volume)
    let room = entityManager.createEntity()
    entityManager.addComponent(new Appearance(appearance), room)
    entityManager.addComponent(new Location(parent), room)
    entityManager.addComponent(new Descriptors(['room']), room)
    entityManager.addComponent(new Container({volume, maxLoad, freeVolume, contents, open}), room)
    entityManager.addComponent(new ObjectProperties({size, baseWeight, weight, visible, transparent}), room)
    entityManager.addComponent(new Area(title, visited, doors), room)
    return room
})

entityFactory.registerConstructor('container', (props = {}) => {
    let {
        parent,
        volume,
        maxLoad,
        freeVolume,
        contents = [],
        open,
        labels,
        descriptors,
        appearance,
        size,
        baseWeight,
        weight,
        visible = true,
        transparent = false,
    } = props
    let container = entityManager.createEntity()
    entityManager.addComponent(new Appearance(appearance), container)
    entityManager.addComponent(new Location(parent), container)
    entityManager.addComponent(new Descriptors(labels, descriptors), container)
    entityManager.addComponent(new Container({volume, maxLoad, freeVolume, contents, open}), container)
    entityManager.addComponent(new ObjectProperties({size, baseWeight, weight, visible, transparent}), container)
    return container
})

// Register a factory method for creating entities
entityFactory.registerConstructor('thing', (props = {}) => {
    let {
        parent,
        labels,
        descriptors,
        appearance,
        size,
        baseWeight,
        weight,
        visible = true,
        transparent = false,
    } = props
    let thing = entityManager.createEntity()
    entityManager.addComponent(new Appearance(appearance), thing)
    entityManager.addComponent(new Location(parent), thing)
    entityManager.addComponent(new Descriptors(labels, descriptors), thing)
    entityManager.addComponent(new ObjectProperties({size, baseWeight, weight, visible, transparent}), thing)
    return thing
})

entityFactory.registerConstructor('player', (props = {}) => {
    let {
        parent,
        volume,
        maxLoad,
        freeVolume,
        contents = [],
        open,
        appearance,
        size,
        baseWeight,
        weight,
        visible = true,
        transparent = false,
    } = props
    let player = entityManager.createEntity()
    entityManager.addComponent(new Appearance(appearance), player)
    entityManager.addComponent(new Location(parent), player)
    entityManager.addComponent(new Descriptors(['self', 'me', 'myself'], []), player)
    entityManager.addComponent(new Container({volume, maxLoad, freeVolume, contents, open}), player)
    entityManager.addComponent(new ObjectProperties({size, baseWeight, weight, visible, transparent}), player)

    return player
})

let player

if (entityManager.lowestFreeId === 10) {
    // Great! This is where you create an entity 🤖
    let testingChamber00178 = entityFactory.createRoom({
        title: 'Testing Chamber 00178',
        appearance: 'A bare and forgettable offices space.',
        volume: Number.POSITIVE_INFINITY,
        maxLoad: Number.POSITIVE_INFINITY,
        size: Number.POSITIVE_INFINITY,
        baseWeight: Number.POSITIVE_INFINITY,
    })

    let anotherRoom = entityFactory.createRoom({
        title: 'Another Room',
        appearance: 'This all looks unbearably banal.',
        doors: {
            s: testingChamber00178,
        },
        volume: Number.POSITIVE_INFINITY,
        maxLoad: Number.POSITIVE_INFINITY,
        size: Number.POSITIVE_INFINITY,
        baseWeight: Number.POSITIVE_INFINITY,
    })

    player = entityFactory.createPlayer({
        parent: testingChamber00178,
        appearance: 'You.',
        volume: 10,
        freeVolume: 9,
        maxLoad: 10,
        // load: 1,
        size: 10,
        baseWeight: 10,
        weight: 11,
    })

    let thing = entityFactory.createThing({
        parent: player,
        labels: ['thing', 'THING', 'thign'],
        appearance: 'An amorphous blob of greyish goop.',
        size: 1,
        baseWeight: 1,
    })

    let crate = entityFactory.createContainer({
        parent: testingChamber00178,
        open: false,
        labels: ['crate'],
        appearance: 'A weathered wooden crate.',
        volume: 4,
        freeVolume: 2,
        maxLoad: 6,
        // load: 2,
        size: 3,
        baseWeight: 3,
        weight: 5,
    })

    let rock = entityFactory.createThing({
        parent: crate,
        labels: ['rock'],
        appearance: 'It\'s just a stone.',
        size: 1,
        baseWeight: 1,
        // weight: 1,
    })

    let screw = entityFactory.createThing({
        parent: crate,
        labels: ['screw', 'fixture'],
        descriptors: ['red', 'rusty'],
        appearance: 'A rusty screw with flaking red paint on the head.',
        size: 1,
        baseWeight: 1,
        // weight: 1,
    })

    let bolt = entityFactory.createThing({
        parent: testingChamber00178,
        labels: ['bolt', 'fixture'],
        descriptors: ['red'],
        appearance: 'A bolt with chpped red paint on the head.',
        size: 1,
        baseWeight: 1,
        // weight: 1,
    })

    let box = entityFactory.createContainer({
        parent: crate,
        labels: ['box'],
        open: true,
        appearance: 'A small vaguely mildewed shoe box.',
        volume: 2,
        freeVolume: 1,
        maxLoad: 2,
        // load: 2,
        size: 2,
        baseWeight: 1,
        weight: 2,
    })

    let wrench = entityFactory.createThing({
        parent: box,
        labels: ['wrench'],
        appearance: 'A wrench shaped like a gibbous moon.',
        size: 1,
        baseWeight: 1,
        // weight: 2,
    })

    let testingArea = entityManager.getComponent('Area', testingChamber00178)
    testingArea.setVisited([player])
    testingArea.setDoors({
        n: anotherRoom,
    })

    entityManager.getComponent('Container', player).setContents([thing])
    entityManager.getComponent('Container', crate).setContents([rock, screw, box])
    entityManager.getComponent('Container', box).setContents([wrench])
    entityManager.getComponent('Container', testingChamber00178).setContents([player, bolt, crate])
    // entityManager.getComponent('Container', anotherRoom).setContents([])

    console.log(JSON.stringify({
        testingChamber00178,
        anotherRoom,
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
        testingChamber00178: [
            'player',
            // 'rock',
            // 'screw',
            'bolt',
            'crate',
        ],
        anotherRoom: [
            'box',
        ],
        crate: [
            'rock',
            'screw,',
        ],
        box: [
            'wrench',
        ],
        offscreen: [
            'testingChamber00178',
            'anotherRoom',
        ],
    }, null, 4))

} else {
    console.log('')
    console.log('~~       reset       ~~')
    // console.log('skipped entities')
    // console.log('player: 11')
    player = 12
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
