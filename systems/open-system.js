const {System} = require('rubricjs')
const {entityManager: em} = require('../managers.js')

class OpenSystem extends System {
    constructor() {
        super()
        this.requiredComponents = ['ContainerComponent']
        this.acceptedActions = ['open']
    }

    update() {
        this.channel.events.forEach((action) => {

            if (!this.acceptedActions.includes(action.type) || !action.live) {
                return
            }

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

            if (!container.isOpen()) {
                this.fail(action, {
                    reason: 'Already Open.',
                })
                return
            }

            container.setOpen(false)

            action.steps.set('open', {
                success: true,
            })
        })
    }

    fail(action, info) {
        info.success = false
        info.id = action.object.id
        action.steps.set('open', info)
        action.live = false
    }

    mutate(channel) {
        this.channel = channel
    }
}

module.exports = OpenSystem
