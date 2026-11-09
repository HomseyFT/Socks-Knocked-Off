# SockOffice

A very colorful, very sock-y office suite. Everything is a sock.

| App | What it does |
|-----|--------------|
| **Clothesline** | Task board. Tasks are socks hung on three lines; drag or tap them along until they're knocked off (with sock confetti). |
| **Puppet Boardroom** | Type a speech and a sock-puppet executive reads it aloud (Web Speech API), with live captions and a shareholder ovation. Mimes if the browser can't talk. |
| **Pair Drawer** | Random coffee-chat pairs (odd sock makes a trio) or a Secret Sock-ta gift chain. |
| **Sockonomics** | Shareholder dashboard built from Clothesline data: stat tiles, a chart where bar = sock leg length, and a fictional sock-stock ticker. |
| **The Dryer** | Trash bin. Deleted socks tumble here until restored or the lint trap is cleaned. |

**Gaslight Mode** switches to a sepia Victorian theme and copy.

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
