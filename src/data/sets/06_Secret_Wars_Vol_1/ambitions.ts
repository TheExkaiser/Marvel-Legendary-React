import type { CardData } from '../../../engine/types'

const ambition = (id: string, name: string, strength: number, text: string): CardData => ({
  id: `secret-wars-1-ambition-${id}`, name, img: `/cards/secret-wars-vol-1/secret-wars-1-ambition-${id}.webp`,
  kind: 'ambition', strength, vp: 4, villainGroup: 'Ambitions', text,
})

export const SECRET_WARS_VOL_1_AMBITIONS: CardData[] = [
  ambition('pure-evil', 'Pure Evil', 5, 'Starting Ambition. Play a card from the Villain Deck. Keep this card in the Ambition Row.'),
  ambition('crackdown', 'Crackdown', 7, 'Choose a class. Each other player reveals their hand and discards all cards of that class.'),
  ambition('tide-of-destruction', 'Tide of Destruction', 8, 'Play two cards from the Villain Deck.'),
  ambition('abduction', 'Abduction', 2, 'Put a Hero from the HQ on the bottom of the Hero Deck.'),
  ambition('secret-plans', 'Secret Plans', 4, 'Put this card under a Villain in the Sewers or Bank. When that Villain escapes, this becomes a Scheme Twist that takes effect immediately.'),
  ambition('wipe-out', 'Wipe Out', 2, 'Choose a class. Put all Heroes of that class from the HQ on the bottom of the Hero Deck.'),
  ambition('crush-the-weak', 'Crush the Weak', 3, 'The other player with the fewest Villains in their Victory Pile gains a Wound.'),
  ambition('identity-theft', 'Identity Theft', 4, 'Each other player that has exactly six cards reveals a Tech Hero or puts two cards from their hand on top of their deck.'),
  ambition('wave-of-punishment', 'Wave of Punishment', 5, 'Each other player reveals a Ranged Hero or gains a Wound to the bottom of their deck.'),
  ambition('force-field', 'Force Field', 3, 'Put this card under the Mastermind. That Mastermind gets +3 Attack until the start of your next turn. Then discard this card.'),
  ambition('breakout', 'Breakout', 4, 'Choose a Villain from the Escape Pile. It enters the city.'),
  ambition('last-minute-escape', 'Last-Minute Escape', 9, "Pick a random Mastermind Tactic from all players' Victory Piles. Shuffle it back into the Mastermind's Tactics."),
  ambition('empower', 'Empower', 3, 'Put this card under a Villain in the city. Until the start of your next turn, that Villain gets +3 Attack. Then discard this card.'),
  ambition('deceive', 'Deceive', 4, 'Each other player reveals a Covert Hero or discards their hand and draws five cards.'),
  ambition('inflict-pain', 'Inflict Pain', 2, 'Each other player puts a Wound from their discard pile on top of their deck.'),
  ambition('bank-robbery', 'Bank Robbery', 3, "KO the Hero in the HQ space under the Bank. You get +Recruit equal to that Hero's printed Recruit."),
  ambition('pressure-point', 'Pressure Point', 6, 'Each other player reveals an Instinct Hero or gains a Wound to the top of their deck.'),
  ambition('cleave', 'Cleave', 6, 'Choose a number besides 0. Each other player reveals their hand and discards all cards of that cost.'),
  ambition('entrap', 'Entrap', 1, "Put this card on a Hero in the HQ. Players can't recruit that Hero until the start of your next turn. Then discard this card."),
  ambition('insane-twist', 'Insane Twist', 9, 'This card becomes a Scheme Twist that takes effect immediately.'),
  ambition('kidnap', 'Kidnap', 2, 'A Villain in the city captures a Bystander.'),
  ambition('thirst-for-power', 'Thirst for Power', 7, 'Reveal the top two cards of the Villain Deck. Play a Scheme Twist you revealed. Put the rest back in any order.'),
  ambition('painful-choice', 'Painful Choice', 8, 'Each other player chooses Recruit or Attack, then discards all their cards with that icon.'),
  ambition('crime-surge', 'Crime Surge', 3, 'Each Villain on the Rooftops and Streets captures a Bystander.'),
  ambition('dark-apprentice', 'Dark Apprentice', 10, 'Add a random new Mastermind to the game with one Tactic.'),
  ambition('collateral-damage', 'Collateral Damage', 4, 'Each other player KOs a Bystander from their Victory Pile or gains a Wound.'),
  ambition('ruthless-strike', 'Ruthless Strike', 4, 'This card becomes a Master Strike that takes effect immediately.'),
  ambition('infiltrate-shield', 'Infiltrate S.H.I.E.L.D.', 4, 'Choose a 0-cost Hero from the KO pile for each other player. Those players gain those Heroes.'),
  ambition('thirst-for-vengeance', 'Thirst for Vengeance', 6, 'Reveal the top two cards of the Villain Deck. Play a Master Strike you revealed. Put the rest back in any order.'),
  ambition('pummel', 'Pummel', 4, 'Each other player reveals a Strength Hero or gains a Wound.'),
]
