# @builtin "whitespace.ne"

@{%
const moo = require('moo')
let lexer = moo.compile({
    complexAdjective: [
        'complex-adjective',
        /(?:your |my )?aunt(?:ie)? gave(?: you| me)/,
        /(?:you |i )?don\'?t know what(?: it is)?/,
    ],
    adjectivalPronoun: [
        'which',
    ],
    conjunction: [
        'and',
        'then',
    ],
    conjunctionPunctuation: [
        ','
    ],
    noun: [
        'rock',
        'stick',
        'box',
        'crate',
        'coin',
        'desk',
        'you',
        'self',
        'wrench',
        'paper',
        'fixture',
        'everything',
        'all',
        'thing',
    ],
    verb: [
        'get',
        'take',
        'put',
        'pick',
        'say',
        'go',
        'begin',
    ],
    deteterminer: [
        'a',
        'an',
        'the',
        'some',
    ],
    adjective: [
        'red',
        'old',
    ],
    preposition: [
        'at',
        'in',
        'with',
        'using',
        'from',
        'except',
    ],
    pronoun: [
        'it',
        'them',
        'those',
        'him',
        'her',
        'us',
    ],
    // adverbialPreposition: [
    //     'up',
    // ],
    adverb: [
        'quickly',
        'quietly',
    ],
    nounVerbConversion: [
        'n',
        'north',
        's',
        'south',
        'e',
        'east',
        'w',
        'west',
        'ne',
        'northeast',
        'nw',
        'northwest',
        'se',
        'southeast',
        'sw',
        'southwest',
        'u',
        'up',
        'd',
        'down',
    ],
    terminator: [
        '.',
    ],
    string: /"(?:\\["\\]|[^\n"\\])*"/,
    number: /0|[1-9][0-9]*/,
    // TODO: should these be non greedy?
    // Remember that one of the format functions below must match this.
    // Consider adding a token that includes a "," for occasions when that would be allowed and ignored.
    _: /[ \t]+/,
    word: /[a-zA-Z]/
})

let prepositionTypes = {
    from: 'from',
    except: 'except',
    using: 'tool',
    with: 'tool',
}

let nounImpliedVerbs
{
    let nsew = {
            type: "verb",
            value: "go",
            text: "go",
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
%}

# Pass your lexer object using the @lexer option:
@lexer lexer

# Grammar

line -> %_:? (input | incompleteSentence) T:? %_:? {% ([, [input]]) => input %}

input -> sentence {% ([sentence]) => [sentence] %}
    | sentence D input {% ([sentence, , sentences]) => [sentence, ...sentences] %}


T -> %_:? %terminator

D -> T %_
    # Consider adding:
    # and,
    # Consider adding:
    # | T %_:? %conjunction %_
    # And normalizing for allowing a lack of space like so: "N,and N"
    | T:? %_ %conjunction %_
    | %_:? %conjunctionPunctuation %_

incompleteSentence -> %verb {% (sentence) => {
        sentence[0].modifiers = []
        return sentence
    } %}
    | adverbPhrase %_ incompleteSentence {% ([adverb, , sentence]) => {
        sentence[0].modifiers.push(adverb)
        return sentence
    } %}
    | %verb %_ adverbialPreposition {% ([verb, , adverb]) => {
        verb.modifiers = [adverb]
        return [verb]
    } %}
    | nounPhrase {% ([noun], location, reject) => noun.converted ? reject : [noun] %}

sentence -> verbPhrase {% id %}
    | adverbPhrase %_ verbPhrase {%
    function([adverb, , verb], location, reject) {
        verb = Object.assign({}, verb)
        verb.modifiers = verb.modifiers.slice()
        verb.modifiers.push(adverb)
        return verb
    } %}
    | verbPhrase %_ adverbPhrase {%
    function([verb, , adverb], location, reject) {
        verb = Object.assign({}, verb)
        verb.modifiers = verb.modifiers.slice()
        verb.modifiers.push(adverb)
        return verb
    } %}

verbPhrase -> %verb %_ nounPhrase {%
    function([verb, , noun], location, reject) {
        verb.object = noun
        verb.modifiers = []
        return verb
    } %}
    | %verb %_ adverbialPreposition %_ nounPhrase {%
    function([verb, , preposition, , noun], location, reject) {
        verb.object = noun
        verb.modifiers = [preposition]
        return verb
    } %}
    | %verb %_ nounPhrase %_ adverbialPreposition {%
    function([verb, , noun, , preposition], location, reject) {
        verb.object = noun
        verb.modifiers = [preposition]
        return verb
    } %}
    | verbPhrase %_ prepositionPhrase {%
    function([verb, , [preposition, , noun]], location, reject) {
        const key = prepositionTypes[preposition] || 'indirect'
        verb = Object.assign({}, verb)
        if (key === 'from' || key === 'except') {
            const contextKey = verb.objectContext || 'object'
            let objectContext = verb[contextKey]
            if (objectContext[key]) {
                return reject
            }
            objectContext = Object.assign({}, objectContext)
            objectContext[key] = noun
            verb[contextKey] = objectContext
            return verb
        }
        if (verb[key]) {
            return reject
        }
        verb.objectContext = key
        verb[key] = noun
        return verb
    } %}
    | %verb %_ %string {%
    function([verb, , string], location, reject) {
        verb.object = string
        return verb
    } %}
    | %nounVerbConversion {%
    function([noun], location, reject) {
        noun = Object.assign({}, noun)
        verb = Object.assign({}, noun, nounImpliedVerbs[noun.text])
        verb.object = noun
        noun.type = 'noun'
        noun.converted = true
        return verb
    } %}

prepositionPhrase -> %preposition %_ nounPhrase

adverbPhrase -> %adverb {% id %}

nounPhrase -> singleNoun {% id %}
    | %pronoun {% id %}
    | nounPhrase %_ %conjunction %_ nounPhrase {%
    function([noun1, , conjunction, , noun2], location, reject) {
        return {
            objects: [noun1, noun2],
        }
    } %}
    | nounPhrase %_:? %conjunctionPunctuation %_ nounPhrase {%
    function([noun1, , conjunction, , noun2], location, reject) {
        return {
            objects: [noun1, noun2],
        }
    } %}


singleNoun -> %noun {%
    function([noun], location, reject) {
        noun.descriptors = []
        return noun
    } %}
    | %nounVerbConversion {%
    function([noun], location, reject) {
        noun = Object.assign({}, noun)
        noun.type = 'noun'
        noun.converted = true
        noun.descriptors = []
        return noun
    } %}
    | %noun %_ adjectivePhrase {%
    function([noun, , adjectives], location, reject) {
        // noun = Object.assign({}, noun)
        // noun.descriptors = noun.descriptors.slice()
        noun.descriptors = [...adjectives]
        return noun
    } %}
    | %adjective %_ singleNoun {%
    function([adjective, , noun], location, reject) {
        noun = Object.assign({}, noun)
        noun.descriptors = noun.descriptors.slice()
        noun.descriptors.push(adjective)
        return noun
    } %}
    # Still unsure about this one.
    | %noun %_ %adjective %_ adjectivePhrase {%
    function([noun, , adjective, , adjectives], location, reject) {
        // noun = Object.assign({}, noun)
        // noun.descriptors = noun.descriptors.slice()
        noun.descriptors = [adjective]
        noun.descriptors = noun.descriptors.concat(adjectives)
        return noun
    } %}
    | %deteterminer %_ singleNoun {%
    function([determiner, , noun], location, reject) {
        noun.determiner = determiner
        return noun
    } %}

adjectivePhrase -> (%adjectivalPronoun %_):? %complexAdjective  {% ([, adjective]) => [adjective] %}
    | (%adjectivalPronoun %_):? %complexAdjective (%_:? %conjunctionPunctuation):? %_ adjectivePhrase {% ([, adjective1, , , [adjective2]]) => [adjective1, adjective2] %}


# Lexical additions:

adverbialPreposition -> "up"
