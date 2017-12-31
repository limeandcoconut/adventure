const {System} = require('rubricjs')
const {entityManager: em} = require('../managers.js')

class InventorySystem extends System {
    constructor() {
        super()
        this.requiredComponents = ['ContainerComponent']
        this.acceptedActions = ['inventory']
    }

    update() {
        this.channel.events.forEach((action) => {

            if (!this.acceptedActions.includes(action.action) || !action.live) {
                return
            }

            console.log('-------- INVENTORY --------')

            let entity = action.entity.id

            let container = em.getComponent('ContainerComponent', entity)
            let inventory = container.getContents()

            console.log(inventory)

            action.inventory = {
                success: true,
                inventory: JSON.stringify(inventory),
            }

            console.log(action.inventory)

            action.steps.set('inventory', {
                success: true,
            })
            console.log(action)
        })
    }

    mutate(channel) {
        this.channel = channel
    }
}

module.exports = InventorySystem
