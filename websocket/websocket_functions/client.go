package websocket

import (
	"log"
	"time"

	websocket_database "github.com/Ahmeds-Library/Chat-App/websocket_database/mongo"
	websocket_postgres "github.com/Ahmeds-Library/Chat-App/websocket_database/postgres"
	"github.com/Ahmeds-Library/Chat-App/websocket_models"
	"github.com/gorilla/websocket"
)

type Client struct {
	conn   *websocket.Conn
	userID string
	send   chan interface{}
}

func (c *Client) ReadPump(h *Hub) {
	defer func() {
		h.RemoveClient(c.userID)
		c.conn.Close()
	}()

	for {
		var input struct {
			ReceiverNumber string `json:"receiver_number"`
			Message        string `json:"message"`
		}

		if err := c.conn.ReadJSON(&input); err != nil {
			log.Println("Read error:", err)
			break
		}

		receiverUser, err := websocket_postgres.GetUserByPhone(input.ReceiverNumber)
		if err != nil {
			log.Println(" Receiver not found:", err)
			continue
		}

		if c.userID == receiverUser.ID {
			log.Println(" Sender and receiver cannot be the same")
			continue
		}

		msg := &websocket_models.Save_Message{
			SenderID:   c.userID,
			ReceiverID: receiverUser.ID,
			Message:    input.Message,
			CreatedAt:  time.Now(),
		}

		if err := websocket_database.SaveMessage(msg); err != nil {
			log.Println("Mongo Save Error:", err)
			continue
		}

		h.SendToUser(receiverUser.ID, msg)
	}
}

func (c *Client) WritePump() {
	for msg := range c.send {
		if err := c.conn.WriteJSON(msg); err != nil {
			log.Println("Write error:", err)
			break
		}
	}
	c.conn.Close()
}
