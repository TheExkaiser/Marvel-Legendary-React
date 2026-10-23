import { registerCardAbility } from '../../../engine/cardAbilities'
import { gainWound } from '../../../engine/game'
import { escapeVillain } from '../../../engine/villainPhase'
import { isLedGroupVillain } from '../../../engine/ledGroup'
import { activeCityIndexes } from '../../../engine/cityLayout'

// Mole Man: wszyscy Villainowie głównej grupy (Subterranea) w mieście uciekają, potem Rana
registerCardAbility('mastermind-mole-man-master-strike', async (state, { ui }) => {
  let escapedAny = false
  for (let i = 0; i < state.city.length; i++) {
    const villain = state.city[i]
    if (!villain || !isLedGroupVillain(state, villain)) continue
    state.city[i] = null
    await escapeVillain(state, villain, ui)
    escapedAny = true
  }
  if (escapedAny) await gainWound(state, ui)
})

// Galactus: niszczy istniejące pole miasta najbliższe Galactusowi (Bridge, potem kolejne w stronę Sewers).
// Villain na tym polu ucieka, a karta Master Strike zostaje na polu (cityDestroyed), więc nie idzie do KO.
registerCardAbility('mastermind-galactus-master-strike', async (state, { self, ui }) => {
  const index = activeCityIndexes(state)[0]
  if (index === undefined) return

  state.cityDestroyed = state.city.map((_, i) => (i === index ? self : (state.cityDestroyed?.[i] ?? null)))

  const villain = state.city[index]
  if (villain) {
    state.city[index] = null
    await escapeVillain(state, villain, ui)
  }
})
