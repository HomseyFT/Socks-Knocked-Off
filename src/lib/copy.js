import { createContext, useContext } from 'react'

const modern = {
  appName: 'SockOffice',
  tagline: 'The productivity suite that knocks your socks off.',
  gaslight: 'Gaslight Mode',
  apps: {
    clothesline: 'Clothesline',
    puppet: 'Puppet Boardroom',
    pairing: 'Pair Drawer',
    sockonomics: 'Sockonomics',
    dryer: 'The Dryer',
  },
  columns: { hamper: 'In the Hamper', line: 'On the Line', off: 'Knocked Off!' },
  knockedOff: 'SOCKS KNOCKED OFF!',
  footer: 'No socks were harmed. A few were knocked off.',
}

const victorian = {
  appName: 'Ye Olde Hosiery Bureau',
  tagline: 'Industry so splendid it shall remove thine very stockings.',
  gaslight: 'Electric Mode',
  apps: {
    clothesline: "The Laundress's Line",
    puppet: 'Marionette Parlour',
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
