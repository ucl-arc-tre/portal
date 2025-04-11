# This Dockerfile is used to build a multi-stage Docker image for the release version of the Go web API and React frontend.

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

# Frontend builder (Vite)
FROM node:22-alpine3.20 AS web-frontend-builder

WORKDIR /app
COPY web .

RUN --mount=type=cache,target=/app/node_modules/.vite \
  npm install vite@6.2.5 && \
  npm run build

# Release image for API
FROM scratch AS web-api-release

COPY --from=builder /etc/passwd /etc/passwd
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder --chmod=777 /app/web-api web-api

USER user
ENV PORT=8080
ENV GIN_MODE=release
ENTRYPOINT ["./web-api"]

# Release image for frontend
FROM scratch AS web-frontend-release

COPY --from=builder /etc/passwd /etc/passwd
COPY --from=builder --chmod=777 /app/web-frontend web-frontend
COPY --from=web-frontend-builder /app/dist .

USER user
ENV PORT=8080
ENV GIN_MODE=release
ENTRYPOINT ["./web-frontend"]
