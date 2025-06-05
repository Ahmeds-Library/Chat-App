package main

import (
	"github.com/Ahmeds-Library/Chat-App/internal/database"
	"github.com/Ahmeds-Library/Chat-App/internal/routes"
	"github.com/gin-gonic/gin"
)

func main() {
	database.ConnectDatabase()

	r := gin.Default()

	routes.RoutesHandler(r)

	r.Run(":8001")
}
