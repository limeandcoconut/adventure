// Generated automatically by nearley, version 2.15.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

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
        'stick',
        'sign',
        'you',
        'self',
        'coin',
        'money',
        'THING',
        'thing',
        'thign',
        'rock',
        'crate',
        'fixture',
        'bolt',
        'screw',
        'box',
        'wrench',
        'desk',
        'table',
        'tray',
        'basket',
        'pencil',
        'paper',
        'yes',
        /no(?=\s|$)/,
        'option',
        'optoin',
        'weight',
        'sack',
        'bag',
        'cloth',
        'fish',
        'room',
        'anything',
        'everything',
        'all',
    ],
    deteterminer: [
        /a(?=\s|$)/,
        'an',
        'the',
        /some(?=\s|$)/,
    ],
    adjective: [
        'red',
        'rusty',
        'heavy',
        'lead',
        'silver',
        'round',
        'cold',
        'shiny',
        'wire',
        'mesh',
        'plastic',
        'laminated',
        'outdated',
        'seafoam',
        'chipped',
        'option',
        'yellow',
        'ticonderoga',
    ],
    verb: [
        'find',
        'dowse',
        'put',
        'get',
        'take',
        'pick',
        'drop',
        'open',
        'close',
        'read',
        'go',
        'check',
        'uncheck',
        'look',
        /l(?=\s|$)/,
        'begin',
        'inventory',
        /i(?=\s|$)/,
        'say',
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
    // See the non-token 'adverbialPreposition ->' below.
    //     'up',
    //     'at',
    // ],
    adverb: [
        'quickly',
        'quietly',
    ],
    nounVerbConversion: [
        /n(?=\s|$)/,
        'north',
        /s(?=\s|$)/,
        'south',
        /e(?=\s|$)/,
        'east',
        /w(?=\s|$)/,
        'west',
        /ne(?=\s|$)/,
        'northeast',
        /nw(?=\s|$)/,
        'northwest',
        /se(?=\s|$)/,
        'southeast',
        /sw(?=\s|$)/,
        'southwest',
        /u(?=\s|$)/,
        /up(?=\s|$)/,
        /d(?=\s|$)/,
        'down',
    ],
    terminator: [
        '.',
    ],
    string: {
        match: /"(?:\\["\\]|[^\n"\\])*?"/,
        value(x) {
            return x.slice(1, -1)
        },
    },
    number: /0|[1-9][0-9]*/,
    // TODO: should these be non greedy?
    // Remember that one of the format functions below must match this.
    // Consider adding a token that includes a "," for occasions when that would be allowed and ignored.
    _: /[ \t]+/,
    word: /[a-zA-Z]+(?=\s|$)/
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
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "line$ebnf$1", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "line$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "line$subexpression$1", "symbols": ["input"]},
    {"name": "line$subexpression$1", "symbols": ["incompleteSentence"]},
    {"name": "line$ebnf$2", "symbols": ["T"], "postprocess": id},
    {"name": "line$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "line$ebnf$3", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "line$ebnf$3", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "line", "symbols": ["line$ebnf$1", "line$subexpression$1", "line$ebnf$2", "line$ebnf$3"], "postprocess": ([, [input]]) => input},
    {"name": "input", "symbols": ["sentence"], "postprocess": ([sentence]) => [sentence]},
    {"name": "input", "symbols": ["sentence", "D", "input"], "postprocess": ([sentence, , sentences]) => [sentence, ...sentences]},
    {"name": "T$ebnf$1", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "T$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "T", "symbols": ["T$ebnf$1", (lexer.has("terminator") ? {type: "terminator"} : terminator)]},
    {"name": "D", "symbols": ["T", (lexer.has("_") ? {type: "_"} : _)]},
    {"name": "D$ebnf$1", "symbols": ["T"], "postprocess": id},
    {"name": "D$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "D", "symbols": ["D$ebnf$1", (lexer.has("_") ? {type: "_"} : _), (lexer.has("conjunction") ? {type: "conjunction"} : conjunction), (lexer.has("_") ? {type: "_"} : _)]},
    {"name": "D$ebnf$2", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "D$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "D", "symbols": ["D$ebnf$2", (lexer.has("conjunctionPunctuation") ? {type: "conjunctionPunctuation"} : conjunctionPunctuation), (lexer.has("_") ? {type: "_"} : _)]},
    {"name": "incompleteSentence", "symbols": [(lexer.has("verb") ? {type: "verb"} : verb)], "postprocess":  (sentence) => {
            sentence[0].modifiers = []
            return sentence
        } },
    {"name": "incompleteSentence", "symbols": ["adverbPhrase", (lexer.has("_") ? {type: "_"} : _), "incompleteSentence"], "postprocess":  ([adverb, , sentence]) => {
            sentence[0].modifiers.push(adverb)
            return sentence
        } },
    {"name": "incompleteSentence", "symbols": [(lexer.has("verb") ? {type: "verb"} : verb), (lexer.has("_") ? {type: "_"} : _), "adverbialPreposition"], "postprocess":  ([verb, , adverb]) => {
            verb.modifiers = [adverb]
            return [verb]
        } },
    {"name": "incompleteSentence", "symbols": ["nounPhrase"], "postprocess": ([noun], location, reject) => noun.converted ? reject : [noun]},
    {"name": "sentence", "symbols": ["verbPhrase"], "postprocess": id},
    {"name": "sentence", "symbols": ["adverbPhrase", (lexer.has("_") ? {type: "_"} : _), "verbPhrase"], "postprocess": 
        function([adverb, , verb], location, reject) {
            verb = Object.assign({}, verb)
            verb.modifiers = verb.modifiers.slice()
            verb.modifiers.push(adverb)
            return verb
        } },
    {"name": "sentence", "symbols": ["verbPhrase", (lexer.has("_") ? {type: "_"} : _), "adverbPhrase"], "postprocess": 
        function([verb, , adverb], location, reject) {
            verb = Object.assign({}, verb)
            verb.modifiers = verb.modifiers.slice()
            verb.modifiers.push(adverb)
            return verb
        } },
    {"name": "verbPhrase", "symbols": [(lexer.has("verb") ? {type: "verb"} : verb), (lexer.has("_") ? {type: "_"} : _), "nounPhrase"], "postprocess": 
        function([verb, , noun], location, reject) {
            verb.object = noun
            verb.modifiers = []
            return verb
        } },
    {"name": "verbPhrase", "symbols": [(lexer.has("verb") ? {type: "verb"} : verb), (lexer.has("_") ? {type: "_"} : _), "adverbialPreposition", (lexer.has("_") ? {type: "_"} : _), "nounPhrase"], "postprocess": 
        function([verb, , preposition, , noun], location, reject) {
            verb.object = noun
            verb.modifiers = [preposition]
            return verb
        } },
    {"name": "verbPhrase", "symbols": [(lexer.has("verb") ? {type: "verb"} : verb), (lexer.has("_") ? {type: "_"} : _), "nounPhrase", (lexer.has("_") ? {type: "_"} : _), "adverbialPreposition"], "postprocess": 
        function([verb, , noun, , preposition], location, reject) {
            verb.object = noun
            verb.modifiers = [preposition]
            return verb
        } },
    {"name": "verbPhrase", "symbols": ["verbPhrase", (lexer.has("_") ? {type: "_"} : _), "prepositionPhrase"], "postprocess": 
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
        } },
    {"name": "verbPhrase", "symbols": [(lexer.has("verb") ? {type: "verb"} : verb), (lexer.has("_") ? {type: "_"} : _), (lexer.has("string") ? {type: "string"} : string)], "postprocess": 
        function([verb, , string], location, reject) {
            verb.object = string
            return verb
        } },
    {"name": "verbPhrase", "symbols": [(lexer.has("nounVerbConversion") ? {type: "nounVerbConversion"} : nounVerbConversion)], "postprocess": 
        function([noun], location, reject) {
            noun = Object.assign({}, noun)
            verb = Object.assign({}, noun, nounImpliedVerbs[noun.text])
            verb.modifiers = []
            verb.object = noun
            noun.type = 'noun'
            noun.converted = true
            return verb
        } },
    {"name": "prepositionPhrase", "symbols": [(lexer.has("preposition") ? {type: "preposition"} : preposition), (lexer.has("_") ? {type: "_"} : _), "nounPhrase"]},
    {"name": "adverbPhrase", "symbols": [(lexer.has("adverb") ? {type: "adverb"} : adverb)], "postprocess": id},
    {"name": "nounPhrase", "symbols": ["singleNoun"], "postprocess": id},
    {"name": "nounPhrase", "symbols": [(lexer.has("pronoun") ? {type: "pronoun"} : pronoun)], "postprocess": id},
    {"name": "nounPhrase", "symbols": ["nounPhrase", (lexer.has("_") ? {type: "_"} : _), (lexer.has("conjunction") ? {type: "conjunction"} : conjunction), (lexer.has("_") ? {type: "_"} : _), "nounPhrase"], "postprocess": 
        function([noun1, , conjunction, , noun2], location, reject) {
            return {
                objects: [noun1, noun2],
            }
        } },
    {"name": "nounPhrase$ebnf$1", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "nounPhrase$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "nounPhrase", "symbols": ["nounPhrase", "nounPhrase$ebnf$1", (lexer.has("conjunctionPunctuation") ? {type: "conjunctionPunctuation"} : conjunctionPunctuation), (lexer.has("_") ? {type: "_"} : _), "nounPhrase"], "postprocess": 
        function([noun1, , conjunction, , noun2], location, reject) {
            return {
                objects: [noun1, noun2],
            }
        } },
    {"name": "singleNoun", "symbols": [(lexer.has("noun") ? {type: "noun"} : noun)], "postprocess": 
        function([noun], location, reject) {
            noun.descriptors = []
            return noun
        } },
    {"name": "singleNoun", "symbols": [(lexer.has("nounVerbConversion") ? {type: "nounVerbConversion"} : nounVerbConversion)], "postprocess": 
        function([noun], location, reject) {
            noun = Object.assign({}, noun)
            noun.type = 'noun'
            noun.converted = true
            noun.descriptors = []
            return noun
        } },
    {"name": "singleNoun", "symbols": [(lexer.has("noun") ? {type: "noun"} : noun), (lexer.has("_") ? {type: "_"} : _), "adjectivePhrase"], "postprocess": 
        function([noun, , adjectives], location, reject) {
            // noun = Object.assign({}, noun)
            // noun.descriptors = noun.descriptors.slice()
            noun.descriptors = [...adjectives]
            return noun
        } },
    {"name": "singleNoun", "symbols": [(lexer.has("adjective") ? {type: "adjective"} : adjective), (lexer.has("_") ? {type: "_"} : _), "singleNoun"], "postprocess": 
        function([adjective, , noun], location, reject) {
            noun = Object.assign({}, noun)
            noun.descriptors = noun.descriptors.slice()
            noun.descriptors.push(adjective)
            return noun
        } },
    {"name": "singleNoun", "symbols": [(lexer.has("noun") ? {type: "noun"} : noun), (lexer.has("_") ? {type: "_"} : _), (lexer.has("adjective") ? {type: "adjective"} : adjective), (lexer.has("_") ? {type: "_"} : _), "adjectivePhrase"], "postprocess": 
        function([noun, , adjective, , adjectives], location, reject) {
            // noun = Object.assign({}, noun)
            // noun.descriptors = noun.descriptors.slice()
            noun.descriptors = [adjective]
            noun.descriptors = noun.descriptors.concat(adjectives)
            return noun
        } },
    {"name": "singleNoun", "symbols": [(lexer.has("deteterminer") ? {type: "deteterminer"} : deteterminer), (lexer.has("_") ? {type: "_"} : _), "singleNoun"], "postprocess": 
        function([determiner, , noun], location, reject) {
            noun.determiner = determiner
            return noun
        } },
    {"name": "adjectivePhrase$ebnf$1$subexpression$1", "symbols": [(lexer.has("adjectivalPronoun") ? {type: "adjectivalPronoun"} : adjectivalPronoun), (lexer.has("_") ? {type: "_"} : _)]},
    {"name": "adjectivePhrase$ebnf$1", "symbols": ["adjectivePhrase$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "adjectivePhrase$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "adjectivePhrase", "symbols": ["adjectivePhrase$ebnf$1", (lexer.has("complexAdjective") ? {type: "complexAdjective"} : complexAdjective)], "postprocess": ([, adjective]) => [adjective]},
    {"name": "adjectivePhrase$ebnf$2$subexpression$1", "symbols": [(lexer.has("adjectivalPronoun") ? {type: "adjectivalPronoun"} : adjectivalPronoun), (lexer.has("_") ? {type: "_"} : _)]},
    {"name": "adjectivePhrase$ebnf$2", "symbols": ["adjectivePhrase$ebnf$2$subexpression$1"], "postprocess": id},
    {"name": "adjectivePhrase$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "adjectivePhrase$ebnf$3$subexpression$1$ebnf$1", "symbols": [(lexer.has("_") ? {type: "_"} : _)], "postprocess": id},
    {"name": "adjectivePhrase$ebnf$3$subexpression$1$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "adjectivePhrase$ebnf$3$subexpression$1", "symbols": ["adjectivePhrase$ebnf$3$subexpression$1$ebnf$1", (lexer.has("conjunctionPunctuation") ? {type: "conjunctionPunctuation"} : conjunctionPunctuation)]},
    {"name": "adjectivePhrase$ebnf$3", "symbols": ["adjectivePhrase$ebnf$3$subexpression$1"], "postprocess": id},
    {"name": "adjectivePhrase$ebnf$3", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "adjectivePhrase", "symbols": ["adjectivePhrase$ebnf$2", (lexer.has("complexAdjective") ? {type: "complexAdjective"} : complexAdjective), "adjectivePhrase$ebnf$3", (lexer.has("_") ? {type: "_"} : _), "adjectivePhrase"], "postprocess": ([, adjective1, , , [adjective2]]) => [adjective1, adjective2]},
    {"name": "adverbialPreposition", "symbols": [{"literal":"at"}]},
    {"name": "adverbialPreposition", "symbols": [{"literal":"up"}]}
]
  , ParserStart: "line"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
