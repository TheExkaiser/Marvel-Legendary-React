import { useRef, useState } from 'react'
import { startGame } from './engine/game'
import { TEST_SETUP } from './data/sets/setup'
import type { GameState, CardInstance } from './engine/types'
import type { UiAdapter, ChoiceOptions, TextOption } from './engine/ui'

interface CardPromptState extends ChoiceOptions {
  options: CardInstance[]
}

interface OptionPromptState {
  options: TextOption[]
  prompt: string
}

export function useGame() {
  const [state] = useState<GameState>(() => startGame(TEST_SETUP))
  const [, setVersion] = useState(0)
  const [cardPrompt, setCardPrompt] = useState<CardPromptState | null>(null)
  const [optionPrompt, setOptionPrompt] = useState<OptionPromptState | null>(null)
  const resolveCardRef = useRef<((choice: CardInstance | null) => void) | null>(null)
  const resolveOptionRef = useRef<((choice: string | null) => void) | null>(null)

  const ui: UiAdapter = {
    choose(options, choiceOpts) {
      return new Promise((resolve) => {
        resolveCardRef.current = resolve
        setCardPrompt({ options, ...choiceOpts })
      })
    },
    chooseOption(options, prompt) {
      return new Promise((resolve) => {
        resolveOptionRef.current = resolve
        setOptionPrompt({ options, prompt })
      })
    },
  }

  function answerCardPrompt(choice: CardInstance | null) {
    resolveCardRef.current?.(choice)
    resolveCardRef.current = null
    setCardPrompt(null)
  }

  function answerOptionPrompt(choice: string) {
    resolveOptionRef.current?.(choice)
    resolveOptionRef.current = null
    setOptionPrompt(null)
  }

  async function act(action: (state: GameState, ui: UiAdapter) => void | Promise<void>) {
    try {
      await action(state, ui)
    } catch (e) {
      alert((e as Error).message)
    }
    setVersion((v) => v + 1)
  }

  return { state, act, cardPrompt, answerCardPrompt, optionPrompt, answerOptionPrompt }
}