const System = require('./system')

const {put} = require('./methods')

class GetterSystem extends System {

    update(action) {
        if (action.object.properties.fixture) {
            this.fail(action, {
                reason: 'Fixture.',
                code: 'sgf1',
                object: action.object,
            })
            return
        }

        // console.log('---------- GET ---------')

        const {entity, object} = action
        const source = object.location.parent

        if (source === entity) {
            this.fail(action, {
                reason: 'Already Have.',
                code: 'sgh1',
            })
            return
        }

        let result = put(object, source, entity)
        if (result) {
            this.fail(action, result)
            return
        }

        action.steps.get = {
            success: true,
            code: 'sgs1',
        }
    }

    fail(action, info) {
        info.success = false
        // info.id = action.object.id
        action.steps.get = info
        action.live = false
        action.fault = 'get'
    }
}

module.exports = GetterSystem
