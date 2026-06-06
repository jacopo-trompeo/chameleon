# Chameleon

A web-based, real-time multiplayer social-deduction party game. Players join a
shared lobby and compete across rounds to identify a hidden impostor who was
given a slightly different question

## Prerequisites

- [Bun](https://bun.sh) `1.3+`
- A Redis instance on `localhost:6379` (a `docker-compose.yml` is provided)

## Setup

```bash
bun install
docker compose up -d        # starts Redis on :6379
bun dev                     # runs the server (:3001) and client (:5173)
```

Open http://localhost:5173. To play a full game you need **4 players** - open
the lobby link in several tabs/devices.

Environment defaults live in `apps/server/.env` and `apps/client/.env`.

## Scripts (run from the repo root)

```bash
bun dev          # server + client in watch mode
bun run build    # production build of the client
bun run typecheck
bun run lint     # biome check
bun test         # pure game-logic unit tests (apps/server/test)
```
