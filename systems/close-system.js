const {System} = require('rubricjs')
const {entityManager: em} = require('../managers.js')

class CloseSystem extends System {

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

        console.log('-------- OPEN --------')

        let object = action.object.id

        let container = em.getComponent('ContainerComponent', object)

        if (!container) {
            this.fail(action, {
                reason: 'Not a Container.',
                id: action.object.id,
            })
            return
        }

        if (!container.isOpen()) {
            this.fail(action, {
                reason: 'Already Closed.',
            })
            return
        }

        container.setOpen(false)

        action.steps.set('close', {
            success: true,
        })
    }

    fail(action, info) {
        info.success = false
        info.id = action.object.id
        action.steps.set('close', info)
        action.live = false
    }
}

module.exports = CloseSystem
