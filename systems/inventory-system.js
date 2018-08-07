const {System} = require('rubricjs')
const {entityManager: em} = require('../managers.js')

class InventorySystem extends System {

    update(action) {
        console.log('-------- INVENTORY --------')

        let entity = action.entity.id

        let container = em.getComponent('Container', entity)
        let inventory = container.getContents()

        inventory = this.formatInventory(inventory)

        action.info.inventory = inventory

        action.steps.set('inventory', {
            success: true,
        })
    }

    formatInventory(inventory) {

        inventory = Array.from(inventory)

        inventory = inventory.map((id) => {
            let container = em.getComponent('Container', id)
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
}

module.exports = InventorySystem
