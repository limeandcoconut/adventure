const Action = require('./action')

const actions = {}

Action.setActionsManifest(actions)

let baseProcess = ['resolve', 'locate']

const get = new Action('get', [
    ...baseProcess,
    'get',
],
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
    ...baseProcess,
    'drop',
])

const go = new Action('go', ['move'])

const look = new Action('look', [
    ...baseProcess,
    'look',
], {
    at: 'look',
})

Object.assign(actions, {
    begin: new Action('begin', [
        'begin',
        'locate',
        'look',
    ]),
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
        ...baseProcess,
        'open',
    ], {
        up: 'open',
    }),
    close: new Action('close', [
        ...baseProcess,
        'close',
    ], {
        up: 'close',
    }),
    look,
    l: look,
    put: new Action('put', [
        ...baseProcess,
        'put',
    ]),
})

module.exports = actions

