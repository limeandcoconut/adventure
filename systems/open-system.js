const System = require('./system')

class OpenSystem extends System {

    update(action) {

        // console.log('-------- OPEN --------')

        let object = action.object.id

        let container = object.container

        if (!container) {
            this.fail(action, {
                reason: 'Not a Container.',
                object,
                code: 'son1',
            })
            return
        }

        if (container.isSurface()) {
            this.fail(action, {
                reason: 'Surface.',
                object,
                code: 'sou1',
            })
            return
        }

        if (container.open === action.desired) {
            this.fail(action, {
                reason: 'Already Done.',
                code: 'soa1',
            })
            return
        }

        container.open = action.desired

        action.steps.open = {
            success: true,
            code: 'sos1',
        }
    }

    fail(action, info) {
        info.success = false
        // info.id = action.object.id
        action.steps.open = info
        action.live = false
        action.fault = 'open'
    }
}

module.exports = OpenSystem
