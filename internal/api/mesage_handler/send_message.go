package handlers

import (
	"context"
	"fmt"
	"net/http"
	"time"

	pg_admin "github.com/Ahmeds-Library/Chat-App/internal/database/Pg_Admin"
	"github.com/Ahmeds-Library/Chat-App/internal/models"
	"github.com/Ahmeds-Library/Chat-App/internal/utils"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func SendMessageHandler(mongoClient *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		claims, valid := utils.ValidateToken(c)
		if !valid {
			return
		}

		senderID, ok := claims["id"].(string)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

		var req *models.Request_Message
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		fmt.Println("Request received:", req)

		receiver, err := pg_admin.GetUserByPhone(req.Receiver_Number)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Receiver not found"})
			return
		}

		message := models.Message{
			ID:         primitive.NewObjectID(),
			SenderID:   senderID,
			ReceiverID: receiver.ID,
			Content:    req.Message,
			CreatedAt:  time.Now(),
		}

		fmt.Println("MongoDB client:", mongoClient)

		collection := mongoClient.Database("Chat-App").Collection("messages")
		_, err = collection.InsertOne(context.Background(), message)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save message", "details": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Message sent successfully"})
	}
}
