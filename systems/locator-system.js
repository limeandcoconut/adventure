const {System} = require('rubricjs')
const {entityManager: em} = require('../managers.js')

class LocatorSystem extends System {

    update(action) {
        let entity = action.entity.id
        let object = action.object

        // if (typeof object === 'undefined') {
        //     // In case of an infix.
        //     return
        // }

        // console.log('---------- LOCATE ---------')

        let objects = []
        while (object) {
            objects.push(object)
            object = object.object
        }

        for (let i = 0; i < objects.length; i++) {
            const object = objects[i]
            this.locate(object, entity)
            // if (result.success) {
            //     object.id = result.id
            // } else {
            //     action.steps.set('resolve', result)
            //     action.live = false
            //     return
            // }
        }

        action.steps.locate = {
            success: true,
        }
    }

    // extractObjects(action) {
    //     if (action.object.type === 'infix') {
    //         let {direct, indirect} = action.object
    //         return [direct, indirect]
    //     }

    //     return [action.object]
    // }

    locate(object, entity) {
        let location = em.getComponent('Location', entity)
        let room = location.getParent()

        let parent = em.getComponent('Location', object.id).getParent()
        let root = parent
        let properties = em.getComponent('ObjectProperties', object.id)
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
        let rootFlag = Boolean(root) || object.id === room
        object.accessible = rootFlag && !container
        object.container = container
        // If it's visible and there's a root location (it's not offscreen) then it is apparent.
        object.apparent = apparent && rootFlag
        object.root = root
        object.parent = parent

        // console.log(object)
    }
}

module.exports = LocatorSystem
