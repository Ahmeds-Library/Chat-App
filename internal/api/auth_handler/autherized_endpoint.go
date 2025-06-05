package auth_handler

import (
	"fmt"
	"net/http"

	"github.com/Ahmeds-Library/Chat-App/internal/utils"
	"github.com/gin-gonic/gin"
)

func Autherized_Endpoint(C *gin.Context) {
	tokenString := C.GetHeader("Authorization")
	if tokenString == "" {
		C.JSON(http.StatusUnauthorized, gin.H{"error": "No token provided"})
		return
	}

	if len(tokenString) > 7 && tokenString[:7] == "Bearer " {
		tokenString = tokenString[7:]
	}

	claims, err := utils.DecodeToken(tokenString)

	if err != nil {
		C.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token", "details": err.Error()})
		return
	}

	token_type, ok := claims["token_type"].(string)

	fmt.Println("Token Type:", token_type)

	if !ok || token_type != "Access" {
		C.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token type", "details": "Use a valid access token"})
		return
	}

}
