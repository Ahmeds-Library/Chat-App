package message_handler

import (
	"net/http"
	"time"

	mongo_db "github.com/Ahmeds-Library/Chat-App/internal/database/Mongo_DB"
	"github.com/Ahmeds-Library/Chat-App/internal/models"
	"github.com/Ahmeds-Library/Chat-App/internal/utils"
	"github.com/gin-gonic/gin"
)

func UpdateMessageHandler(c *gin.Context) {
	var req models.Update_Message

	claims, ok := utils.ValidateToken(c)
	if !ok {
		return
	}

	token_type, ok := claims["token_type"].(string)

	if !ok || token_type != "Access" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token type", "details": "Use a valid access token"})
		return
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input", "details": err.Error()})
		return
	}

	senderID := claims["id"].(string)

	updatedTime := time.Now()

	mongoclient, err := mongo_db.ConnectMongoDatabase()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to database", "details": err.Error()})
		return
	}

	err = mongo_db.Update_Message(
		mongoclient.Database("Chat-App"),
		req.ID,
		senderID,
		req.New_Message,
		updatedTime,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Message updated successfully"})
}
