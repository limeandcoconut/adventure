const System = require('./system')

const {put} = require('./methods')

class DroppingSystem extends System {

    update(action) {
        const {entity, object} = action
        if (object.location.parent !== entity) {
            this.fail(action, {
                reason: 'Don\'t have.',
                code: 'sdh1',
            })
            return
        }

        if (object.properties.fixture) {
            this.fail(action, {
                reason: 'Fixture.',
                code: 'sdf1',
                object,
            })
            return
        }

        // console.log('-------- DROP --------')

        // const source = entity
        // const destination = entity.location.parent

        let result = put(object, entity, entity.location.parent)
        if (result) {
            this.fail(action, result)
            return
        }

        action.steps.drop = {
            success: true,
            code: 'sds1',
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
