const {System} = require('rubricjs')
const {entityManager: em} = require('../managers.js')

class GetterSystem extends System {
    constructor() {
        super()
        this.requiredComponents = ['ContainerComponent']
        this.acceptedActions = ['get']
    }

    update() {
        this.channel.events.forEach((action) => {

            if (!this.acceptedActions.includes(action.action) || !action.live) {
                return
            }

            if (!action.object.accessible) {
                action.steps.set('get', {
                    success: false,
                    // Consider making an Enum for this
                    reason: 'Inaccessible.',
                })
                action.live = false
                console.log(action)
                return
            }

            console.log('-------- GET --------')

            let entity = action.entity.id

            if (action.object.locationParent === entity) {
                action.steps.set('get', {
                    success: false,
                    // Consider making an Enum for this
                    reason: 'Already Have.',
                })
                action.live = false
                console.log(action)
                return
            }

            let object = action.object.id

            let container = em.getComponent('ContainerComponent', entity)
            let inventory = container.getContents()
            let objectLocation = em.getComponent('LocationComponent', object)
            let parent = objectLocation.getParent()
            let parentContainer = em.getComponent('ContainerComponent', parent)
            let parentInventory = parentContainer.getContents()

            let hadObject = parentInventory.delete(object)
            // If the parent's inventory didn't match the record of the object throw.
            if (!hadObject) {
                throw new Error(`Container "${container}" didn't have object "${object}".`)
            }
            inventory.add(object)

            container.setContents(inventory)
            parentContainer.setContents(parentInventory)
            objectLocation.setParent(entity)

            console.log(em.getComponent('ContainerComponent', entity).getContents())

            action.steps.set('get', {
                success: true,
            })
            console.log(action)
        })
    }

    mutate(channel) {
        this.channel = channel
    }
}

module.exports = GetterSystem
