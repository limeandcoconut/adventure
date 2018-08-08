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
}

module.exports = helpers
