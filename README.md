# adventure
FPS counter

## Words

### Verbs
- [ ] pick up subaction of get. handles pick up players and the like.
- [ ] kick, chop, poke etc. handle differently than kill
- [ ] get stick (plural or not?) as opposed to get a stick or get 1 stick
- [ ] throw/toss, at / to
- [ ] Reset command that resets score, debug, setup etc.

### Prepositions
- [ ] excep

### Parts of speech
- [ ] verbs
- [ ] nouns
- [ ] adjectives
- [ ] adverbs
- [ ] prepositions - (and prepositional adverbs)
- [ ] definite/indefinite objects
- [ ] pronouns
- [ ] superlatives
- [ ] numbers - determiners (special class)
- [ ] conjunctions
- [ ] punctuation
- [ ] multi-word nouns - perhaps as lexer modificaion (specific words to construct a noun)

## Relationships
- [ ] under and behind are different
- [ ] jump vs jump off contextuallly


## Nouns 
- [ ] Fix determiners and adjectives on multiple nouns


## Goal sentences 
- [ ] DROP THE BIGGEST OF THE LIT STICKS IN THE BOAT THEN DROP IT AND THE LEAST BEST WEAPON IN THE RIVER
- [ ] ONE OF THE GOLD COINS
- [ ] THE THING YOUR AUNT GAVE YOU WHICH YOU DONT KNOW WHAT IT IS
- [ ] OPEN LOCK WITH *HAMMER AND CHISEL* (as multiple indirect objects)
- [ ] TAKE SOME RED STICKS | TAKE ALL RED STICKS
- [ ] GET RED ALL EXCEPT THE STICK
- [ ] GET ANYTHING RED BUT THE APPLE
- [ ] GET A COIN NOT THE SILVER COIN
- [ ] GET SOME RED ROCKS NOT THE BIG ONE

## TODO:

- [ ] Add flag for containers that can't be opened or closed
- [ ] Fix refering to things that are invisible
- [ ] Normalize component returns to either copy Arrays or not

- [ ] Make sure all symbols are necessary. Parser should build plausible structure, interpreter should interpret and validate specifics.
- [ ] Improve implied parts.
- [ ] Improve error handling.
- [ ] Make formatResponse intelligable.
- [ ] Add game error class for expected errors in design like teleporting to wrong id
- [ ] Remove false length optomization on "fors" 

- [ ] Make different narrators: mopey, excited, normal, defensive, etc.
- [ ] Multiple response on room put

- [x] generalize put operation to work for any source and target
- [x] fix bifurcation
- [x] info and responses for multiple steps

## TODO For Resolution and interpretation
- [ ] multiple nouns
- [ ] implicit objects and scope
- [ ] history
- [ ] disambiguation
- [ ] pronouns (here)


## TODO
- [x] unable to parse
- [x] fix word length
- [x] open containers
- [x]  at
- [ ] see checked
- [x] errors as objects
- [ ] begin earlier
- [ ] standardize newlines
- [ ] add history for actions
- [ ] add line history
- [ ] from = dont see any there

- [ ] message for not resolving tools
- [ ] different messages for if you don't have what you couldn't resolve