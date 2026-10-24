## Projekt
- To aplikacja React + TypeScript odwzorowująca grę Marvel Legendary.
- Zachowuj istniejącą architekturę silnika gry.
- Nie zmieniaj mechaniki gry bez wyraźnej prośby.
- Zasada Always leads Mastermindów domyślnie wyłączona (ale może być kiedyś włączana) - przy wyłączeniu traktuje LedVillainGroup jako tą z always leads
- Each other player = gracz
- Each player = gracz

## Sposób pracy
- Najpierw sprawdź istniejącą implementację i powiązane typy.
- Przed edycją opisz krótko, co zamierzasz zmienić.
- Wprowadzaj możliwie małe, lokalne zmiany.
- Nie nadpisuj plików bez sprawdzenia ich aktualnej zawartości.
- Zachowuj istniejący język komentarzy i nazewnictwo.
- Wszystkie nowe teksty w grze muszą być po angielsku, jeśli znajdziesz w kodzie jakiś tekst w innym języku, przetłumacz na angielski

## Testowanie
- Nie testuj. Jeśli kod jest logiczny z Twoje punkut, testy nie są potrzebne i tak ja ręcznie testuję wszystkie nowe feature'y
- Wyjątkiem jest edycja wyglądu, wtedy testuj i sprawdzaj jak projekt się wyświetla/renderuje

## UI
- Zachowuj obecny styl wizualny.
- Nie dodawaj bibliotek bez uzasadnienia.
- Sprawdzaj zachowanie responsywne i interakcje hover/focus.

## Git
- Nie wykonuj resetu, checkoutu ani usuwania plików bez wyraźnej zgody.
- Nie twórz commitów ani branchy, chyba że poproszę.

## Hierarchia
src/engine/: types.ts, setup.ts, setupRules.ts, buildSetup.ts, setupChoices.ts, villainPhase.ts, combat.ts, recruit.ts, keywords.ts, wounds.ts
src/data/sets/01_Core_Set/ i 02_Dark_City/: cards.ts, content.ts, abilities, schemes.ts, index.ts
UI: GameScreen.tsx, useGame.ts, components/ (SetupMenu.tsx, CardView.tsx, RescuePrompt.tsx)