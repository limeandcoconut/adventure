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
        let root = parent
        let properties = em.getComponent('ObjectProperties', object)
        let apparent = properties.getVisible()
        let container

        while ((root !== room && root !== entity) && root) {
            if (!em.getComponent('Container', root).isOpen()) {
                container = root
            }
            if (apparent) {
                let rootProperties = em.getComponent('ObjectProperties', root)
                if (rootProperties) {
                    if (!rootProperties.getVisible() || (container && !rootProperties.getTransparent())) {
                        apparent = false

                    }
                }
            }

            root = em.getComponent('Location', root).getParent()
        }
        // Root will always be the entity's locaion or the player itself or null.
        // If the root is null then the object is offscreen.
        // This is fine in the case of the search object being the entity's location.
        let rootFlag = Boolean(root) || object === room
        action.object.accessible = rootFlag && !container
        action.object.container = container
        // If it's visible and there's a root location (it's not offscreen) then it is apparent.
        action.object.apparent = apparent && rootFlag
        action.object.root = root
        action.object.parent = parent

        action.steps.set('locate', {
            success: true,
        })
    }
}

module.exports = LocatorSystem
