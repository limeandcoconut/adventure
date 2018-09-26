const System = require('./system')

const {formatContents} = require('./methods')

class LookSystem extends System {

    update(action) {
        // console.log('-------- LOOK --------')

        const {object, entity} = action
        const info = {}

        info.object = object

        info.area = object.area

        const container = object.container
        const isTransparent = object.properties && object.properties.transparent
        if (container && (container.open || isTransparent)) {
            info.contents = formatContents(container.contents, entity)
        }
        if (object.text) {
            action.procedure.push('read')
        }
        if (object.option) {
            info.option = object.option
        }

        info.success = true
        info.code = 'sl-ss'
        action.steps.look = info
    }

    fail(action, info) {
        info.success = false
        // info.id = action.object.id
        action.steps.look = info
        action.live = false
        action.fault = 'look'
    }
}

module.exports = LookSystem
