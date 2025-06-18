package mongo_db

import (
	"context"
	"net/http"
	"time"

	"github.com/Ahmeds-Library/Chat-App/internal/models"
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

	mongoClient, err := ConnectMongoDatabase()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection error", "details": err.Error()})
		return
	}

	collection := mongoClient.Database("Chat-App").Collection("messages")
	_, err = collection.InsertOne(context.Background(), message)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save message", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": message.Message , "status" : "Message sent successfully"})
}
