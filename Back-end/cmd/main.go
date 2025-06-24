package server

import (
	"fmt"
	"log"

	mongo_db "github.com/Ahmeds-Library/Chat-App/internal/database/Mongo_DB"
	pg_admin "github.com/Ahmeds-Library/Chat-App/internal/database/Pg_Admin"
	"github.com/Ahmeds-Library/Chat-App/internal/routes"
	"github.com/gin-gonic/gin"
)

func StartAPIServer() {
	pg_admin.ConnectPgAdminDatabase()
	err := mongo_db.ConnectMongoDatabase()
	if err != nil {
		log.Fatal("❌ Mongo connection failed: ", err)
	}

	fmt.Println("Server starting...")
	r := gin.Default()

	routes.RoutesHandler(r)

	r.Run(":8001")
}
