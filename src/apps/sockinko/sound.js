// Tiny Web Audio synth. Every call is a no-op when audio is unavailable.
let ctx = null

function audio() {
  if (ctx) return ctx
  const Ctx = window.AudioContext ?? window.webkitAudioContext
  if (!Ctx) return null
  ctx = new Ctx()
  return ctx
}

function tone(freq, { start = 0, length = 0.15, type = 'triangle', volume = 0.18, slideTo } = {}) {
  const ac = audio()
  if (!ac) return
  if (ac.state === 'suspended') ac.resume()
  const t = ac.currentTime + start
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + length)
  gain.gain.setValueAtTime(volume, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + length)
  osc.connect(gain).connect(ac.destination)
  osc.start(t)
  osc.stop(t + length)
}

const PENTATONIC = [0, 2, 4, 7, 9]

export const sounds = {
  peg(streak) {
    const n = Math.min(streak - 1, 24)
    const semis = PENTATONIC[n % 5] + 12 * Math.floor(n / 5)
    tone(392 * 2 ** (semis / 12), { length: 0.18 })
  },
  shoot: () => tone(180, { slideTo: 520, length: 0.18, type: 'square', volume: 0.08 }),
  bucket: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, { start: i * 0.07, length: 0.2 })),
  clone: () => tone(300, { slideTo: 1200, length: 0.3, type: 'sawtooth', volume: 0.08 }),
  finale: () => tone(110, { slideTo: 880, length: 1.4, type: 'sawtooth', volume: 0.1 }),
  won: () =>
    [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, { start: i * 0.12, length: 0.3, volume: 0.15 })),
  lost: () => [392, 370, 349, 262].forEach((f, i) => tone(f, { start: i * 0.35, length: i === 3 ? 0.9 : 0.32, type: 'sawtooth', volume: 0.09 })),
}
