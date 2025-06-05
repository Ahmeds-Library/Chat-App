package routes

import (
	"github.com/Ahmeds-Library/Chat-App/internal/api/auth_handler"
	"github.com/Ahmeds-Library/Chat-App/internal/middleware"
	"github.com/gin-gonic/gin"
)

func RoutesHandler(r *gin.Engine) {

	r.POST("/signup", auth_handler.Signup)
	r.POST("/login", auth_handler.Login)
	r.POST("/refresh_key", auth_handler.Refresh_Key)
	r.POST("/auth", middleware.AuthMiddleware(), auth_handler.Autherized_Endpoint)
}
