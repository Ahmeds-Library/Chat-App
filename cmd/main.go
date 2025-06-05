package main

import (
	mongo_db "github.com/Ahmeds-Library/Chat-App/internal/database/Mongo_DB"
	pg_admin "github.com/Ahmeds-Library/Chat-App/internal/database/Pg_Admin"
	"github.com/Ahmeds-Library/Chat-App/internal/routes"
	"github.com/gin-gonic/gin"
)

func main() {
	pg_admin.ConnectPgAdminDatabase()
	mongo_db.ConnectMongoDatabase()

	r := gin.Default()

	routes.RoutesHandler(r)

	r.Run(":8001")
}
