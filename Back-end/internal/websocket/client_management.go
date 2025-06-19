package websocket

import (
	"sync"
	"github.com/Ahmeds-Library/Chat-App/internal/models"
	"github.com/gorilla/websocket"
)

type Client struct {
	Conn   *websocket.Conn
	UserID string
}

type Hub struct {
	Clients   map[string]*Client
	ClientsMu sync.RWMutex
	Broadcast chan models.Save_Message
}

var WS_HUB = Hub{
	Clients:   make(map[string]*Client),
	Broadcast: make(chan models.Save_Message, 100),  
}

func (h *Hub) AddClient(userID string, client *Client) {
	h.ClientsMu.Lock()
	defer h.ClientsMu.Unlock()
	h.Clients[userID] = client
}

func (h *Hub) RemoveClient(userID string) {
	h.ClientsMu.Lock()
	defer h.ClientsMu.Unlock()
	delete(h.Clients, userID)
}

func (h *Hub) SendToUser(userID string, msg models.Save_Message) {
	h.ClientsMu.RLock()
	defer h.ClientsMu.RUnlock()

	if client, ok := h.Clients[userID]; ok {
		client.Conn.WriteJSON(msg)
	}
}
