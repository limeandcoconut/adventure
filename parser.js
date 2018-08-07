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

    box: 'noun',

    crate: 'noun',

    fish: 'noun',

    all: 'noun',
    everything: 'noun',

    anything: 'noun',

    the: 'article',
    teh: 'article',

    north: 'noun-conversion',
    n: 'noun-conversion',
    south: 'noun-conversion',
    s: 'noun-conversion',
    east: 'noun-conversion',
    e: 'noun-conversion',
    west: 'noun-conversion',
    w: 'noun-conversion',

    get: 'verb',
    take: 'verb',
    pick: 'verb',
    drop: 'verb',
    go: 'verb',
    open: 'verb',
    close: 'verb',
    begin: 'verb-intransitive',
    inventory: 'verb-intransitive',
    i: 'verb-intransitive',

    quickly: 'adverb',

    red: 'adjective',
    rusty: 'adjective',

    u: 'noun-conversion',
    up: 'preposition-adverb-postfix-noun-conversion',

    on: 'preposition-adverb-postfix',

    with: 'preposition-phrase-infix',
    except: 'preposition-phrase-infix',

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
        u: nsew,
        up: nsew,
    }
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
        if (!isObject(token) || isObject(nextToken)) {
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

parser.symbol('noun-conversion', function(tok, rbp) {
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

parser.symbol('preposition-adverb-postfix-noun-conversion',
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

// Implies its' own noun if one is missing; prefix.
parser.symbol('adjective', function(tok) {
    let object
    if (!isObject(parser.token())) {
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
    while (!isObject(left)) {
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
        if (!isObject(token) && token.type !== parser.endToken) {
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
    return type === 'preposition-adverb-postfix-noun-conversion' || type === 'preposition-adverb-postfix'
}

function isObject({type}) {
    return type === 'adjective' || /noun/.test(type)
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
