const Action = require('./action')

const actions = {}

Action.setActionsManifest(actions)

const get = new Action('get', {
    LocatorSystem: {
        apparent: true,
        accessible: true,
        // container:
    },
})
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
    open: new Action('open', {
        up: 'open',
    }),
})

module.exports = actions

