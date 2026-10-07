import type { CardInstance } from './types'

export interface ChoiceOptions {
  prompt: string
  optional: boolean
}

export interface TextOption {
  id: string
  label: string
  icon?: string // ścieżka względem public/, np. 'icons/attack.png'
}

export interface AttackSplit {
  fromAttack: number
  fromRecruit: number
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
  revealCard(card: CardInstance, message: string): Promise<void>
  showCapture(capturer: CardInstance, bystander: CardInstance, message: string): Promise<void>
  // God of Thunder: gracz ustawia proporcję, w jakiej płaci koszt ataku z Attack vs Recruit.
  chooseAttackSplit(cost: number, maxFromAttack: number, maxFromRecruit: number): Promise<AttackSplit>
  chooseNumber(
    prompt: string,
    options?: { min?: number; max?: number; initial?: number },
  ): Promise<number>
}