package auth_handler

import (
	"fmt"
	"net/http"

	"github.com/Ahmeds-Library/Chat-App/internal/utils"
	"github.com/gin-gonic/gin"
)

func Autherized_Endpoint(C *gin.Context) {
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

}
