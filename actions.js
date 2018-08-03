const Action = require('./action')

const actions = {}

Action.setActionsManifest(actions)

const get = new Action('get', [
    'resolve',
    'locate',
    'get',
]
    // LocatorSystem: {
    //     apparent: true,
    //     accessible: true,
    //     // container:
    // },
)

const inventory = new Action('inventory', [
    'inventory',
])

const drop = new Action('drop', [
    'resolve',
    'locate',
    'drop',
])

const go = new Action('go', [])

Object.assign(actions, {
    get,
    take: get,
    pick: new Action('pick', [], {
        up: 'get',
    }),
    drop,
    inventory,
    i: inventory,
    go,
    open: new Action('open', [
        'resolve',
        'locate',
        'open',
    ], {
        up: 'open',
    }),
})

module.exports = actions

