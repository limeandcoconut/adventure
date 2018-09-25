const System = require('./system')

class OpenSystem extends System {

    update(action) {

        // console.log('-------- OPEN --------')

        let object = action.object

        let container = object.container
        if (!container) {
            this.fail(action, {
                reason: 'Not a Container.',
                object,
                code: 'so-nc',
            })
            return
        }

        if (container.surface) {
            this.fail(action, {
                reason: 'Surface.',
                object,
                code: 'so-cs',
            })
            return
        }

        if (container.open === action.desired) {
            this.fail(action, {
                reason: 'Already Done.',
                code: 'so-ax',
            })
            return
        }

        container.open = action.desired

        action.steps.open = {
            success: true,
            code: 'so-ss',
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
