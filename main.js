const {systemManager, entityFactory, entityManager} = require('./managers.js')

// const {
//     RenderComponent,
//     SpatialComponent,
//     PlayerComponent,
//     MobileComponent,
//     CollisionComponent,
// } = require('./components/components.js')

// Register a factory method for creating entities
entityFactory.registerConstructor('thing', (descriptors) => {
    var thing = entityManager.createEntity()
    // This gives the entity a position
    // throw descriptors
    entityManager.addComponent(new ObjectDescriptorComponent(descriptors), thing)
    return thing
})

// Great! This is where you create an entity 🤖
entityFactory.createThing(['rock'])
// entityFactory.create('thing')(['thing'])
