package routes

import (
	"github.com/Ahmeds-Library/Chat-App/internal/api/auth_handler"
	message_handler "github.com/Ahmeds-Library/Chat-App/internal/api/mesage_handler"
	"github.com/Ahmeds-Library/Chat-App/internal/middleware"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func RoutesHandler(r *gin.Engine) {

	r.POST("/signup", auth_handler.Signup)
	r.POST("/login", auth_handler.Login)
	r.POST("/refresh_key", auth_handler.Refresh_Key)
	r.POST("/get_message", middleware.AuthMiddleware(), message_handler.Get_Message)
	r.POST("/message", middleware.AuthMiddleware(), message_handler.SendMessageHandler(&mongo.Client{}))
}
