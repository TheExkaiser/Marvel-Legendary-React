import type { CardInstance, GameState } from './types'
import type { UiAdapter } from './ui'
import { assertPlaying, logEvent } from './common'
import { getCardData } from './cardData'

export type ArtifactEffect = (state: GameState, ui: UiAdapter, self: CardInstance) => Promise<void>

/** Jedna zdolność "raz na turę" artefaktu. Karta może mieć kilka (Godslayer Blade), każda liczy limit osobno. */
export interface ArtifactAbility {
  id: string // unikalne w obrębie karty, klucz limitu użyć
  label: string // napis na przycisku
  effect: ArtifactEffect
  isUsable?: (state: GameState, self: CardInstance) => boolean // dodatkowy warunek widoczności przycisku, np. "mam 5 Shardów"
  limit?: number // ile razy na turę (domyślnie 1)
}

const registry = new Map<string, ArtifactAbility[]>()

export function registerArtifactAbilities(cardId: string, abilities: ArtifactAbility[]): void {
  registry.set(cardId, abilities)
}

export function getArtifactAbilities(cardId: string): ArtifactAbility[] {
  return registry.get(cardId) ?? []
}

const limitOf = (ability: ArtifactAbility): number => ability.limit ?? 1
const useKey = (instance: CardInstance, ability: ArtifactAbility): string => `${instance.instanceId}:${ability.id}`
const usesOf = (state: GameState, instance: CardInstance, ability: ArtifactAbility): number =>
  state.artifactUsesThisTurn?.[useKey(instance, ability)] ?? 0

/** Czy gracz kontroluje ten Artifact (leży w state.artifacts). */
export function controlsArtifact(state: GameState, instance: CardInstance): boolean {
  return (state.artifacts ?? []).some((c) => c.instanceId === instance.instanceId)
}

export function canUseArtifactAbility(state: GameState, instance: CardInstance, ability: ArtifactAbility): boolean {
  if (state.status !== 'playing' || !controlsArtifact(state, instance)) return false
  if (usesOf(state, instance, ability) >= limitOf(ability)) return false
  if (ability.isUsable && !ability.isUsable(state, instance)) return false
  return true
}

/** Zdolności, których przycisk ma być teraz widoczny. */
export function usableArtifactAbilities(state: GameState, instance: CardInstance): ArtifactAbility[] {
  return getArtifactAbilities(instance.cardId).filter((ability) => canUseArtifactAbility(state, instance, ability))
}

/** Artefakt ma zdolności "raz na turę" i wszystkie są już wykorzystane (UI: karta dimmed). */
export function isArtifactExhausted(state: GameState, instance: CardInstance): boolean {
  const abilities = getArtifactAbilities(instance.cardId)
  return abilities.length > 0 && abilities.every((ability) => usesOf(state, instance, ability) >= limitOf(ability))
}

/** Zdolności kontrolowanych Artifactów, które da się teraz skopiować (Legendary Outlaw):
 * limit użyć jest ignorowany (kopia to osobne użycie), ale warunek isUsable nadal obowiązuje. */
export function copyableArtifactAbilities(state: GameState): { artifact: CardInstance; ability: ArtifactAbility }[] {
  return (state.artifacts ?? []).flatMap((artifact) =>
    getArtifactAbilities(artifact.cardId)
      .filter((ability) => !ability.isUsable || ability.isUsable(state, artifact))
      .map((ability) => ({ artifact, ability })),
  )
}

/** Odpala efekt zdolności BEZ sprawdzania i liczenia limitu: dla efektów innych kart
 * (np. Legendary Outlaw / Rogue / Star-Lord kopiujący Artifact: zdolność użyta raz, bez innych skutków). */
export async function runArtifactAbility(
  state: GameState,
  ui: UiAdapter,
  instance: CardInstance,
  abilityId: string,
): Promise<void> {
  const ability = getArtifactAbilities(instance.cardId).find((a) => a.id === abilityId)
  if (!ability) throw new Error(`Artefakt ${instance.cardId} nie ma zdolności ${abilityId}`)
  await ability.effect(state, ui, instance)
}

/** Przycisk na karcie: sprawdza warunki, liczy użycie w tej turze i odpala efekt. */
export async function activateArtifactAbility(
  state: GameState,
  instanceId: string,
  abilityId: string,
  ui: UiAdapter,
): Promise<void> {
  assertPlaying(state)
  const instance = (state.artifacts ?? []).find((c) => c.instanceId === instanceId)
  if (!instance) throw new Error(`Artefaktu ${instanceId} nie ma w grze`)
  const ability = getArtifactAbilities(instance.cardId).find((a) => a.id === abilityId)
  if (!ability) throw new Error(`Artefakt ${instance.cardId} nie ma zdolności ${abilityId}`)
  if (!canUseArtifactAbility(state, instance, ability)) throw new Error('Nie można teraz użyć tej zdolności artefaktu')

  state.artifactUsesThisTurn = {
    ...state.artifactUsesThisTurn,
    [useKey(instance, ability)]: usesOf(state, instance, ability) + 1,
  }
  logEvent(state, `Artifact: ${getCardData(state, instance).name} (${ability.label})`)
  await ability.effect(state, ui, instance)
}

// ---------- Reakcje artefaktów na zdarzenia silnika ("Whenever ...") ----------

/** Zdarzenia, na które artefakt może zareagować. Silnik woła runArtifactReactions w odpowiednim miejscu. */
export type ArtifactTrigger = 'master-strike-completed' | 'ambush-completed'

const reactions = new Map<string, Partial<Record<ArtifactTrigger, ArtifactEffect>>>()

/** Rejestruje reakcje artefaktu (np. Incoming Detector: "Whenever a Master Strike or Villain's Ambush ability is completed"). */
export function registerArtifactReactions(
  cardId: string,
  handlers: Partial<Record<ArtifactTrigger, ArtifactEffect>>,
): void {
  reactions.set(cardId, handlers)
}

/** Odpala reakcje wszystkich kontrolowanych artefaktów na dane zdarzenie (każda kopia osobno). */
export async function runArtifactReactions(state: GameState, ui: UiAdapter, trigger: ArtifactTrigger): Promise<void> {
  for (const artifact of [...(state.artifacts ?? [])]) {
    const handler = reactions.get(artifact.cardId)?.[trigger]
    if (handler) await handler(state, ui, artifact)
  }
}
