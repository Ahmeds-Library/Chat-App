package main

import (
	"log"
	"os"

	websocket_mongo "github.com/Ahmeds-Library/Chat-App/websocket_database/mongo"
	websocket_postgres "github.com/Ahmeds-Library/Chat-App/websocket_database/postgres"
	websocket "github.com/Ahmeds-Library/Chat-App/websocket_functions"
	"github.com/Ahmeds-Library/Chat-App/websocket_middleware"
	"github.com/Ahmeds-Library/Chat-App/websocket_utils"
	"github.com/gin-gonic/gin"
)

func main() {
	websocket_utils.LoadEnv()

	if err := websocket_mongo.ConnectMongoDatabase(); err != nil {
		log.Fatal("Mongo Init Error:", err)
	}

	websocket_postgres.ConnectPgAdminDatabase()

	hub := websocket.NewHub()
	r := gin.Default()

	r.GET("/ws", websocket_middleware.WebSocket_Middleware(), websocket.WebSocketHandler(hub))

	port := os.Getenv("WS_PORT")
	if port == "" {
		port = "9000"
	}
	log.Println("WebSocket Server running on port", port)

	if err := r.Run(":" + port); err != nil {
		log.Fatal("Server error:", err)
	}
}
