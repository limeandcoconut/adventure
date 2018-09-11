const System = require('./system')
const {entityManager: em} = require('../managers.js')

class LocatorSystem extends System {

    update(action) {
        let entity = action.entity.id
        let object = action.object

        // console.log('---------- LOCATE ---------')

        let objects = []
        while (object) {
            objects.push(object)
            object = object.object
        }

        for (let i = 0; i < objects.length; i++) {
            const object = objects[i]
            this.locate(object, entity)
        }

        console.log(objects)

        action.steps.locate = {
            success: true,
        }
    }

    locate(object, entity) {
        const room = em.getComponent('Location', entity).getParent()

        const parent = em.getComponent('Location', object.id).getParent()
        let root = parent
        const properties = em.getComponent('ObjectProperties', object.id)
        let apparent = properties.isVisible()
        const fixture = properties.isFixture()
        let container

        while ((root !== room && root !== entity) && root) {
            if (!em.getComponent('Container', root).isOpen()) {
                container = root
            }
            if (apparent) {
                let rootProperties = em.getComponent('ObjectProperties', root)
                if (rootProperties) {
                    if (!rootProperties.isVisible() || (container && !rootProperties.isTransparent())) {
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
        object.fixture = fixture
        // If it's visible and there's a root location (it's not offscreen) then it is apparent.
        object.apparent = apparent && rootFlag
        object.root = root
        object.parent = parent
    }
}

module.exports = LocatorSystem
