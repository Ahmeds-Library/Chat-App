package message_handler

import (
	"fmt"
	"net/http"

	mongo_db "github.com/Ahmeds-Library/Chat-App/internal/database/Mongo_DB"
	pg_admin "github.com/Ahmeds-Library/Chat-App/internal/database/Pg_Admin"
	"github.com/Ahmeds-Library/Chat-App/internal/models"
	"github.com/Ahmeds-Library/Chat-App/internal/utils"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func SendMessageHandler(mongoClient *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {

		claims, valid := utils.ValidateToken(c)
		if !valid {
			return
		}

		token_type, ok := claims["token_type"].(string)

		fmt.Println("Token Type:", token_type)

		if !ok || token_type != "Access" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token type", "details": "Use a valid access token"})
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

		receiver, err := pg_admin.GetUserByPhone(req.Receiver_Number)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Receiver not found", "details": err.Error()})
			return
		}
		mongo_db.SaveMessage(c, senderID, *receiver, *req)

	}
}
