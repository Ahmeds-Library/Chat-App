package mongo_db

import (
	"context"
	"net/http"
	"time"

	"github.com/Ahmeds-Library/Chat-App/internal/models"
	websocket "github.com/Ahmeds-Library/Chat-App/internal/websocket/websocket_functions"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func SaveMessage(c *gin.Context, senderID string, receiver models.User, req models.Request_Message) {
	message := models.Save_Message{
		ID:         primitive.NewObjectID(),
		SenderID:   senderID,
		ReceiverID: receiver.ID,
		Message:    req.Message,
		CreatedAt:  time.Now(),
	}

	collection := MongoClient.Database("Chat-App").Collection("messages")
	_, err := collection.InsertOne(context.Background(), message)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save message", "details": err.Error()})
		return
	}
	go websocket.GlobalHub.SendMessageToUser(receiver.ID, gin.H{
		"sender_id":  senderID,
		"message":    req.Message,
		"created_at": message.CreatedAt.Format("2006-01-02 15:04:05"),
	})

	c.JSON(http.StatusOK, gin.H{"message": message.Message, "status": "Message sent successfully"})
}
