import type { CardInstance } from './types'

export interface ChoiceOptions {
  prompt: string     // pytanie do pokazania graczowi
  optional: boolean  // czy dostępna opcja "Nic nie rób"
}

export interface UiAdapter {
  choose(options: CardInstance[], choiceOpts: ChoiceOptions): Promise<CardInstance | null>
}