import type { DeckEntry } from '../../../engine/types'

const img = (id: string) => `/cards/secret-wars-vol-1/${id}.webp`

export const APOCALYPTIC_KITTY_PRYDE_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'secret-wars-apocalyptic-kitty-pryde-phase-out', name: 'Phase Out', hero: 'Apocalyptic Kitty Pryde', img: img('secret-wars-apocalyptic-kitty-pryde-phase-out'), team: ['x-men'], type: ['covert'], attack: 2, cost: 4, text: 'You may KO a card from your hand or discard pile. If you do, you get +1 Attack.' } },
  { count: 5, card: { id: 'secret-wars-apocalyptic-kitty-pryde-infiltrate-hq', name: 'Infiltrate HQ', hero: 'Apocalyptic Kitty Pryde', img: img('secret-wars-apocalyptic-kitty-pryde-infiltrate-hq'), team: ['x-men'], type: ['tech'], recruit: 2, cost: 3, text: 'You may put a Hero from the HQ on the bottom of the Hero Deck. The Hero that replaces it in the HQ costs 1 less during this turn.' } },
  { count: 3, card: { id: 'secret-wars-apocalyptic-kitty-pryde-disrupt-circuits', name: 'Disrupt Circuits', hero: 'Apocalyptic Kitty Pryde', img: img('secret-wars-apocalyptic-kitty-pryde-disrupt-circuits'), team: ['x-men'], type: ['covert', 'tech'], attack: 2, cost: 5, text: 'You get +1 Attack for each tech Hero in the HQ.', flavor: 'Kitty goes through a lot of toasters.' } },
  { count: 1, card: { id: 'secret-wars-apocalyptic-kitty-pryde-untouchable', name: 'Untouchable', hero: 'Apocalyptic Kitty Pryde', img: img('secret-wars-apocalyptic-kitty-pryde-untouchable'), team: ['x-men'], type: ['covert'], recruit: 5, cost: 7, text: 'When any player defeats a Villain or Mastermind with a "Fight" effect, you may discard this card to cancel that Fight effect. If you do, draw three cards.' } },
]

export const BLACK_BOLT_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'secret-wars-black-bolt-destructive-whisper', name: 'Destructive Whisper', hero: 'Black Bolt', img: img('secret-wars-black-bolt-destructive-whisper'), team: ['illuminati'], type: ['ranged'], attack: 2, cost: 3, text: 'You get +1 Attack if you reveal four cards with no rules text.', flavor: "Black Bolt's voice is so destructive that even a whisper can destroy an entire city." } },
  { count: 5, card: { id: 'secret-wars-black-bolt-speak-no-words', name: 'Speak No Words', hero: 'Black Bolt', img: img('secret-wars-black-bolt-speak-no-words'), team: ['illuminati'], type: ['covert', 'ranged'], recruit: 2, attack: 1, cost: 4, text: '' } },
  { count: 3, card: { id: 'secret-wars-black-bolt-silence-is-golden', name: 'Silence is Golden', hero: 'Black Bolt', img: img('secret-wars-black-bolt-silence-is-golden'), team: ['illuminati'], type: ['strength'], recruit: 0, attack: 4, cost: 6, text: 'Choose a card you played this turn with no rules text. You get its Recruit and Attack again.' } },
  { count: 1, card: { id: 'secret-wars-black-bolt-hypersonic-scream', name: 'Hypersonic Scream', hero: 'Black Bolt', img: img('secret-wars-black-bolt-hypersonic-scream'), team: ['illuminati'], type: ['ranged'], attack: 3, cost: 8, text: 'For each card with no rules text you played this turn, draw a card.' } },
]

export const BLACK_PANTHER_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'secret-wars-black-panther-catlike-reflexes', name: 'Catlike Reflexes', hero: 'Black Panther', img: img('secret-wars-black-panther-catlike-reflexes'), team: ['illuminati'], type: ['instinct', 'covert'], recruit: 1, cost: 3, text: 'Draw a card.', flavor: "King T'Challa is a doctor of physics, a master diplomat, and a genius inventor. But sometimes he just likes kicking bad guys in the face." } },
  { count: 5, card: { id: 'secret-wars-black-panther-multifaceted-genius', name: 'Multifaceted Genius', hero: 'Black Panther', img: img('secret-wars-black-panther-multifaceted-genius'), team: ['illuminati'], type: ['strength', 'tech'], attack: 2, cost: 4, text: 'You get +1 Attack for each other multicolored card you played this turn.', flavor: 'Some people excel at one specific thing. Black Panther excels at almost everything.' } },
  { count: 3, card: { id: 'secret-wars-black-panther-stalk-the-urban-jungle', name: 'Stalk the Urban Jungle', hero: 'Black Panther', img: img('secret-wars-black-panther-stalk-the-urban-jungle'), team: ['illuminati'], type: ['strength', 'covert'], attack: 4, cost: 6, text: 'Whenever you defeat a Villain on the Rooftops or Streets this turn, you may KO one of your cards or a card from your discard pile.' } },
  { count: 1, card: { id: 'secret-wars-black-panther-king-of-wakanda', name: 'King of Wakanda', hero: 'Black Panther', img: img('secret-wars-black-panther-king-of-wakanda'), team: ['illuminati'], type: ['instinct', 'tech'], cost: 7, text: 'Gain three Sidekicks. Illuminati: Put them on top of your deck.' } },
]

export const CAPTAIN_MARVEL_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'secret-wars-captain-marvel-absorb-energies', name: 'Absorb Energies', hero: 'Captain Marvel', img: img('secret-wars-captain-marvel-absorb-energies'), team: ['avengers'], type: ['ranged'], recruit: 2, cost: 3, conditionIcons: ['ranged'], conditionText: 'For each other ranged Hero you have played this turn, you get +1 Recruit.', flavor: 'Carol Danvers soaks up energy to empower her physical strength and photonic blasts.' } },
  { count: 5, card: { id: 'secret-wars-captain-marvel-supersonic-flight', name: 'Supersonic Flight', hero: 'Captain Marvel', img: img('secret-wars-captain-marvel-supersonic-flight'), team: ['avengers'], type: ['strength', 'ranged'], attack: 1, cost: 3, text: 'Draw a card.', flavor: 'Once a captain in the Air Force, Carol Danvers has re-emerged from Ms. Marvel to Captain Marvel.' } },
  { count: 3, card: { id: 'secret-wars-captain-marvel-marvelous-strength', name: 'Marvelous Strength', hero: 'Captain Marvel', img: img('secret-wars-captain-marvel-marvelous-strength'), team: ['avengers'], type: ['strength'], attack: 3, cost: 5, conditionIcons: ['strength'], conditionText: 'For each other Strength Hero you have played this turn, you get +1 Attack.' } },
  { count: 1, card: { id: 'secret-wars-captain-marvel-cosmic-energies', name: 'Cosmic Energies', hero: 'Captain Marvel', img: img('secret-wars-captain-marvel-cosmic-energies'), team: ['avengers'], type: ['ranged', 'strength'], attack: 5, cost: 7, conditionIcons: ['ranged', 'ranged', 'strength', 'strength'], conditionText: 'You get +6 Attack.', flavor: "You've heard of the power of the sun, right?" } },
]

export const DR_STRANGE_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'secret-wars-dr-strange-cloak-of-levitation', name: 'Cloak of Levitation', hero: 'Dr. Strange', img: img('secret-wars-dr-strange-cloak-of-levitation'), team: ['illuminati'], type: ['ranged'], attack: 2, cost: 4, conditionIcons: ['ranged'], conditionText: 'Reveal the top card of your deck. Draw it or Teleport it.', flavor: 'By the Hoary Hosts of Hoggoth!' } },
  { count: 5, card: { id: 'secret-wars-dr-strange-trust-me-im-a-doctor', name: "Trust Me, I'm a Doctor", hero: 'Dr. Strange', img: img('secret-wars-dr-strange-trust-me-im-a-doctor'), team: ['illuminati'], type: ['instinct', 'ranged'], recruit: 1, cost: 2, conditionIcons: ['illuminati'], conditionText: 'You may KO a card from your hand or discard pile. If you do, you get +1 Recruit.' } },
  { count: 3, card: { id: 'secret-wars-dr-strange-fight-the-future', name: 'Fight the Future', hero: 'Dr. Strange', img: img('secret-wars-dr-strange-fight-the-future'), team: ['illuminati'], type: ['instinct'], attack: 3, cost: 5, conditionIcons: ['instinct'], conditionText: 'Reveal the top card of the Villain Deck. If it is a Villain, you get +2 Attack and may fight that Villain this turn.' } },
  { count: 1, card: { id: 'secret-wars-dr-strange-sorcerer-supreme', name: 'Sorcerer Supreme', hero: 'Dr. Strange', img: img('secret-wars-dr-strange-sorcerer-supreme'), team: ['illuminati'], type: ['covert'], cost: 7, text: 'Reveal the top three cards of your deck. Draw any number of them and Teleport the rest.' } },
]

export const LADY_THOR_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'secret-wars-lady-thor-mysterious-origin', name: 'Mysterious Origin', hero: 'Lady Thor', img: img('secret-wars-lady-thor-mysterious-origin'), team: ['avengers'], type: ['ranged'], recruit: 2, cost: 3, text: 'Once per turn, if you made at least 6 Recruit this turn, draw a card.' } },
  { count: 5, card: { id: 'secret-wars-lady-thor-chosen-by-asgard', name: 'Chosen by Asgard', hero: 'Lady Thor', img: img('secret-wars-lady-thor-chosen-by-asgard'), team: ['avengers'], type: ['strength'], recruit: 2, attack: 0, cost: 4, text: 'Once per turn, if you made at least 6 Recruit this turn, you get +2 Attack.' } },
  { count: 3, card: { id: 'secret-wars-lady-thor-heir-to-the-hammer', name: 'Heir to the Hammer', hero: 'Lady Thor', img: img('secret-wars-lady-thor-heir-to-the-hammer'), team: ['avengers'], type: ['strength', 'ranged'], attack: 4, cost: 6, conditionIcons: ['ranged', 'strength'], conditionText: 'You get +2 Attack.', flavor: 'If Mjolnir deems her worthy, who would dare argue?' } },
  { count: 1, card: { id: 'secret-wars-lady-thor-living-thunderstorm', name: 'Living Thunderstorm', hero: 'Lady Thor', img: img('secret-wars-lady-thor-living-thunderstorm'), team: ['avengers'], type: ['strength'], recruit: 4, attack: 0, cost: 8, text: 'Once per turn, if you made at least 6 Recruit this turn, you get +6 Attack.', flavor: 'Very few can wield Mjolnir. Even fewer can withstand a hit from it.' } },
]

export const MAGIK_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'secret-wars-magik-rally-the-new-mutants', name: 'Rally the New Mutants', hero: 'Magik', img: img('secret-wars-magik-rally-the-new-mutants'), team: ['x-men'], type: ['covert'], cost: 2, text: 'Gain a Sidekick. Covert: Gain another Sidekick.' } },
  { count: 5, card: { id: 'secret-wars-magik-travel-through-limbo', name: 'Travel through Limbo', hero: 'Magik', img: img('secret-wars-magik-travel-through-limbo'), team: ['x-men'], type: ['ranged'], attack: 1, cost: 3, keywords: ['teleport'], text: 'Teleport.', conditionIcons: ['ranged'], conditionText: 'You get +2 Attack.', flavor: 'Any distance is two steps away when those two steps are through a hell dimension.' } },
  { count: 3, card: { id: 'secret-wars-magik-dimensional-portal', name: 'Dimensional Portal', hero: 'Magik', img: img('secret-wars-magik-dimensional-portal'), team: ['x-men'], type: ['covert', 'ranged'], attack: 2, cost: 5, keywords: ['teleport'], text: 'Teleport. For each Sidekick you played this turn, you get +1 Attack.' } },
  { count: 1, card: { id: 'secret-wars-magik-wield-the-soulsword', name: 'Wield the Soulsword', hero: 'Magik', img: img('secret-wars-magik-wield-the-soulsword'), team: ['x-men'], type: ['covert'], attack: 2, cost: 7, keywords: ['teleport'], text: 'Teleport. Choose a Villain or Mastermind in your Victory Pile. You get +Attack equal to its printed VP.' } },
]

export const MAXIMUS_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'secret-wars-maximus-mental-domination', name: 'Mental Domination', hero: 'Maximus', img: img('secret-wars-maximus-mental-domination'), team: ['cabal'], type: ['covert'], recruit: 2, cost: 3, conditionIcons: ['covert'], conditionText: 'Defeat a Henchman Villain for free.', flavor: 'As a gifted inventor, Maximus often creates devices to enhance his telepathic abilities.' } },
  { count: 5, card: { id: 'secret-wars-maximus-enslave-the-will', name: 'Enslave the Will', hero: 'Maximus', img: img('secret-wars-maximus-enslave-the-will'), team: ['cabal'], type: ['tech'], attack: 2, cost: 4, conditionIcons: ['tech'], conditionText: 'Whenever you defeat a Villain this turn, you gain a Sidekick.', flavor: 'Someday, Maximus will use his mind control powers to amass an army large enough to overthrow his brother, Black Bolt.' } },
  { count: 3, card: { id: 'secret-wars-maximus-pieces-on-a-chessboard', name: 'Pieces on a Chessboard', hero: 'Maximus', img: img('secret-wars-maximus-pieces-on-a-chessboard'), team: ['cabal'], type: ['covert', 'tech'], attack: 3, cost: 5, text: 'You may have a Henchman Villain from your Victory Pile enter the city. If you do, draw a card.' } },
  { count: 1, card: { id: 'secret-wars-maximus-inhuman-mastery', name: 'Inhuman Mastery', hero: 'Maximus', img: img('secret-wars-maximus-inhuman-mastery'), team: ['cabal'], type: ['tech'], attack: 4, cost: 7, text: 'Each other player reveals a Tech Hero or chooses a Henchman Villain from their Victory Pile. You defeat all those Henchmen for free.', conditionIcons: ['cabal'], conditionText: 'You get +1 Attack for each Henchman you defeated this turn.' } },
]

export const NAMOR_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'secret-wars-namor-lead-the-armies-of-atlantis', name: 'Lead the Armies of Atlantis', hero: 'Namor, the Sub-Mariner', img: img('secret-wars-namor-lead-the-armies-of-atlantis'), team: ['cabal'], type: ['instinct'], recruit: 2, cost: 3, conditionIcons: ['instinct'], conditionText: 'Gain a Sidekick.' } },
  { count: 5, card: { id: 'secret-wars-namor-ruler-of-the-seas', name: 'Ruler of the Seas', hero: 'Namor, the Sub-Mariner', img: img('secret-wars-namor-ruler-of-the-seas'), team: ['cabal'], type: ['strength'], attack: 2, cost: 4, conditionIcons: ['strength'], conditionText: 'You get +2 Attack usable only against Villains on the Bridge or the Mastermind.', flavor: 'Namor is lord of two-thirds of the Earth: all the watery bits.' } },
  { count: 3, card: { id: 'secret-wars-namor-feed-the-sharks', name: 'Feed the Sharks', hero: 'Namor, the Sub-Mariner', img: img('secret-wars-namor-feed-the-sharks'), team: ['cabal'], type: ['strength', 'instinct'], attack: 2, cost: 6, text: 'You may KO a card from your hand or discard pile. If you do, draw a card.' } },
  { count: 1, card: { id: 'secret-wars-namor-imperius-rex', name: 'Imperius Rex', hero: 'Namor, the Sub-Mariner', img: img('secret-wars-namor-imperius-rex'), team: ['cabal'], type: ['strength'], cost: 7, text: 'Defeat a Villain for free.', conditionIcons: ['instinct', 'instinct', 'strength', 'strength'], conditionText: 'Instead, defeat the Mastermind once for free.' } },
]

export const OLD_MAN_LOGAN_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'secret-wars-old-man-logan-last-survivor', name: 'Last Survivor', hero: 'Old Man Logan', img: img('secret-wars-old-man-logan-last-survivor'), team: ['x-men'], type: ['instinct'], attack: 2, cost: 3, conditionIcons: ['instinct'], conditionText: 'You may KO a card from your hand or discard pile. If you KO a Wound this way, draw a card.' } },
  { count: 5, card: { id: 'secret-wars-old-man-logan-loner', name: 'Loner', hero: 'Old Man Logan', img: img('secret-wars-old-man-logan-loner'), team: ['x-men'], type: ['instinct', 'covert'], attack: 2, cost: 5, text: "If you don't recruit any Heroes this turn, you get +2 Attack.", flavor: 'In this parallel dimension, all the Heroes are dead, and now the world has been carved up by Villains.' } },
  { count: 3, card: { id: 'secret-wars-old-man-logan-rage-out', name: 'Rage Out', hero: 'Old Man Logan', img: img('secret-wars-old-man-logan-rage-out'), team: ['x-men'], type: ['instinct'], attack: 3, cost: 6, conditionIcons: ['instinct'], conditionText: 'Cross-Dimensional Wolverine Rampage. For each other player who gained a Wound this way, you get +1 Attack.' } },
  { count: 1, card: { id: 'secret-wars-old-man-logan-no-more-heroes', name: 'No More Heroes', hero: 'Old Man Logan', img: img('secret-wars-old-man-logan-no-more-heroes'), team: ['x-men'], type: ['instinct'], attack: 5, cost: 7, text: "Reveal your hand. You get +5 Attack if you haven't played any S.H.I.E.L.D. or HYDRA cards this turn and don't have any in your hand." } },
]

export const PROXIMA_MIDNIGHT_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'secret-wars-proxima-midnight-inspiration-through-power', name: 'Inspiration Through Power', hero: 'Proxima Midnight', img: img('secret-wars-proxima-midnight-inspiration-through-power'), team: ['cabal'], type: ['instinct', 'covert'], recruit: 1, attack: 1, cost: 2 } },
  { count: 5, card: { id: 'secret-wars-proxima-midnight-master-combatant', name: 'Master Combatant', hero: 'Proxima Midnight', img: img('secret-wars-proxima-midnight-master-combatant'), team: ['cabal'], type: ['instinct'], recruit: 0, attack: 0, cost: 4, text: 'If the most recent Hero you played this turn has a Recruit icon, you get +2 Recruit. If it has an Attack icon, you get +2 Attack.' } },
  { count: 3, card: { id: 'secret-wars-proxima-midnight-general-of-the-black-order', name: 'General of the Black Order', hero: 'Proxima Midnight', img: img('secret-wars-proxima-midnight-general-of-the-black-order'), team: ['cabal'], type: ['covert'], attack: 3, cost: 5, conditionIcons: ['instinct'], conditionText: 'You get +3 Recruit.', flavor: "Proxima rose through the ranks of Thanos' army with brutal effectiveness." } },
  { count: 1, card: { id: 'secret-wars-proxima-midnight-supernova-spear', name: 'Supernova Spear', hero: 'Proxima Midnight', img: img('secret-wars-proxima-midnight-supernova-spear'), team: ['cabal'], type: ['instinct'], recruit: 4, attack: 4, cost: 8, conditionIcons: ['covert'], conditionText: 'You get +4 Recruit and +4 Attack.' } },
]

export const SUPERIOR_IRON_MAN_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'secret-wars-superior-iron-man-armor-upgrades', name: 'Armor Upgrades', hero: 'Superior Iron Man', img: img('secret-wars-superior-iron-man-armor-upgrades'), team: ['illuminati'], type: ['tech'], attack: 1, cost: 2, conditionIcons: ['tech'], conditionText: 'You get +2 Attack.', flavor: 'Stark Technology is improving exponentially.' } },
  { count: 5, card: { id: 'secret-wars-superior-iron-man-optimized-technology', name: 'Optimized Technology', hero: 'Superior Iron Man', img: img('secret-wars-superior-iron-man-optimized-technology'), team: ['illuminati'], type: ['tech', 'ranged'], attack: 2, cost: 5, text: 'Draw a card.', flavor: 'Tony Stark uses his new psionically-controlled Endo-Sym armor to back up his claims of "Superiority."' } },
  { count: 3, card: { id: 'secret-wars-superior-iron-man-superior-to-others', name: 'Superior to Others', hero: 'Superior Iron Man', img: img('secret-wars-superior-iron-man-superior-to-others'), team: ['illuminati'], type: ['ranged'], recruit: 2, cost: 3, conditionIcons: ['ranged'], conditionText: 'Look at the top two cards of your deck. If one of them has a higher Cost than the other, draw it. Put the rest back in any order.' } },
  { count: 1, card: { id: 'secret-wars-superior-iron-man-humblebrag', name: '#Humblebrag', hero: 'Superior Iron Man', img: img('secret-wars-superior-iron-man-humblebrag'), team: ['illuminati'], type: ['tech'], attack: 5, cost: 8, text: 'Draw a card for each other player who has fewer cards in their Victory Pile than you.' } },
]

export const THANOS_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'secret-wars-thanos-revel-in-destruction', name: 'Revel in Destruction', hero: 'Thanos', img: img('secret-wars-thanos-revel-in-destruction'), team: ['cabal'], type: ['strength', 'ranged'], recruit: 2, cost: 3, conditionIcons: ['cabal'], conditionText: 'KO a Bystander from the Bystander Stack. Then, you get +1 Recruit for every three Bystanders in the KO pile.' } },
  { count: 5, card: { id: 'secret-wars-thanos-transdimensional-overlord', name: 'Transdimensional Overlord', hero: 'Thanos', img: img('secret-wars-thanos-transdimensional-overlord'), team: ['cabal'], type: ['strength'], attack: 2, cost: 5, keywords: ['teleport'], text: 'Teleport. You may KO a Bystander from your Victory Pile. If you do, you get +2 Attack.' } },
  { count: 3, card: { id: 'secret-wars-thanos-galactic-domination', name: 'Galactic Domination', hero: 'Thanos', img: img('secret-wars-thanos-galactic-domination'), team: ['cabal'], type: ['ranged'], attack: 4, cost: 6, conditionIcons: ['ranged'], conditionText: 'Each other player reveals a Ranged Hero or chooses a Bystander from their Victory Pile. You rescue those Bystanders.' } },
  { count: 1, card: { id: 'secret-wars-thanos-utter-annihilation', name: 'Utter Annihilation', hero: 'Thanos', img: img('secret-wars-thanos-utter-annihilation'), team: ['cabal'], type: ['ranged'], cost: 8, text: 'KO six Bystanders from the Bystander Stack. Then, defeat any Villain or Mastermind whose Attack is less than the number of Bystanders in the KO pile.' } },
]

export const ULTIMATE_SPIDER_MAN_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'secret-wars-ultimate-spider-man-marvel-team-up', name: 'Marvel Team-Up', hero: 'Ultimate Spider-Man', img: img('secret-wars-ultimate-spider-man-marvel-team-up'), team: ['spider-friends'], type: ['strength', 'instinct'], cost: 2, text: 'Gain a Sidekick. Reveal the top card of your deck. If it costs 2 or less, draw it.' } },
  { count: 5, card: { id: 'secret-wars-ultimate-spider-man-leaping-spider', name: 'Leaping Spider', hero: 'Ultimate Spider-Man', img: img('secret-wars-ultimate-spider-man-leaping-spider'), team: ['spider-friends'], type: ['strength'], attack: 0, cost: 2, text: 'Reveal the top card of your deck. If it costs 2 or less, draw it.', conditionIcons: ['strength'], conditionText: 'You get +2 Attack.' } },
  { count: 3, card: { id: 'secret-wars-ultimate-spider-man-web-slinger', name: 'Web-Slinger', hero: 'Ultimate Spider-Man', img: img('secret-wars-ultimate-spider-man-web-slinger'), team: ['spider-friends'], type: ['tech'], attack: 0, cost: 2, text: 'You get +2 Attack usable only against the Mastermind or Villains on the Rooftops or Bridge. Reveal the top card of your deck. If it costs 2 or less, draw it.' } },
  { count: 1, card: { id: 'secret-wars-ultimate-spider-man-hero-from-another-dimension', name: 'Hero from Another Dimension', hero: 'Ultimate Spider-Man', img: img('secret-wars-ultimate-spider-man-hero-from-another-dimension'), team: ['spider-friends'], type: ['covert'], attack: 0, cost: 2, text: 'You get +2 Attack for each other card you have played this turn that costs 1 or 2.' } },
]

function deadlandsVillain(
  id: string,
  name: string,
  strength: number,
  vp: number,
  text: string,
  keywords: string[] = ['rise-of-the-living-dead'],
): DeckEntry {
  return {
    count: 1,
    card: {
      id: `secret-wars-${id}`,
      name,
      img: img(id),
      strength,
      vp,
      villainGroup: 'The Deadlands',
      text,
      keywords,
    },
  }
}

export const DEADLANDS_CARDS: DeckEntry[] = [
  deadlandsVillain(
    'zombie-baron-zemo',
    'Zombie Baron Zemo',
    6,
    4,
    'Ambush: Rise of the Living Dead.\nFight: For each of your Avengers Heroes, rescue a Bystander.',
  ),
  deadlandsVillain(
    'zombie-loki',
    'Zombie Loki',
    8,
    6,
    'Ambush: Rise of the Living Dead.\nEscape: Loki ascends to become a new Mastermind. He gains the ability, "Master Strike: Each player reveals a Strength Hero or gains a Wound."',
  ),
  deadlandsVillain(
    'zombie-madame-hydra',
    'Zombie Madame Hydra',
    4,
    2,
    'Ambush: Rise of the Living Dead.\nFight: KO one of your S.H.I.E.L.D. Heroes or HYDRA Allies.',
  ),
  deadlandsVillain(
    'zombie-mr-sinister',
    'Zombie Mr. Sinister',
    7,
    5,
    'Ambush: Rise of the Living Dead.\nEscape: Sinister ascends to become a new Mastermind. He gains the ability, "Master Strike: Sinister captures a Bystander. Then, each player with exactly 6 cards reveals a Covert Hero or discards cards equal to the number of Bystanders Sinister has."',
  ),
  deadlandsVillain(
    'zombie-modok',
    'Zombie M.O.D.O.K.',
    5,
    3,
    'Ambush: Rise of the Living Dead.\nFight: KO one of your Heroes with a Recruit icon.',
  ),
  deadlandsVillain(
    'zombie-mysterio',
    'Zombie Mysterio',
    6,
    6,
    'Ambush: Rise of the Living Dead.\nEscape: Shuffle this card into the Mastermind’s face-down Tactics. It becomes a Mastermind Tactic that says, "Fight: Draw two cards."',
  ),
  deadlandsVillain(
    'zombie-thanos',
    'Zombie Thanos',
    9,
    6,
    'Ambush: Rise of the Living Dead.\nEscape: Thanos ascends to become a new Mastermind. He gains the ability, "Master Strike: Each player reveals their hand and KOs one of their non-grey Heroes."',
  ),
  deadlandsVillain(
    'zombie-venom',
    'Zombie Venom',
    5,
    3,
    'Ambush: Rise of the Living Dead.\nYou can’t defeat Zombie Venom unless you have a Covert Hero.\nEscape: Each player gains a Wound.',
    ['rise-of-the-living-dead'],
  ),
]

function secretWarsVillain(
  id: string,
  name: string,
  group: string,
  count: number,
  strength: number,
  vp: number,
  text: string,
): DeckEntry {
  return {
    count,
    card: {
      id: `secret-wars-${id}`,
      name,
      img: img(id),
      strength,
      vp,
      villainGroup: group,
      text,
    },
  }
}

export const DOMAIN_OF_APOCALYPSE_CARDS: DeckEntry[] = [
  secretWarsVillain(
    'apocalyptic-blink',
    'Apocalyptic Blink',
    'Domain of Apocalypse',
    3,
    5,
    3,
    'Fight: Reveal the top card of your deck. Draw it or Teleport it.',
  ),
  secretWarsVillain(
    'apocalyptic-magneto',
    'Apocalyptic Magneto',
    'Domain of Apocalypse',
    1,
    8,
    6,
    'Fight: Gain an X-Men Hero from the HQ for free.\nEscape: Magneto ascends to become a new Mastermind. He gains the ability, "Master Strike: Each player reveals an X-Men Hero or discards down to four cards."',
  ),
  secretWarsVillain(
    'apocalyptic-rogue',
    'Apocalyptic Rogue',
    'Domain of Apocalypse',
    2,
    6,
    4,
    'Fight: Reveal the top card of the Hero Deck. The player of your choice gains it.\nEscape: Reveal the top card of the Hero Deck. Each player reveals their hand and discards a card of that class.',
  ),
  secretWarsVillain(
    'apocalyptic-weapon-x',
    'Apocalyptic Weapon X',
    'Domain of Apocalypse',
    2,
    7,
    5,
    'Fight: KO one of your Heroes.\nEscape: Cross-Dimensional Wolverine Rampage.',
  ),
]

export const LIMBO_CARDS: DeckEntry[] = [
  secretWarsVillain(
    'inferno-colossus',
    'Inferno Colossus',
    'Limbo',
    2,
    5,
    3,
    'Ambush: The Mastermind captures a Bystander.\nFight: KO one of your Heroes.',
  ),
  secretWarsVillain(
    'inferno-cyclops',
    'Inferno Cyclops',
    'Limbo',
    2,
    6,
    4,
    'Ambush: Inferno Cyclops captures a Bystander.\nEscape: The Mastermind captures all the Bystanders this Villain had. Each player still discards a card for each Bystander carried away.',
  ),
  secretWarsVillain(
    'inferno-darkchilde',
    'Inferno Darkchilde',
    'Limbo',
    2,
    5,
    3,
    'Fight: Reveal the top card of your deck. KO it or Teleport it.\nEscape: Each player Teleports a random card from their hand.',
  ),
  secretWarsVillain(
    'inferno-nightcrawler',
    'Inferno Nightcrawler',
    'Limbo',
    2,
    4,
    2,
    'Fight: Up to two cards in your hand that have a Recruit icon gain Teleport this turn.',
  ),
]
