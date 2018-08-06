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

        const roomVisible = em.getComponent('ObjectProperties', room).getVisible()

        const objects = []
        if (!roomVisible) {
            return objects
        }

        const roomContainer = em.getComponent('Container', room)
        const contents = roomContainer.getContents()

        contents.forEach((object) => {
            if (object === entity || !em.getComponent('ObjectProperties', object).getVisible()) {
                return
            }
            objects.push({
                id: object,
            })
        })

        return objects
    }

    if (type === 'drop') {
        const container = em.getComponent('Container', entity)

        const objects = []
        const contents = container.getContents()

        for (let object of contents) {
            objects.push({
                id: object,
            })
        }

        return objects
    }

    return new ResolveError('Cannot interpret preresolve.')
}

module.exports = {
    preresolve,
    ResolveError,
}
