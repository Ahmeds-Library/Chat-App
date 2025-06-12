package message_handler

import (
	"fmt"
	"net/http"

	mongo_db "github.com/Ahmeds-Library/Chat-App/internal/database/Mongo_DB"
	pg_admin "github.com/Ahmeds-Library/Chat-App/internal/database/Pg_Admin"
	"github.com/Ahmeds-Library/Chat-App/internal/models"
	"github.com/Ahmeds-Library/Chat-App/internal/utils"
	"github.com/gin-gonic/gin"
)

func Get_Message(C *gin.Context) {
	claims, ok := utils.ValidateToken(C)
	if !ok {
		return
	}

	token_type, ok := claims["token_type"].(string)

	fmt.Println("Token Type:", token_type)

	if !ok || token_type != "Access" {
		C.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token type", "details": "Use a valid access token"})
		return
	}

	receiverID, ok := claims["id"].(string)
	if !ok {
		C.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token", "details": "User ID not found in token"})
		return
	}

	var req *models.Get_Message
	if err := C.ShouldBindJSON(&req); err != nil {
		C.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body", "details": err.Error()})
		return
	}

	senderID, err := pg_admin.GetUserByPhone(req.Sender_Number)
	if err != nil {
		C.JSON(http.StatusNotFound, gin.H{"error": "Sender not found", "details": err.Error()})
		return
	}


	mongoClient, err := mongo_db.ConnectMongoDatabase()
	if err != nil {
		C.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to MongoDB", "details": err.Error()})
		return
	}

	messages, err := utils.Message_Fetcher(mongoClient, senderID.ID, receiverID)

	if err != nil {
		C.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get messages", "details": err.Error()})
		return
	}
	C.JSON(http.StatusOK, messages)

}

