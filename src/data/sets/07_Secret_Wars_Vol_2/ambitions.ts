import type { CardData } from '../../../engine/types'

// Ambitions są pulą opcjonalną: trafiają do Villain Decku wyłącznie przez Sinister Ambitions.
// Karta brakująca z poprzedniego zestawienia zostanie dopisana osobno.
const ambition = (id: string, name: string, strength: number, text: string): CardData => ({
  id: `secret-wars-2-ambition-${id}`,
  name,
  img: `/cards/secret-wars-vol-2/secret-wars-2-ambition-${id}.webp`,
  kind: 'ambition',
  strength,
  vp: 4,
  villainGroup: 'Ambitions',
  text,
})

export const SECRET_WARS_VOL_2_AMBITIONS: CardData[] = [
  ambition('puzzle-trap', 'Puzzle Trap', 6, "Choose a class. Other players can't recruit Heroes of that class until the start of your next turn. Then, discard this card."),
  ambition('seize-the-high-ground', 'Seize the High Ground', 3, "Patrol the Rooftops: If there's a Villain there, then all Villains everywhere get +1 Attack until the start of your next turn. Then, discard this card."),
  ambition('hostage-situation', 'Hostage Situation', 2, 'Patrol the Streets: If there\'s a Villain there, then each Villain in the city captures a Bystander.'),
  ambition('this-is-a-stickup', 'This is a Stickup', 4, "Patrol the Bank: If there's a Villain there, each other player reveals their hand and discards a card with a Recruit icon."),
  ambition('shadowy-disciple', 'Shadowy Disciple', 9, 'This Ambition ascends to become a new 9 Attack Mastermind worth 5 VP. It gains the ability: Master Strike: Each player reveals a Ranged Hero or gains a Wound.'),
  ambition('detonate-the-bridge', 'Detonate the Bridge', 4, "Patrol the Bridge: If there's a Villain there, each player gains a Wound."),
  ambition('secret-escape-tunnels', 'Secret Escape Tunnels', 5, "Patrol the Sewers: If there's a Villain there, it escapes."),
  ambition('crazed-charge', 'Crazed Charge', 3, 'A Villain in the city charges two spaces.'),
  ambition('devastate-shield', 'Devastate S.H.I.E.L.D.', 7, 'Every other player reveals their hand and discards all their cards that cost 0.'),
  ambition('rack-and-ruin', 'Rack and Ruin', 10, 'This card becomes a Master Strike that takes effect immediately. Then, this card becomes a Scheme Twist that takes effect immediately.'),
]
