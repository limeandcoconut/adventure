const {entityManager: em} = require('./managers.js')

/* eslint-disable require-jsdoc */
// class ResolveError extends Error {
//     constructor(message) {
//         super(message)
//         this.isResolveError = true
//     }
//
const locales = {
    get: local,
    drop: personal,
    put: (entity) => {
        // TDOD: Add contextual information sometime. e.g. (everything in room)
        let objects = personal(entity)
        if (objects[0].result) {
            objects = local(entity)
        }
        return objects
    },
}

const pronouns = {
    room,
}

function room(entity) {
    return [{
        id: em.getComponent('Location', entity).getParent(),
    }]
}

function local(entity) {
    const location = em.getComponent('Location', entity)
    const room = location.getParent()
    const roomVisible = em.getComponent('ObjectProperties', room).isVisible()

    const result = [{
        result: {
            reason: 'Cannot preresolve entity.',
            success: false,
        },
    }]

    if (!roomVisible) {
        return result
    }

    const objects = []
    const roomContainer = em.getComponent('Container', room)
    const contents = roomContainer.getContents()

    contents.forEach((object) => {
        if (object === entity || !em.getComponent('ObjectProperties', object).isVisible()) {
            return
        }
        objects.push({
            id: object,
        })
    })

    if (!objects.length) {
        return result
    }

    return objects
}

function personal(entity) {
    const container = em.getComponent('Container', entity)

    const objects = []
    const contents = container.getContents()

    for (let object of contents) {
        objects.push({
            id: object,
        })
    }

    if (!objects.length) {
        return [{
            result: {
                reason: 'Cannot preresolve entity.',
                success: false,
            },
        }]
    }

    return objects
}

function preresolve(object, {id: entity}, {type} = {}) {

    console.log('---------- PRERESOLVE ---------')
    // let {entity: {id: entity}, type, object} = action
    // console.log(JSON.stringify(object, null, 4))
    // console.log(JSON.stringify(object.type, null, 4))
    // console.log(JSON.stringify(object.word, null, 4))
    let resolver
    if (object.type === 'noun-multiple') {
        resolver = locales[type]
    } else {
        resolver = pronouns[object.word]
    }
    if (!resolver) {
        throw Error('Can\'t preresolve.')
    }
    // console.log(JSON.stringify(resolver(entity), null, 4))
    return resolver(entity)
}

module.exports = {
    preresolve,
}
