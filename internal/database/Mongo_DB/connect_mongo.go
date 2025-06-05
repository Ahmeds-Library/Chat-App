package mongo_db

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/Ahmeds-Library/Chat-App/internal/utils"
	_ "github.com/lib/pq"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var Db *sql.DB

func ConnectMongoDatabase() {

	utils.LoadEnvVariables()

	fmt.Println("Mongo_URI:", os.Getenv("Mongo_URI"))

	MONGO_URI := os.Getenv("MONGO_URI")

	clientOptions := options.Client().ApplyURI(MONGO_URI)
	client, err := mongo.Connect(context.Background(), clientOptions)
	if err != nil {
		log.Fatal(err)
	}

    err = client.Ping(context.Background(), nil)
    if err != nil {
        log.Fatal(err)
    }else{
      fmt.Println("Connected to mongoDB!!!")
   }
}
