package main

import (
	"log"
	"os"

	"github.com/Ahmeds-Library/Chat-App/wc_database"
	"github.com/Ahmeds-Library/Chat-App/wc_middleware"
	"github.com/Ahmeds-Library/Chat-App/wc_utils"
	websocket "github.com/Ahmeds-Library/Chat-App/websocket_functions"
	"github.com/gin-gonic/gin"
)

func main() {
	wc_utils.LoadEnv()

	if err := wc_database.ConnectMongoDatabase(); err != nil {
		log.Fatal("❌ Mongo Init Error:", err)
	}

	hub := websocket.NewHub()
	r := gin.Default()

	// Attach middleware & WebSocket handler
	r.GET("/ws", wc_middleware.WebSocket_Middleware(), websocket.WebSocketHandler(hub))

	port := os.Getenv("WS_PORT")
	if port == "" {
		port = "9000" 
	}
	log.Println("✅ WebSocket Server running on port", port)

	if err := r.Run(":" + port); err != nil {
		log.Fatal("❌ Server error:", err)
	}
}
