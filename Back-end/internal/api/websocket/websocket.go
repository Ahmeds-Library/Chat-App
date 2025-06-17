package websocket

import (
    "net/http"
    "github.com/gorilla/websocket"
    "log"
)

var upgrader = websocket.Upgrader{
    CheckOrigin: func(r *http.Request) bool {
        // Allow all origins for simplicity; customize as needed
        return true
    },
}

func WebSocketHandler(w http.ResponseWriter, r *http.Request) {
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Println("Error upgrading connection:", err)
        return
    }
    defer conn.Close()

    log.Println("Client connected")

    for {
        // Read message from client
        _, message, err := conn.ReadMessage()
        if err != nil {
            log.Println("Error reading message:", err)
            break
        }
        log.Printf("Received: %s\n", message)

        // Echo message back to client
        err = conn.WriteMessage(websocket.TextMessage, message)
        if err != nil {
            log.Println("Error writing message:", err)
            break
        }
    }
}