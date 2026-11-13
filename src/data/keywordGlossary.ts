// Słownik słów kluczowych pokazywany w menu "Keywords". To TYLKO opis zasad dla gracza.
// Logika słów kluczowych siedzi w silniku (np. engine/keywords.ts, focus.ts, versatile.ts).
// Bez podziału na sety: nowe słowo kluczowe = nowy wpis w KEYWORD_GLOSSARY.
//
// Znaczniki w tekście:
//   {strength} {instinct} {covert} {tech} {ranged}  -> ikona z public/icons/<nazwa>.png
//   **tekst**                                       -> pogrubienie

import type { CardData } from '../engine/types'

export type KeywordBlock =
  | { type: 'text'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'list'; items: string[] }

export interface KeywordEntry {
  id: string
  name: string
  aliases?: string[] // odmiany nazwy rozpoznawane w tekście karty (np. liczba mnoga)
  tooltip: string // krótki opis w okienku po najechaniu na słowo w tekście karty (KeywordText)
  // Czy dana karta używa tego słowa kluczowego. Menu pokazuje wpis, jeśli którakolwiek karta w grze spełnia warunek.
  appearsOn: (card: CardData) => boolean
  blocks: KeywordBlock[]
}

const hasKeyword = (card: CardData, keyword: string) => (card.keywords ?? []).includes(keyword)
const hasCardText = (card: CardData, pattern: RegExp) =>
  pattern.test(`${card.name} ${card.text ?? ''}`)

export const KEYWORD_GLOSSARY: KeywordEntry[] = [
  {
    id: 'wall-crawl',
    name: 'Wall-Crawl',
    tooltip: 'When you recruit this Hero, you may put it on top of your deck.',
    appearsOn: (c) => hasKeyword(c, 'wall-crawl'),
    blocks: [
      {
        type: 'text',
        text: `When you recruit this Hero, you may put it on top of your deck. Do not use any other abilities on the card until it is drawn from your deck.`,
      },
      {
        type: 'text',
        text: `You cannot use Wall-Crawl when you gain a Hero through a special ability instead of recruiting it.`,
      },
    ],
  },
  {
    id: 'feast',
    name: 'Feast',
    tooltip: 'Fight: KO the top card of your deck.',
    appearsOn: (c) => hasKeyword(c, 'feast'),
    blocks: [
      {
        type: 'text',
        text: `Feast means: Fight: KO the top card of your deck. A Feast effect is treated as a Fight effect.`,
      },
    ],
  },
  {
    id: 'teleport',
    name: 'Teleport',
    tooltip: 'Instead of playing a card with Teleport, you may set it aside. Add it to your new hand at the end of your turn as an extra card.',
    // Azazel nadaje Teleport karcie z ręki, więc jego obecność też oznacza, że Teleport jest w grze
    appearsOn: (c) => hasKeyword(c, 'teleport') || c.id === 'villain-azazel',
    blocks: [
      {
        type: 'text',
        text: `Instead of playing, you may set aside a card with the keyword "Teleport". If you do, add it to your new hand at the end of your turn as an extra card.`,
      },
    ],
  },
  {
    id: 'bribe',
    name: 'Bribe',
    tooltip: 'You can fight Villains with Bribe by spending any combination of Attack and/or Recruit points.',
    appearsOn: (c) => hasKeyword(c, 'bribe'),
    blocks: [
      {
        type: 'text',
        text: `You can fight villains with the keyword "Bribe" by spending any combination of Attack and/or Recruit points. For example, you may play two S.H.I.E.L.D. Agents and two S.H.I.E.L.D. Troopers to fight the +4 Attack Maggia Goons.`,
      },
    ],
  },
  {
    id: 'versatile',
    name: 'Versatile',
    tooltip: 'When you play a card with Versatile, you must first choose between Recruit and Attack. The card then provides the chosen one equal to the Versatile value.',
    appearsOn: (c) => c.versatile !== undefined,
    blocks: [
      {
        type: 'text',
        text: `When you play a card with the keyword "Versatile" you must first choose between Recruit and Fight. Once you have chosen, the card provides recruit or fight equal to the Versatile value. For example, Versatile 3 gives you +3 Recruit or +3 Attack.`,
      },
    ],
  },
  {
    id: 'focus',
    name: 'Focus',
    tooltip: 'Pay the Recruit cost on the left of the arrow to get the effect on the right. You can use it as many times as you want this turn, as long as you have the Recruit.',
    appearsOn: (c) => c.focus !== undefined,
    blocks: [
      {
        type: 'text',
        text: `The new "Focus" keyword lets you transform your Recruit Points into powerful, flexible effects. It looks like this:`,
      },
      { type: 'quote', text: `"Focus Recruit -> [EFFECT]"` },
      {
        type: 'text',
        text: `When you play a card with a Focus ability, you can pay the cost on the left side of the arrow to get the effect on right side of the arrow. You can use that Focus ability as many times as you want for the rest of the turn. For example, say you play a card that says:`,
      },
      { type: 'quote', text: `"Focus 2 Recruit -> Draw a card."` },
      {
        type: 'text',
        text: `For the rest of your turn, you can use 2 Recruit Points to draw a card, as many times as you want, as long as you have the Recruit points available. You can even play more Heroes, recruit, fight, then use the Focus ability more.`,
      },
      {
        type: 'text',
        text: `**Note:** You can use Focus abilities and still use the "Healing" ability on Wounds.`,
      },
    ],
  },
  {
    id: 'burrow',
    name: 'Burrow',
    tooltip: 'Fight: If the Streets were empty, put this Villain back into the Streets. It does not do any Ambush effects.',
    appearsOn: (c) => hasKeyword(c, 'burrow'), // kiedy dojdą karty: keywords: ['burrow']
    blocks: [
      {
        type: 'text',
        text: `Subterranea Villains use the new Burrow keyword. This allows them to retreat by digging to safety when they are attacked. "Burrow" means:`,
      },
      { type: 'quote', text: `"Fight: If the Streets were empty, put this Villain back into the Streets."` },
      {
        type: 'text',
        text: `When you fight a Villain with Burrow, do all of that Villain's Fight effects. You rescue any Bystanders the Villain may have captured as normal. Then, if the "Streets" city space was empty, put that Villain back into the Streets space. This means that to stop a Villain with Burrow permanently, you have to:`,
      },
      {
        type: 'list',
        items: [
          `Fight it while it's in the Streets, or`,
          `Fight it while another Villain occupies the Streets, or`,
          `Fight it once to drive it back to the Streets then fight it again in the Streets to finish it.`,
        ],
      },
      {
        type: 'text',
        text: `If you fight a Villain with Burrow twice in a turn, you'll do that Villain's "Fight" effects twice. Cards that do something "when you defeat" a Villain still work if the Villain burrows to the Streets. When a Villain burrows to the Streets, it does not do any Ambush effects.`,
      },
    ],
  },
  {
    id: 'cosmic-threat',
    name: 'Cosmic Threat',
    tooltip: 'Once per turn, for each card of the listed class you reveal, this Enemy gets -3 Attack this turn.',
    appearsOn: (c) => hasKeyword(c, 'cosmic-threat'), // kiedy dojdą karty: keywords: ['cosmic-threat']
    blocks: [
      {
        type: 'text',
        text: `Galactus and his Heralds use the new Cosmic Threat keyword. This gives them incredibly high Attack values with a special vulnerability. If an enemy has **Cosmic Threat:** {ranged} that means:`,
      },
      { type: 'quote', text: `"Once per turn, for each {ranged} card you reveal, this Enemy gets -3 Attack this turn."` },
      { type: 'text', text: `For example, Morg has **Cosmic Threat:** {instinct} and 12* Attack.` },
      {
        type: 'list',
        items: [
          `If you reveal two {instinct} cards, Morg gets -6 Attack this turn, so he has 6 Attack left.`,
          `If you reveal four or more {instinct} cards, Morg gets -12 Attack this turn, so he has 0 Attack, and you can fight him without spending any Attack.`,
        ],
      },
      {
        type: 'text',
        text: `(An asterisk next to an Enemy's Attack number is to remind you that their Attack can change. The asterisk doesn't mean anything else.)`,
      },
      {
        type: 'text',
        text: `**Galactus' Cosmic Threat:** Galactus has the "Cosmic Threat: {strength} {instinct} {covert} {tech} {ranged}" ability. This means:`,
      },
      {
        type: 'quote',
        text: `"Once per turn, choose {strength}, {instinct}, {covert}, {tech} or {ranged}. For each card of that color you reveal, this Enemy gets -3 Attack for one fight this turn."`,
      },
      {
        type: 'text',
        text: `If you try to fight Galactus a second time in the same turn, he will return to his full Attack and you cannot use his Cosmic Threat ability a second time that turn.`,
      },
    ],
  },
  {
    id: 'shard',
    name: 'Shard',
    aliases: ['Shards'],
    tooltip: 'Shards are tokens from a supply of 18. Spend one to get +1 Attack. Shards on a Villain or Mastermind give it +1 Attack each.',
    appearsOn: (c) => hasKeyword(c, 'shard'),
    blocks: [
      {
        type: 'text',
        text: `There are 18 Shard tokens. If you, a Villain or the Mastermind would gain a Shard but none are left in the supply, no Shard is gained and the game continues.`,
      },
      {
        type: 'text',
        text: `**You:** a Shard you gain stays in front of you. Click the Shard counter to spend them: each spent Shard returns to the supply and gives +1 Attack. You can spend as many as you like in a turn and keep the rest for later turns. Shards are worth no Victory Points.`,
      },
      {
        type: 'text',
        text: `**Villains:** Shards a Villain gains are put on it, and it gets +1 Attack for each. When you defeat it, you take one of its Shards and the rest return to the supply. When it escapes, the Mastermind gains one of its Shards and the rest return to the supply.`,
      },
      {
        type: 'text',
        text: `**Mastermind:** Shards on the Mastermind give it +1 Attack each. After you fight it, you take one of its Shards and the rest return to the supply. Then you resolve the Fight effect of the Tactic, which may add Shards to the Mastermind for future fights.`,
      },
    ],
  },
  {
    id: 'artifact',
    name: 'Artifact',
    aliases: ['Artifacts'],
    tooltip: 'A Hero you play in front of you that stays in play every turn. Its "once per turn" abilities can be used on each of your turns, including the turn you play it.',
    appearsOn: (c) => hasKeyword(c, 'artifact'),
    blocks: [
      {
        type: 'text',
        text: `Some Heroes are also Artifacts. You gain them like any Hero (into your discard pile). When you draw one, you may play it in front of you. You then control it, and at the end of your turn it stays in play while your other cards are discarded.`,
      },
      {
        type: 'text',
        text: `Use an Artifact's abilities with the buttons on the card, usually once per turn, starting on the turn you play it. You don't have to use them. Several Artifacts with the same name each work separately. A card turns dim once all its once-per-turn abilities are used.`,
      },
      {
        type: 'text',
        text: `Artifacts you control count as your Heroes, and you may reveal them when a card asks you to reveal a Hero. But you only "played" an Artifact on the turn you put it out, so it triggers Superpower abilities and "Heroes you played this turn" counts only on that turn.`,
      },
      {
        type: 'text',
        text: `If an effect copies an Artifact, you use that Artifact's "once per turn" ability once and nothing else happens.`,
      },
    ],
  },
  {
    id: 'rise-of-the-living-dead',
    name: 'Rise of the Living Dead',
    tooltip: 'A Villain with this ability can reenter the city from the top of a player’s Victory Pile.',
    appearsOn: (c) =>
      hasKeyword(c, 'rise-of-the-living-dead') ||
      hasCardText(c, /\bRise of the Living Dead\b/i),
    blocks: [
      {
        type: 'text',
        text: `Each player checks the top card of their Victory Pile. If that card is a Villain with a "Rise of the Living Dead" ability, that Villain reenters the city. Mastermind Tactics never return this way.`,
      },
      {
        type: 'text',
        text: `If you put a Villain with Bystanders into your Victory Pile, you choose the order of those cards.`,
      },
    ],
  },
  {
    id: 'cross-dimensional-rampage',
    name: 'Cross-Dimensional Rampage',
    aliases: ['Cross-Dimensional Hulk Rampage', 'Cross-Dimensional Wolverine Rampage', 'Cross-Dimensional Thor Rampage'],
    tooltip: 'Reveal a matching Hero or card from your Victory Pile, or gain a Wound.',
    appearsOn: (c) =>
      hasKeyword(c, 'cross-dimensional-rampage') ||
      hasCardText(c, /\bCross-Dimensional\b/i),
    blocks: [
      {
        type: 'text',
        text: `Cross-Dimensional (Character) Rampage means: Each player reveals one of their (Character) Heroes or a (Character) card in their Victory Pile, or gains a Wound.`,
      },
      {
        type: 'text',
        text: `(Character) cards include any card with "(Character)" in its card name or Hero name.`,
      },
      {
        type: 'text',
        text: `**Hulk** cards additionally include Maestro and Nul, Breaker of Worlds.`,
      },
      {
        type: 'text',
        text: `**Wolverine** cards additionally include any card with Weapon X or Old Man Logan in its name.`,
      },
    ],
  },
  {
    id: 'spectrum',
    name: 'Spectrum',
    tooltip: 'You can use a Spectrum ability only if you have at least 3 classes of Hero among the cards you played this turn and the cards in your hand.',
    appearsOn: (c) => hasKeyword(c, 'spectrum') || hasCardText(c, /\bSpectrum\b/),
    blocks: [
      {
        type: 'text',
        text: `Some cards have abilities like \"Spectrum: Draw a card.\" You can use a card's Spectrum abilities only if you have at least 3 classes of Hero.`,
      },
      {
        type: 'text',
        text: `Grey S.H.I.E.L.D. Heroes, HYDRA Allies, New Recruits and Sidekicks don't have classes, so they don't help.`,
      },
      {
        type: 'text',
        text: `You can count all the classes you have among cards you played this turn and cards in your hand.`,
      },
    ],
  },
  {
    id: 'patrol',
    name: 'Patrol',
    tooltip: 'You can use the ability only if that place (city space, Escape Pile or Victory Pile) has no cards in it when you play the card.',
    appearsOn: (c) => hasKeyword(c, 'patrol') || hasCardText(c, /\bPatrol\b/),
    blocks: [
      {
        type: 'text',
        text: `Some cards have abilities like \"Patrol the Sewers: If it's empty, rescue a Bystander.\" When you play that card, you can use that ability only if that city space has no cards in it.`,
      },
      {
        type: 'text',
        text: `If that city space becomes empty later in the turn, it's too late to use the Patrol ability.`,
      },
      {
        type: 'text',
        text: `This can also say \"Fight: Patrol the Bank: If it's empty, you get +2 Recruit. If it's not, you get +2 Attack.\"`,
      },
      {
        type: 'text',
        text: `Other cards let you patrol even stranger places, like the Escape Pile or a Victory Pile. Similarly, you can use those Patrol abilities if that place has no cards in it.`,
      },
      {
        type: 'text',
        text: `If a Mastermind or Scheme causes a city space not to exist, you can't patrol that space.`,
      },
    ],
  },
  {
    id: 'circle-of-kung-fu',
    name: 'Circle of Kung-Fu',
    tooltip: 'During your turn, this Villain has +N Attack unless you reveal a Hero that costs N or more.',
    appearsOn: (c) => hasKeyword(c, 'circle-of-kung-fu') || hasCardText(c, /\bCircle of (Kung|Quack)-Fu\b/),
    blocks: [
      {
        type: 'text',
        text: `\"5th Circle of Kung-Fu\" means \"During your turn, this Villain has +5 Attack unless you reveal a Hero that costs 5 or more.\"`,
      },
      {
        type: 'text',
        text: `Likewise, the 7th Circle gets +7 Attack unless you reveal a Hero that costs 7 or more, etc.`,
      },
      {
        type: 'text',
        text: `If a Villain or Mastermind already has a Circle of Kung-Fu, and a Scheme gives them another one, only count the highest circle - don't add them up.`,
      },
      {
        type: 'text',
        text: `(\"Quack-Fu\" is the same rule.)`,
      },
    ],
  },
  {
    id: 'fateful-resurrection',
    name: 'Fateful Resurrection',
    tooltip: 'Fight: Reveal the top card of the Villain Deck. If it is a Scheme Twist or Master Strike, this Villain reenters the city.',
    appearsOn: (c) => hasKeyword(c, 'fateful-resurrection') || hasCardText(c, /\bFateful Resurrection\b/),
    blocks: [
      {
        type: 'text',
        text: `On a Villain card, \"Fight: Fateful Resurrection\" means \"Fight: Reveal the top card of the Villain Deck. If it's a Scheme Twist or Master Strike, this Villain reenters the city.\"`,
      },
      {
        type: 'text',
        text: `If a Villain resurrects this way, you still rescue its Bystanders and do its other Fight effects. The Villain pushes into the Sewers and does any Ambush abilities as normal.`,
      },
      {
        type: 'text',
        text: `If a Mastermind Tactic resurrects this way, shuffle it back into the other face down Tactics.`,
      },
      {
        type: 'text',
        text: `If a Villain that has ascended to become a Mastermind resurrects this way, it stays a Mastermind and does not reenter the city.`,
      },
    ],
  },
  {
    id: 'charge',
    name: 'Charge',
    tooltip: 'After this Villain enters the Sewers, it charges forward an extra space, pushing other Villains forward.',
    appearsOn: (c) => hasKeyword(c, 'charge') || hasCardText(c, /\bCharge one space\b/),
    blocks: [
      {
        type: 'text',
        text: `\"Ambush: Charge one space\" means \"(After this Villain enters the Sewers,) it charges forward an extra space, pushing other Villains forward.\"`,
      },
    ],
  },
]
