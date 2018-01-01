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

            if (!this.acceptedActions.includes(action.type) || !action.live) {
                return
            }

            console.log('-------- INVENTORY --------')

            let entity = action.entity.id

            let container = em.getComponent('ContainerComponent', entity)
            let inventory = container.getContents()

            inventory = this.formatInventory(inventory)
            console.log(inventory)

            action.info = {
                inventory,
            }

            action.steps.set('inventory', {
                success: true,
            })
            // console.log(action.inventory)

            // action.steps.set('inventory', {
            //     success: true,
            // })
            // console.log(action)
        })
    }

    formatInventory(inventory) {

        inventory = Array.from(inventory)
        console.log(inventory)

        inventory = inventory.map((id) => {
            let container = em.getComponent('ContainerComponent', id)
            let item = {
                id,
            }
            if (container) {
                item.inventory = this.formatInventory(container.getContents())
            }
            return item
        })

        return inventory
    }

    mutate(channel) {
        this.channel = channel
    }
}

module.exports = InventorySystem
