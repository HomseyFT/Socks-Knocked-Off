import { useState } from 'react'
import Sock from '../components/Sock'
import { useCopy } from '../lib/copy'
import { STATUSES } from '../lib/tasks'
import './Clothesline.css'

function HangingSock({ task, selected, onSelect }) {
  return (
    <li className={`hanging ${task.status === 'off' ? 'hanging--off' : ''}`}>
      <button
        className="hanging__button"
        draggable
        onDragStart={(e) => e.dataTransfer.setData('text/plain', task.id)}
        onClick={() => onSelect(selected ? null : task.id)}
        aria-pressed={selected}
        aria-label={task.title}
      >
        <span className="hanging__pin" aria-hidden="true" />
        <Sock seed={task.id} height={110} className="hanging__sock" />
        <span className="hanging__tag">{task.title}</span>
      </button>
    </li>
  )
}

function SockActions({ task, dispatch, onKnockOff, onClose }) {
  const t = useCopy()
  const index = STATUSES.indexOf(task.status)
  const move = (status) => (status === 'off' ? onKnockOff(task.id) : dispatch({ type: 'move', id: task.id, status }))

  return (
    <div className="sock-actions" role="group" aria-label={`Actions for ${task.title}`}>
      <strong className="sock-actions__title">{task.title}</strong>
      {index > 0 && (
        <button className="btn btn--small btn--ghost" onClick={() => move(STATUSES[index - 1])}>
          ← {t.columns[STATUSES[index - 1]]}
        </button>
      )}
      {index < STATUSES.length - 1 && (
        <button className="btn btn--small btn--green" onClick={() => move(STATUSES[index + 1])}>
          {t.columns[STATUSES[index + 1]]} →
        </button>
      )}
      <button
        className="btn btn--small btn--ghost"
        onClick={() => {
          dispatch({ type: 'toDryer', id: task.id })
          onClose()
        }}
      >
        🌀 Toss in {t.apps.dryer}
      </button>
    </div>
  )
}

export default function Clothesline({ tasks, dispatch, celebrate }) {
  const t = useCopy()
  const [draft, setDraft] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [dropTarget, setDropTarget] = useState(null)
  const selected = tasks.find((task) => task.id === selectedId && task.status !== 'dryer')

  const knockOff = (id) => {
    dispatch({ type: 'move', id, status: 'off' })
    celebrate()
  }

  const drop = (status, e) => {
    e.preventDefault()
    setDropTarget(null)
    const id = e.dataTransfer.getData('text/plain')
    const task = tasks.find((x) => x.id === id)
    if (!task || task.status === status) return
    if (status === 'off') knockOff(id)
    else dispatch({ type: 'move', id, status })
  }

  const addTask = (e) => {
    e.preventDefault()
    const title = draft.trim()
    if (!title) return
    dispatch({ type: 'add', title })
    setDraft('')
  }

  return (
    <section>
      <div className="app-head">
        <div>
          <h2>{t.apps.clothesline}</h2>
          <p>Every task is a sock. Drag it along the line (or tap it) until it gets knocked off.</p>
        </div>
        <form className="hang-form" onSubmit={addTask}>
          <label className="visually-hidden" htmlFor="new-task">New task</label>
          <input
            id="new-task"
            className="field"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Hang a new sock…"
            maxLength={80}
          />
          <button className="btn btn--pink" type="submit">📌 Hang it</button>
        </form>
      </div>

      {selected && (
        <SockActions task={selected} dispatch={dispatch} onKnockOff={knockOff} onClose={() => setSelectedId(null)} />
      )}

      {STATUSES.map((status) => {
        const onLine = tasks.filter((task) => task.status === status)
        return (
          <div
            key={status}
            className={`line line--${status} ${dropTarget === status ? 'line--target' : ''}`}
            onDragOver={(e) => {
              e.preventDefault()
              setDropTarget(status)
            }}
            onDragLeave={() => setDropTarget(null)}
            onDrop={(e) => drop(status, e)}
          >
            <h3 className="line__label">
              {t.columns[status]} <span className="line__count">{onLine.length}</span>
            </h3>
            {onLine.length === 0 ? (
              <p className="line__empty">Nothing hanging here. Drop a sock on this line.</p>
            ) : (
              <ul className="line__socks">
                {onLine.map((task) => (
                  <HangingSock key={task.id} task={task} selected={task.id === selectedId} onSelect={setSelectedId} />
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </section>
  )
}
