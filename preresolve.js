const {entityManager: em} = require('./managers.js')

/* eslint-disable require-jsdoc */
class ResolveError extends Error {
    constructor(message) {
        super(message)
        this.isResolveError = true
    }
}

function preresolve(action) {

    console.log('---------- PRERESOLVE ---------')
    let {entity: {id: entity}, type} = action

    if (type === 'get') {
        const location = em.getComponent('Location', entity)
        const room = location.getParent()

        // const roomProperties = em.getComponent('ObjectPropertiesComponent', room)
        // const roomTransparent = roomProperties.getTransparent()
        const roomVisible = em.getComponent('ObjectPropertiesComponent', room).getVisible()

        const objects = []
        // if (!roomVisible || !(roomContainer.isOpen() || roomTransparent)) {
        if (!roomVisible) {
            return objects
        }

        const roomContainer = em.getComponent('ContainerComponent', room)
        const contents = roomContainer.getContents()

        for (let object of contents) {
            if (object === entity || !em.getComponent('ObjectPropertiesComponent', object).getVisible()) {
                continue
            }
            objects.push({
                id: object,
            })
        }

        console.log(JSON.stringify(objects, null, 4))

        return objects
    }

    if (type === 'drop') {
        const container = em.getComponent('ContainerComponent', entity)

        // const location = em.getComponent('Location', entity)
        // const room = location.getParent()

        // const roomProperties = em.getComponent('ObjectPropertiesComponent', room)
        // const roomTransparent = roomProperties.getTransparent()
        // const roomVisible = em.getComponent('ObjectPropertiesComponent', room).getVisible()

        const objects = []
        // if (!roomVisible || !(roomContainer.isOpen() || roomTransparent)) {
        // if (!roomVisible) {
        //     return objects
        // }

        // const roomContainer = em.getComponent('ContainerComponent', room)
        const contents = container.getContents()

        for (let object of contents) {
            // TODO: Dunno if you should be able to find invisible things on your person.
            // if (!em.getComponent('ObjectPropertiesComponent', object).getVisible()) {
            //     continue
            // }
            objects.push({
                id: object,
            })
            console.log(object)
        }

        console.log(JSON.stringify(objects, null, 4))

        return objects
    }

    // TODO: this.
    return new ResolveError('Cannot interpret preresolve.')
}

module.exports = {
    preresolve,
    ResolveError,
}
