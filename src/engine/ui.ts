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
  chooseOptionWithCard(
    card: CardInstance,
    options: TextOption[],
    prompt: string,
  ): Promise<string | null>
  showInfo(card: CardInstance, message: string): Promise<void>
  // Jak showInfo, ale podlega ustawieniu "Show reveal popups" — używane WYŁĄCZNIE
  // przy odkrywaniu kart z talii złoczyńców (Twist, Master Strike, villain wchodzi do miasta).
  revealCard(card: CardInstance, message: string): Promise<void>
  // Popup z dwiema kartami: capturer (po lewej) + bystander (po prawej). Też podlega temu ustawieniu.
  showCapture(capturer: CardInstance, bystander: CardInstance, message: string): Promise<void>
}