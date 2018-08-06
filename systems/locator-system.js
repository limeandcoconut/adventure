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

        let parent = em.getComponent('Location', object).getParent()
        let properties = em.getComponent('ObjectProperties', object)
        let apparent = properties.getVisible()
        let container

        while ((parent !== room && parent !== entity) && parent) {
            if (!em.getComponent('Container', parent).isOpen()) {
                container = parent
            }
            if (apparent) {
                let parentProperties = em.getComponent('ObjectProperties', parent)
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
