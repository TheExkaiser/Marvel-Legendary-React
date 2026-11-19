import { registerCardAbility } from '../../../engine/cardAbilities'
import { logEvent } from '../../../engine/common'
import { patrolCitySpace } from '../../../engine/patrol'
import { addRecruit } from '../../../engine/resources'
import { registerStrengthModifier } from '../../../engine/strengthModifiers'
import { registerVillainAbilities } from '../../../engine/villainAbilities'
import { enterCity } from '../../../engine/villainPhase'
import { koOneOfYourHeroes } from './heroAbilities'

// Alligator Trapper: przy uratowaniu Patrol the Sewers, puste = +2 Recruit
registerCardAbility('secret-wars-2-alligator-trapper', async (state) => {
  if (patrolCitySpace(state, 'Sewers') !== 'empty') return
  logEvent(state, 'Patrol the Sewers: empty')
  addRecruit(state, 2)
})

// Shapeshifted Copycat: uratowany Bystander wychodzi z Victory Pile, zmienia się w Villaina z 3 Attack i wchodzi do miasta.
// Dane karty nadpisuje instanceOverrides (nie jest już Bystanderem), siłę 3 daje modyfikator (silnik czyta siłę z kart bazowych),
// a "Fight: KO one of your Heroes" to zdolność zarejestrowana pod tym cardId (działa tylko, gdy karta jest Villainem w mieście).
registerCardAbility('secret-wars-2-shapeshifted-copycat', async (state, { ui, self }) => {
  const index = state.defeated.findIndex((card) => card.instanceId === self.instanceId)
  if (index === -1) return
  state.defeated.splice(index, 1)
  state.instanceOverrides = {
    ...state.instanceOverrides,
    [self.instanceId]: { data: { kind: undefined, strength: 3, villainGroup: 'Shapeshifted Copycat' } },
  }
  logEvent(state, 'Shapeshifted Copycat: became a Villain with 3 Attack')
  await enterCity(state, self, ui)
})

registerStrengthModifier('secret-wars-2-shapeshifted-copycat', () => 3)

registerVillainAbilities('secret-wars-2-shapeshifted-copycat', {
  onFight: async (state, ui) => {
    await koOneOfYourHeroes(state, ui, 'Shapeshifted Copycat (Fight): KO one of your Heroes')
  },
})

// Undercover Agent: "a player of your choice" = gracz (solo), zdobywa S.H.I.E.L.D. Officera na discard
registerCardAbility('secret-wars-2-undercover-agent', async (state) => {
  const officer = state.officerDeck.pop()
  if (!officer) return
  state.discard.push(officer)
  logEvent(state, 'Undercover Agent: gained a S.H.I.E.L.D. Officer')
})
