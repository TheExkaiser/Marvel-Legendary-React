import type { GameState, CardInstance } from './types'
import type { UiAdapter } from './ui'
import { addAttack, addRecruit } from './resources'

/** Versatile N: gracz wybiera +N Attack albo +N Recruit.
 * Gdy aktywny jest Against All Odds, dostaje oba zasoby bez pytania. */
export async function applyVersatile(
  state: GameState,
  ui: UiAdapter,
  amount: number,
  card: CardInstance,
): Promise<void> {
  if (state.versatileBothThisTurn) {
    addAttack(state, amount)
    addRecruit(state, amount)
    return
  }

  let choice: string | null = null
  while (choice !== 'attack' && choice !== 'recruit') {
    choice = await ui.chooseOptionWithCard(
      card,
      [
        { id: 'attack', label: `+${amount} Attack`, icon: 'icons/attack.png' },
        { id: 'recruit', label: `+${amount} Recruit`, icon: 'icons/recruit.png' },
      ],
      `Versatile ${amount}: wybierz Attack albo Recruit`,
    )
  }

  if (choice === 'attack') addAttack(state, amount)
  else addRecruit(state, amount)
}