const {System} = require('rubricjs')
const {entityManager: em} = require('../managers.js')
const {formatContents} = require('./methods')

class LookSystem extends System {

    update(action) {
        if (!action.object.apparent) {
            this.fail(action, {
                reason: 'Inapparent.',
                container: action.object.container,
            })
            return
        }

        // console.log('-------- LOOK --------')

        const {object: {id: object}, entity: {id: entity}} = action
        const look = {}

        look.object = object

        const area = em.getComponent('Area', object)
        look.area = area

        const container = em.getComponent('Container', object)
        const properties = em.getComponent('ObjectProperties', object)
        const isTransparent = properties && properties.getTransparent()
        if (container && (container.isOpen() || isTransparent)) {
            look.contents = formatContents(container.getContents(), entity)
        }

        // action.info.look = look
        look.success = true
        action.steps.look = look
    }

    fail(action, info) {
        info.success = false
        info.id = action.object.id
        action.steps.look = info
        action.live = false
        action.fault = 'look'
    }

}

module.exports = LookSystem
