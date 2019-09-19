const test = require('ava')
const adventure = require('../main')
const chai = require('chai')
chai.should()
chai.use(require('chai-interface'))
chai.use(require('chai-things'))

adventure.debugMode = {
  resolve: true,
  verbs: true,
  codes: true,
  begun: true,
}
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

test('Find on single, accessible, apparent, labeled, top sibling should succeed.', (t) => {
  const {
    actionSchema,
    objectSchema,
  } = t.context
  actionSchema.object = objectSchema

  const result = adventure('find bolt')
  result.should.be.length(1)
  const action = result[0]
  action.should.have.interface(actionSchema)
  action.type.should.equal('find')
  action.object.id.should.equal(19)
})

test('Find on single, scoped, accessible, apparent, labeled, nested sibling should succeed.', (t) => {
  const {
    actionSchema,
    nounFromSchema,
    objectSchema,
  } = t.context
  actionSchema.object = objectSchema
  actionSchema.verb.object = nounFromSchema

  const result = adventure('find bolt from crate')
  result.should.be.length(1)
  const action = result[0]
  action.should.have.interface(actionSchema)
  action.type.should.equal('find')
  action.object.id.should.equal(19)
  action.verb.object.from.id.should.equal(16)
  action.verb.object.from.id.should.equal(action.object.location.parent.id)
})

test('Inventory on object should fail.', () => {

  const error = adventure('i fixture')
  error.code.should.equal('aor1')
})

test('Put with indirect multiple object should fail.', () => {

  const error = adventure('put rock in all')
  error.code.should.equal('aor2')
})

test('Put with no object should fail.', () => {

  const error = adventure('put')

  error.code.should.equal('aor3')
})

test('Put with no indirect object should fail.', () => {

  const error = adventure('put rock')

  error.code.should.equal('aor3')
})

test('Put with multiple indirect objects should fail.', () => {

  const error = adventure('put rock in crate and box')

  error.code.should.equal('aor4')
})

test('Put with multiple objects should succceed.', (t) => {

  t.notThrows(() => {
    adventure('put rock and thing in crate')
  })

})

test('Put with non existant indirect object should fail.', () => {

  const error = adventure('put rock in fish')

  error.code.should.equal('aor5')
})

test('Find with non existant object should return an error for the object.', (t) => {
  const {
    actionSchema,
  } = t.context
  actionSchema.object = {
    message: String,
    code: String,
  }

  const result = adventure('find fish')
  result.should.be.length(1)
  const action = result[0]
  action.should.have.interface(actionSchema)
  action.object.code.should.equal('aor5')
})

test('Find on single ambiguous, top sibling should return an error as the object.', (t) => {
  const {
    actionSchema,
  } = t.context
  actionSchema.object = {
    message: String,
    code: String,
  }

  const result = adventure('find fixture')
  result.should.be.length(1)
  const action = result[0]
  action.should.have.interface(actionSchema)
  action.object.code.should.equal('aor6')
})

test('Put with single ambiguous, accessible, apparent, labeled, indirect object should fail.', () => {

  const error = adventure('put rock in fixture')

  error.code.should.equal('aor6')
})

test('Find on single from-scoped, accessible, apparent, labeled, nested sibling should succeed.', (t) => {
  const {
    actionSchema,
    nounFromSchema,
    objectSchema,
  } = t.context
  actionSchema.object = objectSchema
  actionSchema.verb.object = nounFromSchema

  const result = adventure('find fixture from crate')
  result.should.be.length(1)
  const action = result[0]
  action.should.have.interface(actionSchema)
  action.type.should.equal('find')
  action.object.id.should.equal(19)
  action.verb.object.from.id.should.equal(16)
  action.verb.object.from.id.should.equal(action.object.location.parent.id)
})

test('Look should autoresolve to parent.', (t) => {
  const {
    actionSchema,
    objectSchema,
  } = t.context
  actionSchema.object = objectSchema

  const result = adventure('look')
  result.should.be.length(1)
  const action = result[0]
  action.should.have.interface(actionSchema)
  action.type.should.equal('look')
  action.object.id.should.equal(10)
  action.object.should.equal(action.entity.location.parent)
})

test('Find on all siblings should succeed.', (t) => {
  const {
    actionSchema,
    objectsListSchema,
  } = t.context
  actionSchema.object = objectsListSchema

  const result = adventure('find all')
  result.should.be.length(1)
  const action = result[0]
  action.should.have.interface(actionSchema)
  action.object.should.be.length(3)
  action.object.should.all.have.nested.property('location.parent.id', 10)
})

test('Find on all siblings except, one should succeed.', (t) => {
  const {
    actionSchema,
    objectsListSchema,
  } = t.context
  actionSchema.object = objectsListSchema

  const result = adventure('find all except screw')
  result.should.be.length(1)
  const action = result[0]
  action.should.have.interface(actionSchema)
  action.object.should.be.length(2)
  action.object.should.all.not.have.property('id', 18)
})

test('Find on general determined, ambiguous, apparent, accessible, sibling should succeed.', (t) => {
  const {
    actionSchema,
    objectSchema,
  } = t.context
  actionSchema.object = objectSchema

  const result = adventure('find a fixture')
  result.should.be.length(1)
  const action = result[0]
  action.should.have.interface(actionSchema)
  action.object.id.should.be.oneOf([18, 19])
})

test('Find on general, ambiguous, apparent, accessible, sibling should succeed.', (t) => {
  const {
    actionSchema,
    objectSchema,
  } = t.context
  actionSchema.object = objectSchema

  const result = adventure('find anything')
  result.should.be.length(1)
  const action = result[0]
  action.should.have.interface(actionSchema)
})

test('Find on all described siblings should succeed.', (t) => {
  const {
    actionSchema,
    objectsListSchema,
  } = t.context
  actionSchema.object = objectsListSchema

  const result = adventure('find red all')
  result.should.be.length(1)

  const action = result[0]
  action.should.have.interface(actionSchema)
  action.object.should.be.length(2)
  action.object.should.contain.one.with.property('id', 18)
  action.object.should.contain.one.with.property('id', 19)
})

test('Go on multiple object should fail.', () => {
  const error = adventure('go all')

  error.code.should.equal('aor7')
})

test('Go on general object should fail.', () => {
  const error = adventure('go anything')

  error.code.should.equal('aor7')
})

test('Go using direction should succeed but not resolve.', (t) => {
  const {
    actionSchema,
  } = t.context
  actionSchema.object = {
    value: String,
  }

  const result = adventure('go n')
  result.should.be.length(1)
  const action = result[0]
  action.should.have.interface(actionSchema)
  action.object.value.should.equal('n')
  action.object.should.not.have.property('id')
})

test('Say using a word literal should succeed but not resolve.', (t) => {
  const {
    actionSchema,
  } = t.context
  actionSchema.object = {
    type: String,
    value: String,
  }

  const result = adventure('say "asd"')
  result.should.be.length(1)
  const action = result[0]
  action.should.have.interface(actionSchema)
  action.object.type.should.equal('string')
  action.object.value.should.equal('asd')
  action.object.should.not.have.property('id')
})

test('Find with two multiple descriptors should refine results and succeed.', (t) => {
  const {
    actionSchema,
    objectSchema,
  } = t.context
  actionSchema.object = objectSchema

  const result = adventure('find red rusty fixture')
  result.should.be.length(1)
  const action = result[0]
  action.should.have.interface(actionSchema)
  action.object.id.should.equal(18)
})

test('Read should autoresolve to a fixture if necessary.', (t) => {
  const {
    actionSchema,
    objectSchema,
  } = t.context
  actionSchema.object = objectSchema

  const result = adventure('read')
  result.should.be.length(1)
  const action = result[0]
  action.should.have.interface(actionSchema)
  action.object.id.should.equal(14)
})

test('Look at all should not include fixtures.', (t) => {
  const {
    actionSchema,
    objectsListSchema,
  } = t.context
  actionSchema.object = objectsListSchema

  const result = adventure('look all')
  result.should.be.length(1)
  const action = result[0]
  action.should.have.interface(actionSchema)
  action.object.should.all.not.have.property('id', 14)
})
