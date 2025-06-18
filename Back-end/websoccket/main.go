package main

import (
	"fmt"
	"log"

	"github.com/Ahmeds-Library/Chat-App/internal/websocket"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:8080"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Authorization", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))
	fmt.Println("22")

	router.GET("/ws", websocket.WebSocket_Middleware(), websocket.HandleWebSocket)

	fmt.Println("26")

	go websocket.StartBroadcast()

	log.Println("WebSocket server started on :9000")
	router.Run(":9000")
}
