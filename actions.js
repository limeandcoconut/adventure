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
    appropriate,
} = require('./resolve-helpers')
/* eslint-disable require-jsdoc */
let baseProcess = ['locate']

// TODO: Allow for different accessiblity for different objects.
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
    all: appropriate(siblingsOf(entity())),
})

class Dowse extends Action {
    constructor(verb) {
        super(verb)

        this.type = 'dowse'
        this.procedure = baseProcess.concat('dowse')
        this.reporter = this.type
        this.accessibleRequired = false
        this.apparentRequired = false
    }
}
Dowse.prototype.context = new Map(Action.prototype.context)
Dowse.prototype.context.set('object', {
    from: parentOf(entity()),
    all: appropriate(siblingsOf(entity())),
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
    all: appropriate(siblingsOf(entity())),
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
    all: appropriate(childrenOf(entity())),
})

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
        this.accessibleRequired = false
    }
}
Look.prototype.context = new Map(Action.prototype.context)
Look.prototype.context.set('object', {
    resolve: firstOne(visible(parentOf(entity()))),
    from: parentOf(entity()),
    all: appropriate(siblingsOf(entity())),
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
    all: appropriate(childrenOf(entity())),
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
        this.accessibleRequired = false
    }
}
Read.prototype.context = new Map(Action.prototype.context)
Read.prototype.context.set('object', {
    // resolve: onlyOne(visible(legible(either(
    //     deep(childrenOf(entity(), false)),
    //     deepSiblingsOf(entity(), false),
    // )))),
    // _beginResolution: chilre
    // _completeResolution,
    // _standinResolver() {
    //     return this.resolutionSet
    // },
    // resolve(action, accessibleRequired = true, apparentRequired = true) {
    //     this.resolutionSet = childrenOf(parentOf(entity()), accessibleRequired, apparentRequired)(action)
    //     return this._completeResolution(this._standinResolver)
    // },
    resolve: onlyOne(appropriate(legible(deep(childrenOf(parentOf(entity())))))),
    from: parentOf(entity()),
    // inaccessible: true,
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
    resolve: onlyOne(appropriate(option(deep(childrenOf(parentOf(entity())))))),
    from: parentOf(entity()),
    all: appropriate(option(deep(childrenOf(parentOf(entity()))))),
})
Check.prototype.context.set('tool', {
    resolve: onlyOne(appropriate(tool('write', deep(childrenOf(entity()))))),
    from: entity(),
})

function option(getSet) {
    return (action) => {
        const set = getSet(action)

        const result = []
        while (set.length) {
            let entity = set.shift()
            if (entity.option) {
                set.push(entity)
            }
        }
        return result
    }
}

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
    dowse: Dowse,
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

