FROM golang:1.23-alpine

WORKDIR /app

COPY go.* ./

RUN go mod download

COPY . .

RUN go build -o main ./cmd/main.go

EXPOSE 8001

CMD ["./main"]
