const {System} = require('rubricjs')
const {entityManager: em} = require('../managers.js')

class LocatorSystem extends System {

    update(action) {
        let entity = action.entity.id
        let object = action.object.id

        if (typeof object === 'undefined') {
            return
            // why???
        }

        console.log('---------- LOCATE ---------')

        let location = em.getComponent('Location', entity)
        let room = location.getParent()

        console.log(action)
        console.log(object)
        let parent = em.getComponent('Location', object).getParent()
        console.log(parent)
        let properties = em.getComponent('ObjectPropertiesComponent', object)
        let apparent = properties.getVisible()
        let container

        while ((parent !== room && parent !== entity) && parent) {
            console.log(parent)
            if (!em.getComponent('ContainerComponent', parent).isOpen()) {
                container = parent
            }
            if (apparent) {
                let parentProperties = em.getComponent('ObjectPropertiesComponent', parent)
                if (parentProperties) {
                    if (!parentProperties.getVisible() || (container && !parentProperties.getTransparent())) {
                        apparent = false

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
    }
}

module.exports = LocatorSystem
