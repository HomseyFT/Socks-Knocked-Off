# SockOffice

The world's first office suite run entirely by socks. Very colorful, very absurd.

| App | What it does |
|-----|--------------|
| **Sockinko** | Peg-bouncing arcade game. Fire socks from a washing machine, knock off every stinky sock, catch the laundry basket for a free sock. Four levels, including the low-gravity Dead Sea Spa, and three kinds of ammo (rolled sock, falafel, dust bunny). |
| **Clothesline** | Task board. Tasks are socks hung on three lines; drag or tap them along until they're knocked off. |
| **Puppet Boardroom** | Type a speech and a sock-puppet executive reads it aloud (Web Speech API), with live captions and a shareholder ovation. Mimes if the browser can't talk. |
| **Sockstrology** | Daily sock horoscopes for twelve sock signs, delivered by crystal ball. |
| **Pair Drawer** | Random coffee-chat pairs (odd sock makes a trio) or a Secret Sock-ta gift chain. |
| **Sockonomics** | Shareholder dashboard built from Clothesline data, with a fictional sock-stock ticker. |
| **The Dryer** | Trash bin. Deleted socks tumble here until restored or the lint trap is cleaned. |

Also: a Sock Gremlin that runs across the screen every so often (click it), a
Sock Storm button, and **Gaslight Mode** for a sepia Victorian theme and copy.

Data lives in the browser's `localStorage` (per viewer, no backend).

## Develop

```sh
npm install
npm run dev
npm run lint
npm run build
```

## Deploy

The `Dockerfile` builds the app and serves it with nginx on port 80. The compose
stack lives in `Docker-Stack/socks/` and expects this repo at
`/home/nathan1/sites/Socks-Knocked-Off` on the server.
