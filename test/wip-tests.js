const test = require('ava')
const adventure = require('../main')
const chai = require('chai')
chai.should()
chai.use(require('chai-interface'))
chai.use(require('chai-things'))

adventure.debugMode = 'resolve'
adventure.silent = true

const globalObjectSchema = {
    id: Number,
}

const globalObjectsListSchema = [{
    id: Number,
}]

const globalNounFromSchema = {
    from: {
        id: Number,
    },
}
const globalNounExceptSchema = {
    except: {
        id: Number,
    },
}
const globalNounComplexSchema = {
    from: {
        id: Number,
    },
    except: {
        id: Number,
    },
}

const globalVerbSchema = {
    type: String,
    value: String,
    modifiers: Array,
}

const globalActionSchema = {
    type: String,
    word: String,
    live: Boolean,
    steps: {},
    entity: {
        id: Number,
    },
    // verb: globalVerbSchema,
}

test.beforeEach((t) => {
    t.context.objectSchema = Object.assign({}, globalObjectSchema)
    t.context.verbSchema = Object.assign({}, globalVerbSchema)
    t.context.actionSchema = Object.assign({}, globalActionSchema)
    t.context.actionSchema.verb = t.context.verbSchema
    t.context.objectsListSchema = Object.assign({}, globalObjectsListSchema)
    t.context.nounFromSchema = Object.assign({}, globalNounFromSchema)
    t.context.nounExceptSchema = Object.assign({}, globalNounExceptSchema)
    t.context.nounComplexSchema = Object.assign({}, globalNounComplexSchema)
})

test('Dowse action respects contextual flags.', (t) => {
    const {actionSchema, objectSchema} = t.context
    actionSchema.object = objectSchema

    const result = adventure('dowse wrench')
    result.should.be.length(1)
    const action = result[0]
    action.should.have.interface(actionSchema)
    action.type.should.equal('dowse')
    action.object.id.should.equal(21)
})

test('Visibility is filterd appropriately: dowsing works with invisible objects.', (t) => {
    const {actionSchema, objectSchema} = t.context
    actionSchema.object = objectSchema

    const result = adventure('dowse coin')
    result.should.be.length(1)
    const action = result[0]
    action.should.have.interface(actionSchema)
    action.type.should.equal('dowse')
    action.object.id.should.equal(15)
})

test('Visibility is filterd appropriately: find only accepts visible objects.', (t) => {
    const {actionSchema, objectSchema} = t.context
    actionSchema.object = {code: String, message: String}

    let result = adventure('find coin')
    result.should.be.length(1)
    let action = result[0]
    action.should.have.interface(actionSchema)
    action.object.code.should.equal('aor5')

    actionSchema.object = objectSchema

    result = adventure('find rock')
    result.should.be.length(1)
    action = result[0]
    action.should.have.interface(actionSchema)
    action.object.id.should.equal(17)
})
