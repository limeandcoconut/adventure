const test = require('ava')
const adventure = require('../main')

// CREATING

// test.beforeEach((t) => {

// })

test.before((t) => {
    adventure('debug: begin')
})

test('Get on single, accessible, apparent, labeled, top sibling should succeed.', (t) => {
    t.true(adventure('get box').descriptors.name === 'box')
})

test('Get on single, accessible, apparent, labeled, nested sibling should succeed.', (t) => {
    t.true(adventure('get box').descriptors.name === 'box')
})

// // CONSTRUCTORS

// test('Creating an instance should throw if passed invalid parameters', (t) => {
//     let ef = t.ef
//     t.throws(() => {
//             ef.registerConstructor(1, () => {})
//         },
//         TypeError, /parameter/i)

//     t.throws(() => {
//             ef.registerConstructor('foo', 'constructorName')
//         },
//         TypeError, /parameter/i)
// })

// test('Creating an instance should store function in registry', (t) => {
//     let ef = t.ef
//     let registrySymbol = t.registrySymbol
//     ef.registerConstructor('test', () => {
//         return 'abc'
//     })

//     t.true(ef[registrySymbol].size === 1)
// })

// test('Creating an instance should result in a map entry keyed properly', (t) => {
//     let ef = t.ef
//     let registrySymbol = t.registrySymbol
//     let constructorName = 'test'

//     ef.registerConstructor(constructorName, () => {
//         return 'abc'
//     })

//     let constructorKey = constructorName.charAt(0).toUpperCase() + constructorName.slice(1)

//     t.true(ef[registrySymbol].has(constructorKey))
// })
