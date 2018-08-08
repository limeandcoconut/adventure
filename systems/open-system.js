const {System} = require('rubricjs')
const {entityManager: em} = require('../managers.js')

class OpenSystem extends System {

    update(action) {

        if (!action.object.apparent) {
            this.fail(action, {
                reason: 'Inapparent.',
                container: action.object.container,
            })
            return
        }

        if (!action.object.accessible) {
            this.fail(action, {
                reason: 'Inaccessible.',
                container: action.object.container,
            })
            return
        }

        // console.log('-------- OPEN --------')

        let object = action.object.id

        let container = em.getComponent('Container', object)

        if (!container) {
            this.fail(action, {
                reason: 'Not a Container.',
                id: action.object.id,
            })
            return
        }

        if (container.isOpen()) {
            this.fail(action, {
                reason: 'Already Open.',
            })
            return
        }

        container.setOpen(true)

        action.steps.set('open', {
            success: true,
        })
    }

    fail(action, info) {
        info.success = false
        info.id = action.object.id
        action.steps.set('open', info)
        action.live = false
    }
}

module.exports = OpenSystem
