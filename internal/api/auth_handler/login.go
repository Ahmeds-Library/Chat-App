package auth_handler

import (
	"net/http"

	pg_admin "github.com/Ahmeds-Library/Chat-App/internal/database/Pg_Admin"
	"github.com/Ahmeds-Library/Chat-App/internal/middleware"
	"github.com/Ahmeds-Library/Chat-App/internal/models"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

var u models.User

func Login(c *gin.Context) {
	if err := c.ShouldBindJSON(&u); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	dbPassword, dbID, err := pg_admin.GetUserCredentials(u.Username)
	if err != nil {
		if err.Error() == "user not found" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found", "details": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error", "details": err.Error()})
		}
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(dbPassword), []byte(u.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Incorrect password"})
		return
	}

	refreshtoken, err := middleware.Create_Refresh_Token(dbID, u.Username, u.Number)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to create token", "details": err.Error()})
		return
	}

	accesstoken, err := middleware.Create_Access_Token(dbID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to create token", "details": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Login successful", "Refresh token": refreshtoken, "Access token": accesstoken})
}
