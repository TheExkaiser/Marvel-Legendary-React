// Barrel: publiczne API silnika. Reszta kodu nadal importuje z './game'.
export { createGameState, startGame } from './setup'
export { drawCards, takeTopCards } from './deckOps'
export { playCard, endTurn } from './turn'
export { villainPhase } from './villainPhase'
export { recruitHero, recruitOfficer } from './recruit'
export {
  fightVillain,
  defeatVillainFree,
  fightMastermind,
  claimTacticFree,
} from './combat'
export { gainWound, gainWoundSilent, rescueBystander } from './wounds'
export { debugReplaceAllHeroesInHq, debugRemoveAllStartingCards } from './debug'
export { peekTopCard } from './deckOps'
export { addRecruit, addAttack } from './resources'