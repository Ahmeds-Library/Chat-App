package websocket

import (
	"fmt"
	"log"
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func HandleWebSocket(c *gin.Context) {
	fmt.Println("WebSocket connection request received")
	claims, valid := ValidateToken_WebSocket(c)
	if !valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userID, ok := claims["id"].(string)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "UserID not found in token"})
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("WebSocket upgrade failed:", err)
		return
	}

	client := &Client{Conn: conn, UserID: userID}
	WS_HUB.AddClient(userID, client)
	log.Printf("WebSocket connected: %s", userID)

	go readMessages(client)
}

func readMessages(client *Client) {
	defer func() {
		client.Conn.Close()
		WS_HUB.RemoveClient(client.UserID)
		log.Printf("WebSocket disconnected: %s", client.UserID)
	}()

	for {
	_, _, err := client.Conn.ReadMessage()
		if err != nil {
			break
		}
	}
}


func StartBroadcast() {
	for msg := range WS_HUB.Broadcast {
		WS_HUB.SendToUser(msg.ReceiverID, msg)
	}
}

