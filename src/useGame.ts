import { useRef, useState } from 'react'
import { createGameState, startGame } from './engine/game'
import type { GameSetup, GameState, CardInstance } from './engine/types'
import type { UiAdapter, ChoiceOptions, TextOption } from './engine/ui'

interface CardPromptState extends ChoiceOptions {
  options: CardInstance[]
}

interface OptionPromptState {
  options: TextOption[]
  prompt: string
  card?: CardInstance
}

interface InfoPromptState {
  card: CardInstance
  message: string
}

export function useGame(setup: GameSetup) {
  const [state] = useState<GameState>(() => createGameState(setup))
  const [, setVersion] = useState(0)
  const startedRef = useRef(false)

  const [cardPrompt, setCardPrompt] = useState<CardPromptState | null>(null)
  const [optionPrompt, setOptionPrompt] = useState<OptionPromptState | null>(null)
  const [infoPrompt, setInfoPrompt] = useState<InfoPromptState | null>(null)

  const resolveCardRef = useRef<((choice: CardInstance | null) => void) | null>(null)
  const resolveOptionRef = useRef<((choice: string | null) => void) | null>(null)
  const resolveInfoRef = useRef<(() => void) | null>(null)

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
    chooseOptionWithCard(card, options, prompt) {
      return new Promise((resolve) => {
        resolveOptionRef.current = resolve
        setOptionPrompt({ options, prompt, card })
      })
    },
    showInfo(card, message) {
      return new Promise((resolve) => {
        resolveInfoRef.current = resolve
        setInfoPrompt({ card, message })
      })
    },
  }

  // Woła się dopiero, gdy gracz zamknie popup ze schematem na starcie (patrz GameScreen).
  // Dzięki temu villainPhase() (pierwsza karta villaina) nie odpala się, dopóki
  // gracz nie zobaczył i nie zamknął opisu schematu.
  function beginGame() {
    if (startedRef.current) return // ochrona przed podwójnym wywołaniem
    startedRef.current = true

    startGame(state, ui).then(() => {
      setVersion((v) => v + 1)
    })
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

  function closeInfoPrompt() {
    resolveInfoRef.current?.()
    resolveInfoRef.current = null
    setInfoPrompt(null)
  }

  async function act(action: (state: GameState, ui: UiAdapter) => void | Promise<void>) {
    try {
      await action(state, ui)
    } catch (e) {
      alert((e as Error).message)
    }
    setVersion((v) => v + 1)
  }

  return {
    state,
    act,
    beginGame,
    cardPrompt,
    answerCardPrompt,
    optionPrompt,
    answerOptionPrompt,
    infoPrompt,
    closeInfoPrompt,
  }
}