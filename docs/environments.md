# UCL ARC TRE Portal

This project is a full-stack web application built with:

- **Go** for backend services
- **React (NextJS)** for the frontend
- **Docker** for containerized development and deployment
- **Nginx** as a reverse proxy
- **PostgreSQL** as the database
- **Cypress** for end-to-end (E2E) testing

---

## 📦 Project Structure

This project uses a [common Go project layout](https://github.com/golang-standards/project-layout) to structure both the backend Go backend API and React frontend as a monorepo.

```
.
├── cmd/                  # Entry points for Go binaries
│   ├── web-api/          # Main Go backend API server
│   └── web-frontend/     # Go server to serve compiled frontend in release
├── internal/             # Shared application logic (router, middleware, etc.)
├── web/                  # React frontend
├── deploy/               # Docker-related config
│   └── dev/              # Docker Compose and nginx config for dev
├── e2e/                  # Cypress E2E test setup and Compose config
├── Dockerfile            # Multi-stage Dockerfile that handles both dev and release builds
├── Makefile              # Dev and CI command shortcuts
```

---

## 🚀 Environments Overview

All environments are dockerised for a self-contained service that builds all versions of the application: dev, release, and e2e.

### 🧑‍💻 Local Development (`make dev`)

- Runs containers using `docker-compose` from [`deploy/dev/`](../deploy/dev/)
- React frontend is served by **NextJS dev server** with live reloading
- Go backend uses **Air** for live reloads
- Nginx acts as a reverse proxy:
  - `/` → React dev server
  - `/api` → Go backend API
- Accessible at: [http://localhost:8000](http://localhost:8000)

### 🔐 Release

- This environment is used for the production release
- React frontend is built into static files (see [`Dockerfile`](../Dockerfile) in the `web-frontend-builder` section)
- Go backend and frontend servers are compiled into standalone binaries
- Static frontend is served by the `web-frontend` Go binary (see `cmd/web-frontend`)

### 🧪 E2E Testing (`make test-e2e-release`)

- Uses Docker Compose from [`e2e/`](../e2e/)
- Spins up release versions of frontend, backend, database, and nginx (see Release section above for details)
- Cypress runs tests against the full stack via nginx at `http://localhost:8000`

---

## 🏛️ Architecture

<p align="center">
  <img src="./media/architecture.png" alt="architecture" width="650">
</p>
