FROM golang:1.23-alpine

WORKDIR /app

COPY go.* ./

RUN go mod download

COPY . .

RUN go build -o main ./main.go

EXPOSE 9000

CMD ["./main"]
