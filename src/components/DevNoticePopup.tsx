import { useState } from "react";
import "./DevNoticePopup.css";

export default function DevNoticePopup() {
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <div className="dev-notice-overlay" onClick={() => setOpen(false)}>
      <div className="dev-notice-box">
        <h2>Work in progress</h2>
        <p>
          This game is currently under development. It has been tested and works
          correctly on PC at Full HD resolution. Other devices and resolutions
          may not work properly.
        </p>
        <p className="dev-notice-implemented">Implemented and mostly tested:</p>
        <div className="dev-notice-sets">
          <div className="dev-notice-set">
            <img src={`${import.meta.env.BASE_URL}icons/sets/core_set.png`} alt="" />
            <strong>Core Set</strong>
          </div>
          <div className="dev-notice-set">
            <img src={`${import.meta.env.BASE_URL}icons/sets/dark_city.png`} alt="" />
            <strong>Dark City</strong>
          </div>
          <div className="dev-notice-set">
            <img src={`${import.meta.env.BASE_URL}icons/sets/fantastic_four.png`} alt="" />
            <strong>Fantastic Four</strong>
          </div>
        </div>
        <p>Minor undiscovered bugs may still occur.</p>
        <p className="dev-notice-hint">Click anywhere to close</p>
      </div>
    </div>
  );
}
