const {entityManager: em} = require('./managers.js')

const helpers = {
    formatContents(contents, entity) {

        contents = Array.from(contents)

        const newContents = []
        for (let i = 0; i < contents.length; i++) {
            const id = contents[i]

            // }
            // contents = contents.map((id) => {
            let properties = em.getComponent('ObjectProperties', id)
            if (id === entity || (!properties && properties.getVisible())) {
                continue
            }
            let item = {
                id,
            }
            let container = em.getComponent('Container', id)
            if (container && (container.isOpen() || (properties && properties.getTransparent()))) {
                item.contents = helpers.formatContents(container.getContents(), entity)
            }
            newContents.push(item)
        }

        return newContents
    },
    logAction(action) {
        let steps = action.steps
        if (steps) {
            steps = Array.from(action.steps)
        }
        action = JSON.parse(JSON.stringify(action))
        console.log(JSON.stringify(action, null, 4))
        // action.steps = steps
        if (steps) {
            console.log(JSON.stringify(steps, null, 4))
        }
    },
}

module.exports = helpers
