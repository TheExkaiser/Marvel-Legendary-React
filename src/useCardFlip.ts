import { useLayoutEffect, useRef } from 'react'

// Animacja ruchu kart techniką FLIP (First, Last, Invert, Play):
// po każdym renderze porównujemy, gdzie karta o danym id była wcześniej na ekranie
// i gdzie jest teraz, a potem odpalamy krótkie przesunięcie ze starej pozycji do nowej.
// Karty biorące udział w animacji mają atrybut data-flip-id (patrz CardView, prop flipId).

const DURATION = 320 // ms
const EASING = 'cubic-bezier(0.2, 0.8, 0.2, 1)'
const MIN_MOVE = 2 // px: mniejsze przesunięcia ignorujemy
const FLYING_Z_INDEX = '60' // nad ręką (50), pod oknami modalnymi (100)

interface Snapshot {
  x: number // środek karty, współrzędne okna przeglądarki
  y: number
  fixed: boolean // karta w ręce jest przyklejona do ekranu, reszta przewija się ze stroną
}

interface Frame {
  cards: Map<string, Snapshot>
  scrollX: number
  scrollY: number
}

export function useCardFlip(): void {
  const previous = useRef<Frame>({ cards: new Map(), scrollX: 0, scrollY: 0 })

  // Bez tablicy zależności: odpala się po każdym renderze, zanim przeglądarka narysuje klatkę
  useLayoutEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-flip-id]'))

    // 1. Zdejmij trwające animacje, żeby mierzyć prawdziwe (naturalne) pozycje
    for (const el of elements) {
      el.getAnimations()
        .filter((a) => a.id === 'flip')
        .forEach((a) => a.cancel())
    }

    // 2. Zmierz, gdzie karty są TERAZ
    const current = new Map<string, Snapshot>()
    for (const el of elements) {
      const rect = el.getBoundingClientRect()
      current.set(el.dataset.flipId!, {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        fixed: el.closest('.hand-dock') !== null,
      })
    }

    // 3. Dla kart, które się przesunęły, odpal animację od starej pozycji do nowej
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!reduceMotion) {
      const scrolledX = window.scrollX - previous.current.scrollX
      const scrolledY = window.scrollY - previous.current.scrollY

      for (const el of elements) {
        const id = el.dataset.flipId!
        const after = current.get(id)!
        let before = previous.current.cards.get(id)

        if (!before) {
          // Nowa karta: jeśli wie, skąd przyjeżdża, startuje ze środka tej talii
          const from = el.dataset.flipFrom
          const source = from
            ? document.querySelector<HTMLElement>(`[data-deck-id="${from}"]`)
            : null
          if (!source) continue
          const rect = source.getBoundingClientRect()
          // Talia zmierzona teraz, więc nie trzeba korygować o przewijanie
          before = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, fixed: true }
        }

        // Karty zwykłe przesunęły się razem z przewijaniem strony, przyklejone nie
        const beforeX = before.fixed ? before.x : before.x - scrolledX
        const beforeY = before.fixed ? before.y : before.y - scrolledY

        const dx = beforeX - after.x
        const dy = beforeY - after.y
        if (Math.abs(dx) < MIN_MOVE && Math.abs(dy) < MIN_MOVE) continue

        el.style.zIndex = FLYING_Z_INDEX
        const animation = el.animate(
          [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }],
          { duration: DURATION, easing: EASING },
        )
        animation.id = 'flip'

        const cleanup = () => {
          // Nie zdejmuj z-index, jeśli w międzyczasie ruszyła już nowa animacja tej karty
          const stillFlying = el.getAnimations().some((a) => a.id === 'flip')
          if (!stillFlying) el.style.zIndex = ''
        }
        animation.onfinish = cleanup
        animation.oncancel = cleanup
      }
    }

    // 4. Zapamiętaj układ na następny render
    previous.current = {
      cards: current,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
    }
  })
}
