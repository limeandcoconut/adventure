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
            return
        }

        if (action.object.fixture) {
            this.fail(action, {
                reason: 'Fixture.',
                object: action.object.id,
            })
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
