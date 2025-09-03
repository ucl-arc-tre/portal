# ------------- DEV SECTION ----------------
FROM golang:1.24.6-alpine AS builder

RUN adduser --uid 1000 --disabled-password user && \
    apk add -U --no-cache ca-certificates

WORKDIR /app

COPY go.mod go.sum ./
COPY cmd ./cmd
COPY internal ./internal

RUN --mount=type=cache,target=/root/.cache/go-build \
  --mount=type=cache,target=/go/pkg/mod \
  CGO_ENABLED=0 go build -v -o api cmd/api/main.go && \
  CGO_ENABLED=0 go build -v -o web-frontend cmd/web-frontend/main.go

# -------------------------------------------
# Whole repo should be mounted in under /repo
FROM golang:1.24.6-alpine AS api-dev

RUN go install github.com/air-verse/air@latest

WORKDIR /repo
ENV GIN_MODE="debug"
CMD ["air", "--build.cmd", "go build -o bin/api cmd/api/main.go", "--build.bin", "./bin/api", "--build.exclude_dir", "web,bin,deploy,tmp,e2e,docs"]

# -------------------------------------------
# Whole repo should be mounted in under /repo
FROM node:22-alpine3.21 AS web-frontend-dev

WORKDIR /repo/web
COPY web/package.json web/package-lock.json web/eslint.config.mjs web/.env.development ./

RUN npm ci
CMD ["npm", "run", "dev", "--", "--port", "3000", "--hostname", "0.0.0.0"]

# -------------- RELEASE SECTION ------------------
FROM node:22-alpine3.20 AS web-frontend-builder

WORKDIR /app

COPY web/src src
COPY web/public public
COPY web/package-lock.json web/package.json \
  web/next.config.ts web/tsconfig.json web/.env.production ./

ARG NEXT_PUBLIC_AGREEMENT_TIMER=180 # Seconds required before agreements can be agreed to
ENV NEXT_PUBLIC_AGREEMENT_TIMER=$NEXT_PUBLIC_AGREEMENT_TIMER

RUN --mount=type=cache,target=/app/node_modules \
  npm ci && \
  npm run build

# --------------------------------------------------------
FROM scratch AS api-release

COPY --from=builder /etc/passwd /etc/passwd
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder --chmod=777 /app/api api

USER user
ENV PORT=8080
ENV GIN_MODE=release
ENTRYPOINT ["./api"]

# --------------------------------------------------------
FROM scratch AS web-frontend-release

COPY --from=builder /etc/passwd /etc/passwd
COPY --from=builder --chmod=777 /app/web-frontend /web-frontend
COPY --from=web-frontend-builder /app/out /out

USER user
ENV PORT=8080
ENV GIN_MODE=release
WORKDIR /out
ENTRYPOINT ["/web-frontend"]
