const {entityManager: em} = require('./managers.js')

/* eslint-disable require-jsdoc */
// class ResolveError extends Error {
//     constructor(message) {
//         super(message)
//         this.isResolveError = true
//     }
// }

function preresolve(object, type, {id: entity}) {

    console.log('---------- PRERESOLVE ---------')
    // let {entity: {id: entity}, type, object} = action
    console.log(JSON.stringify(object, null, 4))
    console.log(JSON.stringify(object.type, null, 4))
    console.log(JSON.stringify(object.word, null, 4))
    if (object.type === 'noun-multiple') {
        if (type === 'get') {
            const location = em.getComponent('Location', entity)
            const room = location.getParent()

            const roomVisible = em.getComponent('ObjectProperties', room).getVisible()

            const objects = []
            if (!roomVisible) {
                objects.push({
                    result: {
                        reason: 'Cannot preresolve entity.',
                        success: false,
                    },
                })
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
            console.log(JSON.stringify(objects, null, 4))
            if (!objects.length) {
                objects.push({
                    result: {
                        reason: 'Cannot preresolve entity.',
                        success: false,
                    },
                })
            }

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

            if (!objects.length) {
                objects.push({
                    result: {
                        reason: 'Cannot preresolve entity.',
                        success: false,
                    },
                })
            }

            return objects
        }
    } else if (object.word === 'room') {
        if (type === 'look') {

            return [{
                id: em.getComponent('Location', entity).getParent(),
            }]
        }
    }

    // return new ResolveError('Cannot interpret preresolve.')
}

module.exports = {
    preresolve,
    // ResolveError,
}
