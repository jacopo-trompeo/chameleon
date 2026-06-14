# Chameleon

A web-based, real-time multiplayer social-deduction party game for 4 or more
players. In each round one player is secretly the impostor with a slightly
different question. Everyone answers and then tries to figure out who got the
odd question.

## How the Game Works

One player creates a lobby and shares a 6-character room code. Once at least 4
players join and ready up, the game starts. Each round follows a fixed sequence:

1. **Question Input** - The game master writes two questions: one for the
   normal players and a slightly different one for the impostor.
2. **Answering** - Each player sees only their own question and writes an
   answer. At the same time the game master learns who the impostor is.
3. **Reveal** - Answers are shown by manually turning around the devices and the
   group discusses who might be the impostor.
4. **Resolution** - The game master declares the verdict.
   - **Caught**: Everyone except the game master and impostor scores a point.
   - **Fooled**: Only the impostor scores a point.
5. **Next Round** - The game master role rotates to a different player and the
   cycle repeats.

The first player to reach the target score wins. The target score is set by the
lobby creator and defaults to 5.

## Architecture

Chameleon is a Bun workspace monorepo with three packages. The server and
client communicate in real time over Socket.IO with typed events defined in a
shared types package.

```
Client (React 19)               Socket.IO                  Server (Bun + Hono)
┌───────────────────────┐  ──── ClientToServerEvents ──►  ┌───────────────────┐
│  Pages                │                                 │  HTTP API (Hono)  │
│  ├─ HomePage          │  ◄─── ServerToClientEvents ──   │  ├─ POST /lobbies │
│  ├─ LobbyPage         │                                 │  └─ GET  /lobbies │
│  └─ GamePage          │                                 │                   │
│                       │                                 │  Socket.IO Server │
│  Stores (Zustand)     │                                 │  ├─ lobby handlers│
│  ├─ lobby-store       │                                 │  ├─ round handlers│
│  ├─ game-store        │                                 │  └─ disconnect    │
│  └─ notification-store│                                 │                   │
│                       │                                 │  Game Logic       │
│  shared types         │                                 │  ├─ state         │
│  (@chameleon/types)   │     Redis (ioredis)             │  ├─ lobby         │
│  └─ events, game,     │     ◄─────────────────────►     │  ├─ round         │
│     socket-events     │     JSON state with TTL         │  ├─ scoring       │
└───────────────────────┘                                 │  └─ rotation      │
                                                          └───────────────────┘
```

**The server** runs on Bun and uses Hono for REST endpoints (lobby creation and
lookup) and Socket.IO for all real-time game communication. Lobby state is
stored in Redis as JSON with a 24-hour TTL. Mutations use Redis optimistic
locking (`WATCH`/`MULTI`/`EXEC`). A Lua script handles atomic counting for
detecting when all answers are in.

**The client** is a React 19 SPA built with Vite. Zustand stores hold lobby
state, game state, and notifications. React Router handles page navigation
(Home, Lobby, Game). Framer Motion animates transitions between game phases.
Tailwind CSS 4 with shadcn/ui components provides the visual layer.

**The shared types package** (`@chameleon/types`) defines Socket.IO event maps,
game phase enums, and player/lobby/round data types. It has zero dependencies
and is consumed by both server and client through the workspace protocol.

## Tech Stack

| Technology | Role | Notes |
|---|---|---|
| TypeScript 5.x | Language |  |
| Bun 1.3+ | Runtime / build / test |  |
| Hono 4.x | HTTP framework | Lightweight REST API for lobby creation/lookup |
| Socket.IO 4.x | Real-time communication | Bidirectional events with room support |
| Redis 7 | State store | In-memory with 24h TTL, optimistic concurrency |
| ioredis | Redis client | Lua scripting support for atomic operations |
| Zod | Validation | Runtime schema validation on server and shared types |
| Pino | Logging | Structured JSON logging |
| React 19 | UI | With React Compiler for automatic memoization |
| React Router 7 | Routing ||
| Zustand 5 | State management |  |
| Tailwind CSS 4 | Styling |  |
| shadcn/ui | Components | New York style, neutral base, copied into source |
| Framer Motion | Animation | Phase transition animations |
| Vite 7 | Client build |  |
| Biome 2 | Linting & formatting | Replaces ESLint and Prettier |
| Docker Compose | Infrastructure | Redis service for local development |
| GitHub Actions | CI/CD | Lint, typecheck, test on push and PR |

## Install & Run

**Prerequisites:** [Bun](https://bun.sh) 1.3 or later, and [Docker](https://docker.com) for Redis.

Clone the repository and install:

```bash
git clone https://github.com/jacopo-trompeo/chameleon.git
cd chameleon
bun install
```

Start Redis and launch both server and client in dev mode:

```bash
docker compose up -d        # starts Redis on port 6379
bun dev                     # server on :3001, client on :5173
```

Open http://localhost:5173. To play you need at least 4 players. Open the same
URL in multiple browser tabs or on different devices on the local network
(set `VITE_SERVER_URL` accordingly in `apps/client/.env`).

Environment variables are in `apps/server/.env` and `apps/client/.env` with
defaults that work out of the box for local development.

Build the client for production:

```bash
bun run build
```

## Development

Scripts run from the repository root:

```bash
bun dev                    # server + client in watch mode
bun run build              # production build of the client
bun run typecheck          # TypeScript type checking across all workspaces
bun run lint               # biome check (lint + format)
bun run format             # biome check --write (auto-fix)
bun test                   # run all tests
```

Tests use `bun:test` and cover pure game logic: lobby creation, round flow,
scoring, and player rotation. They live in `apps/server/test/`. CI runs lint,
typecheck, and tests on every push to `main` or `develop` and on all pull
requests.

## Project Structure

```
chameleon/
  packages/types/        shared TypeScript types, enums, Socket.IO event maps
  apps/server/           Bun server: HTTP API (Hono), Socket.IO handlers, game logic, Redis layer
  apps/client/           React 19 SPA: pages, Zustand stores, game components, shadcn/ui
  biome.json             linter and formatter configuration
  tsconfig.base.json     shared TypeScript strict-mode config
  docker-compose.yml     Redis 7 container for local development
```

## Design Decisions

**Bun as the sole runtime.**
Bun replaces Node.js, a bundler (webpack/rollup), a test runner (jest/vitest),
and a package manager (npm/yarn/pnpm). This means a single tool for the entire
workflow. The trade-off is a smaller ecosystem and less battle-tested runtime
compared to Node.js.

**Socket.IO over raw WebSockets.**
Socket.IO provides rooms, automatic reconnection, and typed event maps. Raw
WebSockets would mean reimplementing these features or accepting a less capable
protocol. 

**Redis as an ephemeral state store.**
All lobby state lives in Redis with a 24-hour TTL and no persistence. This is
deliberate: the game is meant for casual play sessions, not long-lived
accounts. Redis gives atomic operations with Lua scripting support. The
downside is that all data is lost on restart and there is no player identity
across sessions.

**Optimistic locking for state mutations.**
Server-side state changes use Redis `WATCH`/`MULTI`/`EXEC` to detect and retry
on conflicts. This avoids blocking reads and works well for the low-contention
workload of a party game where only one player acts at a time in most phases.

**Monorepo with a shared types package.**
Defining Socket.IO event types, game enums, and data shapes in a single package
enforces a contract between client and server at compile time. Zod schemas in
the server validate at runtime that incoming payloads match those types. The
package has no dependencies so it stays fast to build.

**React 19 with the React Compiler.**
The React Compiler plugin automatically applies `React.memo` and `useMemo`
where safe, reducing boilerplate and preventing stale closure bugs from manual
memoization. It requires Babel integration via Vite, which adds a build-time
dependency.

## Limitations & Future Work

- **No data persistence.** Redis is configured without disk persistence. A
  restart wipes all active lobbies. Enabling Redis RDB or AOF persistence would
  survive restarts at the cost of some memory and latency.
- **No reconnection recovery.** When a player disconnects during an active
  game, they are automatically given an empty answer to avoid blocking the
  round, but there is no mechanism for them to rejoin and resume their session.
- **Server runs from source.** There is no Dockerfile for the server app and no
  production deployment configuration. The client builds static files to `dist/`
  but there is no instruction for serving them in production.
- **No end-to-end tests.** Existing tests cover pure game logic functions only.
  The Socket.IO handlers, HTTP endpoints, and full game flow are not tested
  automatically.
- **Tests require a running Redis instance.** The lobby store tests depend on a
  live Redis connection. CI does not currently spin up a Redis service
  container for the test job.
- **Limited accessibility.** Some `aria-live` regions are present but there is
  no full accessibility audit, no keyboard navigation testing beyond default
  browser behavior, and screen reader support is untested.
- **Game rules not embedded in the UI.** New players learn the rules from the
  README or from other players. There is no onboarding tutorial or in-app
  explanation of how the game works.

## License

MIT. Copyright 2026.

