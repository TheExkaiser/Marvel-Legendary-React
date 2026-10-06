# React + TypeScript + Vite

## Obrazki

### Ikonki (zestawy i grupy kart)

Pliki w `public/icons/`, nazwa pliku = `id` z danych:

- `public/icons/sets/<id zestawu>.png`
- `public/icons/heroes/<id bohatera>.png`
- `public/icons/villains/<id grupy złoczyńców>.png`
- `public/icons/henchmen/<id grupy poplecznika>.png`

Kwadratowe, najlepiej 128×128. Brak pliku = w menu pojawia się pierwsza litera nazwy.

### Obrazki kart i proxy

Duże obrazki kart są w `public/cards/`. Na planszy używamy ich małych wersji
z `public/cards-small/` (WebP), a duży obrazek ładuje się dopiero w oknie zoomu.

Po dodaniu nowych kart (np. nowy dodatek) uruchom:

    npm run proxies

Skrypt `scripts/make-proxies.mjs` wygeneruje brakujące miniatury (istniejące pomija).
Szerokość miniatury ustawia stała `WIDTH` w skrypcie.

## BUILD I DEPLOY
W terminau: "npm run deploy"
Po kilku minutach zmiany będą widoczne na stronie


This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
