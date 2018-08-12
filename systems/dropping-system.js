const {System} = require('rubricjs')
const {entityManager: em} = require('../managers.js')
const {put} = require('./methods')

class DroppingSystem extends System {

    update(action) {
        const entity = action.entity.id
        if (action.object.parent !== entity) {
            this.fail(action, {
                reason: 'Don\'t have.',
            })
            return
        }

        if (!action.object.apparent) {
            this.fail(action, {
                reason: 'Inapparent.',
                container: action.object.container,
            })
            return
        }

        if (!action.object.accessible) {
            this.fail(action, {
                reason: 'Inaccessible',
                container: action.object.container,
            })
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

        action.steps.drop = {
            success: true,
        }
    }

    fail(action, info) {
        info.success = false
        // info.id = action.object.id
        action.steps.drop = info
        action.live = false
        action.fault = 'drop'
    }
}

module.exports = DroppingSystem
