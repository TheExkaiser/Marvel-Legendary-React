import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { CardData } from '../engine/types'

interface CardViewProps {
  data: CardData
  onClick?: () => void
  flipId?: string
  flipFrom?: string // id talii (data-deck-id), z której nowa karta ma przyjechać
}

function ConditionLine({ data }: { data: CardData }) {
  if (!data.conditionIcons?.length || !data.conditionText) return null
  return (
    <div className="condition-line">
      {data.conditionIcons.map((icon, i) => (
        <img
          key={i}
          className="condition-icon"
          src={`${import.meta.env.BASE_URL}icons/${icon}.png`}
          alt={icon}
        />
      ))}
      <span>: {data.conditionText}</span>
    </div>
  )
}

export function CardView({ data, onClick, flipId, flipFrom }: CardViewProps) {
  const [zoomed, setZoomed] = useState(false)

  return (
    <>
      <div
        className={onClick ? 'card clickable' : 'card'}
        onClick={onClick}
        title={data.name}
        data-flip-id={flipId}
        data-flip-from={flipFrom}
      >
        <button
          className="zoom-button"
          onClick={(e) => {
            e.stopPropagation() // żeby kliknięcie lupki nie odpaliło też onClick karty
            setZoomed(true)
          }}
        >
          🔍
        </button>

        {data.img ? (
          <img src={data.img} alt={data.name} />
        ) : (
          <div className="card-text">
            <strong>{data.name}</strong>
            {data.cost !== undefined && <div>Koszt: {data.cost}</div>}
            {data.strength !== undefined && <div>Siła: {data.strength}</div>}
            <div>Attack: {data.attack ?? 0}</div>
            <div>Recruit: {data.recruit ?? 0}</div>
            <ConditionLine data={data} />
          </div>
        )}
      </div>

      {zoomed &&
        createPortal(
          <div className="modal-overlay" onClick={() => setZoomed(false)}>
            <div className="modal-content zoom-content" onClick={(e) => e.stopPropagation()}>
              <h3>{data.name}</h3>
              <button className="close-button" onClick={() => setZoomed(false)}>✕</button>
              <div className="zoom-body">
                {data.img && <img src={data.img} alt={data.name} className="zoom-image" />}
                <div className="zoom-details">
                  {data.hero !== undefined && (
                    <p><strong>Hero:</strong> {data.hero}</p>
                  )}
                  {(data.team ?? []).length > 0 && (
                    <p><strong>Team:</strong> {(data.team ?? []).join(', ')}</p>
                  )}
                  {(data.type ?? []).length > 0 && (
                    <p><strong>Type:</strong> {(data.type ?? []).join(', ')}</p>
                  )}
                  {data.strength !== undefined && <p><strong>Attacks:</strong> {data.strength}</p>}
                  {data.attack !== undefined && <p><strong>Attacks:</strong> {data.attack}</p>}
                  {data.cost !== undefined && <p><strong>Cost:</strong> {data.cost}</p>}
                  {data.vp !== undefined && <p><strong>VP:</strong> {data.vp}</p>}
                  {data.text && <p><strong>Text:</strong> {data.text}</p>}
                  <ConditionLine data={data} />
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}