const {System} = require('rubricjs')
const {put} = require('./methods')

class PutSystem extends System {

    update(action) {
        let {entity: {id: entity}, object} = action
        let indirect = object.object

        if (object.id === indirect.id) {
            this.fail(action, {
                reason: 'Inceptive.',
                object: object.id,
            })
            return
        }

        if (object.fixture) {
            this.fail(action, {
                reason: 'Fixture.',
                object: object.id,
            })
            return
        }

        if (!object.apparent) {
            this.fail(action, {
                reason: 'Inapparent.',
                object: object.id,
                container: object.container,
            })
            return
        }

        if (!object.accessible) {
            this.fail(action, {
                reason: 'Inaccessible.',
                object: object.id,
                container: object.container,
            })
            return
        }

        if (!indirect.apparent) {
            this.fail(action, {
                reason: 'Inapparent.',
                object: indirect.id,
                container: indirect.container,
            })
            return
        }

        if (!indirect.accessible) {
            this.fail(action, {
                reason: 'Inaccessible.',
                object: indirect.id,
                container: indirect.container,
            })
            return
        }

        console.log('---------- PUT ---------')

        if (object.parent !== entity) {
            // TODO: Maybe these should be put into different actions.
            action.procedure.push('get')
            action.procedure.push('locate')
            action.procedure.push('put')
            return
        }
        object = object.id
        const destination = indirect.id
        const source = entity

        let result = put(object, source, destination)
        if (result) {
            this.fail(action, result)
            return
        }

        action.steps.put = {
            success: true,
        }
    }

    fail(action, info) {
        info.success = false
        info.id = info.object
        action.steps.put = info
        action.live = false
        action.fault = 'put'
    }
}

module.exports = PutSystem
