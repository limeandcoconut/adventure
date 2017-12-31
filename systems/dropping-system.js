const {System} = require('rubricjs')
const {entityManager: em} = require('../managers.js')

class DroppingSystem extends System {
    constructor() {
        super()
        this.requiredComponents = ['ContainerComponent']
        this.acceptedActions = ['drop']
    }

    update() {
        this.channel.events.forEach((action) => {

            if (!this.acceptedActions.includes(action.type) || !action.live) {
                return
            }

            let entity = action.entity.id
            if (action.object.locationParent !== entity) {
                action.steps.set('drop', {
                    success: false,
                    // Consider making an Enum for this
                    reason: 'Don\'t have it.',
                })
                action.live = false
                console.log(action)
                return
            }

            console.log('-------- DROP --------')

            let object = action.object.id

            let container = em.getComponent('ContainerComponent', entity)
            let inventory = container.getContents()
            let room = em.getComponent('LocationComponent', entity).getParent()
            let roomContainer = em.getComponent('ContainerComponent', room)
            let roomInventory = roomContainer.getContents()
            let objectLocation = em.getComponent('LocationComponent', object)

            let hadObject = inventory.delete(object)
            if (!hadObject) {
                throw new Error(`Entity "${entity}" didn't have object "${object}".`)
            }
            roomInventory.add(object)

            container.setContents(inventory)
            roomContainer.setContents(roomInventory)
            objectLocation.setParent(room)

            console.log(em.getComponent('ContainerComponent', entity).getContents())

            action.steps.set('drop', {
                success: true,
            })
            console.log(action)
        })
    }

    mutate(channel) {
        this.channel = channel
    }
}

module.exports = DroppingSystem
