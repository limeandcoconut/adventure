const adventure = require('../main.js')
const chai = require('chai')
// const CircularJSON = require('circular-json')
// chai.use(require('chai-json-schema'))
// chai.use(require('chai-like'))
chai.use(require('chai-interface'))
chai.should()

const lines = [
    // 'debug: get thing',
    // 'get box',
    // 'get crate',
    // 'get rock',
    // 'get coin',
    // 'get wrench',
    // 'get desk',
    // 'get you',
    // 'get paper',
    // 'get paper from desk',

    // 'get fixture',
    // 'get fixture from box',
    'get fixture from crate',
    'get a fixture',
    'get all',
    'get all except you',
    'get rock except you and coin',
    'get all except you and coin',
    'get rock from you and coin',
    'get thing from you and crate',
]

const objectSchema = {
    id: Number,
}

const objectsListSchema = [objectSchema]

const nounFromSchema = {from: objectSchema}
const nounExceptSchema = {except: objectSchema}
const nounComplexSchema = {from: objectSchema, except: objectSchema}

const verbSchema = {
    type: String,
    value: String,
    modifiers: Array,
}

const actionSchema = {
    type: String,
    word: String,
    live: Boolean,
    steps: {},
    entity: objectSchema,
    verb: verbSchema,
}

// const actionSchema = {
//     type: 'object',
//     required: ['type', 'verb', 'entity', 'live', 'steps', 'word'],
//     properties: {
//         type: {type: 'string'},
//         word: {type: 'string'},
//         live: {type: 'boolean'},
//         steps: {type: 'object'},
//         verb: {
//             type: 'object',
//             required: ['value'],
//             properties: {
//                 value: {
//                     type: 'string',
//                 },
//             },
//         },
//         entity: {
//             type: 'object',
//             required: ['id'],
//             properties: {
//                 id: {
//                     type: 'number',
//                     minimum: 10,
//                 },
//             },
//         },
//         object: {$ref: '#/definitions/objects'},
//         indirect: {$ref: '#/definitions/complexObject'},
//         tool: {$ref: '#/definitions/complexObject'},
//     },

//     definitions: {
//         object: {
//             type: 'object',
//             required: ['id'],
//             properties: {
//                 id: {
//                     type: 'number',
//                     minimum: 10,
//                 },
//             },
//         },

//         complexObject: {
//             allOf: [
//                 {$ref: '#/definitions/object'},
//                 {
//                     properties: {
//                         from: {$ref: '#/definitions/object'},
//                         except: {$ref: '#/definitions/object'},
//                     },
//                 },
//             ],
//         },

//         objects: {
//             oneOf: [
//                 {$ref: '#/definitions/complexObject'},
//                 {type: 'array', items: {$ref: '#/definitions/complexObject'}},
//             ],
//         },
//     },
// }

let expect = [
    // 'thing',
    // 'box',
    // 'crate',
    // 'rock',
    // 'coin',
    // null,
    // null,
    // 'you',
    // null,
    // null,
    // null,
    // null,
    /bolt/i,
    [{
        type: 'get',
        object: {
            id: 19,
            from: [

            ],
        },
    }],
    /bolt|screw/i,
    /crate|screw|rock/i,
    /crate|screw|rock/i,
    /rock/i,
    /crate|screw|rock/i,
    null,
    /thing/i,
]

adventure.debugMode = 'resolve'

actionSchema.object = objectSchema
// actionSchema.object.from = objectSchema
actionSchema.verb.object = nounFromSchema
// actionSchema.verb.object.from = objectSchema

const result = adventure('find bolt from crate')
result.should.be.length(1)
const action = result[0]
action.should.have.interface(actionSchema)
action.type.should.equal('find')
action.object.id.should.equal(19)
action.verb.object.from.id.should.equal(16)
action.verb.object.from.id.should.equal(action.object.location.parent.id)
// adventure('find rock')[0].should.like(actionSchema)
// let test = {word: 'foo'}
// test.should.have.interface(actionSchema)
// test.should.like(actionSchema)

// const responses = []
// while (lines.length) {
//     try {
//         let response = adventure(lines.shift())
//         console.log('response')
//         // console.log(response)
//         // responses.push(response)
//     } catch (error) {
//         console.log('error')
//         console.log(error)
//         // responses.push(null)
//     }
// }

// console.log('\n\ntests:\n')
// while (responses.length) {
//     let response = responses.shift()
//     let expectation = expect.shift()
//     // console.log(response)
//     if (!response) {
//         console.log(response === expectation)
//         continue
//     }
//     if (Array.isArray(response)) {
//         console.log()
//         while (response.length) {
//             let name = response.shift().descriptors.name
//             console.log(name)
//             console.log(expectation.test(name))
//         }
//         console.log()
//         continue
//     }
//     let name = response.descriptors.name
//     console.log(expectation.test(name))
// }
