package websocket

import (
	"log"
	"net/http"

	"github.com/Ahmeds-Library/Chat-App/wc_middleware"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func WebSocketHandler(hub *Hub) gin.HandlerFunc {
	return func(c *gin.Context) {
		claims, ok := wc_middleware.ValidateToken_WebSocket(c)
		if !ok {
			return
		}
		userID := claims["id"].(string)

		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Println("❌ Upgrade error:", err)
			return
		}

		client := &Client{
			conn:   conn,
			userID: userID,
			send:   make(chan interface{}, 256),
		}

		hub.AddClient(userID, client)
		log.Println("✅ Connected:", userID)

		go client.WritePump()
		client.ReadPump(hub)
	}
}
