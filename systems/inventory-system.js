const {System} = require('rubricjs')
const {entityManager: em} = require('../managers.js')
const {formatContents} = require('../helpers.js')

class InventorySystem extends System {

    update(action) {
        // console.log('-------- INVENTORY --------')

        let entity = action.entity.id

        let container = em.getComponent('Container', entity)
        let contents = container.getContents()

        contents = formatContents(contents, entity)

        action.info.inventory = contents

        action.steps.set('inventory', {
            success: true,
        })
    }
}

module.exports = InventorySystem
