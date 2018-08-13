class Action {
    constructor({word, object}) {
        this.steps = {}
        this.live = true
        this.object = object
        this.word = word
        this.variants = {}
    }

    modify(modifier) {
        let constructor = this.variants[modifier]
        if (!constructor) {
            throw new Error('No variation of action')
        }

        return new constructor({
            word: `${this.word} ${modifier}`,
            object: this.object,
        })
    }

    clone() {
        const clone = new this.constructor({
            word: this.word,
            object: this.object,
        })
        clone.live = this.live
        const steps = {}
        const keys = Object.keys(this.steps)
        while (keys.length) {
            let step = keys.shift()
            steps[step] = Object.assign({}, this.steps[step])
        }
        clone.steps = steps

        clone.procedure = this.procedure.slice()
        clone.reporter = this.reporter
        clone.fault = this.faul

        clone.bifurcated = this.bifurcated
        clone.entity = Object.assign({}, this.entity)
        clone.initiative = this.initiative

        const copy = [
            'word',
            'object',
            'live',
            'steps',
            'procedure',
            'reporter',
            'fault',
            'bifurcated',
            'entity',
            'initiative',

            'variants',
        ]
        const props = Object.keys(keys)
        while (props.length) {
            let prop = props.shift()
            if (!copy.includes(prop)) {
                throw new Error(`Need to clone: ${prop}`)
            }
        }

        return clone
    }
}

module.exports = Action
