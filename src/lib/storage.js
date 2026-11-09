import { useEffect, useReducer, useState } from 'react'

// Storage can be missing or throw (private windows, blocked site data), so every
// access degrades to in-memory state instead of crashing.
function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* in-memory only */
  }
}

export function usePersistentState(key, initial) {
  const [value, setValue] = useState(() => read(key, initial))
  useEffect(() => write(key, value), [key, value])
  return [value, setValue]
}

export function usePersistentReducer(key, reducer, makeInitial) {
  const [state, dispatch] = useReducer(reducer, undefined, () => read(key, null) ?? makeInitial())
  useEffect(() => write(key, state), [key, state])
  return [state, dispatch]
}
