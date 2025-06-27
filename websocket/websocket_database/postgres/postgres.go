package websocket_postgres

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/Ahmeds-Library/Chat-App/websocket_utils"
	_ "github.com/lib/pq" 
)

var Db *sql.DB

func ConnectPgAdminDatabase() {
	websocket_utils.LoadEnv()

	envdata := fmt.Sprintf("host=%s port=%s user=%s dbname=%s password=%s sslmode=disable",
		os.Getenv("HOST"), os.Getenv("PORT"), os.Getenv("DB_USER"), os.Getenv("DB_NAME"), os.Getenv("PASSWORD"))

	var err error
	Db, err = sql.Open("postgres", envdata)
	if err != nil {
		log.Fatalf("Postgres connection error: %v", err)
	} else {
		fmt.Println("Postgres connection successful")
	}
}
