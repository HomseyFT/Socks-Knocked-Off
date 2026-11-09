import { makeId } from './random'

export const STATUSES = ['hamper', 'line', 'off']
const DAY = 24 * 60 * 60 * 1000

export function seedTasks(now = Date.now()) {
  const task = (title, status, daysAgo) => ({
    id: makeId(),
    title,
    status,
    createdAt: now - (daysAgo + 1) * DAY,
    knockedOffAt: status === 'off' ? now - daysAgo * DAY : null,
  })
  return [
    task('Present Q4 hosiery forecast to the board', 'hamper', 0),
    task('Locate the left sock from the 2019 retreat', 'hamper', 0),
    task('Approve argyle budget increase', 'line', 0),
    task('Rehearse puppet keynote', 'line', 0),
    task('Onboard new intern (Tube Tom)', 'off', 0),
    task('Fold the quarterly report', 'off', 1),
    task('Darn hole in the supply chain', 'off', 1),
    task('Ship knee-high initiative', 'off', 2),
    task('Retire the beige sock line', 'off', 4),
    task('Wash team mascots', 'off', 4),
    task('Match all mismatched invoices', 'off', 4),
    task('Sock-hop team offsite', 'off', 6),
  ]
}

export function tasksReducer(tasks, action) {
  switch (action.type) {
    case 'add':
      return [...tasks, { id: makeId(), title: action.title, status: 'hamper', createdAt: Date.now(), knockedOffAt: null }]
    case 'move':
      return tasks.map((t) =>
        t.id === action.id
          ? { ...t, status: action.status, knockedOffAt: action.status === 'off' ? Date.now() : null }
          : t,
      )
    case 'toDryer':
      return tasks.map((t) => (t.id === action.id ? { ...t, status: 'dryer', prevStatus: t.status } : t))
    case 'restore':
      return tasks.map((t) => (t.id === action.id ? { ...t, status: t.prevStatus ?? 'hamper', prevStatus: undefined } : t))
    case 'emptyDryer':
      return tasks.filter((t) => t.status !== 'dryer')
    default:
      throw new Error(`Unknown task action: ${action.type}`)
  }
}
