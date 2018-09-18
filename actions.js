const Action = require('./action')
const {
    // list,
    parentOf,
    entity,
    childrenOf,
    visible,
    tool,
    deep,
    siblingsOf,
    firstOne,
    onlyOne,
    // either,
    legible,
} = require('./resolve-helpers')

let baseProcess = ['locate']

class Find extends Action {
    constructor(verb) {
        super(verb)

        this.type = 'find'
        this.procedure = baseProcess.concat('find')
        this.reporter = this.type
    }
}
Find.prototype.context = new Map(Action.prototype.context)
Find.prototype.context.set('object', {
    from: parentOf(entity()),
    all: siblingsOf(entity()),
})

class Get extends Action {
    constructor(verb) {
        super(verb)

        this.type = 'get'
        this.procedure = baseProcess.concat('get')
        this.reporter = this.type
    }
}
Get.prototype.context = new Map(Action.prototype.context)
Get.prototype.context.set('object', {
    from: parentOf(entity()),
    all: siblingsOf(entity()),
})
// Get.prototype.variants = {foo: 'foo'}
// Get.prototype.context.set('indirect', {
//     // resolve: parentOf(entity()),

// })

class Pick extends Action {
    constructor(verb) {
        super(verb)

        this.type = 'pick'
        this.procedure = []
        this.reporter = ''
        // this.variants = {
        //     up: Get,
        // }
    }
}
Pick.prototype.context = new Map(Action.prototype.context)
Pick.prototype.context.set('object', {
})

Pick.prototype.variants = {
    up: Get,
}

class Inventory extends Action {
    constructor(verb) {
        super(verb)

        this.type = 'inventory'
        this.procedure = ['inventory']
        this.reporter = this.type
    }
}
// .Check.prototype.context = new Map(Action.prototype.context)
// Inventory.set(

class Drop extends Action {
    constructor(verb) {
        super(verb)

        this.type = 'drop'
        this.procedure = baseProcess.concat('drop')
        this.reporter = this.type
    }
}
Drop.prototype.context = new Map(Action.prototype.context)
Drop.prototype.context.set('object', {
    from: entity(),
    all: childrenOf(entity()),
})
// Drop.prototype.context.set('indirect', {
//     resolve: entity(),
// })

class Go extends Action {
    constructor(verb) {
        super(verb)

        this.type = 'go'
        this.procedure = ['move']
        this.reporter = 'move'
    }
}
Go.prototype.context = new Map(Action.prototype.context)
Go.prototype.context.set('object', {
    acceptsPassthrough: true,
})

class Look extends Action {
    constructor(verb) {
        super(verb)

        this.type = 'look'
        this.procedure = baseProcess.concat('look')
        this.reporter = this.type
        // this.variants = {
        //     at: Look,
        // }
    }
}
Look.prototype.context = new Map(Action.prototype.context)
Look.prototype.context.set('object', {
    resolve: firstOne(visible(parentOf(entity()))),
    from: parentOf(entity()),
    all: siblingsOf(entity()),
    inaccessible: true,
})

Look.prototype.variants = {
    at: Look,
}

class Begin extends Action {
    constructor(verb) {
        super(verb)

        this.type = 'begin'
        this.procedure = [
            'begin',
            'locate',
            'look',
        ]
        this.reporter = this.type
    }
}

class Open extends Action {
    constructor(verb) {
        super(verb)

        this.type = 'open'
        this.procedure = baseProcess.concat('open')
        this.reporter = this.type
        // this.variants = {
        //     up: Open,
        // }
    }
}
Open.prototype.context = new Map(Action.prototype.context)
Open.prototype.context.set('object', {
    from: parentOf(entity()),
})

Open.prototype.variants = {
    up: Open,
}

class Close extends Action {
    constructor(verb) {
        super(verb)

        this.type = 'close'
        this.procedure = baseProcess.concat('close')
        this.reporter = this.type
        // this.variants = {
        //     up: Close,
        // }
    }
}
Close.prototype.context = new Map(Action.prototype.context)
Close.prototype.context.set('object', {
    from: parentOf(entity()),
})

Close.prototype.variants = {
    up: Close,
}

class Put extends Action {
    constructor(verb) {
        super(verb)

        this.type = 'put'
        this.procedure = baseProcess.concat('put')
        this.reporter = this.type
    }
}
Put.prototype.context = new Map(Action.prototype.context)
Put.prototype.context.set('object', {
    from: parentOf(entity()),
    all: childrenOf(entity()),
})
Put.prototype.context.set('indirect', {
    from: parentOf(entity()),
})

class Read extends Action {
    constructor(verb) {
        super(verb)

        this.type = 'read'
        this.procedure = baseProcess.concat('read')
        this.reporter = this.type
    }
}
Read.prototype.context = new Map(Action.prototype.context)
Read.prototype.context.set('object', {
    // resolve: onlyOne(visible(legible(either(
    //     deep(childrenOf(entity(), false)),
    //     deepSiblingsOf(entity(), false),
    // )))),

    resolve: onlyOne(visible(legible(deep(childrenOf(parentOf(entity()), false))))),
    from: parentOf(entity()),
    inaccessible: true,
})

class Check extends Action {
    constructor(verb) {
        super(verb)

        this.type = 'check'
        this.desired = verb.text === 'check'
        this.procedure = baseProcess.concat('check')
        this.reporter = this.type
    }
}
Check.prototype.context = new Map(Action.prototype.context)
Check.prototype.context.set('object', {
    resolve: onlyOne(visible((action) => {
        const set = deep(childrenOf(parentOf(entity())))(action)

        const result = []
        while (set.length) {
            let entity = set.shift()
            if (entity.option) {
                set.push(entity)
            }
        }
        return result
    })),
    from: parentOf(entity()),
    all: visible((action) => {
        const set = deep(childrenOf(parentOf(entity())))(action)

        const result = []
        while (set.length) {
            let entity = set.shift()
            if (entity.option) {
                set.push(entity)
            }
        }
        return result
    }),
})
Check.prototype.context.set('tool', {
    resolve: onlyOne(visible(tool('write', deep(childrenOf(entity()))))),
    from: entity(),
})

class Say extends Action {
    constructor(verb) {
        super(verb)

        this.type = 'say'
        this.procedure = baseProcess.concat('say')
        this.reporter = this.type
    }
}
Say.prototype.context = new Map(Action.prototype.context)
Say.prototype.context.set('object', {
    acceptsWordLiteral: true,
})

const actions = {
    begin: Begin,
    find: Find,
    get: Get,
    put: Put,
    take: Get,
    pick: Pick,
    drop: Drop,
    inventory: Inventory,
    i: Inventory,
    go: Go,
    open: Open,
    close: Close,
    look: Look,
    l: Look,
    read: Read,
    check: Check,
    uncheck: Check,
    say: Say,
}

module.exports = actions

