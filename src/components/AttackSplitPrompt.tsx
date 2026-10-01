import { useState } from 'react'

interface AttackSplitPromptProps {
  cost: number
  maxFromAttack: number
  maxFromRecruit: number
  onConfirm: (fromAttack: number, fromRecruit: number) => void
}

export function AttackSplitPrompt({ cost, maxFromAttack, maxFromRecruit, onConfirm }: AttackSplitPromptProps) {
  const minFromAttack = Math.max(0, cost - maxFromRecruit)
  const maxFromAttackClamped = Math.min(cost, maxFromAttack)
  const [fromAttack, setFromAttack] = useState(maxFromAttackClamped)
  const fromRecruit = cost - fromAttack

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>God of Thunder: pay {cost} Attack</h3>
        <div className="split-row">
          <span>Attack: {fromAttack}</span>
          <button onClick={() => setFromAttack((v) => Math.max(minFromAttack, v - 1))}>▼</button>
          <button onClick={() => setFromAttack((v) => Math.min(maxFromAttackClamped, v + 1))}>▲</button>
        </div>
        <div className="split-row">
          <span>Recruit: {fromRecruit}</span>
        </div>
        <button onClick={() => onConfirm(fromAttack, fromRecruit)}>Confirm</button>
      </div>
    </div>
  )
}