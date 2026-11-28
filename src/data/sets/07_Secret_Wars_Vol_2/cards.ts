import type { DeckEntry, MastermindData } from '../../../engine/types'

// Karty Secret Wars Vol. 2. Dane dopisujemy grupami (bohaterowie, złoczyńcy, henchmeni, mastermindzi).
// Obrazki leżą w public/cards/secret-wars-vol-2/<id>.webp
export const img = (id: string) => `/cards/secret-wars-vol-2/${id}.webp`

export const AGENT_VENOM_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'secret-wars-2-agent-venom-multi-gun', name: 'Multi-Gun', hero: 'Agent Venom', img: img('secret-wars-2-agent-venom-multi-gun'), team: ['spider-friends'], type: ['tech'], recruit: 1, attack: 1, cost: 2, text: 'Spectrum: You get +1 Recruit and +1 Attack.', flavor: 'His weapons are as versatile as Venom himself.' } },
  { count: 5, card: { id: 'secret-wars-2-agent-venom-government-payroll', name: 'Government Payroll', hero: 'Agent Venom', img: img('secret-wars-2-agent-venom-government-payroll'), team: ['spider-friends'], type: ['strength', 'instinct'], recruit: 0, attack: 0, cost: 3, keywords: ['wall-crawl'], text: "Wall-Crawl. Patrol the Bank: If it's empty, you get +2 Recruit. If it's not, you get +2 Attack." } },
  { count: 3, card: { id: 'secret-wars-2-agent-venom-big-slimeportunity', name: 'Big Slimeportunity', hero: 'Agent Venom', img: img('secret-wars-2-agent-venom-big-slimeportunity'), team: ['spider-friends'], type: ['instinct'], recruit: 2, attack: 2, cost: 6, keywords: ['wall-crawl'], text: "Wall-Crawl. Patrol the Sewers: If it's empty, draw a card.", flavor: 'Flash Thompson combines elite military training with Venom symbiote.' } },
  { count: 1, card: { id: 'secret-wars-2-agent-venom-shapeshifting-symbiote', name: 'Shapeshifting Symbiote', hero: 'Agent Venom', img: img('secret-wars-2-agent-venom-shapeshifting-symbiote'), team: ['spider-friends'], type: ['strength'], recruit: 0, attack: 0, cost: 7, keywords: ['wall-crawl'], text: 'Wall-Crawl. For each other card you played this turn with a Recruit icon, you get +1 Recruit.\nFor each other card you played this turn with a Attack icon, you get +1 Attack.\n(If another card has both Recruit and Attack, you get both bonuses.)' } },
]

export const ARKON_THE_MAGNIFICENT_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'secret-wars-2-arkon-the-magnificent-all-terrain-barbarian', name: 'All-Terrain Barbarian', hero: 'Arkon the Magnificent', img: img('secret-wars-2-arkon-the-magnificent-all-terrain-barbarian'), type: ['strength', 'covert'], recruit: 2, cost: 3, keywords: ['wall-crawl'], text: "Wall-Crawl. Patrol the Sewers: If it's empty, you get +1 Recruit.", flavor: 'Even beneath the surface, Arkon conquers them all.' } },
  { count: 5, card: { id: 'secret-wars-2-arkon-the-magnificent-quiver-of-thunderbolts', name: 'Quiver of Thunderbolts', hero: 'Arkon the Magnificent', img: img('secret-wars-2-arkon-the-magnificent-quiver-of-thunderbolts'), type: ['ranged'], attack: 2, cost: 3, text: 'Spectrum: Draw a card.', flavor: 'A Quiver of Thunderbolts is quite unorthodox but totally awesome.' } },
  { count: 3, card: { id: 'secret-wars-2-arkon-the-magnificent-warlord-of-open-spaces', name: 'Warlord of Open Spaces', hero: 'Arkon the Magnificent', img: img('secret-wars-2-arkon-the-magnificent-warlord-of-open-spaces'), type: ['instinct'], attack: 3, cost: 5, text: "Patrol two adjacent city spaces: If they're both empty, you get +1 Attack." } },
  { count: 1, card: { id: 'secret-wars-2-arkon-the-magnificent-lord-of-dragons', name: 'Lord of Dragons', hero: 'Arkon the Magnificent', img: img('secret-wars-2-arkon-the-magnificent-lord-of-dragons'), type: ['instinct'], recruit: 0, attack: 0, cost: 7, text: "Patrol the Rooftops: If it's empty, you get +4 Recruit and +4 Attack. If it's not, defeat the Villain there for free." } },
]

export const BEAST_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'secret-wars-2-beast-balanced-attack', name: 'Balanced Attack', hero: 'Beast', img: img('secret-wars-2-beast-balanced-attack'), team: ['illuminati'], type: ['strength', 'tech'], attack: 2, cost: 3, text: "Reveal the top card of your deck. If it's tech or strength, draw it.", flavor: 'If you can balance yourself upside-down, you will turn your foes upside-down with a balanced attack.' } },
  { count: 5, card: { id: 'secret-wars-2-beast-upside-down-thinking', name: 'Upside-down Thinking', hero: 'Beast', img: img('secret-wars-2-beast-upside-down-thinking'), team: ['illuminati'], type: ['strength', 'tech'], cost: 4, keywords: ['wall-crawl'], text: "Wall-Crawl. Patrol any city space: If it's empty, then the hero in the HQ space under it costs 3 less this turn." } },
  { count: 3, card: { id: 'secret-wars-2-beast-doctor-of-beatdown', name: 'Doctor of Beatdown', hero: 'Beast', img: img('secret-wars-2-beast-doctor-of-beatdown'), team: ['illuminati'], type: ['strength', 'tech'], attack: 2, cost: 6, text: 'For each other strength card you played this turn, you get +1 Attack.\nFor each other tech card you played this turn, you get +1 Attack.' } },
  { count: 1, card: { id: 'secret-wars-2-beast-multi-variable-smackulus', name: 'Multi-Variable Smackulus', hero: 'Beast', img: img('secret-wars-2-beast-multi-variable-smackulus'), team: ['illuminati'], type: ['strength', 'tech'], attack: 4, cost: 8, conditionIcons: ['strength', 'strength', 'tech', 'tech'], conditionText: 'Draw three cards.', flavor: "If I calculate the precise rotational torque, I find I'm really thrashing you with considerable force." } },
]

export const BLACK_SWAN_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'secret-wars-2-black-swan-apocalyptic-vision', name: 'Apocalyptic Vision', hero: 'Black Swan', img: img('secret-wars-2-black-swan-apocalyptic-vision'), team: ['cabal'], type: ['ranged'], attack: 2, cost: 3, conditionIcons: ['ranged'], conditionText: "Reveal the top card of the Villain Deck. If it's a Scheme Twist, you get +2 Attack. Otherwise, put it back on the top or bottom." } },
  { count: 5, card: { id: 'secret-wars-2-black-swan-witness-the-end', name: 'Witness the End', hero: 'Black Swan', img: img('secret-wars-2-black-swan-witness-the-end'), team: ['cabal'], type: ['instinct'], recruit: 2, cost: 5, conditionIcons: ['instinct'], conditionText: 'You may KO a card from your hand or discard pile. If you do, draw a card.', flavor: 'Black Swan foretold the Incursions that destroyed the old universe.' } },
  { count: 3, card: { id: 'secret-wars-2-black-swan-dark-foretelling', name: 'Dark Foretelling', hero: 'Black Swan', img: img('secret-wars-2-black-swan-dark-foretelling'), team: ['cabal'], type: ['instinct', 'ranged'], attack: 4, cost: 6, text: 'Reveal the top three cards of the Villain Deck. Rescue any Bystanders you revealed, then put the rest back in any order.' } },
  { count: 1, card: { id: 'secret-wars-2-black-swan-telepathic-control', name: 'Telepathic Control', hero: 'Black Swan', img: img('secret-wars-2-black-swan-telepathic-control'), team: ['cabal'], type: ['covert'], attack: 0, cost: 7, text: 'Reveal the top five cards of the Villain Deck. You get +Attack equal to the printed Victory Point of one of those cards. Put them back in any order.', conditionIcons: ['cabal'], conditionText: 'Instead, you get +Attack for two of those cards.' } },
]

export const THE_CAPTAIN_AND_THE_DEVIL_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'secret-wars-2-the-captain-and-the-devil-jurassic-america', name: 'Jurassic America', hero: 'The Captain and the Devil', img: img('secret-wars-2-the-captain-and-the-devil-jurassic-america'), team: ['avengers'], type: ['strength', 'tech'], recruit: 1, cost: 2, text: 'Spectrum: you get +2 Recruit.', flavor: 'When you gotta go, you gotta go.' } },
  { count: 5, card: { id: 'secret-wars-2-the-captain-and-the-devil-patriotic-chomp', name: 'Patriotic Chomp', hero: 'The Captain and the Devil', img: img('secret-wars-2-the-captain-and-the-devil-patriotic-chomp'), team: ['avengers'], type: ['instinct'], attack: 2, cost: 4, text: 'Spectrum: You get +2 Attack.', flavor: 'The Captain and The Devil must journey through a sea of angry Hulks in the Battleworld region known as "Greenland."' } },
  { count: 3, card: { id: 'secret-wars-2-the-captain-and-the-devil-feeding-grounds', name: 'Feeding Grounds', hero: 'The Captain and the Devil', img: img('secret-wars-2-the-captain-and-the-devil-feeding-grounds'), team: ['avengers'], type: ['covert'], attack: 3, cost: 6, text: "Patrol the Streets: If it's empty, you may KO a card from your hand or discard pile.", flavor: 'Captain America and Devil Dinosaur...Unlikely brothers in arms.' } },
  { count: 1, card: { id: 'secret-wars-2-the-captain-and-the-devil-dino-roar-of-triumph', name: 'Dino-Roar of Triumph', hero: 'The Captain and the Devil', img: img('secret-wars-2-the-captain-and-the-devil-dino-roar-of-triumph'), team: ['avengers'], type: ['ranged'], attack: 6, cost: 8, text: 'Whenever you defeat a Villain this turn, each Villain and Mastermind adjacent to it gets -2 Attack this turn.' } },
]

export const CAPTAIN_BRITAIN_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'secret-wars-2-captain-britain-combined-strength', name: 'Combined Strength', hero: 'Captain Britain', img: img('secret-wars-2-captain-britain-combined-strength'), team: ['illuminati'], type: ['strength'], attack: 0, cost: 4, text: 'You get +1 Attack for each different team icon among your Heroes.', flavor: "It's wise to respect 400 years of British history...Especially when it's punching you in the face." } },
  { count: 5, card: { id: 'secret-wars-2-captain-britain-transatlantic-savior', name: 'Transatlantic Savior', hero: 'Captain Britain', img: img('secret-wars-2-captain-britain-transatlantic-savior'), team: ['illuminati'], type: ['covert'], recruit: 0, cost: 3, text: 'You get +1 Recruit for each different team icon among your Heroes.' } },
  { count: 3, card: { id: 'secret-wars-2-captain-britain-raise-the-union-jack', name: 'Raise the Union Jack', hero: 'Captain Britain', img: img('secret-wars-2-captain-britain-raise-the-union-jack'), team: ['illuminati'], type: ['covert', 'strength'], attack: 2, cost: 5, text: "Patrol the Rooftops: If it's empty, reveal the top two cards of your deck. If they have different team icons, draw them. Otherwise, put them back in any order." } },
  { count: 1, card: { id: 'secret-wars-2-captain-britain-lead-the-captain-britain-corps', name: 'Lead the Captain Britain Corps', hero: 'Captain Britain', img: img('secret-wars-2-captain-britain-lead-the-captain-britain-corps'), team: ['illuminati'], type: ['strength'], cost: 7, text: 'When you draw a new hand of cards at the end of this turn, draw three extra cards.' } },
]

export const CORVUS_GLAIVE_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'secret-wars-2-corvus-glaive-culling-blade', name: 'Culling Blade', hero: 'Corvus Glaive', img: img('secret-wars-2-corvus-glaive-culling-blade'), team: ['cabal'], type: ['instinct'], attack: 2, cost: 3, text: "KO a Bystander from the Bystander Deck. If it's a Special Bystander, you may use its Rescue effect.", flavor: 'A sculptor with a scalpel...A rather enormous scalpel.' } },
  { count: 5, card: { id: 'secret-wars-2-corvus-glaive-let-none-escape-you', name: 'Let None Escape You', hero: 'Corvus Glaive', img: img('secret-wars-2-corvus-glaive-let-none-escape-you'), team: ['cabal'], type: ['strength', 'instinct'], recruit: 0, attack: 0, cost: 2, text: 'Patrol the Escape Pile: If there are none Bystanders in it, you get +2 Attack. Otherwise, you get +2 Recruit.', flavor: "Thanos' most trusted general...And his most cruel." } },
  { count: 3, card: { id: 'secret-wars-2-corvus-glaive-rictus-grin', name: 'Rictus Grin', hero: 'Corvus Glaive', img: img('secret-wars-2-corvus-glaive-rictus-grin'), team: ['cabal'], type: ['strength'], attack: 3, cost: 6, conditionIcons: ['cabal'], conditionText: 'KO a Bystander from the Bystander Stack. Then, you get +1 Attack for every four Bystanders in the KO Pile.' } },
  { count: 1, card: { id: 'secret-wars-2-corvus-glaive-atom-splitting-glaive', name: 'Atom-Splitting Glaive', hero: 'Corvus Glaive', img: img('secret-wars-2-corvus-glaive-atom-splitting-glaive'), team: ['cabal'], type: ['tech'], attack: 6, cost: 8, conditionIcons: ['cabal'], conditionText: "You may KO a Bystander from the Escape Pile and from each player's Victory Pile. You get +1 Attack for each Bystander KO'd this way." } },
]

export const DR_PUNISHER_SOLDIER_SUPREME_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'secret-wars-2-dr-punisher-soldier-supreme-sweep-the-streets-of-trash', name: 'Sweep the Streets of Trash', hero: 'Dr. Punisher, Soldier Supreme', img: img('secret-wars-2-dr-punisher-soldier-supreme-sweep-the-streets-of-trash'), team: ['marvel-knights'], type: ['tech', 'ranged'], recruit: 1, cost: 2, text: "Patrol the Streets: If it's empty, draw a card.", flavor: 'This mashup cleans the trash up.' } },
  { count: 5, card: { id: 'secret-wars-2-dr-punisher-soldier-supreme-youre-a-slow-learner', name: "You're a Slow Learner", hero: 'Dr. Punisher, Soldier Supreme', img: img('secret-wars-2-dr-punisher-soldier-supreme-youre-a-slow-learner'), team: ['marvel-knights'], type: ['tech'], attack: 2, cost: 4, conditionIcons: ['tech'], conditionText: 'Reveal the top card of your deck. If it costs 0, KO it and you get +1 Attack.' } },
  { count: 3, card: { id: 'secret-wars-2-dr-punisher-soldier-supreme-ice-magic', name: 'Ice Magic', hero: 'Dr. Punisher, Soldier Supreme', img: img('secret-wars-2-dr-punisher-soldier-supreme-ice-magic'), team: ['marvel-knights'], type: ['ranged'], attack: 2, cost: 3, text: "Reveal the top card of the Villain Deck. If it's a Villain, you may fight it this turn.", conditionIcons: ['ranged', 'ranged'], conditionText: "You get +Attack equal to that Villain's printed VP value." } },
  { count: 1, card: { id: 'secret-wars-2-dr-punisher-soldier-supreme-calm-before-the-storm', name: 'Calm Before the Storm', hero: 'Dr. Punisher, Soldier Supreme', img: img('secret-wars-2-dr-punisher-soldier-supreme-calm-before-the-storm'), team: ['marvel-knights'], type: ['ranged'], attack: 5, cost: 7, text: "Patrol every city space: For each space that's empty, you get +1 Attack.", flavor: "It's quiet. Too quiet." } },
]

export const ELSA_BLOODSTONE_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'secret-wars-2-elsa-bloodstone-bloodstone-pendant', name: 'Bloodstone Pendant', hero: 'Elsa Bloodstone', img: img('secret-wars-2-elsa-bloodstone-bloodstone-pendant'), team: ['S.H.I.E.L.D.'], type: ['instinct'], recruit: 2, cost: 5, text: 'Spectrum: You may KO a card from your hand or discard pile. If you do, you get +1 Recruit.' } },
  { count: 5, card: { id: 'secret-wars-2-elsa-bloodstone-monster-hunter', name: 'Monster Hunter', hero: 'Elsa Bloodstone', img: img('secret-wars-2-elsa-bloodstone-monster-hunter'), team: ['S.H.I.E.L.D.'], type: ['covert', 'instinct'], attack: 2, cost: 3, text: "Patrol the Sewers: If it's empty, rescue a Bystander.", flavor: 'Elsa knows a lot of lore about various dark creatures, but most of it boils down to where to stab them.' } },
  { count: 3, card: { id: 'secret-wars-2-elsa-bloodstone-defend-the-shield-wall', name: 'Defend the S.H.I.E.L.D. Wall', hero: 'Elsa Bloodstone', img: img('secret-wars-2-elsa-bloodstone-defend-the-shield-wall'), team: ['S.H.I.E.L.D.'], type: ['ranged'], attack: 0, cost: 6, keywords: ['wall-crawl'], text: 'Wall-Crawl. You get +1 Attack for each other S.H.I.E.L.D. Hero you played this turn.', flavor: 'As commander of the wall, Elsa must hold back the Deadlands Hordes.' } },
  { count: 1, card: { id: 'secret-wars-2-elsa-bloodstone-prodigy-of-ulysses-bloodstone', name: 'Prodigy of Ulysses Bloodstone', hero: 'Elsa Bloodstone', img: img('secret-wars-2-elsa-bloodstone-prodigy-of-ulysses-bloodstone'), team: ['S.H.I.E.L.D.'], type: ['strength'], attack: 6, cost: 8, text: 'Spectrum: You get +3 Attack.', flavor: "Elsa's father threw her at monsters before she could walk, training her relentlessly to become the perfect weapon." } },
]

export const PHOENIX_FORCE_CYCLOPS_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'secret-wars-2-phoenix-force-cyclops-burn-out', name: 'Burn Out', hero: 'Phoenix Force Cyclops', img: img('secret-wars-2-phoenix-force-cyclops-burn-out'), team: ['x-men'], type: ['ranged'], attack: 2, cost: 4, text: 'You may KO this card. If you do, you get +2 Attack.', flavor: 'Like Jean Grey before him, Cyclops became the vessel for the godlike Phoenix entity.' } },
  { count: 5, card: { id: 'secret-wars-2-phoenix-force-cyclops-reincarnate', name: 'Reincarnate', hero: 'Phoenix Force Cyclops', img: img('secret-wars-2-phoenix-force-cyclops-reincarnate'), team: ['x-men'], type: ['covert'], cost: 3, text: 'KO this card. Gain a hero from the S.H.I.E.L.D. Officer stack or HQ that costs 4 or less and put it into your hand.' } },
  { count: 3, card: { id: 'secret-wars-2-phoenix-force-cyclops-rise-from-the-ashes', name: 'Rise from the Ashes', hero: 'Phoenix Force Cyclops', img: img('secret-wars-2-phoenix-force-cyclops-rise-from-the-ashes'), team: ['x-men'], type: ['instinct', 'ranged'], attack: 3, cost: 6, text: "Gain a Hero that was KO'd this turn.", flavor: 'The Phoenix is a cosmic force of great life or limitless destruction.' } },
  { count: 1, card: { id: 'secret-wars-2-phoenix-force-cyclops-destruction-is-creation', name: 'Destruction Is Creation', hero: 'Phoenix Force Cyclops', img: img('secret-wars-2-phoenix-force-cyclops-destruction-is-creation'), team: ['x-men'], type: ['ranged'], attack: 4, cost: 8, text: 'KO up to three cards from your hand. Draw that many cards.' } },
]

export const RUBY_SUMMERS_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'secret-wars-2-ruby-summers-guerrilla-warfare', name: 'Guerrilla Warfare', hero: 'Ruby Summers', img: img('secret-wars-2-ruby-summers-guerrilla-warfare'), team: ['x-men'], type: ['ranged'], attack: 2, cost: 3, text: 'When a card effect causes you to discard this card, if it is your turn, Teleport it instead. If it is not your turn, set it aside and add it to your hand at the end of this turn.', flavor: 'Hit-and-run tactics.' } },
  { count: 5, card: { id: 'secret-wars-2-ruby-summers-heir-to-legends', name: 'Heir to Legends', hero: 'Ruby Summers', img: img('secret-wars-2-ruby-summers-heir-to-legends'), team: ['x-men'], type: ['strength', 'ranged'], recruit: 2, attack: 2, cost: 5, text: 'To play this card, you must discard a card from your hand.', flavor: 'The alternate-reality daughter of Cyclops and Emma Frost, Ruby, combines both their powers.' } },
  { count: 3, card: { id: 'secret-wars-2-ruby-summers-form-of-solid-ruby', name: 'Form of Solid Ruby', hero: 'Ruby Summers', img: img('secret-wars-2-ruby-summers-form-of-solid-ruby'), team: ['x-men'], type: ['strength'], recruit: 0, attack: 4, cost: 6, conditionIcons: ['x-men'], conditionText: 'Whenever you defeat a villain or mastermind this turn, you get +2 Recruit.', flavor: 'While Emma turned into solid diamond, Ruby turns into - well, you can probably guess.' } },
  { count: 1, card: { id: 'secret-wars-2-ruby-summers-extinction-blast', name: 'Extinction Blast', hero: 'Ruby Summers', img: img('secret-wars-2-ruby-summers-extinction-blast'), team: ['x-men'], type: ['ranged'], attack: 10, cost: 8, text: 'To play this card, you must discard three cards from your hand.' } },
]

export const SHANG_CHI_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'secret-wars-2-shang-chi-shuffling-footwork', name: 'Shuffling Footwork', hero: 'Shang-Chi', img: img('secret-wars-2-shang-chi-shuffling-footwork'), team: ['marvel-knights'], type: ['instinct'], recruit: 2, cost: 3, conditionIcons: ['instinct'], conditionText: 'You may shuffle your discard pile into your deck.' } },
  { count: 5, card: { id: 'secret-wars-2-shang-chi-acrobatic-kung-fu', name: 'Acrobatic Kung-Fu', hero: 'Shang-Chi', img: img('secret-wars-2-shang-chi-acrobatic-kung-fu'), team: ['marvel-knights'], type: ['instinct', 'covert'], attack: 2, cost: 4, keywords: ['wall-crawl'], text: "Wall-Crawl. Patrol the Rooftops: If it's empty, you get +1 Attack." } },
  { count: 3, card: { id: 'secret-wars-2-shang-chi-seek-the-empty-mind', name: 'Seek the Empty Mind', hero: 'Shang-Chi', img: img('secret-wars-2-shang-chi-seek-the-empty-mind'), team: ['marvel-knights'], type: ['covert'], attack: 3, cost: 5, text: "Patrol your discard pile: If it's empty, you get +2 Attack." } },
  { count: 1, card: { id: 'secret-wars-2-shang-chi-muscle-memory', name: 'Muscle Memory', hero: 'Shang-Chi', img: img('secret-wars-2-shang-chi-muscle-memory'), team: ['marvel-knights'], type: ['instinct'], attack: 5, cost: 7, keywords: ['wall-crawl'], text: 'Wall-Crawl. Any time you are shuffling your deck with this card in it, you may set this card aside and put it on top of your deck at the end of the shuffle.' } },
]

export const SILK_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'secret-wars-2-silk-long-range-spider-sense', name: 'Long-Range Spider-Sense', hero: 'Silk', img: img('secret-wars-2-silk-long-range-spider-sense'), team: ['spider-friends'], type: ['ranged'], attack: 2, cost: 2, text: 'Spectrum: Reveal the top card of your deck. If it costs 2 or less, draw it.', flavor: 'Cindy Moon was bitten by the same radioactive spider as Peter Parker.' } },
  { count: 5, card: { id: 'secret-wars-2-silk-cascading-maneuver', name: 'Cascading Maneuver', hero: 'Silk', img: img('secret-wars-2-silk-cascading-maneuver'), team: ['spider-friends'], type: ['strength', 'instinct'], attack: 1, cost: 2, keywords: ['wall-crawl'], text: 'Wall-Crawl. Spectrum: Draw a card.' } },
  { count: 3, card: { id: 'secret-wars-2-silk-silk-stalking', name: 'Silk Stalking', hero: 'Silk', img: img('secret-wars-2-silk-silk-stalking'), team: ['spider-friends'], type: ['covert'], attack: 1, cost: 2, conditionIcons: ['spider-friends'], conditionText: 'Reveal the top card of your deck. If it costs 0, KO it. If it costs 1 or 2, draw it.' } },
  { count: 1, card: { id: 'secret-wars-2-silk-borrowed-cloaking-device', name: 'Borrowed Cloaking Device', hero: 'Silk', img: img('secret-wars-2-silk-borrowed-cloaking-device'), team: ['spider-friends'], type: ['tech'], attack: 1, cost: 2, keywords: ['wall-crawl'], text: 'Wall-Crawl. Spectrum: Reveal the top four cards of your deck. Put any combination of those cards with a total cost of 2 or less into your hand. But the rest back in any order.' } },
]

export const SOULSWORD_COLOSSUS_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'secret-wars-2-soulsword-colossus-invade-the-inferno', name: 'Invade the Inferno', hero: 'Soulsword Colossus', img: img('secret-wars-2-soulsword-colossus-invade-the-inferno'), team: ['x-men'], type: ['covert'], recruit: 2, cost: 3, conditionIcons: ['covert'], conditionText: 'Once this turn, you may fight the top card of the Bystander Stack as if it were a 3 Attack Demon Villain with "Fight: KO one of your heroes."' } },
  { count: 5, card: { id: 'secret-wars-2-soulsword-colossus-steel-interception', name: 'Steel Interception', hero: 'Soulsword Colossus', img: img('secret-wars-2-soulsword-colossus-steel-interception'), team: ['x-men'], type: ['strength', 'covert'], attack: 2, cost: 4, text: 'If a player would gain a Wound, you may discard this card instead. If you do, draw two cards.' } },
  { count: 3, card: { id: 'secret-wars-2-soulsword-colossus-possessed-by-the-soulsword', name: 'Possessed by the Soulsword', hero: 'Soulsword Colossus', img: img('secret-wars-2-soulsword-colossus-possessed-by-the-soulsword'), team: ['x-men'], type: ['strength'], attack: 3, cost: 6, conditionIcons: ['strength'], conditionText: "Cross-Dimensional Colossus Rampage. You get +2 Attack if at least one other player didn't reveal a Colossus card." } },
  { count: 1, card: { id: 'secret-wars-2-soulsword-colossus-rescue-my-family-from-hell', name: 'Rescue My Family from Hell', hero: 'Soulsword Colossus', img: img('secret-wars-2-soulsword-colossus-rescue-my-family-from-hell'), team: ['x-men'], type: ['instinct'], attack: 5, cost: 7, conditionIcons: ['x-men'], conditionText: 'You may gain an X-Men Hero from the HQ or the KO pile to your hand.', flavor: 'Every year, Colossus leads a team of X-Men into the Inferno to rescue his sister, Magik.' } },
]

export const SPIDER_GWEN_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'secret-wars-2-spider-gwen-fateful-bridge', name: 'Fateful Bridge', hero: 'Spider-Gwen', img: img('secret-wars-2-spider-gwen-fateful-bridge'), team: ['spider-friends'], type: ['instinct', 'tech'], attack: 2, cost: 2, text: "Patrol the Bridge: If it's empty, reveal the top card of your deck. If that card costs 2 or less, draw it." } },
  { count: 5, card: { id: 'secret-wars-2-spider-gwen-save-the-day', name: 'Save the Day', hero: 'Spider-Gwen', img: img('secret-wars-2-spider-gwen-save-the-day'), team: ['spider-friends'], type: ['tech'], attack: 1, cost: 2, text: "Patrol the Rooftops: If it's empty, rescue a Bystander, and then you get +1 Attack for every two Bystanders in your Victory Pile." } },
  { count: 3, card: { id: 'secret-wars-2-spider-gwen-first-adventure', name: 'First Adventure', hero: 'Spider-Gwen', img: img('secret-wars-2-spider-gwen-first-adventure'), team: ['spider-friends'], type: ['strength'], attack: 1, cost: 2, keywords: ['wall-crawl'], text: "Wall-Crawl. Patrol the Bank: If it's empty, you get +1 Attack.\nPatrol your Victory Pile: If it's empty, you get +1 Attack." } },
  { count: 1, card: { id: 'secret-wars-2-spider-gwen-intertwining-webs', name: 'Intertwining Webs', hero: 'Spider-Gwen', img: img('secret-wars-2-spider-gwen-intertwining-webs'), team: ['spider-friends'], type: ['covert'], attack: 0, cost: 2, keywords: ['wall-crawl'], text: 'Wall-Crawl. Reveal the top three cards of your deck, then put them back in any order. You get +1 Attack for each card you revealed that costs 2 or less.' } },
]

export const TIME_TRAVELING_JEAN_GREY_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'secret-wars-2-time-traveling-jean-grey-throw-over-the-railing', name: 'Throw Over the Railing', hero: 'Time-Traveling Jean Grey', img: img('secret-wars-2-time-traveling-jean-grey-throw-over-the-railing'), team: ['x-men'], type: ['covert'], attack: 2, cost: 3, conditionIcons: ['covert'], conditionText: 'Choose a Villain on the Rooftops or Bridge. It gets -2 Attack this turn.' } },
  { count: 5, card: { id: 'secret-wars-2-time-traveling-jean-grey-bridge-to-a-better-future', name: 'Bridge to a Better Future', hero: 'Time-Traveling Jean Grey', img: img('secret-wars-2-time-traveling-jean-grey-bridge-to-a-better-future'), team: ['x-men'], type: ['instinct'], cost: 4, text: "Patrol the Bridge: If it's empty, then when you draw a new hand of cards at the end of this turn, draw an extra card." } },
  { count: 3, card: { id: 'secret-wars-2-time-traveling-jean-grey-telekinesis', name: 'Telekinesis', hero: 'Time-Traveling Jean Grey', img: img('secret-wars-2-time-traveling-jean-grey-telekinesis'), team: ['x-men'], type: ['covert', 'ranged'], attack: 3, cost: 5, text: 'You may move a villain to an adjacent city space. If another Villain is already there, swap them.' } },
  { count: 1, card: { id: 'secret-wars-2-time-traveling-jean-grey-change-history', name: 'Change History', hero: 'Time-Traveling Jean Grey', img: img('secret-wars-2-time-traveling-jean-grey-change-history'), team: ['x-men'], type: ['covert'], attack: 5, cost: 7, conditionIcons: ['x-men'], conditionText: "Patrol any city space: If it's empty, gain the hero in the HQ space under it. Put that hero on top of your deck." } },
]

export const BYSTANDER_CARDS: DeckEntry[] = [
  { count: 3, card: { id: 'secret-wars-2-alligator-trapper', name: 'Alligator Trapper', img: img('secret-wars-2-alligator-trapper'), kind: 'bystander', vp: 1, text: "When you rescue this Bystander, Patrol the Sewers: If it's empty, you get +2 Recruit." } },
  { count: 4, card: { id: 'secret-wars-2-shapeshifted-copycat', name: 'Shapeshifted Copycat', img: img('secret-wars-2-shapeshifted-copycat'), kind: 'bystander', vp: 1, text: 'When you rescue this Bystander, this card becomes a Villain with 3 Attack and enters the city. It gains the ability: "Fight: KO one of your Heroes."' } },
  { count: 3, card: { id: 'secret-wars-2-undercover-agent', name: 'Undercover Agent', img: img('secret-wars-2-undercover-agent'), kind: 'bystander', vp: 1, text: 'When you rescue this Bystander, a player of your choice gains a S.H.I.E.L.D. Officer.' } },
]

// ---------- Mastermindowie ----------

export const IMMORTAL_EMPEROR_ZHENG_ZHU: MastermindData = {
  card: {
    id: 'secret-wars-2-immortal-emperor-zheng-zhu',
    name: 'Immortal Emperor Zheng-Zhu',
    img: img('secret-wars-2-immortal-emperor-zheng-zhu'),
    strength: 7,
    vp: 5,
    text: "7th Circle of Kung-Fu. Always Leads: K'un-Lun. Master Strike: Each player reveals a Hero that costs 7 or more, or they discard down to 3 cards.",
  },
  tactics: [
    { id: 'secret-wars-2-zheng-zhu-ultimate-kung-fu-mastery', name: 'Ultimate Kung-Fu Mastery', img: img('secret-wars-2-zheng-zhu-ultimate-kung-fu-mastery'), vp: 5, text: 'Fight: Each other player reveals a card with "Circle of Kung-Fu" from their Victory Pile or gains a Wound.' },
    { id: 'secret-wars-2-zheng-zhu-emperors-justice', name: "Emperor's Justice", img: img('secret-wars-2-zheng-zhu-emperors-justice'), vp: 5, text: 'Fight: Each other player reveals a Marvel Knights Hero or gains a Wound.' },
    { id: 'secret-wars-2-zheng-zhu-humble-the-pretenders', name: 'Humble the Pretenders', img: img('secret-wars-2-zheng-zhu-humble-the-pretenders'), vp: 5, text: 'Fight: Each other player reveals a Marvel Knights Hero or discards a card that costs less than 7.' },
    { id: 'secret-wars-2-zheng-zhu-imperial-edict', name: 'Imperial Edict', img: img('secret-wars-2-zheng-zhu-imperial-edict'), vp: 5, text: 'Fight: Choose any number of Heroes from the HQ. Put them on the bottom of the Hero Deck in random order.' },
  ],
  masterStrikeId: 'secret-wars-2-immortal-emperor-zheng-zhu-master-strike',
  masterStrikeText: 'Each player reveals a Hero that costs 7 or more, or they discard down to 3 cards.',
  alwaysLeads: { villainGroupId: 'secret-wars-2-kun-lun' },
}

export const KING_HYPERION: MastermindData = {
  card: {
    id: 'secret-wars-2-king-hyperion',
    name: 'King Hyperion',
    img: img('secret-wars-2-king-hyperion'),
    strength: 12,
    vp: 6,
    text: 'Always Leads: Utopolis. Master Strike: King Hyperion enters the city if he was not already there. Then, he charges three spaces. Escape: Each player gains a wound. Put King Hyperion on the Mastermind space.',
  },
  tactics: [
    { id: 'secret-wars-2-king-hyperion-worshipped-by-millions', name: 'Worshipped by Millions', img: img('secret-wars-2-king-hyperion-worshipped-by-millions'), vp: 6, text: 'Fight: If King Hyperion is in the city, put him back on the Mastermind space and shuffle this Tactic back into his Tactics. If you do, rescue six Bystanders.' },
    { id: 'secret-wars-2-king-hyperion-royal-treasury', name: 'Royal Treasury', img: img('secret-wars-2-king-hyperion-royal-treasury'), vp: 6, text: 'Fight: If King Hyperion is in the city, put him back on the Mastermind space and shuffle this Tactic back into his Tactics. If you do, you get +5 Recruit.' },
    { id: 'secret-wars-2-king-hyperion-monarch-of-utopolis', name: 'Monarch of Utopolis', img: img('secret-wars-2-king-hyperion-monarch-of-utopolis'), vp: 6, text: 'Fight: If King Hyperion is in the city, put him back on the Mastermind space and shuffle this Tactic back into his Tactics. If you do, when you drew a new hand of cards at the end of this turn, draw three extra cards.' },
    { id: 'secret-wars-2-king-hyperion-rule-with-an-iron-fist', name: 'Rule with an Iron Fist', img: img('secret-wars-2-king-hyperion-rule-with-an-iron-fist'), vp: 6, text: 'Fight: If King Hyperion is in the city, put him back on the Mastermind space and shuffle this Tactic back into his Tactics. If you do, you may defeat a Villain in the city for free.' },
  ],
  masterStrikeId: 'secret-wars-2-king-hyperion-master-strike',
  masterStrikeText: 'King Hyperion enters the city if he was not already there. Then, he charges three spaces.',
  alwaysLeads: { villainGroupId: 'secret-wars-2-utopolis' },
}

export const SHIKLAH_THE_DEMON_BRIDE: MastermindData = {
  card: {
    id: 'secret-wars-2-shiklah-the-demon-bride',
    name: 'Shiklah, the Demon Bride',
    img: img('secret-wars-2-shiklah-the-demon-bride'),
    strength: 9,
    vp: 6,
    text: 'Always Leads: Monster Metropolis. Master Strike: Reveal the top three cards of the Villain Deck. Put all the Scheme Twists you revealed on top of the Villain Deck. Put the rest on the bottom of that deck in random order.',
  },
  tactics: [
    { id: 'secret-wars-2-shiklah-enslavement-beam', name: 'Enslavement Beam', img: img('secret-wars-2-shiklah-enslavement-beam'), vp: 6, text: 'Fight: Fateful Resurrection. If she resurrects, rescue four bystanders.' },
    { id: 'secret-wars-2-shiklah-shiklahs-husband-deadpool', name: "Shiklah's Husband, Deadpool", img: img('secret-wars-2-shiklah-shiklahs-husband-deadpool'), vp: 6, text: 'Fight: Gain this as a Hero.' },
    { id: 'secret-wars-2-shiklah-drain-life', name: 'Drain Life', img: img('secret-wars-2-shiklah-drain-life'), vp: 6, text: 'Fight: Fateful Resurrection. If she resurrects, defeat a Villain in the city for free.' },
    { id: 'secret-wars-2-shiklah-infernal-power', name: 'Infernal Power', img: img('secret-wars-2-shiklah-infernal-power'), vp: 6, text: 'Fight: Fateful Resurrection. If she resurrects, draw two cards.' },
  ],
  masterStrikeId: 'secret-wars-2-shiklah-the-demon-bride-master-strike',
  masterStrikeText: 'Reveal the top three cards of the Villain Deck. Put all the Scheme Twists you revealed on top of the Villain Deck. Put the rest on the bottom of that deck in random order.',
  alwaysLeads: { villainGroupId: 'secret-wars-2-monster-metropolis' },
}

export const SPIDER_QUEEN: MastermindData = {
  card: {
    id: 'secret-wars-2-spider-queen',
    name: 'Spider-Queen',
    img: img('secret-wars-2-spider-queen'),
    strength: 8,
    vp: 6,
    text: 'Spider-Queen gets +1 Attack for each Bystander in the Escape pile. Always Leads: Spider-Infected. Master Strike: Each player puts a Spider-Infected from their Victory Pile into an empty city space. Any player who cannot do so gains a Wound.',
  },
  tactics: [
    { id: 'secret-wars-2-spider-queen-sonic-scream', name: 'Sonic Scream', img: img('secret-wars-2-spider-queen-sonic-scream'), vp: 6, text: 'Fight: Reveal the top eight cards of the Villain Deck. Put all the Bystanders you revealed into the Escape pile. Put the rest on the bottom of the Villain Deck in random orders.' },
    { id: 'secret-wars-2-spider-queen-infect-the-entire-city', name: 'Infect the Entire City', img: img('secret-wars-2-spider-queen-infect-the-entire-city'), vp: 6, text: 'Fight: Put a Bystander from the Bystander Deck into the Escape Pile. Then, each Spider-Infected in the city captures a Bystander.' },
    { id: 'secret-wars-2-spider-queen-control-arachnid-genes', name: 'Control Arachnid Genes', img: img('secret-wars-2-spider-queen-control-arachnid-genes'), vp: 6, text: 'Fight: You may gain a Spider Friends Hero from the HQ.' },
    { id: 'secret-wars-2-spider-queen-web-the-skyscrapers', name: 'Web the Skyscrapers', img: img('secret-wars-2-spider-queen-web-the-skyscrapers'), vp: 6, text: 'Fight: Each other player reveals a Spider Friends Hero or puts a Bystander from their Victory Pile into the Escape pile.' },
  ],
  masterStrikeId: 'secret-wars-2-spider-queen-master-strike',
  masterStrikeText: 'Each player puts a Spider-Infected from their Victory Pile into an empty city space. Any player who cannot do so gains a Wound.',
  alwaysLeads: { henchmenGroupId: 'secret-wars-2-spider-infected' },
}

// ---------- Grupy Villainów ----------

export const DEADPOOLS_SECRET_SECRET_WARS_CARDS: DeckEntry[] = [
  { count: 1, card: { id: 'secret-wars-2-deadpool', name: 'Deadpool', img: img('secret-wars-2-deadpool'), strength: 5, vp: 5, villainGroup: "Deadpool's Secret Secret Wars", text: '5th Circle of Kung-Fu\nFight: Fateful Resurrection\nEscape: Deadpool ascends to become a new Mastermind. He gains the ability, "Master Strike: Each player reveals a Hero with an odd-numbered cost or gains a Wound." (0 is even).' } },
  { count: 2, card: { id: 'secret-wars-2-doop', name: 'Doop', img: img('secret-wars-2-doop'), strength: 2, vp: 2, villainGroup: "Deadpool's Secret Secret Wars", text: "You can't fight Doop if there is a Villain in an adjacent city space." } },
  { count: 2, card: { id: 'secret-wars-2-howard-the-duck', name: 'Howard the Duck', img: img('secret-wars-2-howard-the-duck'), strength: 1, vp: 4, villainGroup: "Deadpool's Secret Secret Wars", text: 'Ambush: Howard the Duck captures (the heart of) a Bystander.\n7th Circle of Quack-Fu' } },
  { count: 3, card: { id: 'secret-wars-2-pink-sphinx', name: 'Pink Sphinx', img: img('secret-wars-2-pink-sphinx'), strength: 4, vp: 2, villainGroup: "Deadpool's Secret Secret Wars", text: 'Fight: Spectrum: KO one of your Heroes.' } },
]

export const GUARDIANS_OF_KNOWHERE_CARDS: DeckEntry[] = [
  { count: 1, card: { id: 'secret-wars-2-angela', name: 'Angela', img: img('secret-wars-2-angela'), strength: 7, vp: 5, villainGroup: 'Guardians of Knowhere', text: 'Fight: Fateful Resurrection\nEscape: Angela ascends to become a new Mastermind. She gains the ability, "Master Strike: Each player KOs a Hero from their discard pile that costs 1 or more."' } },
  { count: 2, card: { id: 'secret-wars-2-drax-the-destroyer', name: 'Drax the Destroyer', img: img('secret-wars-2-drax-the-destroyer'), strength: 5, vp: 4, villainGroup: 'Guardians of Knowhere', text: 'Fight: Reveal the top card of your deck. KO it or put it back. Fateful Resurrection.' } },
  { count: 1, card: { id: 'secret-wars-2-gamora', name: 'Gamora', img: img('secret-wars-2-gamora'), strength: 6, vp: 4, villainGroup: 'Guardians of Knowhere', text: "Ambush: Charge one space.\nFight: (After this goes to your victory pile.) Patrol the Sewers: If it's empty, each other player gains a Wound.\nEscape: Each player gains a Wound." } },
  { count: 2, card: { id: 'secret-wars-2-groot', name: 'Groot', img: img('secret-wars-2-groot'), strength: 5, vp: 4, villainGroup: 'Guardians of Knowhere', text: 'Fight: Fateful Resurrection. If Groot resurrects this way, then he becomes Tiny Dancing Groot with Attack 1 and no abilities for the rest of the turn.' } },
  { count: 2, card: { id: 'secret-wars-2-rocket-raccoon', name: 'Rocket Raccoon', img: img('secret-wars-2-rocket-raccoon'), strength: 4, vp: 2, villainGroup: 'Guardians of Knowhere', text: "Fight: (After this goes to your Victory Pile.) Patrol the Bank: If it's empty, draw a card. If it's not empty, KO one of your Heroes." } },
]

export const KUN_LUN_CARDS: DeckEntry[] = [
  { count: 2, card: { id: 'secret-wars-2-laughing-skull', name: 'Laughing Skull', img: img('secret-wars-2-laughing-skull'), strength: 5, vp: 5, villainGroup: "K'un-Lun", text: '5th Circle of Kung-Fu\nEscape: Each player reveals a Hero that costs 5 or more, or they discard a card.' } },
  { count: 2, card: { id: 'secret-wars-2-rand-kai', name: "Rand K'ai", img: img('secret-wars-2-rand-kai'), strength: 6, vp: 6, villainGroup: "K'un-Lun", text: '6th Circle of Kung-Fu\nEscape: Each player reveals a Hero that costs 6 or more, or they gain a wound.' } },
  { count: 2, card: { id: 'secret-wars-2-razor-fist', name: 'Razor Fist', img: img('secret-wars-2-razor-fist'), strength: 3, vp: 3, villainGroup: "K'un-Lun", text: '3rd Circle of Kung-Fu\nFight: For each of your Heroes that costs 3, KO one of your Heroes.' } },
  { count: 2, card: { id: 'secret-wars-2-red-sai', name: 'Red Sai', img: img('secret-wars-2-red-sai'), strength: 4, vp: 4, villainGroup: "K'un-Lun", text: '4th Circle of Kung-Fu\nFight: Draw a card for each of your Heroes that costs 4.' } },
]

export const MONSTER_METROPOLIS_CARDS: DeckEntry[] = [
  { count: 2, card: { id: 'secret-wars-2-bug-shiklahs-dragon', name: "Bug, Shiklah's Dragon", img: img('secret-wars-2-bug-shiklahs-dragon'), strength: 4, vp: 3, villainGroup: 'Monster Metropolis', text: 'Fight: KO a card from your discard pile. Fateful Resurrection' } },
  { count: 2, card: { id: 'secret-wars-2-ghost-deadpool', name: 'Ghost Deadpool', img: img('secret-wars-2-ghost-deadpool'), strength: 5, vp: 5, villainGroup: 'Monster Metropolis', text: 'Fight: Fateful Resurrection. Then, Cross-Dimensional Deadpool Rampage\nEscape: Cross-Dimensional Deadpool Rampage' } },
  { count: 2, card: { id: 'secret-wars-2-man-thing', name: 'Man-Thing', img: img('secret-wars-2-man-thing'), strength: 5, vp: 4, villainGroup: 'Monster Metropolis', text: 'Ambush: Each Monster Metropolis Villain captures a Bystander.\nFight: Fateful Resurrection' } },
  { count: 2, card: { id: 'secret-wars-2-marcus-symbiote-centaur', name: 'Marcus Symbiote Centaur', img: img('secret-wars-2-marcus-symbiote-centaur'), strength: 3, vp: 3, villainGroup: 'Monster Metropolis', text: 'Ambush: Charge two spaces.\nWhen in the Sewers, Rooftops or Bridge, he is in "wolf form" and gets +3 Attack.' } },
]

export const UTOPOLIS_CARDS: DeckEntry[] = [
  { count: 3, card: { id: 'secret-wars-2-doctor-spectrum', name: 'Doctor Spectrum', img: img('secret-wars-2-doctor-spectrum'), strength: 6, vp: 4, villainGroup: 'Utopolis', text: "Ambush: Charge one space.\nFight: Spectrum: KO a card from your discard pile.\nEscape: Each player who doesn't have Spectrum discards a card." } },
  { count: 2, card: { id: 'secret-wars-2-nighthawk', name: 'Nighthawk', img: img('secret-wars-2-nighthawk'), strength: 4, vp: 4, villainGroup: 'Utopolis', text: 'While in the Sewers, Rooftops or Bridge, Nighthawk gains +4 Attack.\nEscape: Nighthawk becomes a Scheme Twist that takes effect immediately.' } },
  { count: 1, card: { id: 'secret-wars-2-warrior-woman', name: 'Warrior Woman', img: img('secret-wars-2-warrior-woman'), strength: 8, vp: 6, villainGroup: 'Utopolis', text: "Ambush: Charge one space.\nEscape: Warrior Woman ascends to become a new Mastermind. She gains the ability, \"Master Strike: Patrol the Bank: If there's a Villain there, each player discards a card with a Recruit icon.\"" } },
  { count: 2, card: { id: 'secret-wars-2-whizzer', name: 'Whizzer', img: img('secret-wars-2-whizzer'), strength: 5, vp: 3, villainGroup: 'Utopolis', text: "Ambush: Charge three spaces.\nFight: (After he goes to your victory pile.) Patrol the Bridge: If there's a Villain there, each other player gains a Wound.\nEscape: Each player gains a Wound." } },
]

export const X_MEN_92_CARDS: DeckEntry[] = [
  { count: 2, card: { id: 'secret-wars-2-92-beast', name: "'92 Beast", img: img('secret-wars-2-92-beast'), strength: 5, villainGroup: "X-Men '92", text: 'Ambush: Charge one space.\nFight: Gain this as a Hero.', keywords: ['villain-hero'] } },
  { count: 3, card: { id: 'secret-wars-2-92-jubilee', name: "'92 Jubilee", img: img('secret-wars-2-92-jubilee'), strength: 4, villainGroup: "X-Men '92", text: 'Fight: Gain this as a Hero.', keywords: ['villain-hero'] } },
  { count: 1, card: { id: 'secret-wars-2-92-professor-x', name: "'92 Professor X", img: img('secret-wars-2-92-professor-x'), strength: 8, vp: 6, villainGroup: "X-Men '92", text: "Escape: '92 Professor X ascends to become a new Mastermind. He gains the ability, \"Master Strike: Stack the two heroes from the HQ with the highest cost next to '92 Professor X. He gets +1 Attack for each Hero stacked there. Players can recruit the top card of the stack.\"" } },
  { count: 2, card: { id: 'secret-wars-2-92-wolverine', name: "'92 Wolverine", img: img('secret-wars-2-92-wolverine'), strength: 7, villainGroup: "X-Men '92", text: 'Fight: Gain this as a Hero.\nEscape: Cross-Dimensional Wolverine Rampage', keywords: ['villain-hero'] } },
]

// ---------- Grupy Henchmenów (w grze jest ich tyle, ile wynika z trybu gry i Schematu, a w talii leży po 10 kart) ----------

export const KHONSHU_GUARDIANS_CARDS: DeckEntry[] = [
  { count: 10, card: { id: 'secret-wars-2-henchmen-khonshu-guardians', name: 'Khonshu Guardians', img: img('secret-wars-2-henchmen-khonshu-guardians'), strength: 3, vp: 1, henchman: true, text: 'While in the Sewers, Rooftops or Bridge, this is in "wolf form" and gets +2 Attack.\nFight: KO one of your Heroes.' } },
]

export const MAGMA_MEN_CARDS: DeckEntry[] = [
  { count: 10, card: { id: 'secret-wars-2-henchmen-magma-men', name: 'Magma Men', img: img('secret-wars-2-henchmen-magma-men'), strength: 3, vp: 1, henchman: true, text: 'Fight: KO one of your Heroes.\nFateful Resurrection' } },
]

export const SPIDER_INFECTED_CARDS: DeckEntry[] = [
  { count: 10, card: { id: 'secret-wars-2-henchmen-spider-infected', name: 'Spider-Infected', img: img('secret-wars-2-henchmen-spider-infected'), strength: 3, vp: 1, henchman: true, text: 'Ambush: This captures a Bystander.\nFight: The next Hero you gain this turn has Wall-Crawl.' } },
]
