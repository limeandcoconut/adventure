const {Parser, Lexer} = require('parser')
/* eslint-disable require-jsdoc */

let dictionary = {
    THING: 'noun',
    thing: 'noun',
    thign: 'noun',

    rock: 'noun',

    screw: 'noun',
    bolt: 'noun',
    fixture: 'noun',

    wrench: 'noun',

    weight: 'noun',

    box: 'noun',

    crate: 'noun',

    fish: 'noun',

    room: 'pronoun',

    all: 'noun-multiple',
    everything: 'noun-multiple',

    anything: 'noun',

    the: 'article',
    teh: 'article',

    north: 'noun-verb-conversion',
    n: 'noun-verb-conversion',
    south: 'noun-verb-conversion',
    s: 'noun-verb-conversion',
    east: 'noun-verb-conversion',
    e: 'noun-verb-conversion',
    west: 'noun-verb-conversion',
    w: 'noun-verb-conversion',
    ne: 'noun-verb-conversion',
    northeast: 'noun-verb-conversion',
    nw: 'noun-verb-conversion',
    northwest: 'noun-verb-conversion',
    se: 'noun-verb-conversion',
    southeast: 'noun-verb-conversion',
    sw: 'noun-verb-conversion',
    southwest: 'noun-verb-conversion',
    d: 'noun-verb-conversion',
    down: 'noun-verb-conversion',

    get: 'verb',
    take: 'verb',
    pick: 'verb',
    drop: 'verb',
    go: 'verb',
    open: 'verb',
    close: 'verb',
    put: 'verb',
    look: 'verb-noun-conversion',
    l: 'verb-noun-conversion',
    begin: 'verb-intransitive',
    inventory: 'verb-intransitive',
    i: 'verb-intransitive',

    quickly: 'adverb',

    red: 'adjective',
    rusty: 'adjective',
    heavy: 'adjective',
    lead: 'adjective',

    u: 'noun-verb-conversion',
    up: 'preposition-adverb-postfix-noun-verb-conversion',

    on: 'preposition-adverb-postfix',

    at: 'preposition-adverb-postfix',

    with: 'preposition-phrase-infix',
    except: 'preposition-phrase-infix',

    in: 'preposition-phrase-infix',

    and: 'conjunction',

    parsethrow: 'parse-throw',
    pthrow: 'parse-throw',
    interpretererror: 'interpreter-error',
    ierror: 'interpreter-error',
}

// let northConversion = {
//     type: 'adverb',
//     word: 'north',
//     object: {
//         type: 'verb-intransitive',
//         word: 'go',
//     },
// }

// let nounConversions = {
//     n: northConversion,
//     north: northConversion,
// }
let nounImpliedVerbs
{
    let nsew = {
        type: dictionary.go,
        word: 'go',
    }

    nounImpliedVerbs = {
        n: nsew,
        north: nsew,
        s: nsew,
        south: nsew,
        e: nsew,
        east: nsew,
        w: nsew,
        west: nsew,
        ne: nsew,
        northeast: nsew,
        nw: nsew,
        northwest: nsew,
        se: nsew,
        southeast: nsew,
        sw: nsew,
        southwest: nsew,
        u: nsew,
        up: nsew,
        d: nsew,
        down: nsew,
    }
}

let look = {
    type: dictionary.room,
    word: 'room',
}
let verbImpliedNouns = {
    look,
    l: look,
}

let lexer = new Lexer(dictionary, ['article'])

let parser = new Parser(lexer.endToken)

// function infix(id, rbp, lbp, led) {
//     lbp = lbp || rbp
//     led = led || function(left) {
//         return {
//             type: id,
//             word: this.word,
//             direct: left,
//             indirect: parser.expression(rbp),
//         }
//     }
//     parser.symbol(id, null, lbp, led)
// }

// function prefix(id, rbp, nud) {
//     nud = nud || function() {
//         return {
//             type: id,
//             word: this.word,
//             object: parser.expression(rbp),
//         }
//     }
//     parser.symbol(id, nud)
// }

// function postfix(id, lbp, led) {
//     led = led || function(left) {
//         return {
//             type: id,
//             word: this.word,
//             object: left,
//         }
//     }
//     parser.symbol(id, null, lbp, led)
// }

function multifix(id, rbp, lbp, led) {
    led = led || function(left, tok) {
        return {
            type: id,
            word: tok.word,
            object: left,
        }
    }
    let nud = function(tok) {
        return {
            type: id,
            word: tok.word,
            object: parser.expression(rbp, tok),
        }
    }
    parser.symbol(id, nud, lbp, led)
}

multifix('adverb', 7, 3)

// TODO: Clean up symbol functions
// TODO: Generalize adverb-conversions
// TODO: fix adverbImpliedVerbs
// TODO: throw if an expression doesn't end in a period or conjunction

// Adjusts for prepositions, is a prefix.
parser.symbol('verb', function(tok) {
    let token = parser.token()
    if (isPrepositionAdverb(token)) {
        let nextToken = parser.advance()
        // If the next token couldn't be an object use it as an adverb.
        // Or, if the token after that is an object use it as an adverb.
        if (!isObject(token, true) || isObject(nextToken, true)) {
            // parser.advance()
            // Needs to advance before getting the expression. Dry code.
            return token.led({
                type: 'verb',
                word: tok.word,
                object: parser.expression(3, tok),
            }, token)
        }
        // Rewind since the token is not being used as an adverb.
        parser.rewind(false)

    }

    let object = parser.expression(3, tok)

    return {
        type: 'verb',
        word: tok.word,
        object,
    }
})

// Adjusts for prepositions, is a prefix.
parser.symbol('verb-noun-conversion', function(tok) {
    let token = parser.token()
    let objectToken = token
    if (isPrepositionAdverb(token)) {
        objectToken = parser.advance()
        // If the next token couldn't be an object use it as an adverb.
        // if (!isObject(token)) {
        // If the token after that is an object use it as an adverb.
        // }
        // Rewind since the token is not being used as an adverb.
        // parser.rewind(false)

    }

    let object
    if (isObject(objectToken, true)) {
        object = parser.expression(3, tok)
    } else {
        object = verbImpliedNouns[tok.word]
    }

    if (objectToken !== token) {
        return token.led({
            type: 'verb',
            word: tok.word,
            object,
        }, token)

        // let object = parser.expression(3, tok)
    }
    // parser.advance()
    // Needs to advance before getting the expression. Dry code.

    return {
        type: 'verb',
        word: tok.word,
        object,
    }
})

parser.symbol('verb-intransitive', verb => verb)

parser.symbol('interpreter-error', interpreterError => interpreterError)

// Implies verb in nud or is a postfix.
// parser.symbol('adverb-conversion', function(tok) {
//     let verb = adverbImpliedVerbs[tok.word]
//     let verbToken = parser.interpretToken(verb)
//     return this.led(verbToken, tok)
// }, 3, function(left, tok) {
//     return {
//         type: 'adverb',
//         word: tok.word,
//         object: left,
//     }
// })

parser.symbol('noun-verb-conversion', function(tok, rbp) {
    let noun = {
        type: 'noun',
        word: tok.word,
    }
    if (rbp) {
        return noun
    }
    let verb = nounImpliedVerbs[tok.word]
    let token = parser.interpretToken(verb)
    parser.rewind(false)
    parser.tokens[parser.index] = noun
    return token.nud(token, rbp)
})

parser.symbol('preposition-adverb-postfix-noun-verb-conversion',
    function(tok, rbp) {
        let noun = {
            type: 'noun',
            word: tok.word,
        }
        if (rbp) {
            return noun
        }
        // Get the implied verb and interpret it.
        let verb = nounImpliedVerbs[tok.word]
        let token = parser.interpretToken(verb)
        // Rewind the parser to this token again.
        parser.rewind(false)
        // Replace this token with it's noun version.
        parser.tokens[parser.index] = noun
        return token.nud(token, rbp)
    },
    3,
    function(left, tok) {
        return {
            type: 'preposition-adverb-postfix',
            word: tok.word,
            object: left,
        }
    }
)

parser.symbol('noun', noun => noun)

parser.symbol('pronoun', noun => noun)

parser.symbol('noun-multiple', noun => noun)

// Implies its' own noun if one is missing; prefix.
parser.symbol('adjective', function(tok) {
    let object
    if (!isObject(parser.token(), true)) {
        object = {
            type: 'noun',
            word: 'anything',
        }
    } else {
        object = parser.expression(7, tok)
    }
    return {
        type: 'adjective',
        word: tok.word,
        object,
    }
})

parser.symbol('preposition-adverb-postfix', null, 3, function(left, tok) {
    return {
        type: 'preposition-adverb-postfix',
        word: tok.word,
        object: left,
    }
})

parser.symbol('preposition-phrase-infix', null, 4, function(left, tok) {
    let parent
    let top = left
    while (!isObject(left, true) && left.type !== 'conjunction') {
        parent = left
        left = left.object
    }

    let self = {
        type: 'preposition-phrase-infix',
        word: tok.word,
        direct: left,
        indirect: parser.expression(5, tok),
    }

    if (!parent) {
        return self
    }

    parent.object = self
    return top

})

parser.symbol('.', (tok) => {
    if (parser.token().type !== parser.endToken) {
        return parser.expression(0, tok)
    }
})

parser.symbol('conjunction',
    function(tok) {
        return parser.expression(0, tok)
    },
    6,
    function(left, tok) {
        let token = parser.token()
        if (!isObject(token, true) && token.type !== parser.endToken) {
            return left
        }
        return {
            type: 'conjunction',
            word: tok.word,
            left: left,
            right: parser.expression(7, tok),
        }
    },
)

parser.symbol(lexer.endToken)

function isPrepositionAdverb({type}) {
    return type === 'preposition-adverb-postfix-noun-verb-conversion' || type === 'preposition-adverb-postfix'
}

function isObject({type}, greedy = false) {
    return type === 'adjective' || type === 'noun' || (greedy && /noun/.test(type) && !/verb/.test(type))
}

module.exports = {
    friendlyParse: (input) => {
        try {
            let tokens = lexer.lex(input)
            let parseTree = parser.parse(tokens)
            return parseTree
        } catch (error) {
            console.log(error)
            if (error.isLexError || error.isParseError) {
                return error
            }
            throw error
        }
    },
    parser,
    lexer,
}
