# Client Ops API

Small internal API for tracking client site/service records (name, URL, status, notes, owner). Built quickly with AI assistance for another EVO ART engagement.

## Setup

```bash
cp .env.example .env
npm install
npm run seed   # creates the first admin user from your .env values
npm run dev
```

API runs on `http://localhost:5050` by default.

## Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/sites`
- `GET /api/sites/:id`
- `POST /api/sites`
- `PATCH /api/sites/:id`
- `DELETE /api/sites/:id`

Admin and viewer roles exist. Viewers should only be able to read.
