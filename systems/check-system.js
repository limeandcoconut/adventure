const System = require('./system')

class CheckSystem extends System {

    update(action) {
        let {entity, object, tool} = action

        if (object === tool) {
            this.fail(action, {
                reason: 'Inceptive.',
                code: 'sc-ic',
                object,
            })
            return
        }

        if (tool.location.parent !== entity) {
            this.fail(action, {
                reason: 'Don\'t Have Indirect.',
                code: 'sc-dh',
                tool,
            })
            return
        }

        // console.log('-------- CHECK --------'

        if (!tool.tool || tool.tool.type !== 'write') {
            this.fail(action, {
                reason: 'Not Tool.',
                code: 'sc-nt',
                object: tool,
            })
            return
        }

        if (object.option.value === action.desired) {
            this.fail(action, {
                reason: 'Already Done.',
                code: 'sc-ax',
                value: object.option.value,
            })
            return
        }

        object.option.value = action.desired

        action.steps.check = {
            success: true,
            code: 'sc-ss',
            value: action.desired,
        }
    }

    fail(action, info) {
        info.success = false
        // info.id = action.object.id
        action.steps.check = info
        action.live = false
        action.fault = 'check'
    }
}

module.exports = CheckSystem
