const Action = require('./action')

const actions = {}

Action.setActionsManifest(actions)

const get = new Action('get')
const inventory = new Action('inventory')

Object.assign(actions, {
    get,
    take: get,
    pick: new Action('pick', {
        up: 'get',
    }),
    drop: new Action('drop'),
    inventory,
    i: inventory,
    go: new Action('go'),
})

module.exports = actions

