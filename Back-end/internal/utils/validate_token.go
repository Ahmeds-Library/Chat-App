package utils

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func ValidateToken(C *gin.Context) (map[string]interface{}, bool) {
	tokenString := C.GetHeader("Authorization")
	if tokenString == "" {
		C.JSON(http.StatusUnauthorized, gin.H{"error": "No token provided"})
		return nil, false
	}

	if len(tokenString) > 7 && tokenString[:7] == "Bearer " {
		tokenString = tokenString[7:]
	}

	claims, err := DecodeToken(tokenString)
	if err != nil {
		C.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token", "details": err.Error()})
		return nil, false
	}

	return claims, true
}
