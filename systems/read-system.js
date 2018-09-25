const System = require('./system')

class ReadSystem extends System {

    update(action) {

        // console.log('-------- READ --------')

        const {object} = action

        if (!object.text) {
            this.fail(action, {
                reason: 'Nothing to Read.',
                code: 'sr-nr',
            })
            return
        }

        action.steps.read = {
            success: true,
            object,
            code: 'sr-ss',
        }
    }

    fail(action, info) {
        info.success = false
        action.steps.read = info
        action.live = false
        action.fault = 'read'
    }
}

module.exports = ReadSystem
