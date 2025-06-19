package websocket

import (
	"errors"
	"fmt"
	"sync"
)

type Hub struct {
	clients map[string]*Client
	mu      sync.RWMutex
}

var GlobalHub *Hub = NewHub()

func NewHub() *Hub {
	return &Hub{clients: make(map[string]*Client)}
}

func (h *Hub) AddClient(userID string, client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.clients[userID] = client
	fmt.Println("Client added:", userID)
}

func (h *Hub) RemoveClient(userID string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	delete(h.clients, userID)
}

func (h *Hub) SendMessageToUser(userID string, message interface{}) error {
	h.mu.RLock()
	fmt.Println("Connected clients:", h.clients)
	client, ok := h.clients[userID]
	h.mu.RUnlock()
	if !ok {
		return errors.New("user not connected")
	}
	fmt.Println("Client found, sending message:", message)
	return client.Conn.WriteJSON(message)
}
