const LINES = {
  start: [
    'Aim the washing machine. Knock off every stinky sock. Do it for the shareholders.',
    'The stinky socks have unionized. Break them up.',
    'Welcome to the only peg game regulated by the Department of Hosiery.',
  ],
  deadsea: ['Shalom! Gravity is on vacation here.', 'So salty, even the pegs float. Sababa!', 'Your sock is doing the dead man\'s float. On purpose.'],
  streak5: ['Five pegs! Your sock is feeling itself.', 'The pegs are filing a formal complaint.', 'Somewhere, a sock drawer applauds.'],
  streak10: ['TEN PEGS. Your ancestors felt that.', 'Your sock has achieved minor celebrity.', 'Scientists are baffled. Socks are not.'],
  streak15: ['FIFTEEN?! Call the sock police!', 'This sock has entered the multiverse.', 'The Victorian children are weeping with joy.'],
  clone: ['Sock cloned. The ethics board is on its way.', 'There are two of them now. Do not tell HR.'],
  golden: ['GOLDEN SOCK! Worth 500 points or one used car.', 'You hit the golden sock. It will remember you fondly.'],
  bucket: ['Basket case! Free sock!', 'Nothing but laundry basket.', 'The basket accepts your offering.'],
  miss: ['Bold strategy, hitting nothing.', 'Your sock went to find itself.', 'A clean miss. Clean like fresh laundry.'],
  unstuck: ['Sock stuck. We called a plumber. Fixed.', 'The pegs got nervous and left.'],
  frenzy: ['SOCK FRENZY! +2500. Your feet are legally a weapon now.'],
  won: ['You have achieved sock nirvana.', 'Every stinky sock, knocked off. The board is speechless.', 'Mazel tov! The laundry is done!'],
  lost: ['The stinky socks win. They always win. Smell that?', 'Out of socks. Barefoot and ashamed.', 'The dryer took the last one. As foretold.'],
}

export function quip(kind) {
  const list = LINES[kind]
  return list[Math.floor(Math.random() * list.length)]
}
