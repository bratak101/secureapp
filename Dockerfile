# Railway – build backend z głównego katalogu repo
FROM golang:1.21-alpine AS build
WORKDIR /app
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ ./
RUN go build -o server .

FROM alpine:3.19
WORKDIR /app
COPY --from=build /app/server .
EXPOSE 8080
CMD ["./server"]
