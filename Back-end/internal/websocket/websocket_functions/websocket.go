package websocket

import (
	"log"
	"net/http"
	"github.com/Ahmeds-Library/Chat-App/internal/utils"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func HandleWebSocket(c *gin.Context) {
	token := c.Query("token")
	claims, err := utils.DecodeToken(token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
		return
	}
	userID, ok := claims["id"].(string)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid user id"})
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("WS upgrade failed:", err)
		return
	}

	client := &Client{Conn: conn, UserID: userID}
	GlobalHub.AddClient(userID, client)
	log.Printf("WebSocket connected: %s", userID)

	for {
		if _, _, err := conn.NextReader(); err != nil {
			break
		}
	}

	GlobalHub.RemoveClient(userID)
	conn.Close()
}