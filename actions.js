const Action = require('./action')

const actions = {}

// Action.setActionsManifest(actions)

let baseProcess = ['resolve', 'locate']

class Get extends Action {
    constructor({word, object}) {
        super({word, object})

        this.type = 'get'
        this.procedure = baseProcess.concat('get')
        this.reporter = this.type
    }
}

class Pick extends Action {
    constructor({word, object}) {
        super({word, object})

        this.type = 'pick'
        this.procedure = []
        this.reporter = ''
        this.variants = {
            up: Get,
        }
    }
}

class Inventory extends Action {
    constructor({word, object}) {
        super({word, object})

        this.type = 'inventory'
        this.procedure = ['inventory']
        this.reporter = this.type
    }
}

class Drop extends Action {
    constructor({word, object}) {
        super({word, object})

        this.type = 'drop'
        this.procedure = baseProcess.concat('drop')
        this.reporter = this.type
    }
}

class Go extends Action {
    constructor({word, object}) {
        super({word, object})

        this.type = 'go'
        this.procedure = ['move']
        this.reporter = 'move'
    }
}

class Look extends Action {
    constructor({word, object}) {
        super({word, object})

        this.type = 'look'
        this.procedure = baseProcess.concat('look')
        this.reporter = this.type
        this.variants = {
            at: Look,
        }
    }
}

class Begin extends Action {
    constructor({word, object}) {
        super({word, object})

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
    constructor({word, object}) {
        super({word, object})

        this.type = 'open'
        this.procedure = baseProcess.concat('open')
        this.reporter = this.type
        this.variants = {
            up: Open,
        }
    }
}

class Close extends Action {
    constructor({word, object}) {
        super({word, object})

        this.type = 'close'
        this.procedure = baseProcess.concat('close')
        this.reporter = this.type
        this.variants = {
            up: Close,
        }
    }
}

class Put extends Action {
    constructor({word, object}) {
        super({word, object})

        this.type = 'put'
        this.procedure = baseProcess.concat('put')
        this.reporter = this.type
    }
}

class Read extends Action {
    constructor({word, object}) {
        super({word, object})

        this.type = 'read'
        this.procedure = baseProcess.concat('read')
        this.reporter = this.type
    }
}

Object.assign(actions, {
    begin: Begin,
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
})

module.exports = actions

