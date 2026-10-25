import { useRef, useState } from 'react'
import { createGameState, startGame } from './engine/game'
import { checkEndConditions } from './engine/villainPhase'
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

interface CardsPromptState {
  cards: CardInstance[]
  title: string
}

interface CapturePromptState {
  capturer: CardInstance
  bystander: CardInstance
  message: string
}

interface RescuePromptState {
  bystander: CardInstance
  message: string
}

interface AttackSplitPromptState {
  cost: number
  maxFromAttack: number
  maxFromRecruit: number
}

interface NumberPromptState {
  prompt: string
  min: number
  max: number
  initial: number
}

export function useGame(setup: GameSetup, settings: Settings) {
  const [state] = useState<GameState>(() => createGameState(setup))
  const [, setVersion] = useState(0)
  const startedRef = useRef(false)

  const [cardPrompt, setCardPrompt] = useState<CardPromptState | null>(null)
  const [optionPrompt, setOptionPrompt] = useState<OptionPromptState | null>(null)
  const [infoPrompt, setInfoPrompt] = useState<InfoPromptState | null>(null)
  const [cardsPrompt, setCardsPrompt] = useState<CardsPromptState | null>(null)
  const [capturePrompt, setCapturePrompt] = useState<CapturePromptState | null>(null)
  const [rescuePrompt, setRescuePrompt] = useState<RescuePromptState | null>(null)
  const [attackSplitPrompt, setAttackSplitPrompt] = useState<AttackSplitPromptState | null>(null)
  const [numberPrompt, setNumberPrompt] = useState<NumberPromptState | null>(null)

  // Komunikat o błędzie jako napis w grze (zamiast alert): znika sam po chwili
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null)
  const toastIdRef = useRef(0)
  const toastTimerRef = useRef<number | null>(null)

  function showToast(message: string) {
    toastIdRef.current += 1
    setToast({ id: toastIdRef.current, message }) // nowe id = animacja startuje od nowa
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current)
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null)
      toastTimerRef.current = null
    }, 2200) // tyle samo, co animacja .game-toast w App.css
  }

  const resolveCardRef = useRef<((choice: CardInstance | null) => void) | null>(null)
  const resolveOptionRef = useRef<((choice: string | null) => void) | null>(null)
  const resolveInfoRef = useRef<(() => void) | null>(null)
  const resolveCardsRef = useRef<(() => void) | null>(null)
  const resolveCaptureRef = useRef<(() => void) | null>(null)
  const resolveRescueRef = useRef<(() => void) | null>(null)
  const resolveAttackSplitRef = useRef<((split: AttackSplit) => void) | null>(null)
  const resolveNumberRef = useRef<((value: number) => void) | null>(null)
  const lastNumberRef = useRef(3) // ostatnio wybrana liczba, podpowiadana w kolejnym oknie

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
    showCards(cards, title) {
      if (cards.length === 0 || !settings.showRevealPopups) return Promise.resolve()
      return new Promise((resolve) => {
        resolveCardsRef.current = resolve
        setCardsPrompt({ cards, title })
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
    showRescue(bystander, message) {
      if (!settings.showRevealPopups) return Promise.resolve()
      return new Promise((resolve) => {
        resolveRescueRef.current = resolve
        setRescuePrompt({ bystander, message })
      })
    },
    chooseAttackSplit(cost, maxFromAttack, maxFromRecruit) {
      return new Promise((resolve) => {
        resolveAttackSplitRef.current = resolve
        setAttackSplitPrompt({ cost, maxFromAttack, maxFromRecruit })
      })
    },
    chooseNumber(prompt, opts) {
      return new Promise((resolve) => {
        resolveNumberRef.current = resolve
        setNumberPrompt({
          prompt,
          min: opts?.min ?? 0,
          max: opts?.max ?? 20,
          initial: opts?.initial ?? lastNumberRef.current,
        })
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

  function closeCardsPrompt() {
    resolveCardsRef.current?.()
    resolveCardsRef.current = null
    setCardsPrompt(null)
  }

  function closeCapturePrompt() {
    resolveCaptureRef.current?.()
    resolveCaptureRef.current = null
    setCapturePrompt(null)
  }

  function closeRescuePrompt() {
    resolveRescueRef.current?.()
    resolveRescueRef.current = null
    setRescuePrompt(null)
  }

  function answerAttackSplitPrompt(fromAttack: number, fromRecruit: number) {
    resolveAttackSplitRef.current?.({ fromAttack, fromRecruit })
    resolveAttackSplitRef.current = null
    setAttackSplitPrompt(null)
  }

  function answerNumberPrompt(value: number) {
    lastNumberRef.current = value
    resolveNumberRef.current?.(value)
    resolveNumberRef.current = null
    setNumberPrompt(null)
  }

  async function act(action: (state: GameState, ui: UiAdapter) => void | Promise<void>) {
    try {
      await action(state, ui)
      checkEndConditions(state)
    } catch (e) {
      showToast((e as Error).message)
    }
    setVersion((v) => v + 1)
  }

  // Jak act(), ale oznacza grę jako "debug used" — taka rozgrywka nie trafia do historii gier.
function debugAct(action: (state: GameState, ui: UiAdapter) => void | Promise<void>) {
  state.debugUsed = true
  return act(action)
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
    cardsPrompt,
    closeCardsPrompt,
    capturePrompt,
    closeCapturePrompt,
    rescuePrompt,
    closeRescuePrompt,
    attackSplitPrompt,
    answerAttackSplitPrompt,
    debugAct,
    numberPrompt,
    answerNumberPrompt,
    toast,
  }
}
