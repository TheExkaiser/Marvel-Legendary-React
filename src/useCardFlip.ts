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
  width: number
  height: number
  fixed: boolean // karta w ręce jest przyklejona do ekranu, reszta przewija się ze stroną
  el: HTMLElement // z niego robimy kopię, gdy karta zniknie z DOM
}

interface Frame {
  cards: Map<string, Snapshot>
  scrollX: number
  scrollY: number
}

export function useCardFlip(discardIds: ReadonlySet<string>): void {
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
        width: rect.width,
        height: rect.height,
        fixed: el.closest('.hand-dock') !== null,
        el,
      })
    } // <-- tej klamry brakowało

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
          before = {
            ...after,
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            fixed: true,
          }
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

      // 3b. Karty, które zniknęły z ekranu i wylądowały na discardzie:
      // "duch" (kopia) leci ze starej pozycji na stos i sam znika
      const pile = document.querySelector<HTMLElement>('[data-deck-id="discard"]')
      if (pile) {
        const target = pile.getBoundingClientRect()
        const targetX = target.left + target.width / 2
        const targetY = target.top + target.height / 2

        for (const [id, before] of previous.current.cards) {
          if (current.has(id) || !discardIds.has(id)) continue

          const startX = before.fixed ? before.x : before.x - scrolledX
          const startY = before.fixed ? before.y : before.y - scrolledY

          const ghost = before.el.cloneNode(true) as HTMLElement
          ghost.removeAttribute('data-flip-id') // żeby hook nie brał kopii za prawdziwą kartę
          ghost.removeAttribute('data-flip-from')
          Object.assign(ghost.style, {
            position: 'fixed',
            left: `${startX - before.width / 2}px`,
            top: `${startY - before.height / 2}px`,
            width: `${before.width}px`,
            height: `${before.height}px`,
            margin: '0',
            zIndex: FLYING_Z_INDEX,
            pointerEvents: 'none',
          })
          document.body.appendChild(ghost)

          const flight = ghost.animate(
            [
              { transform: 'translate(0, 0)' },
              { transform: `translate(${targetX - startX}px, ${targetY - startY}px) scale(0.9)` },
            ],
            { duration: DURATION, easing: EASING, fill: 'forwards' },
          )
          flight.onfinish = () => ghost.remove()
          flight.oncancel = () => ghost.remove()
        }
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