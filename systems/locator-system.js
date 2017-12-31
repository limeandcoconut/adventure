const {System} = require('rubricjs')
const {entityManager: em} = require('../managers.js')

class LocatorSystem extends System {
    constructor() {
        super()
        this.requiredComponents = ['LocationComponent']
        this.acceptedActions = ['get', 'drop']
    }

    update() {
        this.channel.events.forEach((action) => {

            if (!this.acceptedActions.includes(action.action) || !action.live) {
                return
            }

            let entity = action.entity.id
            let object = action.object.id

            if (typeof object === 'undefined') {
                return
            }

            console.log('---------- LOCATE ---------')

            let locationComponent = em.getComponent('LocationComponent', entity)
            let room = locationComponent.getParent()

            let parent = em.getComponent('LocationComponent', object).getParent()
            let container

            while ((parent !== room && parent !== entity) && parent) {
                if (!em.getComponent('ContainerComponent', parent).isOpen()) {
                    container = parent
                }

                parent = em.getComponent('LocationComponent', parent).getParent()
            }

            action.object.accessible = Boolean(parent) && !container
            action.object.container = container
            action.object.locationParent = parent

            action.steps.set('locate', {
                success: true,
            })
            console.log(action)

        })
    }

    mutate(channel) {
        this.channel = channel
    }
}

module.exports = LocatorSystem

