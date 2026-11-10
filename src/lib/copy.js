import { createContext, useContext } from 'react'

const modern = {
  appName: 'SockOffice',
  taglines: [
    'The productivity suite that knocks your socks off.',
    'Now with 40% more socks than legally permitted.',
    'Sentient hosiery. Sensible prices.',
    'Ask your doctor if SockOffice is right for you.',
    'Founded in a dryer, 1897. Still in the dryer.',
    'Shalom! The socks have been expecting you.',
    'Not a cult. A sock collective.',
    'Warning: may contain traces of foot.',
  ],
  gaslight: 'Gaslight Mode',
  storm: 'Sock Storm',
  gremlins: 'Gremlins caught',
  apps: {
    sockinko: 'Sockinko',
    clothesline: 'Clothesline',
    puppet: 'Puppet Boardroom',
    sockstrology: 'Sockstrology',
    pairing: 'Pair Drawer',
    sockonomics: 'Sockonomics',
    dryer: 'The Dryer',
  },
  columns: { hamper: 'In the Hamper', line: 'On the Line', off: 'Knocked Off!' },
  knockedOff: 'SOCKS KNOCKED OFF!',
  footer: 'No socks were harmed. A few were knocked off. One is in the Dead Sea, floating peacefully.',
}

const victorian = {
  appName: 'Ye Olde Hosiery Bureau',
  taglines: [
    'Industry so splendid it shall remove thine very stockings.',
    'By appointment to absolutely no one.',
    'Steam-powered. Sock-powered. Mostly sock-powered.',
    'Purveyors of fine stockings and finer nonsense.',
    'The mangle is hungry. Feed it, children.',
  ],
  gaslight: 'Electric Mode',
  storm: 'Stocking Tempest',
  gremlins: 'Imps apprehended',
  apps: {
    sockinko: 'Ye Bagatelle of Hosiery',
    clothesline: "The Laundress's Line",
    puppet: 'Marionette Parlour',
    sockstrology: 'The Hosiery Séance',
    pairing: 'Matchmaking Chest',
    sockonomics: 'Ledger of Hosiery',
    dryer: 'The Mangle',
  },
  columns: { hamper: 'Awaiting the Washtub', line: 'Drying by the Hearth', off: 'Splendidly Accomplished' },
  knockedOff: 'STOCKINGS MOST THOROUGHLY REMOVED!',
  footer: 'Children, mind the mangle. Mind it most earnestly.',
}

export const COPY = { modern, victorian }
export const CopyContext = createContext(modern)
export const useCopy = () => useContext(CopyContext)
