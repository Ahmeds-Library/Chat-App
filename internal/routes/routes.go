package routes

import (
	"github.com/Ahmeds-Library/Chat-App/internal/api/handlers"
	"github.com/Ahmeds-Library/Chat-App/internal/auth"
	"github.com/gin-gonic/gin"
)

func RoutesHandler(r *gin.Engine) {

	r.POST("/signup", handlers.Signup)
	r.POST("/login", handlers.Login)
	r.POST("/refresh_key", handlers.Refresh_Key)
	r.POST("/auth", auth.AuthMiddleware(), handlers.Autherized_Endpoint)
}
