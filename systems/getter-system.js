const {System} = require('rubricjs')
const {entityManager: em} = require('../managers.js')
const {put} = require('./methods')

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
        let source = em.getComponent('Location', object).getParent()

        let result = put(object, source, entity)
        if (result) {
            this.fail(action, result)
            return
        }

        // let container = em.getComponent('Container', entity)
        // let inventory = container.getContents()

        // let objectLocation = em.getComponent('Location', object)
        // let parentContainer = em.getComponent('Container', parent)
        // let parentInventory = parentContainer.getContents()

        // let hadObject = parentInventory.delete(object)
        // // If the parent's inventory didn't match the record of the object throw.
        // if (!hadObject) {
        //     throw new Error(`Container "${parent}" didn't have object "${object}".`)
        // }
        // inventory.add(object)

        // container.setContents(inventory)
        // parentContainer.setContents(parentInventory)
        // objectLocation.setParent(entity)

        action.steps.get = {
            success: true,
        }
    }

    fail(action, info) {
        info.success = false
        info.id = action.object.id
        action.steps.get = info
        action.live = false
        action.fault = 'get'
    }
}

module.exports = GetterSystem
