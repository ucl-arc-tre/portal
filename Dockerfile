FROM golang:1.24.2-alpine AS builder

RUN adduser --uid 1000 --disabled-password user && \
    apk add -U --no-cache ca-certificates

WORKDIR /app

COPY go.mod go.sum ./
COPY cmd ./cmd
COPY internal ./internal

RUN --mount=type=cache,target=/root/.cache/go-build \
  --mount=type=cache,target=/go/pkg/mod \
  CGO_ENABLED=0 go build -v -o web cmd/web/main.go

# --------------------------------------------------------
FROM scratch AS release

COPY --from=builder /etc/passwd /etc/passwd
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder --chmod=777 /app/web web

USER user
ENV PORT=8080
ENV GIN_MODE=release
ENTRYPOINT ["./web"]
