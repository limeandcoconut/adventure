const adventure = require('../main.js')
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

    'debug: get fixture',
    'get fixture from box',
    'get fixture from crate',
    'get a fixture',
    'get all',
    'get all except you',
    'get rock except you and coin',
    'get all except you and coin',
    'get rock from you and coin',
    'get thing from you and crate',
]

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
    null,
    null,
    /bolt/i,
    /bolt|screw/i,
    /crate|screw|rock/i,
    /crate|screw|rock/i,
    /rock/i,
    /crate|screw|rock/i,
    null,
    /thing/i,
]

const responses = []
while (lines.length) {
    try {
        let response = adventure(lines.shift())
        console.log('response')
        console.log(response)
        responses.push(response)
    } catch (error) {
        console.log('error')
        console.log(error)
        responses.push(null)
    }
}

console.log('\n\ntests:\n')
while (responses.length) {
    let response = responses.shift()
    let expectation = expect.shift()
    // console.log(response)
    if (!response) {
        console.log(response === expectation)
        continue
    }
    if (Array.isArray(response)) {
        console.log()
        while (response.length) {
            let name = response.shift().descriptors.name
            console.log(name)
            console.log(expectation.test(name))
        }
        console.log()
        continue
    }
    let name = response.descriptors.name
    console.log(expectation.test(name))
}
