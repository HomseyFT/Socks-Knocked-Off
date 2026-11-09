import { useState } from 'react'
import Sock from '../components/Sock'
import { useCopy } from '../lib/copy'
import './Dryer.css'

export default function Dryer({ tasks, dispatch }) {
  const t = useCopy()
  const [confirming, setConfirming] = useState(false)
  const inDryer = tasks.filter((x) => x.status === 'dryer')

  return (
    <section>
      <div className="app-head">
        <div>
          <h2>{t.apps.dryer}</h2>
          <p>Where tossed socks tumble. Pull one out to restore it, or clean the lint trap to let them go for good.</p>
        </div>
      </div>

      <div className="dryer-app">
        <div className="machine" aria-hidden="true">
          <div className="machine__panel">
            <span className="machine__knob" />
            <span className="machine__light" />
            <span className="machine__label">TUMBLE · LOW · COZY</span>
          </div>
          <div className="machine__door">
            <div className={`machine__drum ${inDryer.length ? 'is-spinning' : ''}`}>
              {inDryer.slice(0, 8).map((task, i) => (
                <span key={task.id} className="machine__sock" style={{ '--angle': `${(360 / Math.min(inDryer.length, 8)) * i}deg` }}>
                  <Sock seed={task.id} height={58} />
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="dryer-app__list">
          {inDryer.length === 0 ? (
            <p className="dryer-app__empty">The dryer is empty. Suspicious. Where did they all go?</p>
          ) : (
            <>
              <ul className="lost">
                {inDryer.map((task) => (
                  <li key={task.id} className="lost__item">
                    <Sock seed={task.id} height={44} />
                    <span className="lost__title">{task.title}</span>
                    <button className="btn btn--small btn--green" onClick={() => dispatch({ type: 'restore', id: task.id })}>
                      Pull it out
                    </button>
                  </li>
                ))}
              </ul>
              {confirming ? (
                <div className="lint-confirm" role="alert">
                  <span>Permanently delete {inDryer.length} {inDryer.length === 1 ? 'sock' : 'socks'}?</span>
                  <button
                    className="btn btn--small btn--pink"
                    onClick={() => {
                      dispatch({ type: 'emptyDryer' })
                      setConfirming(false)
                    }}
                  >
                    Yes, clean the lint trap
                  </button>
                  <button className="btn btn--small btn--ghost" onClick={() => setConfirming(false)}>Keep them</button>
                </div>
              ) : (
                <button className="btn btn--ghost" onClick={() => setConfirming(true)}>🧹 Clean lint trap</button>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
