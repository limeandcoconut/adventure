const {System} = require('rubricjs')
const {entityManager: em} = require('../managers.js')

class GetterSystem extends System {

    update(action) {
        if (!action.object.apparent) {
            this.fail(action, {
                reason: 'Inapparent.',
                container: action.object.container,
            })
            return
        }

        if (!action.object.accessible) {
            this.fail(action, {
                reason: 'Inaccessible.',
                container: action.object.container,
            })
            console.log(action.object)
            return
        }

        // console.log('---------- GET ---------')

        let entity = action.entity.id

        if (action.object.parent === entity) {
            this.fail(action, {
                reason: 'Already Have.',
            })
            return
        }

        let object = action.object.id

        let container = em.getComponent('Container', entity)
        let inventory = container.getContents()

        let objectLocation = em.getComponent('Location', object)
        let parent = objectLocation.getParent()
        let parentContainer = em.getComponent('Container', parent)
        let parentInventory = parentContainer.getContents()

        let hadObject = parentInventory.delete(object)
        // If the parent's inventory didn't match the record of the object throw.
        if (!hadObject) {
            throw new Error(`Container "${parent}" didn't have object "${object}".`)
        }
        inventory.add(object)

        container.setContents(inventory)
        parentContainer.setContents(parentInventory)
        objectLocation.setParent(entity)

        action.steps.set('get', {
            success: true,
        })
    }

    fail(action, info) {
        info.success = false
        info.id = action.object.id
        action.steps.set('get', info)
        action.live = false
    }
}

module.exports = GetterSystem
