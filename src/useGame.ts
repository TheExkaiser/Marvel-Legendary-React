import { useRef, useState } from 'react'
import { createGameState, startGame } from './engine/game'
import type { GameSetup, GameState, CardInstance } from './engine/types'
import type { UiAdapter, ChoiceOptions, TextOption, AttackSplit } from './engine/ui'
import type { Settings } from './useSettings'

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

interface CapturePromptState {
  capturer: CardInstance
  bystander: CardInstance
  message: string
}

interface AttackSplitPromptState {
  cost: number
  maxFromAttack: number
  maxFromRecruit: number
}

export function useGame(setup: GameSetup, settings: Settings) {
  const [state] = useState<GameState>(() => createGameState(setup))
  const [, setVersion] = useState(0)
  const startedRef = useRef(false)

  const [cardPrompt, setCardPrompt] = useState<CardPromptState | null>(null)
  const [optionPrompt, setOptionPrompt] = useState<OptionPromptState | null>(null)
  const [infoPrompt, setInfoPrompt] = useState<InfoPromptState | null>(null)
  const [capturePrompt, setCapturePrompt] = useState<CapturePromptState | null>(null)
  const [attackSplitPrompt, setAttackSplitPrompt] = useState<AttackSplitPromptState | null>(null)

  const resolveCardRef = useRef<((choice: CardInstance | null) => void) | null>(null)
  const resolveOptionRef = useRef<((choice: string | null) => void) | null>(null)
  const resolveInfoRef = useRef<(() => void) | null>(null)
  const resolveCaptureRef = useRef<(() => void) | null>(null)
  const resolveAttackSplitRef = useRef<((split: AttackSplit) => void) | null>(null)

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
    revealCard(card, message) {
      if (!settings.showRevealPopups) return Promise.resolve()
      return new Promise((resolve) => {
        resolveInfoRef.current = resolve
        setInfoPrompt({ card, message })
      })
    },
    showCapture(capturer, bystander, message) {
      if (!settings.showRevealPopups) return Promise.resolve()
      return new Promise((resolve) => {
        resolveCaptureRef.current = resolve
        setCapturePrompt({ capturer, bystander, message })
      })
    },
    chooseAttackSplit(cost, maxFromAttack, maxFromRecruit) {
      return new Promise((resolve) => {
        resolveAttackSplitRef.current = resolve
        setAttackSplitPrompt({ cost, maxFromAttack, maxFromRecruit })
      })
    },
  }

  // Uruchamia grę RAZ, po pierwszym wyrenderowaniu (dopiero wtedy `ui` może pokazywać popupy)
  function beginGame() {
    if (startedRef.current) return
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

  function closeCapturePrompt() {
    resolveCaptureRef.current?.()
    resolveCaptureRef.current = null
    setCapturePrompt(null)
  }

  function answerAttackSplitPrompt(fromAttack: number, fromRecruit: number) {
    resolveAttackSplitRef.current?.({ fromAttack, fromRecruit })
    resolveAttackSplitRef.current = null
    setAttackSplitPrompt(null)
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
    capturePrompt,
    closeCapturePrompt,
    attackSplitPrompt,
    answerAttackSplitPrompt,
  }
}