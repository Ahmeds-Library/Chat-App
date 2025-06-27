package websocket_middleware

import (
	"fmt"
	"net/http"

	"github.com/Ahmeds-Library/Chat-App/websocket_utils"
	"github.com/gin-gonic/gin"
)

func WebSocket_Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		fmt.Println("WebSocket Middleware	: Checking token...")
		tokenString := c.Query("token")
		if tokenString == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "no token provided"})
			return
		}

		if err := websocket_utils.VerifyToken(tokenString); err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}

		c.Next()
	}
}

func ValidateToken_WebSocket(C *gin.Context) (map[string]interface{}, bool) {
	tokenString := C.Query("token")
	if tokenString == "" {
		C.JSON(http.StatusUnauthorized, gin.H{"error": "No token provided"})
		return nil, false
	}

	claims, err := websocket_utils.DecodeToken(tokenString)
	if err != nil {
		C.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token", "details": err.Error()})
		return nil, false
	}

	return claims, true
}
