package routes

import (
	"github.com/Ahmeds-Library/Chat-App/internal/api/handlers"
	"github.com/gin-gonic/gin"
)

func RoutesHandler(r *gin.Engine) {

	r.POST("/signup", handlers.Signup)
	r.POST("/login", handlers.Login)
	r.POST("/renew_access", handlers.Renew_Access)
}
