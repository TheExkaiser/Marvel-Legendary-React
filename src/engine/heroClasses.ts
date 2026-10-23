import type { UiAdapter } from './ui'

// "Klasy" kart bohaterów (kolory): wybierane w efektach typu "choose strength, instinct, covert, tech or ranged"
export const HERO_CLASSES = ['strength', 'instinct', 'covert', 'tech', 'ranged'] as const
export type HeroClass = (typeof HERO_CLASSES)[number]

export function heroClassLabel(heroClass: HeroClass): string {
  return heroClass.charAt(0).toUpperCase() + heroClass.slice(1)
}

/** Okno wyboru klasy z ikonami (public/icons/<klasa>.png). Zwraca null, gdy gracz nic nie wybrał. */
export async function chooseHeroClass(ui: UiAdapter, prompt: string): Promise<HeroClass | null> {
  const choice = await ui.chooseOption(
    HERO_CLASSES.map((c) => ({ id: c, label: heroClassLabel(c), icon: `icons/${c}.png` })),
    prompt,
  )
  return HERO_CLASSES.find((c) => c === choice) ?? null
}
