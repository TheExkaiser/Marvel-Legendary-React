import { registerCardAbility } from '../../../engine/cardAbilities'
import { drawCards, rescueBystander, addAttack } from '../../../engine/game'
import { discardCard } from '../../../engine/keywords'
import { registerDiscardReplacement } from '../../../engine/replacements'

// ---------- Angel ----------

// Diving Catch: to nie jest efekt przy zagraniu, tylko reakcja na odrzucenie przez efekt karty.
// Używamy tego samego mechanizmu co Cyclops (Unending Energy), ale zwracamy false,
// czyli karta i tak normalnie trafia do odrzuconych.
registerDiscardReplacement('hero-angel-diving-catch', async (state) => {
  rescueBystander(state)
  drawCards(state, 2)
  return false
})

registerCardAbility('hero-angel-high-speed-chase', async (state, { ui }) => {
  drawCards(state, 2)
  if (state.hand.length === 0) return

  const chosen = await ui.choose(state.hand, {
    prompt: 'High-Speed Chase: wybierz kartę do odrzucenia',
    optional: false,
  })
  if (chosen) await discardCard(state, chosen.instanceId, ui)
})

registerCardAbility('hero-angel-drop-off-a-friend', async (state, { ui }) => {
  if (state.hand.length === 0) return

  const chosen = await ui.choose(state.hand, {
    prompt: "Drop off a Friend: możesz odrzucić kartę (+Attack równy jej kosztowi)",
    optional: true,
  })
  if (!chosen) return

  const cost = state.cards[chosen.cardId].cost ?? 0
  await discardCard(state, chosen.instanceId, ui)

  // Jeśli efekt zastępczy zatrzymał kartę w ręce, to nie została odrzucona i nie ma bonusu
  const stillInHand = state.hand.some((c) => c.instanceId === chosen.instanceId)
  if (!stillInHand) addAttack(state, cost)
})

registerCardAbility('hero-angel-strength-of-spirit', async (state, { ui }) => {
  let discarded = 0
  const kept = new Set<string>() // karty, które efekt zastępczy zostawił w ręce

  while (true) {
    const options = state.hand.filter((c) => !kept.has(c.instanceId))
    if (options.length === 0) break

    const chosen = await ui.choose(options, {
      prompt: `Strength of Spirit: odrzucono ${discarded}. Wybierz kolejną kartę albo zakończ`,
      optional: true,
    })
    if (!chosen) break

    await discardCard(state, chosen.instanceId, ui)
    if (state.hand.some((c) => c.instanceId === chosen.instanceId)) {
      kept.add(chosen.instanceId)
    } else {
      discarded++
    }
  }

  if (discarded > 0) drawCards(state, discarded)
})