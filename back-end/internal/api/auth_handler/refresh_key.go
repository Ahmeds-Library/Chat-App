package auth_handler

import (
	"net/http"

	"github.com/Ahmeds-Library/Chat-App/internal/middleware"
	"github.com/Ahmeds-Library/Chat-App/internal/utils"
	"github.com/gin-gonic/gin"
)

func Refresh_Key(c *gin.Context) {
	tokenString := c.GetHeader("Authorization")

	if err := middleware.VerifyToken(tokenString); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token", "details": err.Error()})
		return
	}

	claims, err := utils.DecodeToken(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token", "details": err.Error()})
		return
	}

	token_type, ok := claims["token_type"].(string)
	userID, ok2 := claims["id"].(string)

	if !ok || token_type != "refresh" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token type", "details": "Use a valid refresh token"})
		return
	}
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in token"})
		return
	}

	if !ok2 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims", "details": "User ID not found in token claims"})
		return
	}

	accesstoken, err := middleware.Create_Access_Token(userID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to create refresh token", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Token renewed successfully", "Access token": accesstoken})
}
