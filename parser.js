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

    all: 'noun',
    everything: 'noun',

    anything: 'noun',

    the: 'article',
    teh: 'article',

    get: 'verb',
    take: 'verb',
    pick: 'verb',
    drop: 'verb',

    quickly: 'adverb',

    red: 'adjective',
    rusty: 'adjective',

    up: 'preposition-adverb-postfix',

    with: 'preposition-phrase-infix',
    except: 'preposition-phrase-infix',

    and: 'conjunction',
}

let lexer = new Lexer(dictionary, ['article'])

let parser = new Parser(lexer.endToken)

// let parser.expression = parser.parser.expression
// let parser.token = parser.parser.token
// let parser.advance = parser.parser.advance

function infix(id, rbp, lbp, led) {
    lbp = lbp || rbp
    led = led || function(left) {
        return {
            type: id,
            word: this.word,
            direct: left,
            indirect: parser.expression(rbp),
        }
    }
    parser.symbol(id, null, lbp, led)
}

function prefix(id, rbp, nud) {
    nud = nud || function() {
        return {
            type: id,
            word: this.word,
            object: parser.expression(rbp),
        }
    }
    parser.symbol(id, nud)
}

function postfix(id, lbp, led) {
    led = led || function(left) {
        return {
            type: id,
            word: this.word,
            object: left,
        }
    }
    parser.symbol(id, null, lbp, led)
}

function multifix(id, rbp, lbp, led) {
    led = led || function(left) {
        return {
            type: id,
            word: this.word,
            object: left,
        }
    }
    let nud = function() {
        return {
            type: id,
            word: this.word,
            object: parser.expression(rbp),
        }
    }
    parser.symbol(id, nud, lbp, led)
}

function verb(id, rbp) {
    let nud = function() {
        let tok = parser.token()
        if (tok.type === 'preposition-adverb-postfix') {
            parser.advance()
            return tok.led({
                type: id,
                word: this.word,
                object: parser.expression(rbp),
            })
        }

        return {
            type: id,
            word: this.word,
            object: parser.expression(rbp),
        }
    }
    parser.symbol(id, nud)
}

verb('verb', 3)

parser.symbol('noun', noun => noun)
parser.symbol('adjective', function() {
    let object
    if (parser.token().type !== 'noun' && parser.token().type !== 'adjective') {
        object = {
            type: 'noun-standin',
        }
    } else {
        object = parser.expression(7)
    }
    return {
        type: 'adjective',
        word: this.word,
        object,
    }
})

parser.symbol('preposition-adverb-postfix', null, 3, function(left) {
    return {
        type: 'preposition-adverb-postfix',
        word: this.word,
        object: left,
    }
})

parser.symbol('preposition-phrase-infix', null, 4, function(left) {
    let parent
    let top = left
    while (!/(noun|adjective)/.test(left.type)) {
        parent = left
        left = left.object

        if (typeof left === 'undefined') {
            throw new Error('Expected a lefthand noun.')
        }
    }

    let self = {
        type: 'preposition-phrase-infix',
        word: this.word,
        direct: left,
        indirect: parser.expression(5),
    }

    if (!parent) {
        return self
    }

    parent.object = self
    return top

})

// parser.symbol('preposition-adverb-infix', null, 3, function(left) {

// })

multifix('adverb', 7, 3)

parser.symbol('.', () => {
    if (parser.token().type !== this.endToken) {
        return parser.expression(0)
    }
})

parser.symbol('conjunction',
    function() {
        return parser.expression(0)
    },
    6,
    function(left) {
        if (parser.token().type === this.endToken) {
            throw new Error('Unexpected end of statement.')
        }
        if (parser.token().type !== 'noun' && parser.token().type !== 'adjective') {
            return left
        }
        return {
            type: 'conjunction',
            word: this.word,
            left: left,
            right: parser.expression(7),
        }
    },
)

parser.symbol(lexer.endToken)

parser.symbol('number', number => number)

module.exports = (input) => {
    try {
        let tokens = lexer.lex(input)
        let parseTree = parser.parse(tokens)
        return parseTree
    } catch (e) {
        console.log(e)
        return e
    }
}
