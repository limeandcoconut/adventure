const System = require('./system')
const {put} = require('./methods')

class PutSystem extends System {

    update(action) {
        let {entity, object, indirect} = action

        if (object === indirect) {
            this.fail(action, {
                reason: 'Inceptive.',
                code: 'spi1',
                object,
            })
            return
        }

        if (object.properties.fixture) {
            this.fail(action, {
                reason: 'Fixture.',
                code: 'spf1',
                object,
            })
            return
        }

        // console.log('---------- PUT ---------')

        if (object.location.parent !== entity) {
            // TODO: Maybe these should be put into different actions.
            action.procedure.push('get')
            action.procedure.push('put')
            return
        }

        let result = put(object, entity, indirect)
        if (result) {
            this.fail(action, result)
            return
        }

        action.steps.put = {
            success: true,
            code: 'sps1',
        }
    }

    fail(action, info) {
        info.success = false
        // info.id = info.object
        action.steps.put = info
        action.live = false
        action.fault = 'put'
    }
}

module.exports = PutSystem
