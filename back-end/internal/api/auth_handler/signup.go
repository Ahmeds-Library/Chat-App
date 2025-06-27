package auth_handler

import (
    "net/http"

    pg_admin "github.com/Ahmeds-Library/Chat-App/internal/database/Pg_Admin"
    "github.com/Ahmeds-Library/Chat-App/internal/middleware"
    "github.com/Ahmeds-Library/Chat-App/internal/models"
    "github.com/gin-gonic/gin"
)

func Signup(c *gin.Context) {
    var u models.User

    if err := c.ShouldBindJSON(&u); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input", "details": err.Error()})
        return
    }

    err := pg_admin.CreateUser(u.Username, u.Password, u.Number)
    if err != nil {
        if err.Error() == "username already exists" {
            c.JSON(http.StatusConflict, gin.H{"error": "Username already exists"})
            return
        } else if err.Error() == "pq: new row for relation \"users\" violates check constraint \"number_length_check\"" {
            c.JSON(http.StatusConflict, gin.H{"error": "Phone number is too short, it must be 11 digits"})
            return
        } else if err.Error() == "pq: value too long for type character varying(11)" {
            c.JSON(http.StatusConflict, gin.H{"error": "Phone number is too long, it must be 11 digits"})
            return
        }
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error", "details": err.Error()})
        return
    }

    // Generate tokens after successful user creation
    refreshtoken, err := middleware.Create_Refresh_Token(u.ID, u.Username, u.Number)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to create refresh token", "details": err.Error()})
        return
    }

    accesstoken, err := middleware.Create_Access_Token(u.ID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to create access token", "details": err.Error()})
        return
    }

    c.JSON(http.StatusCreated, gin.H{
        "message":        "User registered successfully",
        "Refresh token":  refreshtoken,
        "Access token":   accesstoken,
    })
}	