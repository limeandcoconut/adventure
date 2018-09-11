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
    /you|crate|.*/i,
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
        while (response.length) {
            let name = response.shift().descriptors.name
            console.log(expectation.test(name))
        }
        continue
    }
    let name = response.descriptors.name
    console.log(expectation.test(name))
}
