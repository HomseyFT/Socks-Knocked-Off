import { useEffect, useState } from 'react'
import Sock from '../components/Sock'
import { useCopy } from '../lib/copy'
import { seededRandom } from '../lib/random'
import './Sockstrology.css'

const SIGNS = [
  { key: 'lone', name: 'The Lone Sock', trait: 'Independent. Its partner is "on a journey."', look: { base: '#b388ff', accent: '#ffffff', pattern: 'dots' } },
  { key: 'tube', name: 'The Tube', trait: 'No heel. No rules. No regrets.', look: { base: '#ffffff', accent: '#ff6b6b', pattern: 'stripes' } },
  { key: 'argyle', name: 'Argyle Ascendant', trait: 'Thinks in diamonds. Owns a monocle.', look: { base: '#7ee081', accent: '#b388ff', pattern: 'argyle' } },
  { key: 'toe', name: 'The Toe Sock', trait: 'Five-pronged. Deeply unsettling. Loyal.', look: { base: '#ffd23f', accent: '#ff5fa2', pattern: 'zigzag' } },
  { key: 'compression', name: 'Compression Sock', trait: 'Holds it all together. Literally.', look: { base: '#3ddbd9', accent: '#2b1d4e', pattern: 'stripes' } },
  { key: 'knee', name: 'Knee-High Prophet', trait: 'Sees far. Climbs higher than allowed.', look: { base: '#ff8c42', accent: '#ffd23f', pattern: 'stars' } },
  { key: 'sabra', name: 'The Sabra Sock', trait: 'Prickly outside, sweet inside. Brings hummus.', look: { base: '#ffffff', accent: '#0038b8', pattern: 'magen' } },
  { key: 'taco', name: 'Novelty Taco Sock', trait: 'A gift from an aunt. Wildly confident.', look: { base: '#ffd23f', accent: '#a3e635', pattern: 'hearts' } },
  { key: 'holey', name: 'The Hole-y One', trait: 'Has a hole. Calls it ventilation.', look: { base: '#f9a8d4', accent: '#ff5fa2', pattern: 'dots' } },
  { key: 'wet', name: 'The Wet Sock', trait: 'Cursed. Stepped in something. Unbothered.', look: { base: '#5ad1ff', accent: '#2b1d4e', pattern: 'zigzag' } },
  { key: 'stocking', name: 'The Stocking', trait: 'Seasonal. Huge. Full of oranges for some reason.', look: { base: '#ff6b6b', accent: '#ffffff', pattern: 'stars' } },
  { key: 'gremlin', name: 'Gremlin Rising', trait: 'Steals socks. Feels nothing. Very cute.', look: { base: '#a3e635', accent: '#2b1d4e', pattern: 'hearts' } },
]

const OPENINGS = [
  'The washing machine has spoken.',
  'Mercury is in the dryer.',
  'The lint has aligned.',
  'A distant sock drawer trembles.',
  'Your left foot has been talking about you.',
  'The moon is wearing socks tonight.',
  'An ancient hosiery scroll has been unrolled. It was a sock.',
]

const PREDICTIONS = [
  'Today you will find a sock you lost in 2014. Do not trust it.',
  'A coworker will compliment your ankles. Accept graciously.',
  'Avoid sandals. They know what you did.',
  'You will be offered a raise, paid entirely in single socks.',
  'A pigeon will make eye contact. This is a business opportunity.',
  'Your toes are planning a union. Negotiate early.',
  'Something warm and cozy approaches. It is a sock. It is always a sock.',
  'Do not put socks in the microwave, no matter what the voices say.',
  'A large plate of hummus is in your future. Embrace it fully.',
  'You will float effortlessly through a problem, like a sock in the Dead Sea.',
  'A stranger will ask to borrow a sock. Say no. It is a test.',
  'Your laundry will finish at the perfect moment. Savor this. It will not happen again.',
  'Wear mismatched socks today. The universe finds it charming.',
  'Someone is about to say "sock it to me." Be ready.',
  'A Victorian child will appear and nod approvingly. Nod back.',
  'Beware of carpets with static. They hunger.',
  'Your sock drawer will reorganize itself overnight. Do not investigate.',
  'Shalom is the password. You will know when to use it.',
]

const LUCKY_ITEMS = [
  'a damp crouton', 'the left shoelace', 'a commemorative spoon', 'one warm falafel',
  'an empty dryer sheet box', 'a rubber duck with a secret', 'a single googly eye',
  'a slightly haunted button', 'a jar of tahini', 'grandma\'s sock thermometer',
]

const LUCKY_NUMBERS = ['7', '42', '3½', 'a billion and two', 'π (rounded to "sock")', 'negative four', '18 (chai!)', '11:11', 'the number of socks you own, minus one']

const today = () => new Date().toISOString().slice(0, 10)

function reading(sign, nonce) {
  const rand = seededRandom(`${today()}|${sign.key}|${nonce}`)
  const pick = (list) => list[Math.floor(rand() * list.length)]
  const first = pick(PREDICTIONS)
  let second = pick(PREDICTIONS)
  while (second === first) second = pick(PREDICTIONS)
  let match = pick(SIGNS)
  while (match.key === sign.key) match = pick(SIGNS)
  return {
    opening: nonce ? 'The socks sigh. Fine. Again.' : pick(OPENINGS),
    predictions: [first, second],
    item: pick(LUCKY_ITEMS),
    number: pick(LUCKY_NUMBERS),
    match: match.name,
    risk: Math.floor(rand() * 101),
  }
}

export default function Sockstrology() {
  const t = useCopy()
  const [sign, setSign] = useState(null)
  const [nonce, setNonce] = useState(0)
  const [gazing, setGazing] = useState(false)

  useEffect(() => {
    if (!gazing) return
    const timer = setTimeout(() => setGazing(false), 1400)
    return () => clearTimeout(timer)
  }, [gazing])

  const consult = (next, again = false) => {
    setSign(next)
    setNonce((n) => (again ? n + 1 : 0))
    setGazing(true)
  }

  const result = sign && reading(sign, nonce)

  return (
    <section className="astro">
      <div className="app-head">
        <div>
          <h2>{t.apps.sockstrology}</h2>
          <p>Ancient hosiery wisdom, updated daily. Choose your sock sign. The crystal ball does the rest. Legally binding in zero countries.</p>
        </div>
      </div>

      <div className="astro__layout">
        <ul className="signs">
          {SIGNS.map((s) => (
            <li key={s.key}>
              <button className="sign" aria-pressed={sign?.key === s.key} onClick={() => consult(s)}>
                <Sock look={s.look} height={58} />
                <span>{s.name}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="oracle" aria-live="polite">
          <div className={`ball ${gazing ? 'ball--gazing' : ''}`} aria-hidden="true">
            <div className="ball__glass">{sign && <Sock look={sign.look} height={70} />}</div>
            <div className="ball__stand" />
          </div>

          {!sign && <p className="oracle__idle">The crystal ball awaits a sock.</p>}
          {sign && gazing && <p className="oracle__idle">Consulting the lint…</p>}
          {result && !gazing && (
            <div className="prophecy">
              <h3>{sign.name}</h3>
              <p className="prophecy__trait">{sign.trait}</p>
              <p className="prophecy__opening">{result.opening}</p>
              <ul>
                {result.predictions.map((p) => <li key={p}>{p}</li>)}
              </ul>
              <dl className="prophecy__facts">
                <div><dt>Lucky item</dt><dd>{result.item}</dd></div>
                <div><dt>Lucky number</dt><dd>{result.number}</dd></div>
                <div><dt>Best paired with</dt><dd>{result.match}</dd></div>
                <div>
                  <dt>Sock-risk level</dt>
                  <dd>
                    <span className="risk" role="meter" aria-valuenow={result.risk} aria-valuemin={0} aria-valuemax={100}>
                      <span style={{ width: `${result.risk}%` }} />
                    </span>
                    {result.risk}%
                  </dd>
                </div>
              </dl>
              <button className="btn btn--small btn--ghost" onClick={() => consult(sign, true)}>🔮 Ask again (they hate this)</button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
