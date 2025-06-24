package routes

import (
	"database/sql"

	"github.com/Ahmeds-Library/Chat-App/internal/api/auth_handler"
	message_handler "github.com/Ahmeds-Library/Chat-App/internal/api/mesage_handler"
	mongo_db "github.com/Ahmeds-Library/Chat-App/internal/database/Mongo_DB"
	"github.com/Ahmeds-Library/Chat-App/internal/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func RoutesHandler(r *gin.Engine) {

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:8080"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Authorization", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	r.POST("/signup", auth_handler.Signup)
	r.POST("/login", auth_handler.Login)
	r.POST("/refresh_key", auth_handler.Refresh_Key)
	r.POST("/get_message", middleware.AuthMiddleware(), message_handler.Get_Message)
	r.GET("/chat_list", middleware.AuthMiddleware(), message_handler.GetChatListHandler(mongo_db.MongoClient, &sql.DB{}))
	r.POST("/message", middleware.AuthMiddleware(), message_handler.SendMessageHandler(mongo_db.MongoClient))
	r.POST("/update_message", middleware.AuthMiddleware(), func(c *gin.Context) {
		message_handler.UpdateMessageHandler(c)
	})
}
