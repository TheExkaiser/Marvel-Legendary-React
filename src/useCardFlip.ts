import { useLayoutEffect, useRef } from 'react'

// Animacja ruchu kart techniką FLIP (First, Last, Invert, Play):
// po każdym renderze porównujemy, gdzie karta o danym id była wcześniej na ekranie
// i gdzie jest teraz, a potem odpalamy krótkie przesunięcie ze starej pozycji do nowej.
// Karty biorące udział w animacji mają atrybut data-flip-id (patrz CardView, prop flipId).

const COARSE = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

const DURATION = COARSE ? 320 : 500 // ms — na dotyku krócej, bo mniej klatek do narysowania
const EASING = 'cubic-bezier(0.2, 0.8, 0.2, 1)'
const MIN_MOVE = 2 // px: mniejsze przesunięcia ignorujemy
const FLYING_Z_INDEX = '60' // nad ręką (50), pod oknami modalnymi (100)
const MAX_GHOSTS = COARSE ? 6 : 24 // ile kart naraz "odlatuje" na discard (reszta po prostu znika)

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

interface PlannedFlight {
  el: HTMLElement
  id: string
  after: Snapshot
  dx: number
  dy: number
}

interface PlannedGhost {
  before: Snapshot
  startX: number
  startY: number
}

export function useCardFlip(discardIds: ReadonlySet<string>): void {
  const previous = useRef<Frame>({ cards: new Map(), scrollX: 0, scrollY: 0 })
  // Karty, które aktualnie lecą. Własny rejestr zamiast el.getAnimations(), bo getAnimations()
  // wymusza przeliczenie stylów przy każdym wywołaniu (a wołaliśmy je dla każdej karty po kilka razy).
  const flying = useRef(new WeakSet<HTMLElement>())

  // Bez tablicy zależności: odpala się po każdym renderze, zanim przeglądarka narysuje klatkę
  useLayoutEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-flip-id]'))

    // 1. Zmierz, gdzie karty są TERAZ. Nie anulujemy aktywnych animacji:
    // render w trakcie lotu nie może skrócić animacji do pojedynczej klatki.
    const current = new Map<string, Snapshot>()
    for (const el of elements) {
      const id = el.dataset.flipId!
      const previousSnapshot = previous.current.cards.get(id)
      if (flying.current.has(el) && previousSnapshot) {
        // Nie zapisuj pozycji z połowy lotu jako nowego stanu bazowego.
        current.set(id, previousSnapshot)
        continue
      }
      const rect = el.getBoundingClientRect()
      current.set(id, {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        width: rect.width,
        height: rect.height,
        fixed: el.closest('.hand-dock') !== null,
        el,
      })
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!reduceMotion) {
      const scrolledX = window.scrollX - previous.current.scrollX
      const scrolledY = window.scrollY - previous.current.scrollY

      // 2. Same ODCZYTY: zaplanuj loty kart i duchów. Żadnych zapisów do DOM w tej fazie,
      // żeby przeglądarka nie przeliczała układu strony wielokrotnie.
      const flights: PlannedFlight[] = []
      for (const el of elements) {
        // Karta już leci — zostawiamy jej bieżącą animację do końca.
        if (flying.current.has(el)) continue

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

        flights.push({ el, id, after, dx, dy })
      }

      // Karty, które zniknęły z ekranu i wylądowały na discardzie: "duch" (kopia) poleci na stos
      const ghosts: PlannedGhost[] = []
      let targetX = 0
      let targetY = 0
      const pile = document.querySelector<HTMLElement>('[data-deck-id="discard"]')
      if (pile) {
        const target = pile.getBoundingClientRect()
        targetX = target.left + target.width / 2
        targetY = target.top + target.height / 2

        for (const [id, before] of previous.current.cards) {
          if (current.has(id) || !discardIds.has(id)) continue
          if (ghosts.length >= MAX_GHOSTS) break // nadmiarowe karty znikają bez animacji
          ghosts.push({
            before,
            startX: before.fixed ? before.x : before.x - scrolledX,
            startY: before.fixed ? before.y : before.y - scrolledY,
          })
        }
      }

      // 3. Same ZAPISY: odpal zaplanowane animacje
      for (const { el, id, after, dx, dy } of flights) {
        el.style.zIndex = FLYING_Z_INDEX
        flying.current.add(el)
        const animation = el.animate(
          [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }],
          { duration: DURATION, easing: EASING },
        )
        animation.id = 'flip'

        const cleanup = () => {
          flying.current.delete(el)
          el.style.zIndex = ''
          // Po zakończeniu lotu zapamiętaj cel, żeby kolejny render nie
          // uruchamiał tej samej animacji ponownie od starej pozycji.
          previous.current.cards.set(id, after)
        }
        animation.onfinish = cleanup
        animation.oncancel = cleanup
      }

      for (const { before, startX, startY } of ghosts) {
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
          // Kopia leci bez poświaty: duże rozmyte cienie na każdej leżącej w powietrzu karcie to najdroższa część animacji
          boxShadow: 'none',
          filter: 'none',
          transition: 'none',
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

    // 4. Zapamiętaj układ na następny render
    previous.current = {
      cards: current,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
    }
  })
}
