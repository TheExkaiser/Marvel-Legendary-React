import type { CardInstance } from './types'

export interface ChoiceOptions {
  prompt: string
  optional: boolean
}

export interface TextOption {
  id: string
  label: string
}

export interface UiAdapter {
  choose(options: CardInstance[], choiceOpts: ChoiceOptions): Promise<CardInstance | null>
  chooseOption(options: TextOption[], prompt: string): Promise<string | null>
  showInfo(card: CardInstance, message: string): Promise<void>
}

export interface UiAdapter {
  choose(options: CardInstance[], choiceOpts: ChoiceOptions): Promise<CardInstance | null>
  chooseOption(options: TextOption[], prompt: string): Promise<string | null>
  chooseOptionWithCard(
    card: CardInstance,
    options: TextOption[],
    prompt: string,
  ): Promise<string | null>
  showInfo(card: CardInstance, message: string): Promise<void>
}