// Wymusza pełny ekran w zainstalowanej PWA na urządzeniach dotykowych.
// requestFullscreen wymaga gestu użytkownika, więc odpalamy go przy pierwszym dotknięciu ekranu.
// Jeśli manifest już uruchamia aplikację w trybie fullscreen, nic nie robi.

function tryFullscreen() {
  if (!window.matchMedia('(pointer: coarse)').matches) return
  if (!window.matchMedia('(display-mode: standalone)').matches) return
  if (document.fullscreenElement) return
  const el = document.documentElement
  if (!el.requestFullscreen) return
  el.requestFullscreen({ navigationUI: 'hide' }).catch(() => {})
}

window.addEventListener('pointerup', tryFullscreen)
