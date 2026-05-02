# Stage 1: Build
FROM golang:1.24-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o main .

# Stage 2: Final Image (ตัวจริงที่เอาไปรัน)
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/main .
COPY .env* ./
# Create data dir for SQLite
RUN mkdir -p /app/data && chown -R 1000:1000 /app/data
ENV DB_PATH=/app/data/app.db

EXPOSE 8080
CMD ["./main"] 