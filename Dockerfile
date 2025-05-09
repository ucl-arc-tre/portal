# ------------- DEV SECTION ----------------
FROM golang:1.24.2-alpine AS builder

RUN adduser --uid 1000 --disabled-password user && \
    apk add -U --no-cache ca-certificates

WORKDIR /app

COPY go.mod go.sum ./
COPY cmd ./cmd
COPY internal ./internal

RUN --mount=type=cache,target=/root/.cache/go-build \
  --mount=type=cache,target=/go/pkg/mod \
  CGO_ENABLED=0 go build -v -o web-api cmd/web-api/main.go && \
  CGO_ENABLED=0 go build -v -o web-frontend cmd/web-frontend/main.go

# -------------------------------------------
# Whole repo should be mounted in under /repo
FROM golang:1.24.2-alpine AS web-api-dev

RUN go install github.com/air-verse/air@latest

WORKDIR /repo
ENV GIN_MODE="debug"
CMD ["air", "--build.cmd", "go build -o bin/web-api cmd/web-api/main.go", "--build.bin", "./bin/web-api", "--build.exclude_dir", "web,bin,deploy,tmp"]

# -------------------------------------------
# Whole repo should be mounted in under /repo
FROM node:22-alpine3.20 AS web-frontend-dev

WORKDIR /repo/web
COPY web/package.json web/package-lock.json web/eslint.config.mjs ./

RUN npm ci
CMD ["npm", "run", "dev", "--", "--port", "3000", "--hostname", "0.0.0.0"]

# -------------- RELEASE SECTION ------------------
FROM node:22-alpine3.20 AS web-frontend-builder

WORKDIR /app

# Copy the rest of the frontend app
COPY web/ ./

RUN --mount=type=cache,target=/app/node_modules \
  npm ci && \
  npm run build

# --------------------------------------------------------
FROM scratch AS web-api-release

COPY --from=builder /etc/passwd /etc/passwd
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder --chmod=777 /app/web-api web-api

USER user
ENV PORT=8080
ENV GIN_MODE=release
ENTRYPOINT ["./web-api"]

# --------------------------------------------------------
FROM scratch AS web-frontend-release

COPY --from=builder /etc/passwd /etc/passwd
COPY --from=builder --chmod=777 /app/web-frontend web-frontend
COPY --from=web-frontend-builder /app/out .

USER user
ENV PORT=8080
ENV GIN_MODE=release
ENTRYPOINT ["./web-frontend"]
