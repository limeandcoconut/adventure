const {System} = require('rubricjs')
const {entityManager: em} = require('../managers.js')

class LocatorSystem extends System {
    constructor() {
        super()
        this.requiredComponents = ['Location']
        this.acceptedActions = ['get', 'drop', 'open']
    }

    update() {
        this.channel.events.forEach((action) => {

            if (!this.acceptedActions.includes(action.type) || !action.live) {
                return
            }

            let entity = action.entity.id
            let object = action.object.id

            if (typeof object === 'undefined') {
                return
                // why???
            }

            console.log('---------- LOCATE ---------')

            let location = em.getComponent('Location', entity)
            let room = location.getParent()

            let parent = em.getComponent('Location', object).getParent()
            let properties = em.getComponent('ObjectPropertiesComponent', object)
            let apparent = properties.getVisible()
            let container

            while ((parent !== room && parent !== entity) && parent) {
                if (!em.getComponent('ContainerComponent', parent).isOpen()) {
                    container = parent
                }
                if (apparent) {
                    let parentProperties = em.getComponent('ObjectPropertiesComponent', parent)
                    if (parentProperties) {
                        if (!parentProperties.getVisible() || (container && !parentProperties.getTransparent())) {
                            apparent = false
                        // } else if (container && parentProperties.transparent()) {
                        }
                    }
                }

                parent = em.getComponent('Location', parent).getParent()
            }
            // Parent will always be the players locaion or the player itself.
            let parentFlag = Boolean(parent)
            action.object.accessible = parentFlag && !container
            action.object.container = container
            // If it's visible and there's a parent location (it's not offscreen) then it is apparent.
            action.object.apparent = apparent && parentFlag
            action.object.locationParent = parent

            action.steps.set('locate', {
                success: true,
            })
            // console.log(action)

        })
    }

    mutate(channel) {
        this.channel = channel
    }
}

module.exports = LocatorSystem

