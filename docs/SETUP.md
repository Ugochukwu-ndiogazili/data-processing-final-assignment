# StreamFlix Dev Setup

## Requirements
- Node.js 20+
- npm 10+
- Docker (optional but recommended)
- PostgreSQL 15+ (if not using Docker)

## 1. Install dependencies
```bash
npm install
```
The root workspace installs both `backend` and `frontend` packages.

## 2. Environment variables
Copy `backend/.env.example` to `backend/.env` and adjust secrets (database URL, JWT keys, SMTP).
Set `API_DB_PASSWORD` to provision the `api_user_account` with a password during database
initialization. The API will use `API_DATABASE_URL` (constructed in `docker-compose.yml`) to
connect as this limited user.

## 3. Database
Run PostgreSQL locally or via Docker:
```bash
docker compose up postgres -d
```
Then apply Prisma migrations:
```bash
cd backend
npx prisma migrate dev
npm run seed
```

## 4. Development servers
From the repo root:
```bash
npm run dev
```
This runs the NestJS API on `http://localhost:5000` and React on `http://localhost:5173`.

## 5. Tests & lint
```bash
npm run lint      # both workspaces
npm run test      # backend Jest + frontend Vitest
```

## 6. Docker all-in-one
```bash
docker compose up --build
```
This spins up Postgres, the API, and the React client together.




