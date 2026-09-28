import type { Settings } from '../useSettings'

interface SettingsMenuProps {
  settings: Settings
  onChange: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  onClose: () => void
}

export function SettingsMenu({ settings, onChange, onClose }: SettingsMenuProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Settings</h3>
        <button className="close-button" onClick={onClose}>✕</button>
        <label className="settings-row">
          <input
            type="checkbox"
            checked={settings.showRevealPopups}
            onChange={(e) => onChange('showRevealPopups', e.target.checked)}
          />
          Show reveal popups (Twist, Master Strike, villain enters city, bystander captured)
        </label>
      </div>
    </div>
  )
}