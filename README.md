# ProcApp — Procurement System

Monorepo for the procurement application.

| Module | Stack | Path |
| --- | --- | --- |
| Frontend | React + TypeScript + Vite | [`procapp-frontend/`](procapp-frontend/) |
| Backend | Java + Spring Boot | [`procapp-backend/`](procapp-backend/) |

Shared docs: [`docs/api-contract.md`](docs/api-contract.md)

## Getting started

### Frontend

```bash
cd procapp-frontend
npm install
npm run dev
```

### Backend

```bash
cd procapp-backend
./mvnw spring-boot:run
```

Each module has its own README / build config; commands must be run from inside the
module directory.
