import { Fragment, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { KEYWORD_GLOSSARY } from '../data/keywordGlossary'
import type { KeywordEntry } from '../data/keywordGlossary'
import './KeywordText.css'

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Każde słowo kluczowe może mieć odmiany (aliases), np. "Shard" + "Shards"
const TERMS = KEYWORD_GLOSSARY.flatMap((entry) =>
  [entry.name, ...(entry.aliases ?? [])].map((term) => ({ term, entry })),
)

// Najdłuższe nazwy pierwsze, żeby np. "Cosmic Threat" nie rozbiło się na krótszy wpis
const KEYWORD_PATTERN = new RegExp(
  `\\b(${[...TERMS]
    .sort((a, b) => b.term.length - a.term.length)
    .map(({ term }) => escapeRegex(term))
    .join('|')})\\b`,
)

const TOOLTIP_WIDTH = 300

// Pogrubione słowo kluczowe. Najechanie (albo kliknięcie/tap na telefonie) pokazuje okienko z opisem.
function KeywordTerm({ entry }: { entry: KeywordEntry }) {
  const ref = useRef<HTMLElement>(null)
  const [rect, setRect] = useState<DOMRect | null>(null)

  const show = () => {
    if (ref.current) setRect(ref.current.getBoundingClientRect())
  }
  const hide = () => setRect(null)

  const above = rect !== null && rect.bottom > window.innerHeight * 0.6
  const left = rect ? Math.max(8, Math.min(rect.left, window.innerWidth - TOOLTIP_WIDTH - 8)) : 0

  return (
    <>
      <strong
        ref={ref}
        className="keyword-term"
        tabIndex={0}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onClick={(e) => {
          e.stopPropagation()
          if (rect) hide()
          else show()
        }}
      >
        {entry.name}
      </strong>
      {rect &&
        createPortal(
          <div
            className="keyword-tooltip"
            style={{
              left,
              top: above ? rect.top - 6 : rect.bottom + 6,
              width: TOOLTIP_WIDTH,
              transform: above ? 'translateY(-100%)' : undefined,
            }}
          >
            <strong>{entry.name}</strong>
            <p>{entry.tooltip}</p>
          </div>,
          document.body,
        )}
    </>
  )
}

/** Tekst karty ze słowami kluczowymi (ze słownika) pogrubionymi i z okienkiem opisu po najechaniu. */
export function KeywordText({ text }: { text: string }) {
  const parts = text.split(KEYWORD_PATTERN)
  return (
    <>
      {parts.map((part, i) => {
        // split z grupą przechwytującą daje na nieparzystych miejscach dopasowane słowa kluczowe
        const entry = i % 2 === 1 ? TERMS.find((t) => t.term === part)?.entry : undefined
        return entry ? <KeywordTerm key={i} entry={entry} /> : <Fragment key={i}>{part}</Fragment>
      })}
    </>
  )
}
