import { registerCardAbility } from '../../../engine/cardAbilities'
import { gainWound, drawCards, addRecruit, addAttack, rescueBystander } from '../../../engine/game'
import { koCard, countPlayedThisTurn, koFromHandOrDiscard, getEffectiveStrength } from '../../../engine/keywords'
import { defeatVillainFree } from '../../../engine/combat'
import { canDefeatVillain } from '../../../engine/villainRequirements'
import { getCardData } from '../../../engine/cardData'
import { CITY_NAMES } from '../../../engine/constants'
import { registerFocusEffect } from '../../../engine/focus'
import { registerAmbushShield } from '../../../engine/replacements'
import type { CardInstance, GameState } from '../../../engine/types'
import type { UiAdapter } from '../../../engine/ui'

// "Fantastic Four:" = inna zagrana karta tej drużyny (karta jest dopisana do cardsPlayedThisTurn dopiero po zdolności)
function playedOtherFantasticFour(state: GameState): boolean {
  return countPlayedThisTurn(state, { team: 'fantastic-four' }) > 0
}

// ---------- Human Torch ----------

registerCardAbility('hero-human-torch-call-for-backup', async (state, { ui }) => {
  const wounds = [...state.hand, ...state.discard].filter(
    (c) => state.cards[c.cardId].kind === 'wound',
  )
  if (wounds.length === 0) return

  const chosen = await ui.choose(wounds, {
    prompt: 'Call for Backup: możesz KO Ranę z ręki lub stosu odrzuconych (+1 Recruit)',
    optional: true,
  })
  if (!chosen) return

  koCard(state, chosen.instanceId)
  addRecruit(state, 1)
})

registerCardAbility('hero-human-torch-hothead', async (state, { ui }) => {
  await gainWound(state, ui)
})

// Flame On!: sam przycisk i koszt (focus: 6) są w silniku, tu tylko efekt
registerFocusEffect('hero-human-torch-flame-on', async (state) => {
  addAttack(state, 4)
})

// Nova Flame: liczy zajęte pola miasta
registerCardAbility('hero-human-torch-nova-flame', async (state) => {
  if (!playedOtherFantasticFour(state)) return
  addAttack(state, state.city.filter((c) => c !== null).length)
})

// ---------- Invisible Woman ----------

registerFocusEffect('hero-invisible-woman-disappearing-act', async (state, ui) => {
  await koFromHandOrDiscard(state, ui, 'Disappearing Act: możesz KO kartę z ręki lub stosu odrzuconych')
})

registerCardAbility('hero-invisible-woman-four-of-a-kind', async (state) => {
  const otherCostFour = state.cardsPlayedThisTurn.filter((c) => getCardData(state, c).cost === 4)
  if (otherCostFour.length === 0) return
  addAttack(state, 2)
})

// Limit 4 użyć na turę to dane karty (focusLimit), liczony łącznie dla wszystkich kopii (engine/focus.ts)
registerFocusEffect('hero-invisible-woman-unseen-rescue', async (state, ui) => {
  await rescueBystander(state, ui)
})

// Invisible Barrier: nie zagrywa się jej, tylko ujawnia z ręki zamiast efektu Ambush (hook w enterCity)
registerAmbushShield('hero-invisible-woman-invisible-barrier', async (state, ui, self) => {
  const choice = await ui.chooseOptionWithCard(
    self,
    [
      { id: 'reveal', label: 'Ujawnij Invisible Barrier: dobierz 2 karty zamiast efektu Ambush' },
      { id: 'no', label: 'Rozpatrz Ambush normalnie' },
    ],
    'Efekt Ambush',
  )
  if (choice !== 'reveal') return false
  drawCards(state, 2)
  return true
})

// ---------- Mr. Fantastic ----------

// Dobranie nowej ręki na koniec tury czyta bonusDrawNextTurn (turn.ts, endTurn)
registerFocusEffect('hero-mr-fantastic-twisting-equations', async (state) => {
  state.bonusDrawNextTurn += 1
})

registerCardAbility('hero-mr-fantastic-unstable-molecules', async (state) => {
  drawCards(state, 2)
})

// Karta zagrywana jest już poza ręką, więc hand.length to "pozostałe" karty w ręce
registerCardAbility('hero-mr-fantastic-one-gigantic-hand', async (state) => {
  if (!playedOtherFantasticFour(state)) return
  addAttack(state, state.hand.length)
})

// Ultimate Nullifier: flaga odczytywana w combat.ts (anulowanie efektu Fight Villaina i taktyki Mastermina)
registerCardAbility('hero-mr-fantastic-ultimate-nullifier', async (state) => {
  state.cancelFightEffectsThisTurn = true
})

// Focus: "+1 Attack tylko na Mastermina" = Mastermind ma -1 Attack w tej turze (jak w innych kartach)
registerFocusEffect('hero-mr-fantastic-ultimate-nullifier', async (state) => {
  state.mastermindAttackModifierThisTurn -= 1
})

// ---------- Silver Surfer ----------

function epicDestinyTargets(state: GameState): CardInstance[] {
  return state.city.filter((c): c is CardInstance => {
    if (!c) return false
    const strength = getEffectiveStrength(state, c)
    return (strength === 5 || strength === 6) && canDefeatVillain(state, c.cardId)
  })
}

registerFocusEffect(
  'hero-silver-surfer-epic-destiny',
  async (state, ui) => {
    const targets = epicDestinyTargets(state)
    if (targets.length === 0) return

    const chosen = await ui.choose(targets, {
      prompt: 'Epic Destiny: pokonaj Villaina o sile 5 lub 6',
      optional: false,
    })
    if (chosen) await defeatVillainFree(state, chosen.instanceId, ui)
  },
  (state) => epicDestinyTargets(state).length > 0,
)

registerFocusEffect('hero-silver-surfer-warp-speed', async (state) => {
  drawCards(state, 1)
})

registerFocusEffect('hero-silver-surfer-the-power-cosmic', async (state) => {
  addAttack(state, 9)
})

registerCardAbility('hero-silver-surfer-energy-surge', async (state) => {
  addRecruit(state, state.recruit)
})

// ---------- Thing ----------

registerCardAbility('hero-thing-it-started-on-yancy-street', async (state) => {
  if (!playedOtherFantasticFour(state)) return
  addRecruit(state, 2)
})

registerFocusEffect('hero-thing-knuckle-sandwich', async (state) => {
  addAttack(state, 2)
})

// Crime Stopper, Focus: przesunięcie Villaina (wzorzec z Stalk the Prey, ale bez "may": Focus jest już opłacony)
async function moveVillainToAdjacent(state: GameState, ui: UiAdapter, title: string): Promise<void> {
  const targets = state.city.filter((c): c is CardInstance => !!c)
  if (targets.length === 0) return

  const villain = await ui.choose(targets, {
    prompt: `${title}: wybierz Villaina do przesunięcia na sąsiednią pozycję`,
    optional: false,
  })
  if (!villain) return

  const fromIndex = state.city.findIndex((c) => c?.instanceId === villain.instanceId)
  const neighbours = [fromIndex - 1, fromIndex + 1].filter((i) => i >= 0 && i < CITY_NAMES.length)
  if (neighbours.length === 0) return

  let toIndex = neighbours[0]
  if (neighbours.length > 1) {
    const chosenSlotId = await ui.chooseOption(
      neighbours.map((i) => ({ id: String(i), label: CITY_NAMES[i] })),
      `${title}: wybierz sąsiednią pozycję`,
    )
    toIndex = Number(chosenSlotId)
  }

  // Jeśli ktoś tam stoi, zamieniają się miejscami. Porwani Bystanderzy zostają przy swoim Villainie
  const occupant = state.city[toIndex]
  state.city[toIndex] = villain
  state.city[fromIndex] = occupant ?? null
}

registerFocusEffect(
  'hero-thing-crime-stopper',
  async (state, ui) => {
    await moveVillainToAdjacent(state, ui, 'Crime Stopper')
  },
  (state) => state.city.some((c) => c !== null),
)

// Crime Stopper: bonus za pokonanie Villaina w Bank do końca tury (obsługa w combat.ts, removeVillainFromCity)
registerCardAbility('hero-thing-crime-stopper', async (state) => {
  state.locationDefeatBonuses = [
    ...(state.locationDefeatBonuses ?? []),
    { locations: ['Bank'], rescue: 1 },
  ]
})

// "strength:" = każda inna zagrana karta typu strength daje +3 Attack
registerCardAbility('hero-thing-its-clobberin-time', async (state) => {
  const others = countPlayedThisTurn(state, { type: 'strength' })
  if (others > 0) addAttack(state, 3 * others)
})
