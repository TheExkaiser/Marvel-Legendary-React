import { useState } from 'react'
import type { CardData } from '../engine/types'

/** Token leżący na karcie scheme'u: obrazek, jeśli karta go ma (i się wczytał), w przeciwnym razie napis. */
export function SchemeToken({ data }: { data: CardData }) {
  const [failed, setFailed] = useState(false)
  const title = data.text ? `${data.name}: ${data.text}` : data.name
  return (
    <span className="scheme-token" title={title}>
      {data.img && !failed ? (
        <img src={data.img} alt={data.name} onError={() => setFailed(true)} />
      ) : (
        data.name
      )}
    </span>
  )
}
