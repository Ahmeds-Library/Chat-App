package pg_admin

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/Ahmeds-Library/Chat-App/internal/utils"
	_ "github.com/lib/pq"
)

var Db *sql.DB

func ConnectPgAdminDatabase() {

	utils.LoadEnvVariables()

	fmt.Println("HOST:", os.Getenv("HOST"))
	fmt.Println("PORT:", os.Getenv("PORT"))
	fmt.Println("USER:", os.Getenv("DB_USER"))
	fmt.Println("PASSWORD:", os.Getenv("PASSWORD"))
	fmt.Println("DB_NAME:", os.Getenv("DB_NAME"))

	envdata := fmt.Sprintf("host=%s port=%s user=%s dbname=%s password=%s sslmode=disable",
		os.Getenv("HOST"), os.Getenv("PORT"), os.Getenv("DB_USER"), os.Getenv("DB_NAME"), os.Getenv("PASSWORD"))

	var err error
	Db, err = sql.Open("postgres", envdata)
	if err != nil {
		log.Fatalf("Database connection error: %v", err)
	} else {
		fmt.Println("Database connection successful")
	}
}
