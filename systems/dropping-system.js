const {System} = require('rubricjs')
const {entityManager: em} = require('../managers.js')
const {put} = require('./methods')

class DroppingSystem extends System {

    update(action) {
        const entity = action.entity.id
        if (action.object.parent !== entity) {
            action.steps.set('drop', {
                success: false,
                // Consider making an Enum for this
                reason: 'Don\'t have it.',
            })
            action.live = false
            // console.log(action)
            return
        }

        if (!action.object.accessible) {
            action.steps.set('drop', {
                success: false,
                reason: 'Inaccessible',
                container: action.object.container,
            })
            action.live = false
            return
        }

        console.log('-------- DROP --------')

        const object = action.object.id
        const source = entity
        const destination = em.getComponent('Location', entity).getParent()

        let result = put(object, source, destination)
        if (result) {
            this.fail(action, result)
            return
        }

        // let container = em.getComponent('Container', entity)
        // let inventory = container.getContents()

        // let roomContainer = em.getComponent('Container', room)
        // let roomInventory = roomContainer.getContents()

        // let objectLocation = em.getComponent('Location', object)

        // let hadObject = inventory.delete(object)
        // if (!hadObject) {
        //     throw new Error(`Entity "${entity}" didn't have object "${object}".`)
        // }
        // roomInventory.add(object)

        // container.setContents(inventory)
        // roomContainer.setContents(roomInventory)
        // objectLocation.setParent(room)

        action.steps.set('drop', {
            success: true,
        })
    }
}

module.exports = DroppingSystem
