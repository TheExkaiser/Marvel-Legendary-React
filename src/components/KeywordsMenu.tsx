import { Fragment } from 'react'
import { KEYWORD_GLOSSARY } from '../data/keywordGlossary'
import type { KeywordBlock } from '../data/keywordGlossary'
import type { CardData } from '../engine/types'
import './KeywordsMenu.css'

// Zamienia znaczniki {ikona} i **pogrubienie** z tekstu słownika na elementy React
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\{[a-z-]+\}|\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('{') && part.endsWith('}')) {
          const icon = part.slice(1, -1)
          return (
            <img
              key={i}
              className="keyword-icon"
              src={`${import.meta.env.BASE_URL}icons/${icon}.png`}
              alt={icon}
            />
          )
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>
        }
        return <Fragment key={i}>{part}</Fragment>
      })}
    </>
  )
}

function Block({ block }: { block: KeywordBlock }) {
  if (block.type === 'quote') {
    return (
      <p className="keyword-quote">
        <RichText text={block.text} />
      </p>
    )
  }
  if (block.type === 'list') {
    return (
      <ul className="keyword-list">
        {block.items.map((item, i) => (
          <li key={i}>
            <RichText text={item} />
          </li>
        ))}
      </ul>
    )
  }
  return (
    <p>
      <RichText text={block.text} />
    </p>
  )
}

export function KeywordsMenu({ cards, onClose }: { cards: CardData[]; onClose: () => void }) {
  // Tylko słowa kluczowe, które występują na jakiejkolwiek karcie w tej grze
  const entries = KEYWORD_GLOSSARY.filter((entry) => cards.some(entry.appearsOn))

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content keywords-content" onClick={(e) => e.stopPropagation()}>
        <h2>Keywords</h2>
        <button className="close-button" onClick={onClose}>✕</button>

        {entries.length === 0 && <p>No keywords in this game.</p>}

        {entries.map((entry) => (
          <section key={entry.id} className="keyword-entry">
            <h3>{entry.name}</h3>
            {entry.blocks.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}
