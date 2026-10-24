import type { CardInstance } from './types'
import type { UiAdapter } from './ui'

/**
 * Select one card for an ability. A single legal target is selected without
 * opening a redundant prompt; multiple targets still require player input.
 */
export async function chooseOneCard(
  ui: UiAdapter,
  pool: CardInstance[],
  prompt: string,
): Promise<CardInstance | undefined> {
  if (pool.length === 0) return undefined
  if (pool.length === 1) return pool[0]
  return (await ui.choose(pool, { prompt, optional: false })) ?? undefined
}

/**
 * Resolve the common "reveal a matching Hero or suffer an effect" pattern.
 * The caller supplies the already filtered pool, so this helper remains
 * usable for teams, classes, icons and other card conditions.
 */
export async function revealOneOr(
  ui: UiAdapter,
  pool: CardInstance[],
  prompt: string,
  revealedMessage: string,
  otherwise: () => Promise<void>,
): Promise<void> {
  const chosen = await chooseOneCard(ui, pool, prompt)
  if (chosen) {
    await ui.showInfo(chosen, revealedMessage)
    return
  }
  await otherwise()
}
