package main

import (
	server "github.com/Ahmeds-Library/Chat-App/cmd"
	"github.com/Ahmeds-Library/Chat-App/internal/websocket"
)

func main() {
	go websocket.StartWebSocketServer()
	server.StartAPIServer()
}
