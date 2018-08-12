const Action = require('./action')

const actions = {}

Action.setActionsManifest(actions)

let baseProcess = ['resolve', 'locate']

const get = new Action({
    type: 'get',
    procedure: [
        ...baseProcess,
        'get',
    ],
    reporter: 'get',
    // LocatorSystem: {
    //     apparent: true,
    //     accessible: true,
    //     // container:
    // },
})

const inventory = new Action({
    type: 'inventory',
    procedure: [
        'inventory',
    ],
    reporter: 'inventory',
})

const drop = new Action({
    type: 'drop',
    procedure: [
        ...baseProcess,
        'drop',
    ],
    reporter: 'drop',
})

const go = new Action({
    type: 'go',
    procedure: ['move'],
    reporter: 'move',
})

const look = new Action({
    type: 'look',
    procedure: [
        ...baseProcess,
        'look',
    ],
    reporter: 'look',
    variants: {
        at: 'look',
    },
})

const begin = new Action({
    type: 'begin',
    procedure: [
        'begin',
        'locate',
        'look',
    ],
    reporter: 'begin',
})

const open = new Action({
    type: 'open',
    procedure: [
        ...baseProcess,
        'open',
    ],
    reporter: 'open',
    variants: {
        up: 'open',
    },
})

const close = new Action({
    type: 'close',
    procedure: [
        ...baseProcess,
        'close',
    ],
    reporter: 'close',
    variants: {
        up: 'close',
    },
})

const put = new Action({
    type: 'put',
    procedure: [
        ...baseProcess,
        'put',
    ],
    reporter: 'put',
})

Object.assign(actions, {
    begin,
    get,
    take: get,
    pick: new Action('pick', [], {
        up: 'get',
    }),
    drop,
    inventory,
    i: inventory,
    go,
    open,
    close,
    look,
    l: look,
    put,
})

module.exports = actions

