package message_handler

import (
	"database/sql"
	"net/http"

	mongo_db "github.com/Ahmeds-Library/Chat-App/internal/database/Mongo_DB"
	pg_admin "github.com/Ahmeds-Library/Chat-App/internal/database/Pg_Admin"
	"github.com/Ahmeds-Library/Chat-App/internal/models"
	"github.com/Ahmeds-Library/Chat-App/internal/utils"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func GetChatListHandler(mongoClient *mongo.Client, pgConn *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {

		claims, valid := utils.ValidateToken(c)
		if !valid {
			return
		}

		userID, ok := claims["id"].(string)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

		database := mongoClient.Database("Chat-App")
		chatPartners, err := mongo_db.GetChatPartners(database, userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Mongo error: " + err.Error()})
			return
		}

		var fullList []models.Chatlist_Item

		for _, chat := range chatPartners {

			userData, err := pg_admin.GetDataFromID(chat.PartnerID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Postgres error: " + err.Error()})
				return
			}

			fullList = append(fullList, models.Chatlist_Item{
				PartnerID:     chat.PartnerID,
				PartnerName:   userData.Username,
				PartnerNumber: userData.Number,
				LastMessage:   chat.LastMessage,
				LastMessageAt: chat.LastMessageAt.Format("2006-01-02 15:04:05"),
			})
		}

		c.JSON(http.StatusOK, fullList)
	}
}
