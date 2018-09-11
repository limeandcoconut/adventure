const System = require('./system')
const {entityManager: em} = require('../managers.js')
const {formatContents} = require('./methods')

class InventorySystem extends System {

    update(action) {
        console.log('-------- INVENTORY --------')

        let entity = action.entity.id

        let container = em.getComponent('Container', entity)
        let contents = container.getContents()

        contents = formatContents(contents, entity)

        action.steps.inventory = {
            success: true,
            inventory: contents,
        }
    }
}

module.exports = InventorySystem
