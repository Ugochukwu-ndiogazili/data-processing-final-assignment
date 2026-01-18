# StreamFlix Frontend

React + Vite single-page app that consumes the StreamFlix Express API. It is written in plain JavaScript and styled with conventional CSS modules.

## Features
- Auth flows (login, register, verify, forgot & reset)
- Account dashboard with viewing progress (`NowWatching`)
- Profile management with age filters and preferences
- Browse library with watchlist and "start session" actions
- Watchlist + viewing history scoped per profile
- Subscription management, invitations, and discount tracking
- Internal console that mimics DBMS role capabilities
- State via Zustand, data-fetching via TanStack Query

## Getting Started
```bash
cd frontend
npm install
npm run dev
```
Set `VITE_API_URL` in `frontend/.env` if the API is not on `http://localhost:5000/api`.

## Testing & lint
```bash
npm run lint
npm run test      # Vitest + Testing Library
```
