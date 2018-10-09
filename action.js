class Action {
    constructor(verb) {
        let {value, object, indirect, tool, word} = verb
        this.steps = {}
        this.live = true
        this.object = object
        this.indirect = indirect
        this.tool = tool
        this.word = word || value
        this.accessibleRequired = true
        this.apparentRequired = true
        this.accessible = {}
        // this.variants = {}
    }

    // validateObjects() {
    //     for (let i = 0; i < this.objectTypes.length; i++) {
    //         const type = this.objectTypes[i]
    //         const context = this.context[type]
    //         if (context) {
    //             if (!this[type]) {
    //                 if (!context.resolve) {
    //                     throw new Error(`av1: Action can't auto resolve: ${type}`)
    //                 }
    //                 const targets = context.resolve(this)
    //                 if (!targets.length) {
    //                     throw new Error(`av2: Action failed to resolve type: ${type}`)
    //                 }
    //                 if (targets.length > 1) {
    //                     throw new Error(`av3: Action has multiple plausible targets: ${type}`)
    //                 }
    //                 this[type] = targets[0]
    //                 return
    //             }
    //         } else if (this[type]) {
    //             throw new Error(`av4: Action can't accept object type: ${type}`)
    //         }
    //     }
    // }

    static delegate(verb) {
        const key = verb.modifiers.sort().join()
        const constructor = this.prototype.variants && this.prototype.variants[key]

        if (!constructor) {
            throw new Error('adg1: No variation of action')
        }

        return new constructor(verb)
    }

    // modify(modifier) {
    //     // let constructor = this.variants[modifier]
    //     // if (!constructor) {
    //     //     throw new Error('No variation of action')
    //     // }

    //     // return new constructor({
    //     //     word: `${this.word} ${modifier}`,
    //     //     object: this.object,
    //     // })
    // }

    clone() {
        const clone = new this.constructor(this)
        clone.live = this.live
        const steps = {}
        const keys = Object.keys(this.steps)
        while (keys.length) {
            let step = keys.shift()
            steps[step] = Object.assign({}, this.steps[step])
        }
        clone.steps = steps
        clone.type = this.type

        clone.procedure = this.procedure.slice()
        clone.reporter = this.reporter
        clone.fault = this.fault

        clone.entity = this.entity
        clone.initiative = this.initiative
        clone.accessibleRequired = this.accessibleRequired
        clone.apparentRequired = this.apparentRequired
        clone.accessible = this.accessible

        clone.verb = this.verb

        const copy = [
            'word',
            'object',
            'tool',
            'indirect',
            'value',
            'live',
            'steps',
            'type',
            'procedure',
            'reporter',
            'fault',
            'entity',
            'initiative',
            'apparentRequired',
            'accessibleRequired',
            'variants',
            'verb',
            'accessible',
        ]
        const props = Object.keys(this)
        while (props.length) {
            let prop = props.shift()
            if (!copy.includes(prop)) {
                throw new Error(`Need to clone: ${prop}`)
            }
        }

        return clone
    }
}

Action.prototype.variants = {}
Action.prototype.context = new Map([
    ['object', false],
    ['indirect', false],
    ['tool', false],
])
// Action.prototype.objectTypes = Object.freeze([
//     'object',
//     'indirect',
//     'tool',
//     'from',
// ])

module.exports = Action
