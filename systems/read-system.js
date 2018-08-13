const {System} = require('rubricjs')
const {entityManager: em} = require('../managers.js')

class ReadSystem extends System {

    update(action) {
        if (!action.object.apparent) {
            this.fail(action, {
                reason: 'Inapparent.',
                container: action.object.container,
            })
            return
        }

        // console.log('-------- READ --------')

        const {object: {id: object}} = action

        const textComponent = em.getComponent('Text', object)
        if (!textComponent) {
            this.fail(action, {
                reason: 'Nothing to Read.',
            })
            return
        }

        action.steps.read = {
            success: true,
            object,
            text: textComponent.getText(),
        }
    }

    fail(action, info) {
        info.success = false
        info.id = action.object.id
        action.steps.read = info
        action.live = false
        action.fault = 'read'
    }
}

module.exports = ReadSystem
